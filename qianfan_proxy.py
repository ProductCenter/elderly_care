#!/usr/bin/env python3
"""百度千帆对话代理（OpenAI SDK）— 支持思考过程 + SSE 流式输出。

模型：deepseek-v3.2-think
思维链字段：reasoning_content
"""

from __future__ import annotations

import json
import os
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parent


def load_env() -> None:
    env_path = ROOT / ".env"
    if not env_path.exists():
        return
    for line in env_path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))


load_env()

API_KEY = os.environ.get("QIANFAN_API_KEY", "").strip()
MODEL = os.environ.get("QIANFAN_MODEL", "deepseek-v3.2-think").strip()
PORT = int(os.environ.get("QIANFAN_PROXY_PORT", "8899"))
HOST = os.environ.get("QIANFAN_PROXY_HOST", "127.0.0.1").strip() or "127.0.0.1"
BASE_URL = os.environ.get("QIANFAN_BASE_URL", "https://qianfan.baidubce.com/v2").strip()

SYSTEM_PROMPT = os.environ.get(
    "QIANFAN_SYSTEM_PROMPT",
    """你是「智护助手」的智伴，面向养老院护工/护士/主管。优先协助日常照护：任务、记录、预警、交班；其次协助入住申请与评估。

【产品安全边界】
智能体只提供记录、提醒、摘要和辅助建议；诊疗、用药、护理等级调整及高风险处置须由具备资质人员确认。回复中涉及高风险时要口头提醒人工确认。

【主线 A · 日常照护（优先）】
- 今日任务/待办 / 今日照护待办 → 由前端规则直达列出本班待办；需要打开任务页时用 ACTION:OPEN_ZH_TASKS
- 护理服务留痕 / 快速语音记录 / 服务留痕 → 由前端规则直达，嵌在对话中填写（语音/文字/图片）；不要要求跳到独立页。需要时末尾可写 ACTION:OPEN_ZH_VOICE
- 风险预警 → ACTION:OPEN_ZH_ALERTS
- 服务台账 → ACTION:OPEN_ZH_LEDGER
- 长者照护档案 → ACTION:OPEN_ZH_ELDER 或 ACTION:OPEN_ZH_ELDER:<姓名或床位>
- 交接班摘要 → ACTION:OPEN_ZH_HANDOVER
- 主管看板 → ACTION:OPEN_ZH_SUPERVISOR
- 家属服务 → ACTION:OPEN_ZH_FAMILY
- 智能体中心 → ACTION:OPEN_ZH_AGENTS
- 工作台 → ACTION:OPEN_WORKBENCH

可根据上下文中的任务/预警/长者列表给出优先级建议；打开页面前先用一两句说明依据。

【主线 B · 入住申请与评估】
- 入住申请 = 建档；入住评估 = 挂在同一申请档案上。无申请不可评估。
- 状态：创建申请 → 待补充资料 → 待评估 → 评估中 → 待审核 → 待家属确认 → 可入住/有条件接收/暂缓或不建议
- ACTION:OPEN_CREATE / CREATE:<姓名>|<性别>|<年龄>|<类型>
- ACTION:OPEN_PATCH / OPEN_DETAIL:<申请编号>[:步骤]
  步骤=patch|base|health|adl|cog|risk|care|review|sign|log
- ACTION:OPEN_LIST / OPEN_RISKS / FILTER:<状态> / SET_STEP:<步骤> / TOGGLE_ROLE / CLOSE

回答要求：
1. 简体中文，专业温暖，短段落，适合手机。
2. 需要跳转页面时，回复末尾单独一行写 ACTION（可多行）；不要写进代码块。
3. 申请编号、长者姓名必须来自上下文，禁止编造。
4. 可用 Markdown；思考过程只写业务判断，严禁出现 ACTION、API、JSON、路由或代码。
5. 用户问交班/任务/预警时优先走主线 A；问新建申请/评估时走主线 B。""",
).strip()


def sanitize_thinking(raw: str) -> str:
    """展示给用户的思考过程：去掉技术/路由相关内容。"""
    import re
    s = raw or ""
    s = re.sub(r"(?m)^\s*ACTION\s*[:：].*$", "", s, flags=re.I)
    s = re.sub(
        r"(?m)^.*(?:OPEN_|SET_STEP|FILTER:|CREATE:|DEMO_|TOGGLE_|CLOSE\b|API|SDK|SSE|HTTP|JSON|qianfan|千帆|reasoning_content|系统提示|路由指令|ACTION\s*指令).*$",
        "",
        s,
        flags=re.I,
    )
    s = re.sub(r"```[\s\S]*?```", "", s)
    s = re.sub(r"`[^`]+`", "", s)
    s = re.sub(r"\n{3,}", "\n\n", s).strip()
    return s



def explain_qianfan_error(err: BaseException) -> str:
    """把 SDK/网络异常转成可操作的中文提示。"""
    text = str(err) or type(err).__name__
    low = text.lower()
    name = type(err).__name__.lower()
    if "connection error" in low or "connecterror" in name or "connecttimeout" in name:
        return (
            "无法连接百度千帆 API（Connection error）。"
            "请在服务器上检查：1) 能否访问 https://qianfan.baidubce.com ；"
            "2) .env 中 QIANFAN_BASE_URL 是否为 https://qianfan.baidubce.com/v2 ；"
            "3) 防火墙/代理是否放行出站 HTTPS；4) systemctl restart admission-qianfan 后重试。"
        )
    if "invalid_model" in low or "does not exist" in low:
        return "模型无权限或不存在，请检查 QIANFAN_MODEL。"
    if "api_key" in low or "unauthorized" in low or "401" in low or "invalid_api_key" in low:
        return "API Key 无效，请检查 .env 中 QIANFAN_API_KEY。"
    if "timeout" in low or "timed out" in low:
        return "调用千帆超时，请检查服务器出站网络或稍后重试。"
    return ""


def get_client():
    try:
        from openai import OpenAI
    except ImportError as e:
        raise RuntimeError("请先安装 OpenAI SDK：pip install openai") from e
    if not API_KEY:
        raise RuntimeError("未配置 QIANFAN_API_KEY，请检查 .env")
    # 显式超时，避免长时间挂起后只返回笼统 Connection error
    return OpenAI(base_url=BASE_URL, api_key=API_KEY, timeout=60.0)


def probe_qianfan_outbound() -> dict:
    """轻量探测：能否从本机连上千帆域名（不消耗模型额度）。"""
    import urllib.error
    import urllib.request

    url = BASE_URL.rstrip("/") + "/"
    try:
        req = urllib.request.Request(url, method="GET", headers={"User-Agent": "admission-qianfan-probe"})
        with urllib.request.urlopen(req, timeout=8) as resp:
            code = getattr(resp, "status", None) or resp.getcode()
        return {"reachable": True, "http_status": int(code), "url": BASE_URL}
    except urllib.error.HTTPError as e:
        # API 根路径常返回 4xx，但说明 TCP/TLS 已通
        return {"reachable": True, "http_status": int(e.code), "url": BASE_URL}
    except Exception as e:  # noqa: BLE001
        return {"reachable": False, "error": str(e), "url": BASE_URL}


def build_messages(body: dict) -> tuple[list[dict], str]:
    user_msg = (body.get("message") or "").strip()
    context = (body.get("context") or "").strip()
    history = body.get("history") or []
    model = (body.get("model") or MODEL).strip()
    messages: list[dict] = [{"role": "system", "content": SYSTEM_PROMPT}]
    if context:
        messages.append({"role": "system", "content": "当前系统上下文：\n" + context[:4000]})
    for h in history[-48:]:
        role = h.get("role")
        content = (h.get("content") or "").strip()
        if role in ("user", "assistant") and content:
            messages.append({"role": role, "content": content})
    messages.append({"role": "user", "content": user_msg})
    return messages, model


def extract_delta_fields(delta) -> tuple[str, str]:
    """返回 (reasoning_delta, content_delta)。"""
    reasoning = ""
    content = ""
    if delta is None:
        return reasoning, content
    # SDK 对象或 dict
    if isinstance(delta, dict):
        reasoning = delta.get("reasoning_content") or delta.get("reasoning") or ""
        content = delta.get("content") or ""
        return reasoning or "", content or ""
    reasoning = getattr(delta, "reasoning_content", None) or getattr(delta, "reasoning", None) or ""
    content = getattr(delta, "content", None) or ""
    # 部分版本把额外字段放在 model_extra
    extra = getattr(delta, "model_extra", None) or {}
    if not reasoning and isinstance(extra, dict):
        reasoning = extra.get("reasoning_content") or extra.get("reasoning") or ""
    return reasoning or "", content or ""


def stream_qianfan(messages: list[dict], model: str):
    """生成 (event_type, payload_dict) 。"""
    client = get_client()
    stream = client.chat.completions.create(
        model=model,
        messages=messages,
        stream=True,
        extra_body={
            "stop": [],
            "web_search": {"enable": False},
            "thinking": {"type": "enabled"},
        },
    )
    full_think = ""
    full_content = ""
    resp_model = model
    resp_id = None
    for chunk in stream:
        if getattr(chunk, "id", None):
            resp_id = chunk.id
        if getattr(chunk, "model", None):
            resp_model = chunk.model
        choices = getattr(chunk, "choices", None) or []
        if not choices:
            continue
        delta = choices[0].delta
        think_d, content_d = extract_delta_fields(delta)
        if think_d:
            full_think += think_d
            # 流式增量原样下发；完整清洗在 done 与前端展示时做
            yield "thinking", {"delta": think_d}
        if content_d:
            full_content += content_d
            yield "content", {"delta": content_d}
    yield "done", {
        "model": resp_model,
        "id": resp_id,
        "thinking": sanitize_thinking(full_think),
        "reply": full_content,
    }


def call_qianfan(messages: list[dict], model: str | None = None) -> dict:
    """非流式（兼容旧接口），同样尽量取出 reasoning_content。"""
    client = get_client()
    response = client.chat.completions.create(
        model=model or MODEL,
        messages=messages,
        extra_body={
            "stop": [],
            "web_search": {"enable": False},
            "thinking": {"type": "enabled"},
        },
    )
    choice = response.choices[0] if response.choices else None
    content = ""
    thinking = ""
    if choice and choice.message:
        content = choice.message.content or ""
        thinking = getattr(choice.message, "reasoning_content", None) or ""
        extra = getattr(choice.message, "model_extra", None) or {}
        if not thinking and isinstance(extra, dict):
            thinking = extra.get("reasoning_content") or ""
    return {
        "id": getattr(response, "id", None),
        "model": getattr(response, "model", model or MODEL),
        "raw_content": content,
        "thinking": sanitize_thinking(thinking or ""),
        "usage": (
            {
                "prompt_tokens": getattr(response.usage, "prompt_tokens", None),
                "completion_tokens": getattr(response.usage, "completion_tokens", None),
                "total_tokens": getattr(response.usage, "total_tokens", None),
            }
            if getattr(response, "usage", None)
            else None
        ),
    }


class Handler(BaseHTTPRequestHandler):
    def _cors(self) -> None:
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def _cache_control_for(self, suffix: str, path: str) -> None:
        """本地预览：禁用 HTML 强缓存；JS/CSS 亦要求每次校验。"""
        # 入口页强制不缓存，避免改完刷新仍看到旧壳
        if path in ("/", "/index.html", "/admission-assessment.html") or suffix == ".html":
            self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
            self.send_header("Pragma", "no-cache")
            self.send_header("Expires", "0")
            return
        if suffix in (".js", ".css", ".json", ".md", ".svg"):
            self.send_header("Cache-Control", "no-cache, must-revalidate")
            return
        # 图片等：短缓存即可（HTML 引用常带 ?v= 查询参数）
        if suffix in (".png", ".jpg", ".webp"):
            self.send_header("Cache-Control", "public, max-age=60, must-revalidate")
            return
        self.send_header("Cache-Control", "no-cache, must-revalidate")

    def _json(self, code: int, obj: dict) -> None:
        data = json.dumps(obj, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self._cors()
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def _sse_start(self) -> None:
        self.send_response(200)
        self.send_header("Content-Type", "text/event-stream; charset=utf-8")
        self.send_header("Cache-Control", "no-cache")
        self.send_header("Connection", "keep-alive")
        self.send_header("X-Accel-Buffering", "no")
        self._cors()
        self.end_headers()

    def _sse_send(self, event: str, payload: dict) -> None:
        data = json.dumps({"type": event, **payload}, ensure_ascii=False)
        self.wfile.write(f"data: {data}\n\n".encode("utf-8"))
        self.wfile.flush()

    def do_OPTIONS(self) -> None:  # noqa: N802
        self.send_response(204)
        self._cors()
        self.end_headers()

    def do_GET(self) -> None:  # noqa: N802
        path = self.path.split("?")[0]
        if path in ("/api/health", "/health"):
            sdk_ok = True
            try:
                import openai  # noqa: F401
            except ImportError:
                sdk_ok = False
            payload = {
                "ok": True,
                "service": "qianfan-proxy",
                "sdk": "openai",
                "sdk_installed": sdk_ok,
                "base_url": BASE_URL,
                "model": MODEL,
                "stream": True,
                "thinking": True,
                "key_configured": bool(API_KEY),
                "key_prefix": (API_KEY[:20] + "…") if API_KEY else "",
            }
            # /api/health?probe=1 额外探测出站能否连千帆
            qs = self.path.split("?", 1)[1] if "?" in self.path else ""
            if "probe=1" in qs or "probe=true" in qs:
                payload["outbound"] = probe_qianfan_outbound()
            self._json(200, payload)
            return

        if path in ("/", "/index.html"):
            file_path = ROOT / "index.html"
        elif path == "/admission-assessment.html":
            file_path = ROOT / "admission-assessment.html"
        else:
            name = path.lstrip("/")
            if ".." in name or name.startswith("/"):
                self._json(400, {"error": "bad path"})
                return
            file_path = ROOT / name

        if file_path.is_file() and file_path.suffix.lower() in {
            ".html",
            ".js",
            ".css",
            ".json",
            ".svg",
            ".png",
            ".jpg",
            ".webp",
            ".md",
        }:
            data = file_path.read_bytes()
            suffix = file_path.suffix.lower()
            ctype = {
                ".html": "text/html; charset=utf-8",
                ".js": "application/javascript; charset=utf-8",
                ".css": "text/css; charset=utf-8",
                ".json": "application/json; charset=utf-8",
                ".svg": "image/svg+xml",
                ".png": "image/png",
                ".jpg": "image/jpeg",
                ".webp": "image/webp",
                ".md": "text/markdown; charset=utf-8",
            }.get(suffix, "application/octet-stream")
            self.send_response(200)
            self.send_header("Content-Type", ctype)
            self._cache_control_for(suffix, path)
            self._cors()
            self.send_header("Content-Length", str(len(data)))
            self.end_headers()
            self.wfile.write(data)
            return

        self._json(404, {"error": "not found"})

    def do_POST(self) -> None:  # noqa: N802
        path = self.path.split("?")[0]
        length = int(self.headers.get("Content-Length") or 0)
        raw = self.rfile.read(length) if length else b"{}"
        try:
            body = json.loads(raw.decode("utf-8") or "{}")
        except json.JSONDecodeError:
            self._json(400, {"error": "invalid json"})
            return

        if path in ("/api/chat", "/api/chat/stream"):
            user_msg = (body.get("message") or "").strip()
            if not user_msg:
                self._json(400, {"error": "message required"})
                return
            want_stream = path.endswith("/stream") or body.get("stream", True)
            try:
                messages, model = build_messages(body)
            except Exception as e:  # noqa: BLE001
                self._json(400, {"error": str(e)})
                return

            if want_stream:
                try:
                    self._sse_start()
                    self._sse_send("start", {"model": model})
                    for event, payload in stream_qianfan(messages, model):
                        self._sse_send(event, payload)
                except Exception as e:  # noqa: BLE001
                    err_text = str(e)
                    hint = explain_qianfan_error(e)
                    try:
                        # 若尚未开始 SSE，改 JSON；已开始则发 error 事件
                        if not self.wfile.closed:
                            self._sse_send("error", {"error": err_text, "hint": hint})
                    except Exception:
                        pass
                return

            # 非流式
            try:
                result = call_qianfan(messages, model=model)
                self._json(
                    200,
                    {
                        "ok": True,
                        "reply": result.get("raw_content") or "",
                        "thinking": result.get("thinking") or "",
                        "model": result.get("model") or model,
                        "usage": result.get("usage"),
                        "id": result.get("id"),
                    },
                )
            except Exception as e:  # noqa: BLE001
                err_text = str(e)
                hint = explain_qianfan_error(e)
                self._json(502, {"ok": False, "error": err_text, "hint": hint, "model": model})
            return

        self._json(404, {"error": "not found"})

    def log_message(self, fmt: str, *args) -> None:
        print(f"[qianfan-proxy] {self.address_string()} - {fmt % args}")


def main() -> None:
    if not API_KEY:
        print("警告：未找到 QIANFAN_API_KEY，请复制 .env.example 为 .env 并填写。")
    try:
        import openai  # noqa: F401
    except ImportError:
        print("警告：未安装 openai，请执行：pip install openai")
    server = ThreadingHTTPServer((HOST, PORT), Handler)
    print(f"千帆代理已启动: http://{HOST}:{PORT}")
    print(f"智护助手:       http://127.0.0.1:{PORT}/")
    print(f"照护帮手原版:   http://127.0.0.1:{PORT}/admission-assessment.html")
    print(f"健康检查:     http://127.0.0.1:{PORT}/api/health")
    print(f"流式接口:     POST /api/chat/stream  (SSE: thinking/content/done)")
    print(f"SDK / 模型:   openai / {MODEL}")
    if HOST not in ("127.0.0.1", "localhost", "::1"):
        print("注意：当前监听非本机回环地址，请确保仅内网可访问或已加鉴权/限流。")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n已停止")


if __name__ == "__main__":
    main()
