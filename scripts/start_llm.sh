#!/bin/bash
# 启动康小护 LLM 代理
pkill -f "llm_server.py" 2>/dev/null
sleep 1
python3 "$(dirname "$0")/llm_server.py"
