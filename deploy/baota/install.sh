#!/usr/bin/env bash
# 宝塔服务器一键部署：静态 H5 + Python 智伴（同端口）
# 用法（在服务器上）：
#   bash deploy/baota/install.sh
#   或：SITE_DIR=/www/wwwroot/kangyang-mall DOMAIN=demo.example.com bash deploy/baota/install.sh

set -euo pipefail

SITE_DIR="${SITE_DIR:-/www/wwwroot/kangyang-mall}"
APP_PORT="${APP_PORT:-8091}"
DOMAIN="${DOMAIN:-}"
PY="${PYTHON:-python3}"

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"

echo "==> 部署目录: $SITE_DIR"
echo "==> 源码目录: $ROOT"
echo "==> 端口: $APP_PORT"

if [[ "$(id -u)" -ne 0 ]]; then
  echo "建议用 root 或 sudo 执行（写 /www、装 systemd）"
fi

mkdir -p "$SITE_DIR"
rsync -a --delete \
  --exclude '.git' \
  --exclude '.venv' \
  --exclude '.venv-xlsx' \
  --exclude '__pycache__' \
  --exclude 'llm.env' \
  --exclude 'node_modules' \
  --exclude 'kangyang-pad' \
  "$ROOT"/ "$SITE_DIR"/

cd "$SITE_DIR"

if [[ ! -f llm.env ]]; then
  cp llm.env.example llm.env
  echo "==> 已生成 llm.env，请编辑填入 LLM_API_KEY"
fi

# systemd 守护
SERVICE=/etc/systemd/system/kangyang-mall.service
cat > "$SERVICE" <<EOF
[Unit]
Description=Kangyang Mall H5 + LLM proxy
After=network.target

[Service]
Type=simple
WorkingDirectory=$SITE_DIR
Environment=HOST=0.0.0.0
Environment=PORT=$APP_PORT
EnvironmentFile=-$SITE_DIR/llm.env
ExecStart=$PY $SITE_DIR/scripts/llm_server.py
Restart=always
RestartSec=3
User=www
Group=www

[Install]
WantedBy=multi-user.target
EOF

# www 用户可能不存在时回退 root
if ! id www >/dev/null 2>&1; then
  sed -i 's/^User=www/User=root/; s/^Group=www/Group=root/' "$SERVICE"
fi

chown -R www:www "$SITE_DIR" 2>/dev/null || chown -R root:root "$SITE_DIR"
systemctl daemon-reload
systemctl enable kangyang-mall
systemctl restart kangyang-mall
sleep 1
systemctl --no-pager --full status kangyang-mall | head -20 || true

# Nginx 反代片段（宝塔可「配置文件」粘贴）
NGX_SNIPPET="$SITE_DIR/deploy/baota/nginx.site.conf"
mkdir -p "$SITE_DIR/deploy/baota"
cat > "$NGX_SNIPPET" <<EOF
# 宝塔 → 网站 → 设置 → 配置文件：把 location / 换成下面内容（或整站反代）
# 若已有 server_name，保留证书/ssl 段即可
server {
    listen 80;
    $( [[ -n "$DOMAIN" ]] && echo "server_name $DOMAIN;" || echo "# server_name your.domain.com;" )
    client_max_body_size 32m;

    location / {
        proxy_pass http://127.0.0.1:$APP_PORT;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        # 智伴 SSE 流式对话
        proxy_buffering off;
        proxy_read_timeout 3600s;
        proxy_send_timeout 3600s;
    }
}
EOF

echo
echo "==> 部署完成"
echo "    本机探测: curl -s http://127.0.0.1:$APP_PORT/api/llm/status"
echo "    Nginx 片段: $NGX_SNIPPET"
if [[ -n "$DOMAIN" ]]; then
  echo "    建议访问: http://$DOMAIN/index.html  与  http://$DOMAIN/agent.html"
else
  echo "    请在宝塔添加网站并反代到 127.0.0.1:$APP_PORT，或开放防火墙端口 $APP_PORT"
fi
echo "    记得编辑: $SITE_DIR/llm.env  填入大模型密钥"
