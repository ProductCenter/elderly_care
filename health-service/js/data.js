/* 活力长者健康服务方案 · 共享数据与状态 */
(function (global) {
  const STORAGE_KEY = "ky_health_service_demo_v4";

  /**
   * 康养标准服务展示（洞察前入口）
   * 覆盖：可落地动作 / 服务人员 / 规则标准（SOP·风控·计价）
   */
  const STANDARD_SERVICES = [
    {
      id: "meal",
      name: "助餐服务",
      action: "到站就餐 / 送餐上门 / 营养配餐",
      staff: "营养师 · 护理员",
      standards: ["服务 SOP", "收费计价"],
      tone: "#1a7a63",
      mark: "餐",
    },
    {
      id: "bath",
      name: "助浴服务",
      action: "上门助浴 / 床旁擦浴 / 安全护送",
      staff: "护理员 · 护士",
      standards: ["服务 SOP", "风控应急"],
      tone: "#2d7a8a",
      mark: "浴",
    },
    {
      id: "vitals",
      name: "体征检测",
      action: "血压心率 / 血糖血氧 / 体重体温",
      staff: "护士 · 护理员",
      standards: ["服务 SOP", "异常上报"],
      tone: "#3b6d8c",
      mark: "征",
    },
    {
      id: "rehab",
      name: "康复训练",
      action: "关节活动 / 步行训练 / 平衡练习",
      staff: "康复师 · 护理员",
      standards: ["服务 SOP", "收费计价"],
      tone: "#c4784a",
      mark: "康",
    },
    {
      id: "nursing",
      name: "基础护理",
      action: "翻身拍背 / 口腔清洁 / 皮肤护理",
      staff: "护理员 · 护士",
      standards: ["服务 SOP", "风控应急"],
      tone: "#5b7c8a",
      mark: "护",
    },
    {
      id: "med",
      name: "用药指导",
      action: "用药提醒 / 分药核对 / 不良反应观察",
      staff: "护士 · 药师",
      standards: ["服务 SOP", "风控应急"],
      tone: "#8a5b6d",
      mark: "药",
    },
    {
      id: "nutrition",
      name: "营养膳食指导",
      action: "膳食评估 / 慢病食谱 / 随访调整",
      staff: "营养师",
      standards: ["服务 SOP", "收费计价"],
      tone: "#6b8a3b",
      mark: "营",
    },
    {
      id: "visit",
      name: "入户探访关爱",
      action: "定期探访 / 情绪疏导 / 需求登记",
      staff: "社工 · 护理员",
      standards: ["服务 SOP", "风控应急"],
      tone: "#7a6b1a",
      mark: "访",
    },
    {
      id: "emergency",
      name: "应急呼叫响应",
      action: "一键呼救 / 到场处置 / 家属联动",
      staff: "护士 · 护理员",
      standards: ["风控应急", "服务 SOP"],
      tone: "#c24141",
      mark: "急",
    },
  ];

  /** 活力长者画像维度（洞察页展示） */
  const VITALITY = [
    { id: "v1", name: "运动活力", role: "晨练 · 步行", tag: "本周 5 次", color: "#1a7a63", initial: "动" },
    { id: "v2", name: "身心稳态", role: "血压 · 睡眠", tag: "整体平稳", color: "#2d7a8a", initial: "稳" },
    { id: "v3", name: "社交活跃", role: "社区活动", tag: "本月 3 场", color: "#c4784a", initial: "活" },
  ];

  const ELDER = {
    name: "陈德福",
    age: 68,
    title: "活力长者",
    portrait: "陈德福 · 活力长者健康画像",
    tags: "晨练坚持 · 血压稳态 · 社区活跃",
  };

  const METRICS = [
    { label: "个人活力指数", value: "86", unit: "分", note: "较上月 +5" },
    { label: "待关注项", value: "1", unit: "项", note: "晚间睡眠" },
    { label: "本周活力打卡", value: "6", unit: "次", note: "执行率 92%" },
    { label: "日均步行", value: "6.2", unit: "千步", note: "优于同龄均值" },
  ];

  /** 常见体征（最新一次测量） */
  const VITALS = [
    {
      id: "bp",
      name: "血压",
      value: "128/82",
      unit: "mmHg",
      time: "今天 07:28",
      status: "平稳",
      tone: "ok",
    },
    {
      id: "hr",
      name: "心率",
      value: "72",
      unit: "次/分",
      time: "今天 07:28",
      status: "正常",
      tone: "ok",
    },
    {
      id: "spo2",
      name: "血氧",
      value: "97",
      unit: "%",
      time: "今天 07:30",
      status: "良好",
      tone: "ok",
    },
    {
      id: "temp",
      name: "体温",
      value: "36.5",
      unit: "℃",
      time: "今天 07:15",
      status: "正常",
      tone: "ok",
    },
    {
      id: "glu",
      name: "空腹血糖",
      value: "5.8",
      unit: "mmol/L",
      time: "今天 07:10",
      status: "关注",
      tone: "warn",
    },
    {
      id: "weight",
      name: "体重",
      value: "68.2",
      unit: "kg",
      time: "昨天 08:00",
      status: "稳定",
      tone: "ok",
    },
  ];

  /** 近 7 日趋势（用于简易柱状/折线示意） */
  const TRENDS = [
    {
      id: "bp_sys",
      name: "收缩压",
      unit: "mmHg",
      range: "理想 < 130",
      change: "较上周 −3",
      tone: "down-good",
      points: [136, 134, 132, 131, 130, 129, 128],
      labels: ["一", "二", "三", "四", "五", "六", "日"],
    },
    {
      id: "hr",
      name: "静息心率",
      unit: "次/分",
      range: "理想 60–80",
      change: "较上周持平",
      tone: "flat",
      points: [74, 73, 75, 72, 71, 73, 72],
      labels: ["一", "二", "三", "四", "五", "六", "日"],
    },
    {
      id: "spo2",
      name: "血氧饱和度",
      unit: "%",
      range: "理想 ≥ 95",
      change: "较上周 +1",
      tone: "up-good",
      points: [95, 96, 96, 97, 96, 97, 97],
      labels: ["一", "二", "三", "四", "五", "六", "日"],
    },
    {
      id: "sleep",
      name: "夜间睡眠",
      unit: "小时",
      range: "建议 7–8h",
      change: "较上周 −0.4",
      tone: "down-warn",
      points: [7.2, 6.8, 7.0, 6.5, 6.4, 6.2, 6.3],
      labels: ["一", "二", "三", "四", "五", "六", "日"],
    },
  ];

  const PLAN = {
    id: "plan-elder-vitality-01",
    name: "活力长者 · 春季续航健康方案",
    cycle: "4 周 · 个人活力版",
    scene: "居家慢病稳态 + 活力养护",
    generatedAt: "2026-07-31",
    value: {
      summary:
        "围绕「血压稳态、关节灵活、日常活力续航」三类核心诉求，为一位活力长者封装可落地的专属服务方案，而非零散商品组合。",
      points: [
        {
          title: "适配个人节奏",
          desc: "覆盖晨间监测、舒缓理疗、营养配餐与活力打卡，贴合长者日常作息。",
        },
        {
          title: "解决真实痛点",
          desc: "解决「知道要注意、却难坚持执行」的断层，把建议变成日历任务。",
        },
        {
          title: "专业交付闭环",
          desc: "方案—计划—打卡—互动一体，让健康管理从洞察瞬间延伸到每周落地。",
        },
      ],
    },
    framework: [
      {
        level: "顶层 · 服务方案",
        title: "活力长者续航方案",
        desc: "用户端唯一感知对象：完整方案与交付承诺。",
      },
      {
        level: "中层 · 服务模块",
        title: "监测 / 养护 / 营养 / 活力",
        desc: "按个人场景拆解模块，形成可执行周期计划。",
      },
      {
        level: "底层 · 服务商品",
        title: "可打包标准服务单元",
        desc: "后台要素封装入方案；交易页透明展示明细。",
      },
    ],
    highlights: [
      {
        ico: "标",
        title: "标准化可交付",
        desc: "每次服务有明确时长、频次与完成标准，避免模糊承诺。",
      },
      {
        ico: "场",
        title: "场景化编排",
        desc: "按个人日历排布任务，把个性化需求转成可执行日程。",
      },
      {
        ico: "落",
        title: "可落地追踪",
        desc: "打卡、逾期提醒与亲友鼓励，形成持续执行动力。",
      },
    ],
    weeks: [
      {
        id: "w1",
        title: "第 1 周 · 基线建立",
        subtitle: "监测习惯养成 · 上门评估",
        items: [
          { name: "臂式血压监测套装", detail: "含指导视频与记录模板", price: 199, tag: "实物支撑" },
          { name: "居家健康评估（到家）", detail: "60 分钟 · 护士上门", price: 128, tag: "专业服务" },
          { name: "活力计划编排", detail: "个人节奏适配 · 后台封装", price: 0, tag: "隐性要素 · 已封装" },
        ],
      },
      {
        id: "w2",
        title: "第 2 周 · 稳态干预",
        subtitle: "理疗养护 · 营养介入",
        items: [
          { name: "颈椎/关节舒缓理疗", detail: "到店 2 次 · 每次 45 分钟", price: 136, tag: "专业服务" },
          { name: "七日轻食营养配餐", detail: "低盐低脂 · 到家配送", price: 168, tag: "场景交付" },
          { name: "执行计划编排", detail: "后台服务要素 · 不单独售卖", price: 0, tag: "隐性要素 · 已封装" },
        ],
      },
      {
        id: "w3",
        title: "第 3 周 · 巩固强化",
        subtitle: "复测跟踪 · 活力强化",
        items: [
          { name: "社区健康复测包", detail: "血压/血氧 · 到店", price: 9.9, tag: "专业服务" },
          { name: "陪诊陪护（半日）", detail: "复诊协同 · 到家/到院", price: 128, tag: "场景交付" },
          { name: "活力激励反馈", detail: "打卡进度与鼓励同步", price: 0, tag: "隐性要素 · 已封装" },
        ],
      },
      {
        id: "w4",
        title: "第 4 周 · 复盘续航",
        subtitle: "方案复盘 · 下周期建议",
        items: [
          { name: "方案执行复盘咨询", detail: "线上 30 分钟", price: 39, tag: "专业服务" },
          { name: "下周期方案预生成", detail: "基于打卡数据自动编排", price: 0, tag: "隐性要素 · 已封装" },
        ],
      },
    ],
    trade: [
      { name: "臂式血压监测套装", sub: "实物支撑 · ×1", price: 199 },
      { name: "居家健康评估（到家）", sub: "专业服务 · ×1", price: 128 },
      { name: "颈椎/关节舒缓理疗", sub: "到店 · ×2", price: 136 },
      { name: "七日轻食营养配餐", sub: "到家配送 · ×1", price: 168 },
      { name: "社区健康复测包", sub: "到店 · ×1", price: 9.9 },
      { name: "陪诊陪护（半日）", sub: "场景交付 · ×1", price: 128 },
      { name: "方案执行复盘咨询", sub: "线上 · ×1", price: 39 },
    ],
  };

  function buildTasks(anchorDate) {
    const anchor = anchorDate ? new Date(anchorDate) : new Date();
    const y = anchor.getFullYear();
    const m = anchor.getMonth();
    const d = anchor.getDate();

    const at = (offset) => new Date(y, m, d + offset, 9, 0, 0, 0);

    const fmt = (dt) => {
      const mm = String(dt.getMonth() + 1).padStart(2, "0");
      const dd = String(dt.getDate()).padStart(2, "0");
      return `${dt.getFullYear()}-${mm}-${dd}`;
    };

    const seed = [
      { offset: -2, title: "晨间血压测量并记录", member: "陈德福", time: "07:30", status: "done" },
      { offset: -1, title: "公园健步 30 分钟", member: "陈德福", time: "08:00", status: "done" },
      { offset: -1, title: "低盐晚餐打卡", member: "陈德福", time: "18:30", status: "overdue" },
      { offset: 0, title: "晨间血压测量并记录", member: "陈德福", time: "07:30", status: "pending" },
      { offset: 0, title: "服用慢病随访药提醒", member: "陈德福", time: "08:00", status: "pending" },
      { offset: 0, title: "晚间拉伸放松 10 分钟", member: "陈德福", time: "20:00", status: "pending" },
      { offset: 1, title: "到店关节舒缓理疗", member: "陈德福", time: "14:00", status: "pending" },
      { offset: 1, title: "营养配餐签收确认", member: "陈德福", time: "11:30", status: "pending" },
      { offset: 2, title: "睡眠与步数回顾", member: "陈德福", time: "21:00", status: "pending" },
      { offset: 3, title: "社区健康复测", member: "陈德福", time: "10:00", status: "pending" },
      { offset: 4, title: "个人周复盘（线上）", member: "陈德福", time: "19:30", status: "pending" },
      { offset: 5, title: "晨间血压测量并记录", member: "陈德福", time: "07:30", status: "pending" },
      { offset: 6, title: "关节养护拉伸", member: "陈德福", time: "09:00", status: "pending" },
    ];

    return seed.map((item, idx) => {
      const dt = at(item.offset);
      return {
        id: `task-${idx + 1}`,
        date: fmt(dt),
        title: item.title,
        member: item.member,
        time: item.time,
        status: item.status,
      };
    });
  }

  const DEFAULT_FEED = [
    {
      id: "f1",
      memberId: "m3",
      name: "陈雨",
      text: "爸爸今天活力指数不错，继续保持晨练～",
      time: "今天 08:12",
      likes: 2,
      liked: false,
      color: "#c4784a",
      initial: "雨",
    },
    {
      id: "f2",
      memberId: "care",
      name: "健康顾问",
      text: "理疗预约已确认，明天下午按时到店即可。",
      time: "昨天 16:40",
      likes: 1,
      liked: false,
      color: "#2d7a8a",
      initial: "顾",
    },
    {
      id: "f3",
      memberId: "m1",
      name: "陈德福",
      text: "配餐味道不错，今天又走了六千多步。",
      time: "昨天 12:18",
      likes: 3,
      liked: true,
      color: "#1a7a63",
      initial: "德",
    },
  ];

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  function saveState(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function ensureState() {
    let state = loadState();
    if (!state || !state.tasks) {
      state = {
        planAccepted: false,
        paid: false,
        payment: null,
        tasks: buildTasks(),
        feed: DEFAULT_FEED.map((f) => ({ ...f })),
      };
      saveState(state);
    } else {
      let dirty = false;
      if (typeof state.paid !== "boolean") {
        state.paid = false;
        dirty = true;
      }
      if (!("payment" in state)) {
        state.payment = null;
        dirty = true;
      }
      const today = new Date();
      const todayStr = [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, "0"),
        String(today.getDate()).padStart(2, "0"),
      ].join("-");
      state.tasks.forEach((t) => {
        if (t.status === "pending" && t.date < todayStr) {
          t.status = "overdue";
          dirty = true;
        }
      });
      if (dirty) saveState(state);
    }
    return state;
  }

  function acceptPlan() {
    const state = ensureState();
    state.planAccepted = true;
    saveState(state);
    return state;
  }

  function payPlan(method) {
    const state = ensureState();
    const total = tradeTotal(PLAN.trade);
    const now = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    state.planAccepted = true;
    state.paid = true;
    state.payment = {
      orderNo: `HS${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${String(now.getTime()).slice(-6)}`,
      method: method || "微信支付",
      amount: total,
      paidAt: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`,
      planId: PLAN.id,
      planName: PLAN.name,
    };
    saveState(state);
    return state;
  }

  function isPlanPaid() {
    return !!ensureState().paid;
  }

  function toggleTask(taskId) {
    const state = ensureState();
    const task = state.tasks.find((t) => t.id === taskId);
    if (!task) return state;
    if (task.status === "done") {
      const today = new Date();
      const todayStr = [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, "0"),
        String(today.getDate()).padStart(2, "0"),
      ].join("-");
      task.status = task.date < todayStr ? "overdue" : "pending";
    } else {
      task.status = "done";
      state.feed.unshift({
        id: `f-${Date.now()}`,
        memberId: "m1",
        name: "陈德福",
        text: `已完成「${task.title}」，活力续航中！`,
        time: "刚刚",
        likes: 0,
        liked: false,
        color: "#1a7a63",
        initial: "德",
      });
    }
    saveState(state);
    return state;
  }

  function toggleLike(feedId) {
    const state = ensureState();
    const item = state.feed.find((f) => f.id === feedId);
    if (!item) return state;
    if (item.liked) {
      item.liked = false;
      item.likes = Math.max(0, (item.likes || 0) - 1);
    } else {
      item.liked = true;
      item.likes = (item.likes || 0) + 1;
    }
    saveState(state);
    return state;
  }

  function countByStatus(tasks) {
    return tasks.reduce(
      (acc, t) => {
        acc[t.status] = (acc[t.status] || 0) + 1;
        return acc;
      },
      { pending: 0, done: 0, overdue: 0 }
    );
  }

  function tradeTotal(lines) {
    return lines.reduce((sum, l) => sum + Number(l.price || 0), 0);
  }

  function toast(message) {
    const host = document.querySelector(".phone") || document.body;
    let el = host.querySelector(".toast");
    if (!el) {
      el = document.createElement("div");
      el.className = "toast";
      host.appendChild(el);
    }
    el.textContent = message;
    el.classList.add("is-show");
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => el.classList.remove("is-show"), 1800);
  }

  function money(n) {
    const num = Number(n);
    return Number.isInteger(num) ? String(num) : num.toFixed(1);
  }

  global.HealthService = {
    ELDER,
    STANDARD_SERVICES,
    VITALITY,
    FAMILY: VITALITY,
    METRICS,
    VITALS,
    TRENDS,
    PLAN,
    ensureState,
    acceptPlan,
    payPlan,
    isPlanPaid,
    toggleTask,
    toggleLike,
    countByStatus,
    tradeTotal,
    toast,
    money,
    resetDemo() {
      localStorage.removeItem(STORAGE_KEY);
      return ensureState();
    },
  };
})(window);
