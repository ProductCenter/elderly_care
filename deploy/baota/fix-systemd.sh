#!/usr/bin/env bash
# 修复「Unit kangyang-mall.service has a bad unit file setting」
# 常见原因：ExecStart 写成了相对路径 python3（systemd 必须用绝对路径）
# 用法（服务器 root）：
#   bash /www/wwwroot/kangyang-mall/deploy/baota/fix-systemd.sh

set -euo pipefail

SITE_DIR="${SITE_DIR:-/www/wwwroot/kangyang-mall}"
APP_PORT="${APP_PORT:-8091}"
SERVICE=/etc/systemd/system/kangyang-mall.service

PY="$(command -v python3)"
[[ "$PY" = /* ]] || PY=/usr/bin/python3
[[ -x "$PY" ]] || { echo "找不到 python3: $PY"; exit 1; }
[[ -f "$SITE_DIR/scripts/llm_server.py" ]] || { echo "找不到 $SITE_DIR/scripts/llm_server.py"; exit 1; }

RUN_USER=www
RUN_GROUP=www
if ! id www >/dev/null 2>&1; then
  RUN_USER=root
  RUN_GROUP=root
fi

if [[ -f "$SITE_DIR/llm.env" ]]; then
  grep -E '^[A-Za-z_][A-Za-z0-9_]*=' "$SITE_DIR/llm.env" | sed 's/^export //' >"$SITE_DIR/llm.env.systemd" || true
fi

{
  echo "[Unit]"
  echo "Description=Kangyang Mall H5 + LLM proxy"
  echo "After=network.target"
  echo
  echo "[Service]"
  echo "Type=simple"
  echo "WorkingDirectory=$SITE_DIR"
  echo "Environment=HOST=0.0.0.0"
  echo "Environment=PORT=$APP_PORT"
  if [[ -s "$SITE_DIR/llm.env.systemd" ]]; then
    echo "EnvironmentFile=-$SITE_DIR/llm.env.systemd"
  fi
  echo "ExecStart=$PY $SITE_DIR/scripts/llm_server.py"
  echo "Restart=always"
  echo "RestartSec=3"
  echo "User=$RUN_USER"
  echo "Group=$RUN_GROUP"
  echo
  echo "[Install]"
  echo "WantedBy=multi-user.target"
} >"$SERVICE"

echo "==> 已写入 $SERVICE"
echo "----"
cat "$SERVICE"
echo "----"

systemctl daemon-reload
systemctl enable kangyang-mall
systemctl restart kangyang-mall
systemctl --no-pager --full status kangyang-mall | head -25
echo
curl -sS "http://127.0.0.1:${APP_PORT}/api/llm/status" || true
echo
