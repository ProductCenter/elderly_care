/**
 * 康养商城会员体系（C 端 + B 端共用 localStorage）
 * - 等级：普通 / 银卡 / 金卡 / 钻石（按成长值）
 * - 积分：下单获得、B 端发放/扣减、C 端流水
 */
(function (global) {
  const MEMBERS_KEY = "kangyang_members_v1";
  const SESSION_KEY = "kangyang_member_session_v1";
  const LEVELS_KEY = "kangyang_member_levels_v1";
  const LEDGER_KEY = "kangyang_member_ledger_v1";

  const DEFAULT_LEVELS = [
    {
      id: "normal",
      name: "普通会员",
      minGrowth: 0,
      discount: 100,
      pointsRate: 1,
      color: "#64748b",
      perks: ["下单累计积分", "会员专属客服"],
    },
    {
      id: "silver",
      name: "银卡会员",
      minGrowth: 500,
      discount: 98,
      pointsRate: 1.2,
      color: "#64748b",
      perks: ["消费 98 折", "积分 1.2 倍", "优先预约时段"],
    },
    {
      id: "gold",
      name: "金卡会员",
      minGrowth: 2000,
      discount: 95,
      pointsRate: 1.5,
      color: "#b45309",
      perks: ["消费 95 折", "积分 1.5 倍", "生日礼遇", "免费改约 1 次/月"],
    },
    {
      id: "diamond",
      name: "钻石会员",
      minGrowth: 5000,
      discount: 90,
      pointsRate: 2,
      color: "#0f766e",
      perks: ["消费 9 折", "积分 2 倍", "专属健康顾问", "到店免排队"],
    },
  ];

  function loadJson(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return typeof fallback === "function" ? fallback() : fallback;
      return JSON.parse(raw);
    } catch {
      return typeof fallback === "function" ? fallback() : fallback;
    }
  }

  function saveJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function uid(prefix) {
    return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  }

  function getLevels() {
    const levels = loadJson(LEVELS_KEY, null);
    if (!Array.isArray(levels) || !levels.length) {
      saveJson(LEVELS_KEY, DEFAULT_LEVELS);
      return DEFAULT_LEVELS.slice();
    }
    return levels.slice().sort((a, b) => a.minGrowth - b.minGrowth);
  }

  function saveLevels(levels) {
    saveJson(LEVELS_KEY, levels);
    return getLevels();
  }

  function resolveLevel(growth) {
    const g = Number(growth) || 0;
    const levels = getLevels();
    let cur = levels[0];
    for (const lv of levels) {
      if (g >= Number(lv.minGrowth || 0)) cur = lv;
    }
    return cur;
  }

  function nextLevel(growth) {
    const g = Number(growth) || 0;
    const levels = getLevels();
    return levels.find((lv) => Number(lv.minGrowth || 0) > g) || null;
  }

  function seedMembers() {
    const now = Date.now();
    return [
      {
        id: "M10001",
        name: "安辉",
        phone: "13800001234",
        avatarText: "安",
        station: "春风康养 · 历下旗舰店",
        growth: 2680,
        points: 420,
        status: "active",
        source: "c_register",
        createdAt: now - 86400000 * 40,
        updatedAt: now - 86400000 * 2,
        lastOrderAt: now - 86400000 * 2,
      },
      {
        id: "M10002",
        name: "张伟",
        phone: "13900005678",
        avatarText: "张",
        station: "春风康养 · 历下旗舰店",
        growth: 860,
        points: 320,
        status: "active",
        source: "admin",
        createdAt: now - 86400000 * 20,
        updatedAt: now - 86400000 * 1,
        lastOrderAt: now - 86400000 * 1,
      },
      {
        id: "M10003",
        name: "李娜",
        phone: "13700009876",
        avatarText: "李",
        station: "柳州市金盛社区AI康养驿站",
        growth: 180,
        points: 95,
        status: "active",
        source: "admin",
        createdAt: now - 86400000 * 12,
        updatedAt: now - 86400000 * 3,
        lastOrderAt: null,
      },
      {
        id: "M10004",
        name: "王敏",
        phone: "13600001122",
        avatarText: "王",
        station: "春风康养 · 高新区店",
        growth: 6120,
        points: 1280,
        status: "active",
        source: "admin",
        createdAt: now - 86400000 * 90,
        updatedAt: now - 86400000 * 5,
        lastOrderAt: now - 86400000 * 5,
      },
    ].map((m) => enrich(m));
  }

  function enrich(member) {
    if (!member) return null;
    const level = resolveLevel(member.growth);
    const nxt = nextLevel(member.growth);
    const growth = Number(member.growth) || 0;
    const progress = nxt
      ? Math.min(100, Math.round(((growth - level.minGrowth) / Math.max(1, nxt.minGrowth - level.minGrowth)) * 100))
      : 100;
    return {
      ...member,
      levelId: level.id,
      levelName: level.name,
      levelColor: level.color,
      discount: level.discount,
      pointsRate: level.pointsRate,
      perks: level.perks || [],
      nextLevelName: nxt?.name || null,
      nextLevelNeed: nxt ? Math.max(0, nxt.minGrowth - growth) : 0,
      levelProgress: progress,
    };
  }

  function listMembers() {
    let list = loadJson(MEMBERS_KEY, null);
    if (!Array.isArray(list) || !list.length) {
      list = seedMembers();
      saveJson(MEMBERS_KEY, list.map(stripEnrich));
    }
    return list.map(enrich).sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  }

  function stripEnrich(m) {
    const {
      levelId,
      levelName,
      levelColor,
      discount,
      pointsRate,
      perks,
      nextLevelName,
      nextLevelNeed,
      levelProgress,
      ...rest
    } = m;
    return rest;
  }

  function saveMembers(list) {
    saveJson(MEMBERS_KEY, list.map(stripEnrich));
  }

  function getMember(id) {
    return listMembers().find((m) => m.id === id) || null;
  }

  function upsertMember(input) {
    const list = loadJson(MEMBERS_KEY, () => seedMembers().map(stripEnrich));
    const now = Date.now();
    const idx = list.findIndex((m) => m.id === input.id);
    const base = {
      id: input.id || uid("M"),
      name: (input.name || "").trim() || "会员用户",
      phone: String(input.phone || "").trim(),
      avatarText: (input.avatarText || input.name || "会").trim().slice(0, 1),
      station: input.station || "春风社区中心站",
      growth: Number(input.growth) || 0,
      points: Number(input.points) || 0,
      status: input.status || "active",
      source: input.source || "admin",
      createdAt: input.createdAt || now,
      updatedAt: now,
      lastOrderAt: input.lastOrderAt ?? null,
    };
    if (idx >= 0) list[idx] = { ...list[idx], ...base, id: list[idx].id, createdAt: list[idx].createdAt };
    else list.unshift(base);
    saveMembers(list);
    return enrich(list.find((m) => m.id === base.id) || base);
  }

  function listLedger(memberId) {
    const all = loadJson(LEDGER_KEY, []);
    return all
      .filter((x) => !memberId || x.memberId === memberId)
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  }

  function pushLedger(entry) {
    const all = loadJson(LEDGER_KEY, []);
    all.unshift({
      id: uid("L"),
      createdAt: Date.now(),
      ...entry,
    });
    saveJson(LEDGER_KEY, all.slice(0, 500));
    return all[0];
  }

  function adjustPoints(memberId, delta, reason, meta = {}) {
    const list = loadJson(MEMBERS_KEY, () => seedMembers().map(stripEnrich));
    const idx = list.findIndex((m) => m.id === memberId);
    if (idx < 0) return { ok: false, message: "会员不存在" };
    const before = Number(list[idx].points) || 0;
    const after = Math.max(0, before + Number(delta) || 0);
    list[idx].points = after;
    list[idx].updatedAt = Date.now();
    saveMembers(list);
    pushLedger({
      memberId,
      memberName: list[idx].name,
      type: Number(delta) >= 0 ? "earn" : "spend",
      points: Number(delta) || 0,
      balance: after,
      reason: reason || "积分变动",
      ...meta,
    });
    return { ok: true, member: enrich(list[idx]) };
  }

  function addGrowth(memberId, growthDelta, reason) {
    const list = loadJson(MEMBERS_KEY, () => seedMembers().map(stripEnrich));
    const idx = list.findIndex((m) => m.id === memberId);
    if (idx < 0) return { ok: false, message: "会员不存在" };
    const beforeLv = resolveLevel(list[idx].growth);
    list[idx].growth = Math.max(0, (Number(list[idx].growth) || 0) + (Number(growthDelta) || 0));
    list[idx].updatedAt = Date.now();
    const afterLv = resolveLevel(list[idx].growth);
    saveMembers(list);
    return {
      ok: true,
      member: enrich(list[idx]),
      leveledUp: beforeLv.id !== afterLv.id,
      fromLevel: beforeLv.name,
      toLevel: afterLv.name,
    };
  }

  /** 支付成功：按实付金额记成长值 + 按等级倍率发积分 */
  function onOrderPaid(order) {
    const session = getSession();
    if (!session?.id) return { ok: false, message: "未登录会员" };
    const member = getMember(session.id);
    if (!member || member.status !== "active") return { ok: false, message: "会员不可用" };

    const pay = Math.max(0, Number(order?.payAmount) || 0);
    const growthGain = Math.round(pay);
    const pointsGain = Math.max(1, Math.round(pay * (Number(member.pointsRate) || 1)));

    const growthRes = addGrowth(member.id, growthGain, `订单成长 ${order.orderId}`);
    const pointsRes = adjustPoints(member.id, pointsGain, `消费得积分`, {
      orderId: order.orderId,
      channel: "order",
    });

    const list = loadJson(MEMBERS_KEY, []);
    const idx = list.findIndex((m) => m.id === member.id);
    if (idx >= 0) {
      list[idx].lastOrderAt = Date.now();
      saveMembers(list);
    }

    const latest = getMember(member.id);
    setSession(latest);
    return {
      ok: true,
      pointsGain,
      growthGain,
      leveledUp: growthRes.leveledUp,
      toLevel: growthRes.toLevel,
      member: latest,
    };
  }

  function calcPayAmount(originAmount) {
    const m = current();
    const discount = Number(m?.discount) || 100;
    const raw = Number(originAmount) || 0;
    return Math.round(raw * discount) / 100;
  }

  function getSession() {
    return loadJson(SESSION_KEY, null);
  }

  function setSession(member) {
    if (!member) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    const slim = {
      id: member.id,
      name: member.name,
      phone: member.phone,
      avatarText: member.avatarText,
      levelName: member.levelName,
      points: member.points,
      growth: member.growth,
    };
    saveJson(SESSION_KEY, slim);
    return slim;
  }

  function current() {
    const s = getSession();
    if (!s?.id) return null;
    return getMember(s.id);
  }

  function ensureDemoSession() {
    let m = current();
    if (m) return m;
    m = getMember("M10001") || listMembers()[0];
    if (m) setSession(m);
    return m;
  }

  function login({ phone, name } = {}) {
    const p = String(phone || "").trim();
    if (!/^1\d{10}$/.test(p)) return { ok: false, message: "请输入正确手机号" };
    let member = listMembers().find((m) => m.phone === p);
    if (!member) {
      member = upsertMember({
        name: (name || "").trim() || `用户${p.slice(-4)}`,
        phone: p,
        source: "c_register",
        growth: 0,
        points: 50,
        station: "春风康养 · 历下旗舰店",
      });
      pushLedger({
        memberId: member.id,
        memberName: member.name,
        type: "earn",
        points: 50,
        balance: 50,
        reason: "新会员注册礼",
        channel: "register",
      });
    }
    if (member.status === "disabled") return { ok: false, message: "账号已停用，请联系客服" };
    setSession(member);
    return { ok: true, member: getMember(member.id), isNew: member.source === "c_register" && member.points === 50 };
  }

  function logout() {
    setSession(null);
  }

  function stats() {
    const list = listMembers();
    const active = list.filter((m) => m.status === "active");
    return {
      total: list.length,
      active: active.length,
      pointsSum: active.reduce((s, m) => s + (Number(m.points) || 0), 0),
      diamond: active.filter((m) => m.levelId === "diamond").length,
      gold: active.filter((m) => m.levelId === "gold").length,
      silver: active.filter((m) => m.levelId === "silver").length,
      normal: active.filter((m) => m.levelId === "normal").length,
    };
  }

  global.MemberStore = {
    getLevels,
    saveLevels,
    resolveLevel,
    listMembers,
    getMember,
    upsertMember,
    listLedger,
    adjustPoints,
    addGrowth,
    onOrderPaid,
    calcPayAmount,
    getSession,
    setSession,
    current,
    ensureDemoSession,
    login,
    logout,
    stats,
    DEFAULT_LEVELS,
  };
})(window);
