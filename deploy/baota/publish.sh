#!/usr/bin/env bash
# 宝塔一键发布：网站(H5) + Python(智伴同端口)
# 在服务器 root 下执行：
#   cd /www/wwwroot/kangyang-mall && bash deploy/baota/publish.sh
# 有域名时：
#   DOMAIN=www.example.com bash deploy/baota/publish.sh

set -euo pipefail

SITE_DIR="${SITE_DIR:-$(cd "$(dirname "$0")/../.." && pwd)}"
APP_PORT="${APP_PORT:-8091}"
DOMAIN="${DOMAIN:-}"

cd "$SITE_DIR"
echo "==> 发布目录: $SITE_DIR"

# 1) 修并启动 systemd（含绝对路径 python）
bash "$SITE_DIR/deploy/baota/fix-systemd.sh"

# 2) 确保 llm.env 存在
if [[ ! -f "$SITE_DIR/llm.env" ]]; then
  cp "$SITE_DIR/llm.env.example" "$SITE_DIR/llm.env"
  echo "==> 已创建 llm.env，请填 LLM_API_KEY 后执行: systemctl restart kangyang-mall"
fi

# 3) 本机探测
echo
echo "==> 本机检测"
curl -sS -m 5 "http://127.0.0.1:${APP_PORT}/api/llm/status" || true
echo
CODE=$(curl -sS -m 5 -o /dev/null -w "%{http_code}" "http://127.0.0.1:${APP_PORT}/index.html" || echo 000)
echo "index.html HTTP $CODE"

# 4) 公网 IP
PUB_IP=$(curl -sS -m 5 ifconfig.me 2>/dev/null || curl -sS -m 5 ip.sb 2>/dev/null || true)
echo
echo "======== 访问地址 ========"
if [[ -n "$DOMAIN" ]]; then
  echo "  http://${DOMAIN}/index.html"
  echo "  http://${DOMAIN}/agent.html"
  echo "（请在宝塔网站中把该域名反代到 127.0.0.1:${APP_PORT}，可粘贴 deploy/baota/nginx.location.conf）"
else
  echo "  http://${PUB_IP:-你的公网IP}:${APP_PORT}/index.html"
  echo "  http://${PUB_IP:-你的公网IP}:${APP_PORT}/agent.html"
  echo "安全组/防火墙请放行 ${APP_PORT}（或配置域名走 80 反代）"
fi
echo "=========================="
