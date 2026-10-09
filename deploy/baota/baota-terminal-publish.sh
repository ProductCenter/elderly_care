#!/usr/bin/env bash
# 在「宝塔面板 → 终端」里整段粘贴执行（无需外网 SSH）
# 前提：代码已在 /www/wwwroot/kangyang-mall
set -euo pipefail
SITE=/www/wwwroot/kangyang-mall
PORT=8091
cd "$SITE"

PY=$(command -v python3 || true)
[[ -x "$PY" ]] || PY=/usr/bin/python3
[[ -x "$PY" ]] || { echo "请先在宝塔安装 Python3"; exit 1; }
[[ -f scripts/llm_server.py ]] || { echo "缺少 scripts/llm_server.py，请先上传项目到 $SITE"; exit 1; }

[[ -f llm.env ]] || cp llm.env.example llm.env

cat >/etc/systemd/system/kangyang-mall.service <<EOF
[Unit]
Description=Kangyang Mall H5 + LLM proxy
After=network.target

[Service]
Type=simple
WorkingDirectory=$SITE
Environment=HOST=0.0.0.0
Environment=PORT=$PORT
ExecStart=$PY $SITE/scripts/llm_server.py
Restart=always
RestartSec=3
User=root

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable kangyang-mall
systemctl restart kangyang-mall
sleep 1
systemctl --no-pager --full status kangyang-mall | head -20 || true
echo
curl -sS -m 5 http://127.0.0.1:$PORT/api/llm/status || true
echo
curl -sS -m 5 -o /dev/null -w "index=%{http_code}\n" http://127.0.0.1:$PORT/index.html || true

# 写入 Nginx 反代片段，方便粘到宝塔网站配置
mkdir -p deploy/baota
cat >deploy/baota/nginx.location.conf <<'NGX'
location / {
    proxy_pass http://127.0.0.1:8091;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_buffering off;
    proxy_read_timeout 3600s;
    proxy_send_timeout 3600s;
}
NGX

echo
echo "==== 下一步（宝塔界面）===="
echo "1. 网站 → 添加站点 → 域名填: 156.253.12.247 （或你的域名）"
echo "2. 网站设置 → 配置文件 → 把 location / 换成 deploy/baota/nginx.location.conf 内容"
echo "3. 保存并重载 Nginx"
echo "4. 浏览器打开: http://156.253.12.247/index.html"
echo "5. 编辑 $SITE/llm.env 填 LLM_API_KEY 后: systemctl restart kangyang-mall"
