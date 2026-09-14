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
