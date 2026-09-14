# 春风康养商城 · 蓝湖交付包

> 说明：蓝湖**不能**直接把 HTML 当设计稿导入。本目录把现有 H5 原型整理为可上传蓝湖的**产品文档** + **页面截图**。

## 目录结构

```
lanhu-docs/
├── index.html                          # 在线版交付文档（含截图与规范）
├── 春风康养商城-蓝湖交付文档.pdf         # 可直接上传蓝湖「产品」
├── screenshots/                        # 各页面截图（设计参考）
└── README.md                           # 本说明
```

## 上传到蓝湖

### 方式 A：产品文档（推荐，最快）

1. 打开 [蓝湖](https://lanhuapp.com) → 进入团队项目  
2. 顶部切换到 **「产品」**  
3. 点击 **「上传」** → 选择本目录中的  
   `春风康养商城-蓝湖交付文档.pdf`  
4. 上传完成后即可在蓝湖内预览、评论、分享  

### 方式 B：外部链接文档

1. 将 `lanhu-docs/` 部署到可访问地址（或本地起服务）  
2. 蓝湖「产品」→ 添加 **外部链接** → 填入 `index.html` 地址  

本地预览：

```bash
cd kangyang-mall/lanhu-docs
python3 -m http.server 5199
# 打开 http://127.0.0.1:5199/
```

### 方式 C：正式设计标注稿（需设计师）

1. 设计师按 `screenshots/` 在 Sketch / Figma / PS 还原画板（宽度 390）  
2. 用蓝湖插件上传设计图，生成标注与切图  
3. 产品文档可与设计图分组互相引用  

## 与源码对应关系

| 截图 | 源码页面 |
|------|----------|
| 01-home | index.html |
| 02~04-detail-* | detail.html |
| 05~07-order-* | order.html |
| 08-orders | orders.html |
| 09-mine | mine.html |
| 10-merchant-verify | merchant-verify.html |
| 11-order-detail | order-detail.html |

H5 预览：

```bash
cd kangyang-mall
python3 -m http.server 5173
# http://127.0.0.1:5173/
```
