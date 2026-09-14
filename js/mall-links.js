/** 商城 Banner / 运营位跳转目标 */
window.MALL_LINK_TYPES = [
  { key: "product", label: "商品详情" },
  { key: "article", label: "文章详情" },
  { key: "activity", label: "活动落地页" },
  { key: "theme", label: "主题活动" },
];

window.MALL_THEME_LINKS = [
  { id: "chronic", label: "慢病守护" },
  { id: "rehab", label: "康复照护" },
  { id: "meal", label: "银发餐桌" },
  { id: "life", label: "乐龄生活" },
  { id: "safe", label: "安心适老" },
];

window.MALL_ARTICLES = [
  {
    id: "art_sleep_guide",
    title: "长者睡眠改善指南",
    summary: "科学作息与夜间护理要点",
    cover: "./assets/cover-health-check.png",
    author: "春风康养 · 护理学堂",
    date: "2026-07-18",
    readMin: 6,
    tags: ["睡眠", "居家护理"],
    relatedProductId: "health_check",
    relatedCta: "预约健康评估",
    paragraphs: [
      "睡眠质量直接影响长者日间精神状态与跌倒风险。建议固定就寝与起床时间，午休控制在 30 分钟以内，避免傍晚大量饮水与咖啡因饮品。",
      "卧室保持安静、微暗与适宜温度；床头留夜灯与扶手，减少起夜摸黑。若有打鼾、憋气或频繁夜醒，应及时进行基础健康评估。",
      "夜间护理可配合轻柔拉伸与放松呼吸；有慢性病或用药影响睡眠时，请遵医嘱调整，切勿自行停药。",
    ],
    tips: ["睡前 1 小时避免刷手机强光", "床边放置防滑拖鞋与呼叫设备", "连续失眠超过一周建议到店评估"],
  },
  {
    id: "art_nutrition",
    title: "社区营养配餐怎么吃更合适",
    summary: "低盐少油，兼顾口味与营养",
    cover: "./assets/cover-nutrition-meal.png",
    author: "春风康养 · 营养组",
    date: "2026-07-22",
    readMin: 5,
    tags: ["营养", "配餐"],
    relatedProductId: "nutrition_meal",
    relatedCta: "查看营养配餐",
    paragraphs: [
      "社区配餐宜「低盐少油、软烂易嚼、色香味兼顾」。蛋白质可来自鱼肉蛋豆，蔬菜尽量切细炖软，主食可粗细搭配。",
      "糖尿病、高血压、肾病等慢病长者需按医嘱控盐控糖；吞咽困难者优先糊状/软食，并在护理人员指导下进食。",
      "订餐后注意保温与分餐卫生；如有剩菜建议及时冷藏，再次加热至彻底热透再食用。",
    ],
    tips: ["每餐尽量包含蔬菜与优质蛋白", "口味清淡不等于寡淡，可用香草提味", "包月订餐可按体质备注忌口"],
  },
  {
    id: "art_rehab",
    title: "居家康复训练注意事项",
    summary: "循序渐进，避免二次损伤",
    cover: "./assets/cover-neck-massage.png",
    author: "春风康养 · 康复师",
    date: "2026-08-01",
    readMin: 7,
    tags: ["康复", "居家"],
    relatedProductId: "neck_massage",
    relatedCta: "了解颈椎舒缓服务",
    paragraphs: [
      "居家康复应遵循「评估—处方—循序渐进」原则，疼痛明显或关节红肿发热时先暂停训练并就医。",
      "训练前热身 5–10 分钟，动作幅度由小到大；完成后做拉伸放松。地面防滑、旁边有人陪同更安全。",
      "颈肩腰等常见不适可配合到店理疗与居家拉伸，但推拿力度与频次需由专业人员把控。",
    ],
    tips: ["不要用疼痛硬扛完成次数", "记录每日完成度，方便复诊沟通", "辅具使用前先学习正确方式"],
  },
  {
    id: "art_safety",
    title: "适老化居家安全清单",
    summary: "防滑、照明与紧急呼叫建议",
    cover: "./assets/cover-therapy-device.png",
    author: "春风康养 · 适老化顾问",
    date: "2026-08-05",
    readMin: 4,
    tags: ["适老化", "安全"],
    relatedProductId: "therapy_device",
    relatedCta: "看看适老辅具",
    paragraphs: [
      "居家跌倒多发生在卫生间、走廊与夜间起身。优先完成：防滑垫、扶手、门槛处理、夜间感应灯。",
      "常用物品放在腰部高度，减少踮脚与弯腰；电源线收纳整齐，避免绊倒。",
      "建议配置一键呼叫或可穿戴报警设备，并让子女/邻里知晓紧急联系方式。",
    ],
    tips: ["浴室干湿分区并加装扶手", "床到卫生间路径保持畅通", "每月检查呼叫设备电量"],
  },
];

window.MALL_ACTIVITIES = [
  {
    id: "act_99_discount",
    title: "超低折扣 · 9.9 折专场",
    summary: "精选到店服务限时优惠",
    cover: "./assets/discount-lifestyle.png",
    period: "2026.09.01 — 2026.09.30",
    badge: "限时",
    highlight: "指定到店服务下单享 9.9 折",
    rules: [
      "活动期内在春风康养小程序下单指定服务即可享受折扣。",
      "优惠可与部分站点券叠加，以结算页为准。",
      "名额有限，先到先得。",
    ],
    benefits: ["到店理疗精选项目", "结算页自动计价", "支持预约到店时段"],
    coupons: [
      { name: "理疗立减", value: "10", tip: "满 50 可用" },
      { name: "首单体验", value: "9.9", tip: "限 1 次" },
    ],
    online: [
      { name: "问智伴怎么选", desc: "按肩颈腰腿推荐项目", href: "./agent.html?q=附近有什么适合长者的到店服务？" },
    ],
    articles: ["art_rehab"],
    products: ["ai_massage", "foot_spa", "neck_massage"],
    relatedProductId: "ai_massage",
    cta: "立即抢购 AI 舒压",
  },
  {
    id: "act_free_check",
    title: "体检套餐 · 安心守护",
    summary: "血压、血糖、体成分筛查，报告有人讲清楚",
    cover: "./assets/cover-health-check.png",
    period: "2026.09.12 — 2026.09.30",
    badge: "公益周",
    highlight: "本周社区中心站免费基础筛查，异常可转正式套餐",
    stats: [
      { n: "1 次", l: "免费筛查名额" },
      { n: "20 分", l: "到店即出" },
      { n: "子女", l: "报告可回传" },
    ],
    rules: [
      "需提前预约到店时段，携带身份证到场。",
      "每位用户活动期内限 1 次免费基础筛查。",
      "异常指标可预约正式体检套餐深度解读，不替代医生诊断。",
    ],
    benefits: ["血压 / 血糖快检", "体成分简易评估", "报告口头解读并推送子女"],
    coupons: [
      { name: "筛查免单", value: "免", tip: "限前 200 名" },
      { name: "套餐立减", value: "50", tip: "转正式体检" },
    ],
    live: {
      title: "周日 09:00 控糖讲座",
      speaker: "驻店营养师 · 化验单怎么看",
      href: "./agent.html?q=预约本周健康讲座",
    },
    checkin: { title: "筛查后 7 日打卡", days: ["一", "二", "三", "四", "五", "六", "日"], done: [1, 1, 0, 0, 0, 0, 0] },
    online: [
      { name: "线上预约筛查", desc: "选站点与时段", href: "./detail.html?id=health_check" },
      { name: "报告问智伴", desc: "帮父母看指标", href: "./agent.html?q=打开爸妈的健康档案" },
      { name: "慢病主题页", desc: "监测、控糖餐、用药", href: "./theme.html?id=chronic" },
    ],
    articles: ["art_sleep_guide", "art_nutrition"],
    products: ["health_check", "bp_monitor", "glucometer", "pulse_oximeter"],
    relatedProductId: "health_check",
    cta: "预约体检套餐",
  },
  {
    id: "act_massage_trial",
    title: "AI 舒压 · 一键放松",
    summary: "智能分区理疗，首次体验 9.9 元，到店就能做",
    cover: "./assets/cover-ai-massage.png",
    period: "长期有效 · 名额滚动开放",
    badge: "体验官",
    highlight: "完成 45 分钟体验，即领下单立减券",
    stats: [
      { n: "9.9", l: "首次体验价" },
      { n: "45′", l: "智能分区" },
      { n: "3F", l: "朝阳门店理疗室" },
    ],
    rules: [
      "点「马上体验」预约时段，高峰期可能排队。",
      "到店完成体验后发放服务券至账户，有效期见券面。",
      "严重骨质疏松、皮肤破损或佩戴起搏器请先告知理疗师。",
    ],
    benefits: ["AI 识别肩颈腰背重点区", "热敷力度可调", "体验后领券可再约"],
    coupons: [
      { name: "体验价", value: "9.9", tip: "限新客 1 次" },
      { name: "复购立减", value: "15", tip: "满 80 可用" },
    ],
    live: {
      title: "本周三 15:00 到店开放日",
      speaker: "理疗师现场讲解适老力度",
      href: "./agent.html?q=预约AI舒压体验",
    },
    seckill: { title: "今日体验秒杀", productId: "ai_massage", price: "9.9", origin: "19.9", stock: "还剩 12 个时段" },
    online: [
      { name: "线上下单占时段", desc: "选上午或下午", href: "./detail.html?id=ai_massage" },
      { name: "问智伴适不适合", desc: "按爸妈情况推荐", href: "./agent.html?q=附近有什么适合长者的到店服务？" },
      { name: "居家康复注意", desc: "体验后怎么拉伸", href: "./article.html?id=art_rehab" },
    ],
    articles: ["art_rehab"],
    products: ["ai_massage", "neck_massage", "foot_spa", "therapy_device"],
    relatedProductId: "ai_massage",
    cta: "马上体验 AI 舒压",
  },
  {
    id: "act_meal_month",
    title: "暖心简餐 · 每日新鲜",
    summary: "低盐少油软食，食堂到家与包月核销都能订",
    cover: "./assets/cover-nutrition-meal.png",
    period: "2026.09.01 — 2026.09.30",
    badge: "开季礼",
    highlight: "首次包月订餐赠社区饮品权益，可备注控糖 / 防呛",
    stats: [
      { n: "26天", l: "包月可核销" },
      { n: "低盐", l: "全菜单标注" },
      { n: "软食", l: "防呛可选" },
    ],
    rules: [
      "活动期内首次开通包月即可获赠饮品权益。",
      "当日 11:00 前可改口味；慢病忌口请在订单备注。",
      "不可与其他开季礼重复领取。",
    ],
    benefits: ["低盐少油社区餐", "可备注控糖 / 软食", "满月赠饮权益"],
    coupons: [
      { name: "开季赠饮", value: "赠", tip: "首次包月" },
      { name: "邻里拼团", value: "80", tip: "满 8 户减" },
    ],
    menu: [
      { day: "周一", name: "清蒸鲈鱼 · 南瓜粥", tag: "控糖" },
      { day: "周二", name: "豆腐蒸蛋 · 软米饭", tag: "软食" },
      { day: "周三", name: "番茄牛腩 · 菠菜", tag: "低盐" },
      { day: "周四", name: "鸡肉丸 · 山药泥", tag: "防呛" },
      { day: "周五", name: "清炒时蔬 · 小米粥", tag: "控糖" },
    ],
    groupbuy: {
      title: "邻里拼团 · 包月午餐",
      tip: "满 8 户立减 80 元",
      progress: 6,
      total: 8,
      productId: "package_meal_month",
    },
    online: [
      { name: "线上下单送餐", desc: "当日 11:00 前可改", href: "./detail.html?id=home_meal" },
      { name: "问营养师配餐", desc: "按爸妈血糖配一周", href: "./agent.html?q=附近哪家食堂的控糖套餐更合适？" },
      { name: "银发餐桌主题", desc: "菜单、拼团、包月", href: "./theme.html?id=meal" },
    ],
    articles: ["art_nutrition"],
    products: ["package_meal_month", "nutrition_meal", "home_meal"],
    relatedProductId: "package_meal_month",
    cta: "开通包月订餐",
  },
];

window.getMallLinkLabel = function getMallLinkLabel(type, id) {
  if (!type || !id) return "";
  if (type === "product") {
    const p = (window.MALL_PRODUCTS || {})[id];
    return p?.name || id;
  }
  if (type === "article") {
    const a = (window.MALL_ARTICLES || []).find((x) => x.id === id);
    return a?.title || id;
  }
  if (type === "activity") {
    const a = (window.MALL_ACTIVITIES || []).find((x) => x.id === id);
    return a?.title || id;
  }
  if (type === "theme") {
    const t = (window.MALL_THEME_LINKS || []).find((x) => x.id === id);
    return t?.label || window.MALL_THEMES?.[id]?.name || id;
  }
  return id;
};

window.resolveMallLinkHref = function resolveMallLinkHref(type, id, pageBase) {
  const base = pageBase || "./";
  if (!type || !id) return "";
  if (type === "product") return `${base}detail.html?id=${encodeURIComponent(id)}`;
  if (type === "article") return `${base}article.html?id=${encodeURIComponent(id)}`;
  if (type === "activity") return `${base}activity.html?id=${encodeURIComponent(id)}`;
  if (type === "theme") return `${base}theme.html?id=${encodeURIComponent(id)}`;
  return "";
};

window.listMallLinkOptions = function listMallLinkOptions(type) {
  if (type === "product") {
    return Object.values(window.MALL_PRODUCTS || {})
      .filter((p) => p && p.id)
      .map((p) => ({ id: p.id, label: p.name || p.id }));
  }
  if (type === "article") {
    return (window.MALL_ARTICLES || []).map((a) => ({ id: a.id, label: a.title }));
  }
  if (type === "activity") {
    return (window.MALL_ACTIVITIES || []).map((a) => ({ id: a.id, label: a.title }));
  }
  if (type === "theme") {
    return (window.MALL_THEME_LINKS || []).map((t) => ({ id: t.id, label: t.label }));
  }
  return [];
};

window.MALL_BROADCASTS = [
  {
    id: "bc_lecture_sugar",
    title: "本周健康讲座：控糖饮食专场，周日上午 9:00",
    summary: "营养师现场讲解控糖饮食搭配，适合糖尿病及前期长者参加。",
    cover: "./assets/cover-calligraphy.png",
    badge: "讲座",
    date: "2026-09-13",
    time: "09:00",
    location: "朝阳门店 2F 健康讲堂",
    relatedProductId: "health_check",
    relatedCta: "预约健康评估",
    paragraphs: [
      "控糖饮食不是一味少吃，而是吃得对、吃得稳。本次讲座将由驻店营养师讲解 GI 指数、食物搭配与进餐顺序，帮助长者平稳餐后血糖。",
      "现场提供一份「控糖一周食谱」供带走，并开放 3 个免费血糖检测名额，建议空腹或餐后 2 小时到场。",
      "请提前 10 分钟签到，行动不便的长者可联系站点安排陪同座位。",
    ],
  },
  {
    id: "bc_ai_massage_trial",
    title: "朝阳门店新增 AI 舒压理疗体验，首次仅需 9.9 元",
    summary: "AI 智能分区舒缓，45 分钟全身放松，到店即可体验。",
    cover: "./assets/cover-ai-massage.png",
    badge: "体验",
    date: "长期有效",
    time: "09:00-18:00",
    location: "朝阳门店 3F 理疗室",
    relatedProductId: "ai_massage",
    relatedCta: "去体验",
    paragraphs: [
      "AI 舒压理疗通过智能分区识别肩颈、腰背等重点区域，自动调节力度与热敷温度，45 分钟一键放松。",
      "首次体验价 9.9 元，到店无需预约（高峰期可能需要排队）。体验后还可领取一张满减服务券。",
      "有严重骨质疏松、皮肤破损或佩戴心脏起搏器的长者，请提前告知理疗师并遵医嘱。",
    ],
  },
  {
    id: "bc_wellness_kit",
    title: "春风康养礼包限时 8 折，药食同源茶饮快递到家",
    summary: "精选适老辅食、养生茶饮组合，包邮到家，限时优惠。",
    cover: "./assets/cover-wellness-kit.png",
    badge: "优惠",
    date: "2026-09-01 — 2026-09-30",
    time: "",
    location: "快递到家",
    relatedProductId: "wellness_kit",
    relatedCta: "去购买",
    paragraphs: [
      "春风康养礼包内含低 GI 药食同源茶饮、适老软质辅食及便携分装盒，适合居家或出游携带。",
      "活动期内下单享 8 折优惠，全国包邮；礼包售出后不支持 7 天无理由退货，如有破损可联系客服补发。",
      "建议根据自身慢病情况选择口味，糖尿病患者优先选择苦荞、桑叶等低糖配方。",
    ],
  },
  {
    id: "bc_canteen_menu",
    title: "社区食堂本周菜单上新，欢迎到店品尝",
    summary: "本周推出低盐少油秋季养生菜单，可提前预订到店取餐。",
    cover: "./assets/cover-nutrition-meal.png",
    badge: "上新",
    date: "2026-09-11",
    time: "11:00-13:00",
    location: "朝阳门店 1F 社区食堂",
    relatedProductId: "package_meal_month",
    relatedCta: "去订餐",
    paragraphs: [
      "本周菜单上新：南瓜小米饭、清蒸鲈鱼、蒜蓉西兰花、山药排骨汤，少盐少油、软烂易嚼。",
      "支持到店用餐与提前预订取餐，60 岁以上长者凭证件可享会员价；包月订餐用户按次核销。",
      "每日食材当日采购，如有忌口或过敏请在预订时备注。",
    ],
  },
];

window.MALL_BROADCAST_BADGES = ["讲座", "体验", "优惠", "上新"];

function parseBroadcastDay(raw) {
  const m = String(raw || "").match(/(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return null;
  return new Date(+m[1], +m[2] - 1, +m[3]);
}

function formatBroadcastDay(d) {
  if (!(d instanceof Date) || Number.isNaN(d.getTime())) return "";
  const w = "日一二三四五六"[d.getDay()];
  return `${d.getMonth() + 1}月${d.getDate()}日 周${w}`;
}

window.formatBroadcastWhen = function formatBroadcastWhen(b) {
  const raw = String(b?.date || "").trim();
  const time = String(b?.time || "").trim();
  if (!raw || raw === "长期有效") {
    return time ? `长期有效 · 每日 ${time}` : "长期有效";
  }
  if (raw.includes("—")) {
    const [a, c] = raw.split("—").map((s) => s.trim());
    const da = parseBroadcastDay(a);
    const dc = parseBroadcastDay(c);
    const range =
      da && dc
        ? `${da.getMonth() + 1}月${da.getDate()}日至${dc.getMonth() + 1}月${dc.getDate()}日`
        : raw.replace("—", "至");
    return time ? `${range} · ${time}` : range;
  }
  const d = parseBroadcastDay(raw);
  const day = d ? formatBroadcastDay(d) : raw;
  return time ? `${day} ${time}` : day;
};

window.getMallBroadcastsSorted = function getMallBroadcastsSorted() {
  const list = (window.MALL_BROADCASTS || []).slice();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTs = today.getTime();
  const rank = (b) => {
    if (!b?.date || b.date === "长期有效") return [3, 9e15];
    const start = parseBroadcastDay(String(b.date).split("—")[0]);
    if (!start) return [3, 9e15];
    const ts = start.getTime();
    if (ts === todayTs) return [0, ts];
    if (ts > todayTs) return [1, ts];
    return [2, -ts];
  };
  return list.sort((a, b) => {
    const ra = rank(a);
    const rb = rank(b);
    return ra[0] - rb[0] || ra[1] - rb[1];
  });
};

window.getMallArticle = function getMallArticle(id) {
  return (window.MALL_ARTICLES || []).find((a) => a.id === id) || null;
};

window.getMallActivity = function getMallActivity(id) {
  return (window.MALL_ACTIVITIES || []).find((a) => a.id === id) || null;
};

window.getMallBroadcast = function getMallBroadcast(id) {
  return (window.MALL_BROADCASTS || []).find((b) => b.id === id) || null;
};
