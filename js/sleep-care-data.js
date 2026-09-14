/**
 * 睡眠健康服务闭环 · Demo 数据与本地状态
 * 对应 PRD：F1~F8 最小可演示闭环
 */
(function (global) {
  const STORE_KEY = "kangyang_sleep_care_v1";

  const ELEMENTS = {
    SE_TCM_HEAD_60: {
      id: "SE_TCM_HEAD_60",
      name: "头部疗愈 60 分钟",
      category: "到店疗愈",
      fulfill: "IN_STORE",
      duration: 60,
      price: 480,
      icon: "store",
      explain: "因为你入睡潜伏期偏长且夜间放松度偏低，头部疗愈有助于当晚降唤醒。",
    },
    SE_FOOT_BATH_30: {
      id: "SE_FOOT_BATH_30",
      name: "舒缓足浴 30 分钟",
      category: "到店疗愈",
      fulfill: "IN_STORE",
      duration: 30,
      price: 180,
      icon: "store",
      group: "TCM_RELAX",
      explain: "与头部疗愈同组，可替换；帮助睡前身体放松。",
    },
    SE_BREATH_TRAIN_8: {
      id: "SE_BREATH_TRAIN_8",
      name: "睡前呼吸训练 8 分钟",
      category: "居家干预",
      fulfill: "ONLINE",
      duration: 8,
      price: 0,
      icon: "home",
      explain: "上床前 30 分钟完成，缩短入睡潜伏期。",
    },
    SE_SLEEP_MEAL: {
      id: "SE_SLEEP_MEAL",
      name: "助眠餐（高镁低 GI）",
      category: "营养膳食",
      fulfill: "DELIVERY",
      duration: 30,
      price: 45,
      icon: "food",
      explain: "稳定夜间代谢，减少入睡后觉醒。",
    },
    SE_WALK_5000: {
      id: "SE_WALK_5000",
      name: "日间快走 5000 步",
      category: "科学运动",
      fulfill: "SELF",
      duration: 40,
      price: 0,
      icon: "sport",
      explain: "增加睡眠压力，提升深睡比例。",
    },
    SE_CAFFEINE_CURFEW: {
      id: "SE_CAFFEINE_CURFEW",
      name: "咖啡因宵禁 14:00",
      category: "营养膳食",
      fulfill: "SELF",
      duration: 0,
      price: 0,
      icon: "food",
      explain: "下午咖啡因会显著拉长入睡时间。",
    },
    SE_PSQI_SURVEY: {
      id: "SE_PSQI_SURVEY",
      name: "PSQI 睡眠量表",
      category: "检测评估",
      fulfill: "ONLINE",
      duration: 8,
      price: 0,
      icon: "check",
      explain: "阶段性回收主观睡眠数据，用于效果验证。",
    },
    SE_COACH_REVIEW: {
      id: "SE_COACH_REVIEW",
      name: "管家 1v1 复盘",
      category: "服务支持",
      fulfill: "ONLINE",
      duration: 20,
      price: 200,
      icon: "coach",
      explain: "阶段节点复盘指标，必要时调整方案。",
    },
  };

  const PACKAGES = {
    SP_ONSET_ANXIETY_8W: {
      id: "SP_ONSET_ANXIETY_8W",
      type: "周期改善包",
      title: "8 周入睡改善包",
      subtitle: "焦虑压力型",
      durationWeeks: 8,
      validDays: 84,
      profiles: ["ONSET", "ANXIETY"],
      salePrice: 3980,
      valueTotal: 5760,
      installment: [3, 6],
      expectedByWeek: 3,
      expectedText: "预计第 3 周入睡时间缩短约 15 分钟",
      stages: [
        { name: "导入期", weeks: "W1-W2", goal: "建立睡前降唤醒仪式，稳定上床时间" },
        { name: "强化期", weeks: "W3-W6", goal: "缩短入睡潜伏期至 30 分钟内，提升夜间 HRV" },
        { name: "巩固期", weeks: "W7-W8", goal: "撤除外部干预，自主维持" },
      ],
      logic: ["降唤醒", "建节律", "稳巩固"],
      interventions: [
        { icon: "store", label: "到店疗愈" },
        { icon: "home", label: "睡前仪式" },
        { icon: "sport", label: "日间活动" },
      ],
      items: [
        { elementId: "SE_TCM_HEAD_60", qty: 8, freq: "1次/周", core: true },
        { elementId: "SE_FOOT_BATH_30", qty: 4, freq: "每2周1次", core: false, group: "TCM_RELAX" },
        { elementId: "SE_BREATH_TRAIN_8", qty: 56, freq: "每日", core: true },
        { elementId: "SE_SLEEP_MEAL", qty: 32, freq: "4次/周", core: false },
        { elementId: "SE_WALK_5000", qty: 56, freq: "每日", core: true },
        { elementId: "SE_CAFFEINE_CURFEW", qty: 56, freq: "每日", core: true },
        { elementId: "SE_PSQI_SURVEY", qty: 5, freq: "阶段节点", core: true },
        { elementId: "SE_COACH_REVIEW", qty: 3, freq: "阶段节点", core: true },
      ],
      outcomes: [
        { metric: "入睡潜伏期", delta: "-15~-25 分钟", byWeek: 6, rate: "约 62% 相似用户达成" },
        { metric: "放松度", delta: "+10~+18 分", byWeek: 4, rate: "约 68% 相似用户达成" },
      ],
      weekPreview: [
        { day: "周一", tasks: ["步数 5000", "咖啡因宵禁", "助眠餐 18:30", "呼吸训练 21:30"] },
        { day: "周二", tasks: ["步数 5000", "咖啡因宵禁", "呼吸训练 21:30"] },
        { day: "周三", tasks: ["步数 5000", "咖啡因宵禁", "助眠餐 18:30", "呼吸训练 21:30"] },
        { day: "周四", tasks: ["步数 5000", "咖啡因宵禁", "呼吸训练 21:30"] },
        { day: "周五", tasks: ["步数 5000", "咖啡因宵禁", "助眠餐 18:30", "呼吸训练 21:30"] },
        { day: "周六", tasks: ["步数 5000", "咖啡因宵禁", "助眠餐", "到店·头部疗愈 19:00", "呼吸训练"] },
        { day: "周日", tasks: ["步数 5000", "咖啡因宵禁", "呼吸训练 21:30"] },
      ],
    },
    SP_ONSET_LITE_4W: {
      id: "SP_ONSET_LITE_4W",
      type: "体验包",
      title: "预算精简版 · 4 周起步",
      subtitle: "居家为主 + 2 次到店",
      durationWeeks: 4,
      validDays: 42,
      profiles: ["ONSET", "ANXIETY"],
      salePrice: 1880,
      valueTotal: 2680,
      expectedByWeek: 2,
      expectedText: "预计第 2 周入睡更容易一些",
      stages: [
        { name: "导入期", weeks: "W1-W2", goal: "建立睡前仪式" },
        { name: "强化期", weeks: "W3-W4", goal: "巩固放松习惯" },
      ],
      logic: ["降唤醒", "建节律"],
      interventions: [
        { icon: "store", label: "到店 2 次" },
        { icon: "home", label: "呼吸训练" },
        { icon: "sport", label: "日间步行" },
      ],
      items: [
        { elementId: "SE_TCM_HEAD_60", qty: 2, freq: "每2周1次", core: true },
        { elementId: "SE_BREATH_TRAIN_8", qty: 28, freq: "每日", core: true },
        { elementId: "SE_WALK_5000", qty: 28, freq: "每日", core: true },
        { elementId: "SE_CAFFEINE_CURFEW", qty: 28, freq: "每日", core: true },
      ],
      outcomes: [
        { metric: "入睡潜伏期", delta: "-8~-15 分钟", byWeek: 4, rate: "约 48% 相似用户达成" },
      ],
      weekPreview: [
        { day: "周一", tasks: ["步数 5000", "咖啡因宵禁", "呼吸训练 21:30"] },
        { day: "周二", tasks: ["步数 5000", "咖啡因宵禁", "呼吸训练 21:30"] },
        { day: "周三", tasks: ["步数 5000", "咖啡因宵禁", "呼吸训练 21:30"] },
        { day: "周四", tasks: ["步数 5000", "咖啡因宵禁", "呼吸训练 21:30"] },
        { day: "周五", tasks: ["步数 5000", "咖啡因宵禁", "呼吸训练 21:30"] },
        { day: "周六", tasks: ["步数 5000", "到店·头部疗愈", "呼吸训练"] },
        { day: "周日", tasks: ["步数 5000", "咖啡因宵禁", "呼吸训练"] },
      ],
    },
    SP_ONSET_PRO_12W: {
      id: "SP_ONSET_PRO_12W",
      type: "周期改善包",
      title: "全面升级版 · 12 周",
      subtitle: "到店 + 膳食 + 管家全程",
      durationWeeks: 12,
      validDays: 126,
      profiles: ["ONSET", "ANXIETY"],
      salePrice: 7600,
      valueTotal: 11200,
      expectedByWeek: 3,
      expectedText: "预计第 3 周起效，第 8 周巩固",
      stages: [
        { name: "导入期", weeks: "W1-W3", goal: "降唤醒" },
        { name: "强化期", weeks: "W4-W9", goal: "建节律+稳深睡" },
        { name: "巩固期", weeks: "W10-W12", goal: "自主维持" },
      ],
      logic: ["降唤醒", "建节律", "稳巩固", "管家跟进"],
      interventions: [
        { icon: "store", label: "到店加强" },
        { icon: "food", label: "助眠膳食" },
        { icon: "coach", label: "管家复盘" },
      ],
      items: [
        { elementId: "SE_TCM_HEAD_60", qty: 12, freq: "1次/周", core: true },
        { elementId: "SE_FOOT_BATH_30", qty: 6, freq: "每2周1次", core: false },
        { elementId: "SE_BREATH_TRAIN_8", qty: 84, freq: "每日", core: true },
        { elementId: "SE_SLEEP_MEAL", qty: 48, freq: "4次/周", core: true },
        { elementId: "SE_WALK_5000", qty: 84, freq: "每日", core: true },
        { elementId: "SE_CAFFEINE_CURFEW", qty: 84, freq: "每日", core: true },
        { elementId: "SE_COACH_REVIEW", qty: 5, freq: "阶段节点", core: true },
      ],
      outcomes: [
        { metric: "入睡潜伏期", delta: "-20~-30 分钟", byWeek: 8, rate: "约 70% 相似用户达成" },
        { metric: "深睡比例", delta: "+3~+6%", byWeek: 8, rate: "约 55% 相似用户达成" },
      ],
      weekPreview: [],
    },
  };

  /** 报告扩展：分型、方案推荐、医疗态 */
  const REPORT_EXTRAS = {
    sr_20260609: {
      profileType: "BREATH",
      profileName: "呼吸相关型",
      subTypes: ["深睡不足倾向"],
      diagnosis:
        "你的睡眠属于**呼吸相关型**：STOP-BANG 11 分、夜间最低血氧偏低，白天可能嗜睡。建议优先就医评估，暂不自动推荐理疗包。",
      medicalHold: true,
      medicalTip:
        "监测数据提示可能存在睡眠呼吸事件，建议尽快前往医院睡眠专科就诊评估。本平台不提供诊断结论。",
      primaryPackageId: null,
      altPackageIds: [],
    },
    sr_20260521: {
      profileType: "ONSET",
      profileName: "入睡困难型",
      subTypes: ["焦虑压力亚型"],
      diagnosis:
        "你的睡眠属于**入睡困难型 · 焦虑压力亚型**：入睡平均约 36 分钟（同龄参考约 18 分钟），夜间放松度偏低。",
      medicalHold: false,
      gaps: [
        { metric: "入睡潜伏期", user: "36 分钟", peer: "18 分钟", weight: "高" },
        { metric: "放松度", user: "偏低", peer: "同龄 P50", weight: "高" },
        { metric: "深睡比例", user: "18.6%", peer: ">20%", weight: "中" },
      ],
      primaryPackageId: "SP_ONSET_ANXIETY_8W",
      altPackageIds: ["SP_ONSET_LITE_4W", "SP_ONSET_PRO_12W"],
      priorityAsk: "我最想解决：快点睡着",
    },
    sr_20260408: {
      profileType: "STABLE",
      profileName: "睡眠质量良好",
      subTypes: [],
      diagnosis: "整体指标稳定，建议维持现有作息与活动习惯，可按需选择巩固体验。",
      medicalHold: false,
      primaryPackageId: "SP_ONSET_LITE_4W",
      altPackageIds: [],
    },
  };

  const DEMO_TODOS = [
    {
      id: "td1",
      elementId: "SE_WALK_5000",
      name: "日间快走 5000 步",
      time: "全天 · 建议 20:00 前",
      status: "doing",
      progress: 0.58,
      progressText: "已走 2900 / 5000",
      action: "去看看进度",
      actionType: "progress",
    },
    {
      id: "td2",
      elementId: "SE_SLEEP_MEAL",
      name: "助眠餐打卡",
      time: "18:30",
      status: "pending",
      action: "去打卡",
      actionType: "checkin",
    },
    {
      id: "td3",
      elementId: "SE_BREATH_TRAIN_8",
      name: "睡前呼吸训练 8 分钟",
      time: "21:30",
      status: "pending",
      action: "去播放",
      actionType: "play",
    },
    {
      id: "td4",
      elementId: "SE_CAFFEINE_CURFEW",
      name: "咖啡因宵禁（14:00 后）",
      time: "全天",
      status: "done",
      action: "已完成",
      actionType: "none",
    },
  ];

  /** 演示「今天」：2026-08-04（周二） */
  const DEMO_TODAY = "2026-08-04";

  const DEMO_CALENDAR = [
    {
      date: "08-01",
      weekday: "周六",
      items: [
        { time: "19:00", name: "到店 · 头部疗愈 60min", type: "store", status: "done" },
        { time: "21:30", name: "呼吸训练", type: "home", status: "done" },
      ],
    },
    {
      date: "08-02",
      weekday: "周日",
      items: [
        { time: "全天", name: "步数 5000", type: "sport", status: "done" },
        { time: "21:30", name: "呼吸训练", type: "home", status: "done" },
      ],
    },
    {
      date: "08-03",
      weekday: "周一",
      items: [
        { time: "18:30", name: "助眠餐", type: "food", status: "done" },
        { time: "全天", name: "步数 5000", type: "sport", status: "missed" },
        { time: "21:30", name: "呼吸训练", type: "home", status: "done" },
      ],
    },
    {
      date: "08-04",
      weekday: "周二",
      items: [
        { time: "全天", name: "咖啡因宵禁", type: "home", status: "done" },
        { time: "全天", name: "步数 5000", type: "sport", status: "doing" },
        { time: "18:30", name: "助眠餐打卡", type: "food", status: "scheduled" },
        { time: "21:30", name: "呼吸训练", type: "home", status: "scheduled" },
      ],
    },
    {
      date: "08-05",
      weekday: "周三",
      items: [
        { time: "全天", name: "步数 5000", type: "sport", status: "scheduled" },
        { time: "18:30", name: "助眠餐", type: "food", status: "scheduled" },
        { time: "21:30", name: "呼吸训练", type: "home", status: "scheduled" },
      ],
    },
    {
      date: "08-06",
      weekday: "周四",
      items: [
        { time: "全天", name: "步数 5000", type: "sport", status: "scheduled" },
        { time: "21:30", name: "呼吸训练", type: "home", status: "scheduled" },
      ],
    },
    {
      date: "08-07",
      weekday: "周五",
      items: [
        { time: "全天", name: "步数 5000", type: "sport", status: "scheduled" },
        { time: "18:30", name: "助眠餐", type: "food", status: "scheduled" },
        { time: "21:30", name: "呼吸训练", type: "home", status: "scheduled" },
      ],
    },
    {
      date: "08-08",
      weekday: "周六",
      items: [
        {
          time: "19:00",
          name: "到店 · 头部疗愈 60min",
          type: "store",
          status: "pending_confirm",
          reason: "你选择的可到店时段 + 与上次疗愈间隔 6 天 + 门店该时段有位",
        },
        { time: "21:30", name: "呼吸训练", type: "home", status: "scheduled" },
      ],
    },
    {
      date: "08-09",
      weekday: "周日",
      items: [
        { time: "全天", name: "步数 5000", type: "sport", status: "scheduled" },
        { time: "21:30", name: "呼吸训练", type: "home", status: "scheduled" },
      ],
    },
    {
      date: "08-10",
      weekday: "周一",
      items: [
        { time: "全天", name: "步数 5000", type: "sport", status: "scheduled" },
        { time: "18:30", name: "助眠餐", type: "food", status: "scheduled" },
        { time: "21:30", name: "呼吸训练", type: "home", status: "scheduled" },
      ],
    },
    {
      date: "08-11",
      weekday: "周二",
      items: [
        { time: "全天", name: "步数 5000", type: "sport", status: "scheduled" },
        { time: "21:30", name: "呼吸训练", type: "home", status: "scheduled" },
      ],
    },
    {
      date: "08-12",
      weekday: "周三",
      items: [
        { time: "18:30", name: "助眠餐", type: "food", status: "scheduled" },
        { time: "21:30", name: "呼吸训练", type: "home", status: "scheduled" },
      ],
    },
    {
      date: "08-15",
      weekday: "周六",
      items: [
        { time: "19:00", name: "到店 · 足浴 30min", type: "store", status: "scheduled" },
        { time: "21:30", name: "呼吸训练", type: "home", status: "scheduled" },
      ],
    },
    {
      date: "08-22",
      weekday: "周六",
      items: [{ time: "19:00", name: "到店 · 头部疗愈 60min", type: "store", status: "scheduled" }],
    },
    {
      date: "08-29",
      weekday: "周六",
      items: [{ time: "19:00", name: "到店 · 头部疗愈 60min", type: "store", status: "scheduled" }],
    },
  ];

  const DEMO_FORECAST = {
    predictedScore: 78,
    baseline7d: 66,
    delta: 12,
    relaxLevel: "高",
    relaxDetail: "HRV 较服务前 ↑23%，静息心率 ↓6bpm",
    confidence: "中高",
    confidenceNote: "基于你过去 21 天数据",
    attribution: [
      { name: "头部疗愈", delta: 8 },
      { name: "今日步数达标", delta: 3 },
      { name: "晚餐较早", delta: 1 },
      { name: "下午咖啡因", delta: -4 },
    ],
    actions: [
      { text: "22:45 前上床", href: "./sleep-todo.html" },
      { text: "卧室调至 24℃", href: "./sleep-todo.html" },
      { text: "21:30 做 8 分钟呼吸训练", href: "./sleep-todo.html" },
    ],
    morning: {
      predicted: 78,
      actual: 76,
      absError: 2,
      latency: "26 分钟（前 7 天均值 44 分钟，↓18）",
      tip: "疗愈当晚入睡明显更快，这是你第 3 次验证该规律。本周深睡仍偏低，建议增加日间步数。",
    },
  };

  const DEMO_ENTITLEMENTS = [
    { elementId: "SE_TCM_HEAD_60", total: 8, used: 1, frozen: 1, expireAt: "2026-10-31" },
    { elementId: "SE_FOOT_BATH_30", total: 4, used: 0, frozen: 0, expireAt: "2026-10-31" },
    { elementId: "SE_SLEEP_MEAL", total: 32, used: 4, frozen: 0, expireAt: "2026-10-31" },
    { elementId: "SE_COACH_REVIEW", total: 3, used: 0, frozen: 0, expireAt: "2026-10-31" },
  ];

  function loadState() {
    try {
      return JSON.parse(localStorage.getItem(STORE_KEY) || "{}");
    } catch {
      return {};
    }
  }

  function saveState(patch) {
    const next = { ...loadState(), ...patch, updatedAt: Date.now() };
    localStorage.setItem(STORE_KEY, JSON.stringify(next));
    return next;
  }

  function getPackage(id) {
    return PACKAGES[id] || null;
  }

  function getElement(id) {
    return ELEMENTS[id] || null;
  }

  function enrichReport(report) {
    if (!report) return null;
    const extra = REPORT_EXTRAS[report.id] || {};
    return { ...report, ...extra };
  }

  function money(n) {
    return Number(n || 0).toLocaleString("zh-CN");
  }

  global.SleepCare = {
    ELEMENTS,
    PACKAGES,
    REPORT_EXTRAS,
    DEMO_TODAY,
    DEMO_TODOS,
    DEMO_CALENDAR,
    DEMO_FORECAST,
    DEMO_ENTITLEMENTS,
    loadState,
    saveState,
    getPackage,
    getElement,
    enrichReport,
    money,
  };
})(window);
