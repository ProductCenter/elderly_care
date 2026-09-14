#!/usr/bin/env bash
# 前台启动千帆代理（关掉终端即停止）。本地预览请保持此窗口开着。
set -euo pipefail
cd "$(dirname "$0")"
export PYTHONUNBUFFERED=1
if [[ -x ./.venv/bin/python ]]; then
  PY=./.venv/bin/python
else
  PY=python3
fi
if ! "$PY" -c "import openai" >/dev/null 2>&1; then
  echo "正在安装 OpenAI SDK（pip install openai）…"
  "$PY" -m pip install -q "openai>=1.40.0"
fi
exec "$PY" ./qianfan_proxy.py
