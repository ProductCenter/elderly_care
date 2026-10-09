#!/usr/bin/env bash
# 宝塔服务器诊断：服务 / 端口 / 页面是否正常
# 用法：bash /www/wwwroot/kangyang-mall/deploy/baota/diagnose.sh

set -u
SITE_DIR="${SITE_DIR:-/www/wwwroot/kangyang-mall}"
APP_PORT="${APP_PORT:-8091}"

echo "======== 1) 基本路径 ========"
echo "SITE_DIR=$SITE_DIR"
ls -la "$SITE_DIR/scripts/llm_server.py" 2>&1 || true
ls -la "$SITE_DIR/index.html" 2>&1 || true
command -v python3; python3 -V 2>&1 || true

echo
echo "======== 2) systemd 单元内容 ========"
if [[ -f /etc/systemd/system/kangyang-mall.service ]]; then
  cat /etc/systemd/system/kangyang-mall.service
else
  echo "缺少 /etc/systemd/system/kangyang-mall.service"
fi

echo
echo "======== 3) 服务状态 ========"
systemctl daemon-reload 2>&1 || true
systemctl status kangyang-mall --no-pager -l 2>&1 | head -40 || true

echo
echo "======== 4) 最近日志 ========"
journalctl -u kangyang-mall -n 40 --no-pager 2>&1 || true

echo
echo "======== 5) 端口监听 ========"
ss -lntp 2>/dev/null | grep -E ":${APP_PORT}\\b|:80\\b|:443\\b" || netstat -lntp 2>/dev/null | grep -E ":${APP_PORT}\\b|:80\\b|:443\\b" || true

echo
echo "======== 6) 本机 HTTP 探测 ========"
echo "-- /api/llm/status --"
curl -sS -m 5 -w "\nHTTP %{http_code}\n" "http://127.0.0.1:${APP_PORT}/api/llm/status" 2>&1 || true
echo "-- /index.html 前 5 行 --"
curl -sS -m 5 -w "\nHTTP %{http_code}\n" "http://127.0.0.1:${APP_PORT}/index.html" 2>&1 | head -8 || true

echo
echo "======== 7) 公网 IP（供浏览器访问） ========"
curl -sS -m 5 ifconfig.me 2>/dev/null || curl -sS -m 5 ip.sb 2>/dev/null || hostname -I 2>/dev/null || true
echo
echo "浏览器可试: http://<公网IP>:${APP_PORT}/index.html"
echo "若走宝塔域名反代: http://你的域名/index.html"
echo
echo "======== 结束：请把以上全部输出发给助手 ========"
