# 百度千帆对接说明

## 官方调用方式（OpenAI SDK）

```bash
pip install openai
```

```python
from openai import OpenAI
client = OpenAI(
    base_url="https://qianfan.baidubce.com/v2",
    api_key="你的密钥",
)
response = client.chat.completions.create(
    model="deepseek-v3.2-think",
    messages=[
        {"role": "system", "content": "护工"},
        {"role": "user", "content": "你好"},
    ],
    extra_body={
        "stop": [],
        "web_search": {"enable": False},
        "thinking": {"type": "enabled"},
    },
)
print(response)
```

- API Key：https://console.bce.baidu.com/qianfan/ais/console/apiKey  
- 模型列表：https://cloud.baidu.com/doc/qianfan-docs/s/7m95lyy43  

## 本项目本地启动

```bash
cp -n .env.example .env   # 填写 QIANFAN_API_KEY
./start_proxy.sh          # 或：.venv/bin/python qianfan_proxy.py
```

打开：http://127.0.0.1:8899/admission-assessment.html  

健康检查：`curl -s http://127.0.0.1:8899/api/health`  
出站探测：`curl -s 'http://127.0.0.1:8899/api/health?probe=1'`

> 浏览器 `ERR_CONNECTION_REFUSED` = 代理未运行，不是前端坏了。

## 关键环境变量（`.env`）

| 变量 | 说明 | 默认 |
|------|------|------|
| `QIANFAN_API_KEY` | 千帆 API Key | （必填） |
| `QIANFAN_MODEL` | 模型名 | `deepseek-v3.2-think` |
| `QIANFAN_BASE_URL` | OpenAI 兼容地址 | `https://qianfan.baidubce.com/v2` |
| `QIANFAN_PROXY_HOST` | 监听地址 | `127.0.0.1` |
| `QIANFAN_PROXY_PORT` | 监听端口 | `8899` |

## 前端接口

智伴默认走千帆，经 `POST /api/chat/stream`（SSE）：

- `thinking`：思考过程增量（`reasoning_content`）
- `content`：正文增量
- `done`：完整 thinking + reply
- `error`：失败（含中文 `hint`）

页面会展示思考过程并流式打字；模型输出末尾的 `ACTION:` 驱动打开表单/档案。  
连接失败时自动重试，并在必要时使用本地兜底路由（不会因一次瞬断永久关闭智能模式）。

## 宝塔面板发布

见根目录 [BAOTA.md](./BAOTA.md) 与 `deploy/baota/`。

## 安全

Key 只放在 `.env`（已 gitignore），不要写进前端 HTML。若 Key 曾在聊天中暴露，请到控制台轮换。
