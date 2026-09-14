#!/usr/bin/env python3
"""Static file server + OpenAI-compatible chat proxy for 康小护 (SSE stream + thinking)."""

from __future__ import annotations

import json
import os
import re
import ssl
import sys
import time
import urllib.error
import urllib.request
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ENV_FILE = ROOT / "llm.env"

SYSTEM_PROMPT = """你是「康小护」，春风康养平台的 AI 康养助手（形象是一只戴帽子的温暖小象）。
你的职责：用简洁、亲切、口语化的中文，帮助用户了解与选择食堂配餐、控糖套餐、到店理疗、居家照护、健康咨询等服务。
规则：
1. 回答尽量短，优先给可执行建议（去哪、怎么做、注意什么）。
2. 不编造具体库存、实时价格或未提供的个人医疗诊断；不确定时说明并建议到店/咨询专业人员。
3. 可主动追问 1 个关键问题，帮助缩小推荐。
4. 不要输出 markdown 标题；可用简短分点。
5. 自称「小护」或「康小护」。
6. 当需要展示推荐列表、榜单、商品卡片、数据表格、日程、家庭档案、体征、趋势、睡眠、病程或价值支柱时，请用 ```cui 代码块输出 JSON，前端会自动渲染成卡片。可用 type：service、rank、product、table、schedule、profile、vitals、trend、sleep、timeline、nodes、pillars。JSON 字段示例：
```cui
{"type":"service","title":"推荐护理员","items":[{"name":"李阿姨","tags":["翻身拍背"],"distance":"1.2km","rating":"4.9","orders":"23","actions":[{"label":"预约","q":"预约李阿姨"}]}]}
```
商品卡片示例：
```cui
{"type":"product","title":"为你推荐","items":[{"id":"ai_massage","name":"AI舒压理疗服务","cover":"./assets/cover-ai-massage.png","price":"15","originPrice":"19.9","sales":"236","tag":"最热","distance":"距你 520m","subtitle":"45 分钟 · 智能分区舒缓"}]}
```
注意：CUI 代码块一旦开始就要连续输出完整 JSON，不要在块内中断或插入解释文字；JSON 闭合后可用 1 句简短追问收尾。
7. 不要展示思考过程。看到推荐/榜单/数据/日程类意图时，直接输出对应 CUI 卡片，无需先解释再出卡片。
8. CUI JSON 中的所有文本字段（title、name、desc、label、summary、day、time 等）必须是纯文本，不要包含 HTML 标签、markdown 标记或换行符；前端会原样展示。
9. 固化演示档案「林家双老」（数据截至2026-09-11，数字不得编造）：子女双职工、不与老人同住。母亲林秀珍，女70岁，158cm/61kg，BMI24.4，A型，2018确诊2型糖尿病；今日空腹血糖7.3mmol/L，血压128/76，心率74；近7日空腹6.8/7.4/7.1/8.2/6.9/7.6/7.3，糖化7.4%；睡眠5h48m、深睡48m、起夜2次、效率78%；昨日营养1680kcal/碳水212g/蛋白52g/钠2100mg；日均3180步、无抗阻；用药二甲双胍0.5g早/晚（本周漏1次晚饭）、阿卡波糖50mg三餐第一口。父亲林建国，男70岁，168cm/64kg，BMI22.7，O型，2015高血压，2023-03左侧大脑中动脉梗死、左侧轻偏瘫；今日血压148/86、心率68、血氧96%；近7日收缩压142/146/151/144/149/152/148；睡眠6h24m、深睡1h06m、轻度呼吸事件；昨日1420kcal/碳水168g/蛋白58g/钠2400mg、软食防呛；周三周五康复40分钟、坐站8次、助行1760步；用药氨氯地平5mg晨、阿司匹林100mg晚饭后、阿托伐他汀20mg晚；2024-11夜间险跌。关键业务节点：9/1能力评估（母Barthel90轻度/父65中度）、本周护理计划、用药漏1次、助餐、上门康复三/五、周四日托、夜灯已装扶手待装、9/16复诊请假、账单830待确认。用户问健康档案/体征/血压/血糖/睡眠/营养/运动/病程/用药/评估/护理计划/日托/请假/巡查/账单/业务节点/爸妈/需求/供给/匹配时，必须围绕这户并用 CUI：profile、vitals、trend、sleep、timeline、nodes、table、schedule、service、pillars。产品价值口径：需智能=看清家里的事；供智能=按病种组织可调度供给；需供匹配=把对的人、强度、时间接到这对老人并回传子女。不替代医生，不改药。
10. CUI 卡片的 actions 按钮尽量映射到商城真实页面。两种写法：
   - 继续对话：{"label":"预约","q":"预约李阿姨"}
   - 跳转页面：{"label":"查看详情","action":"link","href":"./detail.html?id=<商品ID>"} 或 {"label":"立即预约","action":"link","href":"./order.html?goodsId=<商品ID>"}
   商城商品 ID（用于 href）：食堂/套餐用 package_meal_month；到店理疗用 ai_massage；足浴 foot_spa；健康检测 health_check；书法课 calligraphy；AR运动 ar_sports；颈椎按摩 neck_massage；营养配餐 nutrition_meal；陪诊陪护 companion_care；上门保洁 home_clean；血压计 bp_monitor；血氧仪 pulse_oximeter；康养礼包 wellness_kit。"""


def load_env(path: Path) -> None:
    if not path.exists():
        return
    for raw in path.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, val = line.split("=", 1)
        key, val = key.strip(), val.strip().strip('"').strip("'")
        if key and key not in os.environ:
            os.environ[key] = val


load_env(ENV_FILE)

API_KEY = (
    os.environ.get("LLM_API_KEY")
    or os.environ.get("QIANFAN_API_KEY")
    or ""
).strip()
BASE_URL = (
    os.environ.get("LLM_BASE_URL")
    or os.environ.get("QIANFAN_BASE_URL")
    or "https://api.deepseek.com/v1"
).rstrip("/")
MODEL = (
    os.environ.get("LLM_MODEL")
    or os.environ.get("QIANFAN_MODEL")
    or "deepseek-chat"
).strip()
TIMEOUT = float(os.environ.get("LLM_TIMEOUT", "180"))
PORT = int(os.environ.get("PORT", "8091"))
CONFIGURED = bool(API_KEY) and not API_KEY.startswith("sk-your-")
# Thinking is off by default so cards/text are produced directly.
# Set LLM_THINKING=true (or QIANFAN_THINKING=true) to re-enable reasoning.
_THINKING_FLAG = (
    os.environ.get("LLM_THINKING") or os.environ.get("QIANFAN_THINKING") or "false"
).strip().lower()
THINKING_MODEL = _THINKING_FLAG in ("1", "true", "yes", "on")


def json_bytes(data: dict, status: int = 200) -> tuple[int, bytes, str]:
    body = json.dumps(data, ensure_ascii=False).encode("utf-8")
    return status, body, "application/json; charset=utf-8"


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def log_message(self, fmt: str, *args) -> None:
        sys.stderr.write("[%s] %s\n" % (self.log_date_time_string(), fmt % args))

    def _cors(self) -> None:
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")

    def _send(self, status: int, body: bytes, content_type: str) -> None:
        self.send_response(status)
        self._cors()
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def _begin_sse(self) -> None:
        self.send_response(200)
        self._cors()
        self.send_header("Content-Type", "text/event-stream; charset=utf-8")
        self.send_header("Cache-Control", "no-cache, no-store")
        # close the TCP connection after the stream so the browser never
        # reuses a half-closed keep-alive connection for the next request
        self.send_header("Connection", "close")
        self.send_header("X-Accel-Buffering", "no")
        self.end_headers()

    def _sse(self, payload: dict) -> None:
        chunk = ("data: " + json.dumps(payload, ensure_ascii=False) + "\n\n").encode(
            "utf-8"
        )
        self.wfile.write(chunk)
        self.wfile.flush()

    def do_OPTIONS(self) -> None:  # noqa: N802
        self.send_response(204)
        self._cors()
        self.end_headers()

    def do_GET(self) -> None:  # noqa: N802
        if self.path.split("?", 1)[0] == "/api/llm/status":
            status, body, ctype = json_bytes(
                {
                    "ok": True,
                    "configured": CONFIGURED,
                    "model": MODEL if CONFIGURED else None,
                    "baseUrl": BASE_URL if CONFIGURED else None,
                    "thinking": THINKING_MODEL,
                    "stream": True,
                    "agent": "康小护",
                }
            )
            self._send(status, body, ctype)
            return
        super().do_GET()

    def do_POST(self) -> None:  # noqa: N802
        path = self.path.split("?", 1)[0]
        if path != "/api/chat":
            self._send(404, b'{"error":"not found"}', "application/json")
            return

        length = int(self.headers.get("Content-Length") or 0)
        raw = self.rfile.read(length) if length else b"{}"
        try:
            payload = json.loads(raw.decode("utf-8") or "{}")
        except json.JSONDecodeError:
            self._send(400, b'{"error":"invalid json"}', "application/json")
            return

        messages = payload.get("messages") or []
        if not isinstance(messages, list) or not messages:
            self._send(400, b'{"error":"messages required"}', "application/json")
            return

        clean = []
        for m in messages[-20:]:
            role = m.get("role")
            content = (m.get("content") or "").strip()
            if role in ("user", "assistant", "system") and content:
                # Do not round-trip reasoning_content into history
                clean.append({"role": role, "content": content})
        if not any(m["role"] == "user" for m in clean):
            self._send(400, b'{"error":"user message required"}', "application/json")
            return

        if not any(m["role"] == "system" for m in clean):
            clean.insert(0, {"role": "system", "content": SYSTEM_PROMPT})

        accept = self.headers.get("Accept", "")
        want_stream = payload.get("stream", "text/event-stream" in accept)

        if not CONFIGURED:
            last = next(m["content"] for m in reversed(clean) if m["role"] == "user")
            reasoning = "（演示）先理解用户问题，再给出可执行的康养建议。"
            reply = (
                f"（演示模式）小护先记下了：「{last}」。\n"
                "当前还没配置大模型密钥。请在 llm.env 填入密钥后重启服务。"
            )
            if want_stream:
                self._begin_sse()
                if THINKING_MODEL:
                    self._sse({"type": "reasoning", "delta": reasoning})
                    time.sleep(0.05)
                for ch in reply:
                    self._sse({"type": "content", "delta": ch})
                    time.sleep(0.008)
                self._sse(
                    {
                        "type": "done",
                        "demo": True,
                        "content": reply,
                        "reasoning": reasoning if THINKING_MODEL else "",
                    }
                )
                self.wfile.write(b"data: [DONE]\n\n")
                self.wfile.flush()
                return
            status, body, ctype = json_bytes(
                {
                    "ok": True,
                    "demo": True,
                    "content": reply,
                    "reasoning": reasoning if THINKING_MODEL else "",
                }
            )
            self._send(status, body, ctype)
            return

        # Limit context length for speed; keep system + last N pairs
        context_limit = 8  # system + 7 messages
        if len(clean) > context_limit:
            system_msgs = [m for m in clean if m["role"] == "system"]
            chat_msgs = [m for m in clean if m["role"] != "system"]
            clean = system_msgs + chat_msgs[-(context_limit - len(system_msgs)):]

        upstream = {
            "model": MODEL,
            "messages": clean,
            "stream": True,
        }
        if THINKING_MODEL:
            upstream["thinking"] = {"type": "enabled"}
        else:
            upstream["temperature"] = float(payload.get("temperature", 0.6))

        req = urllib.request.Request(
            f"{BASE_URL}/chat/completions",
            data=json.dumps(upstream).encode("utf-8"),
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {API_KEY}",
                "Accept": "text/event-stream",
            },
            method="POST",
        )
        ctx = ssl.create_default_context()

        # Prefer streaming when the browser explicitly asks for SSE
        if not want_stream:
            # Collect full stream into one JSON response
            try:
                content_all, reason_all = self._consume_upstream(req, ctx)
                if not content_all and not reason_all:
                    self._send(
                        502, b'{"error":"empty model response"}', "application/json"
                    )
                    return
                status, body, ctype = json_bytes(
                    {
                        "ok": True,
                        "demo": False,
                        "content": content_all,
                        "reasoning": reason_all,
                        "model": MODEL,
                    }
                )
                self._send(status, body, ctype)
            except urllib.error.HTTPError as e:
                err_body = e.read().decode("utf-8", errors="replace")[:800]
                status, body, ctype = json_bytes(
                    {"ok": False, "error": f"upstream {e.code}", "detail": err_body},
                    status=502,
                )
                self._send(status, body, ctype)
            except Exception as e:  # noqa: BLE001
                status, body, ctype = json_bytes(
                    {"ok": False, "error": str(e)}, status=502
                )
                self._send(status, body, ctype)
            return

        # SSE proxy to browser
        try:
            self._begin_sse()
            self._sse({"type": "meta", "model": MODEL, "thinking": THINKING_MODEL})
            content_all = ""
            reason_all = ""
            # Buffer for CUI JSON so the user never sees JSON characters stream in one-by-one.
            # Once a ```cui block starts we hold tokens until the closing ```.
            cui_buffer = ""
            in_cui = False
            with urllib.request.urlopen(req, timeout=TIMEOUT, context=ctx) as resp:
                while True:
                    line = resp.readline()
                    if not line:
                        break
                    text = line.decode("utf-8", errors="replace").strip()
                    if not text:
                        continue
                    if text.startswith(":"):
                        continue
                    if not text.startswith("data:"):
                        continue
                    data = text[5:].strip()
                    if data == "[DONE]":
                        break
                    try:
                        obj = json.loads(data)
                    except json.JSONDecodeError:
                        continue
                    choices = obj.get("choices") or []
                    if not choices:
                        continue
                    delta = choices[0].get("delta") or {}
                    if not delta and choices[0].get("message"):
                        delta = choices[0]["message"]
                    # Drop reasoning_content when thinking mode is off
                    r = delta.get("reasoning_content") if THINKING_MODEL else None
                    c = delta.get("content")
                    if r:
                        reason_all += r
                        self._sse({"type": "reasoning", "delta": r})
                    if not c:
                        continue
                    content_all += c

                    # Stream normal text immediately; buffer CUI JSON blocks atomically
                    if not in_cui:
                        start = c.find("```cui")
                        if start != -1:
                            # send text before the block immediately
                            if c[:start]:
                                self._sse({"type": "content", "delta": c[:start]})
                            in_cui = True
                            cui_buffer = c[start:]
                        else:
                            self._sse({"type": "content", "delta": c})
                    else:
                        cui_buffer += c
                        # look for a standalone closing ``` line
                        m = re.search(r"\n```\s*(?:\n|$)", cui_buffer)
                        if m:
                            block = cui_buffer[: m.end()]
                            rest = cui_buffer[m.end() :]
                            self._sse({"type": "content", "delta": block})
                            cui_buffer = ""
                            in_cui = False
                            if rest:
                                self._sse({"type": "content", "delta": rest})
            # flush any incomplete CUI buffer so the browser can still render something
            if in_cui and cui_buffer:
                self._sse({"type": "content", "delta": cui_buffer})
            self._sse(
                {
                    "type": "done",
                    "demo": False,
                    "content": content_all,
                    "reasoning": reason_all,
                    "model": MODEL,
                }
            )
            # send standard SSE terminator so the browser reader exits cleanly
            self.wfile.write(b"data: [DONE]\n\n")
            self.wfile.flush()
        except urllib.error.HTTPError as e:
            err_body = e.read().decode("utf-8", errors="replace")[:800]
            self._sse({"type": "error", "error": f"upstream {e.code}", "detail": err_body})
        except Exception as e:  # noqa: BLE001
            self._sse({"type": "error", "error": str(e)})

    def _consume_upstream(self, req: urllib.request.Request, ctx: ssl.SSLContext):
        content_all = ""
        reason_all = ""
        with urllib.request.urlopen(req, timeout=TIMEOUT, context=ctx) as resp:
            while True:
                line = resp.readline()
                if not line:
                    break
                text = line.decode("utf-8", errors="replace").strip()
                if not text.startswith("data:"):
                    continue
                data = text[5:].strip()
                if data == "[DONE]":
                    break
                try:
                    obj = json.loads(data)
                except json.JSONDecodeError:
                    continue
                choices = obj.get("choices") or []
                if not choices:
                    continue
                delta = choices[0].get("delta") or {}
                if not delta and choices[0].get("message"):
                    delta = choices[0]["message"]
                if THINKING_MODEL and delta.get("reasoning_content"):
                    reason_all += delta["reasoning_content"]
                if delta.get("content"):
                    content_all += delta["content"]
        return content_all, reason_all


def main() -> None:
    os.chdir(ROOT)
    host = (os.environ.get("HOST") or os.environ.get("LLM_HOST") or "0.0.0.0").strip()
    server = ThreadingHTTPServer((host, PORT), Handler)
    # 打印本机内网地址，方便局域网访问
    lan = ""
    try:
        import socket

        with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as s:
            s.connect(("8.8.8.8", 80))
            lan = s.getsockname()[0]
    except Exception:
        lan = "127.0.0.1"
    print(f"康小护 LLM server bound {host}:{PORT}")
    print(f"  local : http://127.0.0.1:{PORT}/agent.html")
    if lan and lan != "127.0.0.1":
        print(f"  lan   : http://{lan}:{PORT}/agent.html")
    print(
        f"configured={CONFIGURED} model={MODEL if CONFIGURED else '-'} "
        f"thinking={THINKING_MODEL} env={ENV_FILE}"
    )
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nbye")


if __name__ == "__main__":
    main()
