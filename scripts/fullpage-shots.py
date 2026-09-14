#!/usr/bin/env python3
"""Full-page screenshots using system Chrome + pure-Python WebSocket (no deps)."""
from __future__ import annotations

import base64
import hashlib
import json
import os
import socket
import struct
import subprocess
import sys
import tempfile
import threading
import time
import urllib.request
from pathlib import Path

CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
PORT = 9334
OUT = Path(__file__).resolve().parents[1] / "assets" / "user-manual"

JOBS = [
    ("um-mall", "http://127.0.0.1:8091/index.html", 390, True),
    ("um-agent", "http://127.0.0.1:8091/agent.html", 390, True),
    ("um-mine", "http://127.0.0.1:8091/mine.html", 390, True),
    ("um-orders", "http://127.0.0.1:8091/orders.html", 390, True),
    ("um-search", "http://127.0.0.1:8091/search.html", 390, True),
    ("um-detail", "http://127.0.0.1:8091/detail.html?id=package_meal_month", 390, True),
    ("um-order", "http://127.0.0.1:8091/order.html?goodsId=package_meal_month", 390, True),
    ("um-features", "http://127.0.0.1:8091/product-features.html", 1200, False),
    ("um-ops", "http://127.0.0.1:8091/admin/center/ops-screen.html", 1440, False),
    ("um-demand", "http://127.0.0.1:8091/admin/center/demand-overview-screen.html", 1440, False),
]


class WebSocketClient:
    def __init__(self, url: str):
        assert url.startswith("ws://")
        rest = url[5:]
        host_port, path = rest.split("/", 1)
        path = "/" + path
        if ":" in host_port:
            host, port_s = host_port.split(":")
            port = int(port_s)
        else:
            host, port = host_port, 80
        self.sock = socket.create_connection((host, port), timeout=30)
        key = base64.b64encode(os.urandom(16)).decode()
        req = (
            f"GET {path} HTTP/1.1\r\n"
            f"Host: {host_port}\r\n"
            "Upgrade: websocket\r\n"
            "Connection: Upgrade\r\n"
            f"Sec-WebSocket-Key: {key}\r\n"
            "Sec-WebSocket-Version: 13\r\n\r\n"
        )
        self.sock.sendall(req.encode())
        buf = b""
        while b"\r\n\r\n" not in buf:
            chunk = self.sock.recv(4096)
            if not chunk:
                raise RuntimeError("WS handshake failed")
            buf += chunk
        self._recv_buf = b""
        self._lock = threading.Lock()
        self._id = 0

    def _send_frame(self, data: bytes, opcode=0x1):
        mask = os.urandom(4)
        masked = bytes(b ^ mask[i % 4] for i, b in enumerate(data))
        header = bytearray([0x80 | opcode])
        n = len(masked)
        if n < 126:
            header.append(0x80 | n)
        elif n < 65536:
            header.append(0x80 | 126)
            header.extend(struct.pack("!H", n))
        else:
            header.append(0x80 | 127)
            header.extend(struct.pack("!Q", n))
        header.extend(mask)
        self.sock.sendall(header + masked)

    def _recv_frame(self) -> bytes:
        def read_exact(n):
            out = bytearray()
            while len(out) < n:
                chunk = self.sock.recv(n - len(out))
                if not chunk:
                    raise RuntimeError("socket closed")
                out.extend(chunk)
            return bytes(out)

        h = read_exact(2)
        opcode = h[0] & 0x0F
        masked = (h[1] & 0x80) != 0
        ln = h[1] & 0x7F
        if ln == 126:
            ln = struct.unpack("!H", read_exact(2))[0]
        elif ln == 127:
            ln = struct.unpack("!Q", read_exact(8))[0]
        mask = read_exact(4) if masked else b""
        payload = read_exact(ln)
        if masked:
            payload = bytes(b ^ mask[i % 4] for i, b in enumerate(payload))
        if opcode == 0x8:
            raise RuntimeError("WS closed")
        if opcode == 0x9:  # ping
            self._send_frame(payload, opcode=0xA)
            return self._recv_frame()
        return payload

    def call(self, method: str, params=None, timeout=60.0):
        with self._lock:
            self._id += 1
            mid = self._id
            self._send_frame(json.dumps({"id": mid, "method": method, "params": params or {}}).encode())
        t0 = time.time()
        while time.time() - t0 < timeout:
            raw = json.loads(self._recv_frame())
            if raw.get("id") == mid:
                if "error" in raw:
                    raise RuntimeError(f"{method}: {raw['error']}")
                return raw.get("result", {})
        raise TimeoutError(method)

    def close(self):
        try:
            self.sock.close()
        except Exception:
            pass


def wait_devtools(timeout=25.0):
    t0 = time.time()
    while time.time() - t0 < timeout:
        try:
            with urllib.request.urlopen(f"http://127.0.0.1:{PORT}/json/version", timeout=1) as r:
                return json.load(r)
        except Exception:
            time.sleep(0.2)
    raise RuntimeError("devtools not ready")


def capture_one(page_ws: str, url: str, width: int, mobile: bool, out: Path):
    ws = WebSocketClient(page_ws)
    try:
        ws.call("Page.enable")
        ws.call("Runtime.enable")
        ws.call(
            "Emulation.setDeviceMetricsOverride",
            {
                "width": width,
                "height": 900,
                "deviceScaleFactor": 2,
                "mobile": mobile,
            },
        )
        ws.call("Page.navigate", {"url": url})
        # wait for load event roughly
        time.sleep(2.0)
        # settle fonts/images
        for _ in range(20):
            ready = ws.call(
                "Runtime.evaluate",
                {"expression": "document.readyState", "returnByValue": True},
            )
            if ready.get("result", {}).get("value") == "complete":
                break
            time.sleep(0.15)
        time.sleep(0.8)
        dims = ws.call(
            "Runtime.evaluate",
            {
                "expression": (
                    "(() => { const h = Math.max("
                    "document.documentElement.scrollHeight,"
                    "document.body ? document.body.scrollHeight : 0,"
                    "document.documentElement.offsetHeight,"
                    "document.documentElement.clientHeight);"
                    "const w = Math.max(document.documentElement.scrollWidth, document.documentElement.clientWidth);"
                    "return {w, h}; })()"
                ),
                "returnByValue": True,
            },
        )
        size = dims.get("result", {}).get("value") or {"w": width, "h": 900}
        h = int(max(900, min(int(size.get("h", 900)) + 40, 18000)))
        w = width if mobile else int(max(width, min(int(size.get("w", width)), 2400)))
        ws.call(
            "Emulation.setDeviceMetricsOverride",
            {
                "width": w,
                "height": h,
                "deviceScaleFactor": 2,
                "mobile": mobile,
            },
        )
        time.sleep(0.6)
        shot = ws.call(
            "Page.captureScreenshot",
            {
                "format": "png",
                "fromSurface": True,
                "captureBeyondViewport": True,
            },
            timeout=120.0,
        )
        out.write_bytes(base64.b64decode(shot["data"]))
        print(f"OK {out.name} logical~{w}x{h} bytes={out.stat().st_size}")
    finally:
        ws.close()


def get_page_target():
    pages = json.load(urllib.request.urlopen(f"http://127.0.0.1:{PORT}/json/list", timeout=5))
    for p in pages:
        if p.get("type") == "page" and p.get("webSocketDebuggerUrl"):
            return p
    raise RuntimeError("no page target")


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    user_data = tempfile.mkdtemp(prefix="ky-chrome-")
    # free stale chrome on debug port
    subprocess.run(["pkill", "-f", f"remote-debugging-port={PORT}"], check=False)
    time.sleep(0.4)
    proc = subprocess.Popen(
        [
            CHROME,
            f"--remote-debugging-port={PORT}",
            "--headless=new",
            "--disable-gpu",
            "--hide-scrollbars",
            "--no-first-run",
            "--no-default-browser-check",
            f"--user-data-dir={user_data}",
            "about:blank",
        ],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    try:
        wait_devtools()
        page = get_page_target()
        for name, url, width, mobile in JOBS:
            out = OUT / f"{name}.png"
            try:
                capture_one(page["webSocketDebuggerUrl"], url, width, mobile, out)
            except Exception as e:
                print(f"FAIL {name}: {e}", file=sys.stderr)
                # reconnect page target if WS died
                try:
                    page = get_page_target()
                    capture_one(page["webSocketDebuggerUrl"], url, width, mobile, out)
                    continue
                except Exception as e2:
                    print(f"RETRY FAIL {name}: {e2}", file=sys.stderr)
                h = 6500 if mobile else 4000
                subprocess.run(
                    [
                        CHROME,
                        "--headless=new",
                        "--disable-gpu",
                        "--hide-scrollbars",
                        f"--window-size={width},{h}",
                        "--force-device-scale-factor=2",
                        f"--screenshot={out}",
                        url,
                    ],
                    stdout=subprocess.DEVNULL,
                    stderr=subprocess.DEVNULL,
                )
                if out.exists():
                    print(f"FALLBACK {name} bytes={out.stat().st_size}")
    finally:
        proc.terminate()
        try:
            proc.wait(timeout=5)
        except Exception:
            proc.kill()


if __name__ == "__main__":
    main()
