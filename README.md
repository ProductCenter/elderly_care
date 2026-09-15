# 春风康养 · 商城 / 订单 / 核销

微信小程序风格 H5 Demo。

## 预览

```bash
cd kangyang-mall
python3 -m http.server 5173
```

### AI 智伴（对接大模型）

```bash
cd kangyang-mall
cp llm.env.example llm.env   # 填入 LLM_API_KEY 或 QIANFAN_API_KEY
python3 scripts/llm_server.py
# 打开 http://127.0.0.1:8091/agent.html（商城与智伴同端口）
```

默认走 DeepSeek / 千帆 OpenAI 兼容接口（`LLM_BASE_URL` / `LLM_MODEL` 可改）。未配置密钥时进入演示模式，页面仍可对话。

## 云端发布（必须含 Python）

纯静态托管（仅 HTML）**不能**跑智伴大模型。完整发布请用 **Python 同端口服务**（`scripts/llm_server.py` 既托管页面又提供 `/api/chat`）。

### 方式 1：Render（推荐，含 Python）

1. 把本仓库同步到 GitHub（或在 Render 直接连仓库）
2. 打开 https://dashboard.render.com → New → Blueprint → 选本仓库（读取 `render.yaml`）
3. 在环境变量填入 `LLM_API_KEY`（可选 `LLM_BASE_URL` / `LLM_MODEL`）
4. 部署完成后访问：`https://<服务名>.onrender.com/index.html` 与 `/agent.html`

### 方式 2：Docker（任意云主机 / 容器服务）

```bash
docker build -t kangyang-mall .
docker run --rm -p 8091:8091 \
  -e LLM_API_KEY=sk-xxx \
  -e LLM_BASE_URL=https://api.deepseek.com/v1 \
  -e LLM_MODEL=deepseek-chat \
  kangyang-mall
```

### 方式 3：Linux 云主机

```bash
git clone <仓库地址> && cd kangyang-mall
cp llm.env.example llm.env   # 填写密钥
HOST=0.0.0.0 PORT=8091 python3 scripts/llm_server.py
```

> 不要用 Vercel 纯静态部署本项目的智伴能力；Vercel Hobby 也无法部署 Origin 私有仓。

### 方式 4：宝塔面板（含 Python，推荐有控服务器时用）

1. 把项目上传/克隆到服务器，例如 `/www/wwwroot/kangyang-mall`
2. 在服务器执行：

```bash
cd /www/wwwroot/kangyang-mall
bash deploy/baota/install.sh
# 或指定域名：
# DOMAIN=your.domain.com bash deploy/baota/install.sh
```

3. 编辑 `/www/wwwroot/kangyang-mall/llm.env`，填入 `LLM_API_KEY`
4. 宝塔 → 网站 → 添加站点 → 配置文件里反代到 `127.0.0.1:8091`  
   （可直接粘贴 `deploy/baota/nginx.location.conf`）
5. 安全组/防火墙放行 80/443；访问：

- `http://你的域名/index.html`
- `http://你的域名/agent.html`

也可用宝塔 **Supervisor** 导入 `deploy/baota/supervisor.ini` 守护进程（与 systemd 二选一）。

| 页面 | 地址 |
|------|------|
| 商城 | http://127.0.0.1:8091/ |
| AI 智伴 | http://127.0.0.1:8091/agent.html |
| 我的 | http://127.0.0.1:5173/mine.html |
| 我的订单 | http://127.0.0.1:5173/orders.html |
| 到店下单 | http://127.0.0.1:5173/order.html?type=instore |
| 到家下单 | http://127.0.0.1:5173/order.html?type=home |
| 商家核销 | http://127.0.0.1:5173/merchant-verify.html |
| 后台·新增商品 | http://127.0.0.1:5173/product-add.html |
| 健康服务方案 Demo | http://127.0.0.1:5173/health-service/ |
| 睡眠报告列表 | http://127.0.0.1:5173/sleep-reports.html |
| 睡眠报告详情（含方案卡） | http://127.0.0.1:5173/sleep-report.html?id=sr_20260521 |
| 改善方案 / 下单 / 计划 | http://127.0.0.1:5173/sleep-plan.html?reportId=sr_20260521&packageId=SP_ONSET_ANXIETY_8W |
| 今日待办 / 日历 / 预测 | http://127.0.0.1:5173/sleep-todo.html |

## 2.5 到店核销码

1. 到店订单支付成功后自动生成唯一核销码（HMAC 签名 token + 可读编号）
2. 订单详情展示二维码，可放大查看
3. 商家端支持扫码（粘贴 token）与手动输入编号核销
4. 校验：未支付、已核销、门店不匹配、过期、已退款
5. 到家订单不生成核销码

### 验收路径

1. 商城 → 购买 → 选预约时间 → 提交订单  
2. 进入订单详情，查看核销码  
3. 打开商家核销页 →「从最近订单填入」→ 扫码核销  
4. 再核销一次应提示「该订单已核销」  
5. 切换门店为望京店再核销应提示「门店不匹配」  
6. 订单详情点「模拟退款」后核销码失效  
7. `order.html?type=home` 支付后详情页无核销码区域
