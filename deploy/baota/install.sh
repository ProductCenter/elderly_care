#!/usr/bin/env bash
# 宝塔服务器一键部署：静态 H5 + Python 智伴（同端口）
# 用法（在服务器上）：
#   bash deploy/baota/install.sh
#   或：SITE_DIR=/www/wwwroot/kangyang-mall DOMAIN=demo.example.com bash deploy/baota/install.sh

set -euo pipefail

SITE_DIR="${SITE_DIR:-/www/wwwroot/kangyang-mall}"
APP_PORT="${APP_PORT:-8091}"
DOMAIN="${DOMAIN:-}"
# systemd 的 ExecStart 必须是绝对路径，不能写 python3
if [[ -n "${PYTHON:-}" && "${PYTHON}" = /* ]]; then
  PY="$PYTHON"
else
  PY="$(command -v "${PYTHON:-python3}" 2>/dev/null || true)"
fi
if [[ -z "$PY" || "$PY" != /* ]]; then
  for c in /usr/bin/python3 /usr/local/bin/python3 /bin/python3; do
    [[ -x "$c" ]] && PY="$c" && break
  done
fi
if [[ -z "$PY" || "$PY" != /* ]]; then
  echo "找不到可用的 python3 绝对路径，请先安装 Python3" >&2
  exit 1
fi

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"

echo "==> 部署目录: $SITE_DIR"
echo "==> 源码目录: $ROOT"
echo "==> 端口: $APP_PORT"
echo "==> Python: $PY"

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

# systemd 对 EnvironmentFile 较严：去掉 export、空行保留、值勿含未转义空格问题
if [[ -f llm.env ]]; then
  tmp_env="$(mktemp)"
  # 仅保留 KEY=VALUE；去掉 export 前缀与行内注释外的非法行
  grep -E '^[A-Za-z_][A-Za-z0-9_]*=' llm.env | sed 's/^export //' >"$tmp_env" || true
  # 空文件时不要挂 EnvironmentFile，避免解析失败
  if [[ -s "$tmp_env" ]]; then
    cp "$tmp_env" llm.env.systemd
  else
    rm -f llm.env.systemd
  fi
  rm -f "$tmp_env"
fi

RUN_USER=www
RUN_GROUP=www
if ! id www >/dev/null 2>&1; then
  RUN_USER=root
  RUN_GROUP=root
fi

# systemd 守护
SERVICE=/etc/systemd/system/kangyang-mall.service
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
  if [[ -f "$SITE_DIR/llm.env.systemd" ]]; then
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

chown -R "$RUN_USER:$RUN_GROUP" "$SITE_DIR" 2>/dev/null || true
systemctl daemon-reload
systemctl enable kangyang-mall
systemctl restart kangyang-mall
sleep 1
systemctl --no-pager --full status kangyang-mall | head -25 || true
echo
echo "==> 若仍失败可执行: journalctl -u kangyang-mall -n 50 --no-pager"

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
