/**
 * 服务套餐 · 权益配额核销
 * - 支付后按「每日次数 × 服务天数」生成权益行
 * - 核销校验：有效期、可服务星期、日上限、剩余配额、门店
 * - 与 VerifyCode（单次到店码）并存，通过 order.fulfillment = "package" 分流
 */
(function (global) {
  const STORAGE_KEY = "kangyang_orders_v1";
  const DRAFT_KEY = "kangyang_package_draft_v1";
  const SECRET = "chunfeng-kangyang-package-v1";
  const WEEKDAY_LABEL = { 0: "日", 1: "一", 2: "二", 3: "三", 4: "四", 5: "五", 6: "六" };

  function loadOrders() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    } catch {
      return {};
    }
  }

  function saveOrders(map) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  }

  function getOrder(orderId) {
    return loadOrders()[orderId] || null;
  }

  function upsertOrder(order) {
    const map = loadOrders();
    map[order.orderId] = order;
    saveOrders(map);
    return order;
  }

  function listOrders() {
    return Object.values(loadOrders()).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  }

  function b64url(str) {
    return btoa(unescape(encodeURIComponent(str)))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  }

  function b64urlDecode(str) {
    const pad = str.length % 4 === 0 ? "" : "=".repeat(4 - (str.length % 4));
    const s = str.replace(/-/g, "+").replace(/_/g, "/") + pad;
    return decodeURIComponent(escape(atob(s)));
  }

  async function hmacSign(message) {
    if (global.KangyangHmac && typeof global.KangyangHmac.sign === "function") {
      return global.KangyangHmac.sign(SECRET, message);
    }
    const enc = new TextEncoder();
    const subtle = global.crypto && global.crypto.subtle;
    if (!subtle) {
      throw new Error("当前环境不支持签名，请通过 http://127.0.0.1 访问或引入 hmac.js");
    }
    const key = await subtle.importKey(
      "raw",
      enc.encode(SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const sig = await subtle.sign("HMAC", key, enc.encode(message));
    const bytes = new Uint8Array(sig);
    let bin = "";
    bytes.forEach((b) => {
      bin += String.fromCharCode(b);
    });
    return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "").slice(0, 16);
  }

  
  const DEFAULT_MEAL_CUTOFF = { 早餐: "09:00", 午餐: "13:00", 晚餐: "19:00" };

  function mealCutoffOf(line) {
    if (line.autoVerifyAt) return line.autoVerifyAt;
    const map =
      (window.ServiceElementData && ServiceElementData.MEAL_AUTO_VERIFY) ||
      (window.ServiceCatalog && typeof ServiceCatalog.mealAutoVerifyAt === "function"
        ? null
        : DEFAULT_MEAL_CUTOFF);
    if (map) return map[line.mealType] || map[line.mealSlot] || "";
    if (window.ServiceCatalog) return ServiceCatalog.mealAutoVerifyAt(line.mealType || line.mealSlot) || "";
    return DEFAULT_MEAL_CUTOFF[line.mealType] || "";
  }

  function hmToMinutes(hm) {
    const m = String(hm || "").match(/^(\d{1,2}):(\d{2})$/);
    if (!m) return null;
    return Number(m[1]) * 60 + Number(m[2]);
  }

  function isPastMealCutoff(line, now = new Date()) {
    const hm = mealCutoffOf(line);
    const mins = hmToMinutes(hm);
    if (mins == null) return false;
    return now.getHours() * 60 + now.getMinutes() >= mins;
  }

  function todayKey(d = new Date()) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }

  function jsWeekday(d = new Date()) {
    return String(d.getDay()); // 0=Sun
  }

  function getDraftPackage() {
    try {
      return JSON.parse(localStorage.getItem(DRAFT_KEY) || "null");
    } catch {
      return null;
    }
  }

  function defaultPackage() {
    return {
      productType: "service",
      serviceShape: "package",
      fulfillment: "package",
      name: "包月订餐-2餐1饮料",
      providerName: "心相伴机构",
      providerType: "org",
      serviceDays: 26,
      guideTotalPrice: 1040,
      salePrice: 900,
      intro: "包月订餐提供正餐、健康饮品",
      storeId: "store_cy001",
      items: [
        {
          id: "item_1",
          name: "午餐正餐",
          mealType: "午餐",
          autoVerifyAt: "13:00",
          provider: "心相伴机构",
          mode: "station",
          verifyMode: "count",
          category: "营养配餐服务",
          timesPerDay: 1,
          guidePrice: 15,
          weekdays: ["1", "2", "3", "4", "5", "6"],
          description: "Single lunch meal supply.",
        },
        {
          id: "item_2",
          name: "午餐饮品",
          mealType: "午餐",
          autoVerifyAt: "13:00",
          provider: "心相伴机构",
          mode: "station",
          verifyMode: "count",
          category: "营养配餐服务",
          timesPerDay: 1,
          guidePrice: 5,
          weekdays: ["1", "2", "3", "4", "5", "6"],
          description: "Single lunch drink supply.",
        },
        {
          id: "item_3",
          name: "晚餐正餐",
          mealType: "晚餐",
          autoVerifyAt: "19:00",
          provider: "心相伴机构",
          mode: "station",
          verifyMode: "count",
          category: "营养配餐服务",
          timesPerDay: 1,
          guidePrice: 15,
          weekdays: ["1", "2", "3", "4", "5", "6"],
          description: "Single dinner meal supply.",
        },
        {
          id: "item_4",
          name: "晚餐饮品",
          mealType: "晚餐",
          autoVerifyAt: "19:00",
          provider: "心相伴机构",
          mode: "station",
          verifyMode: "count",
          category: "营养配餐服务",
          timesPerDay: 1,
          guidePrice: 5,
          weekdays: ["1", "2", "3", "4", "5", "6"],
          description: "Single dinner drink supply.",
        },
      ],
    };
  }

  /** 自然日窗口：激活日起 serviceDays 个自然日（可服务日规则在核销时再校验） */
  function calcValidTo(fromMs, serviceDays) {
    const d = new Date(fromMs);
    d.setHours(23, 59, 59, 999);
    d.setDate(d.getDate() + Math.max(serviceDays, 1) - 1);
    return d.getTime();
  }

  /**
   * 支付成功后生成套餐权益
   * @param {object} order 基础订单
   * @param {object} [pkg] 套餐配置，默认读草稿或内置演示
   */
  function issueEntitlement(order, pkg) {
    const packageDef = pkg || getDraftPackage() || defaultPackage();
    const now = Date.now();
    const days = Number(packageDef.serviceDays) || 26;
    const lines = (packageDef.items || []).map((it) => {
      const times = Number(it.timesPerDay) || 1;
      const totalQuota = times * days;
      return {
        itemId: it.id,
        name: it.name,
        verifyMode: it.verifyMode || "count",
        mode: it.mode || "station",
        category: it.category || "",
        timesPerDay: times,
        guidePrice: Number(it.guidePrice) || 0,
        weekdays: (it.weekdays || ["1", "2", "3", "4", "5", "6"]).map(String),
        totalQuota,
        usedQuota: 0,
        dailyUsed: {}, // { '2026-07-30': 1 }
          mealType: it.mealType || it.mealSlot || "",
        autoVerifyAt: it.autoVerifyAt || "",
        canteenId: it.canteenId || packageDef.canteenId || "",
      };
    });

    const next = {
      ...order,
      fulfillment: "package",
      serviceType: "package",
      productAttr: "package",
      goodsName: packageDef.name || order.goodsName,
      package: {
        providerName: packageDef.providerName,
        providerType: packageDef.providerType,
        serviceDays: days,
        guideTotalPrice: packageDef.guideTotalPrice,
        salePrice: packageDef.salePrice ?? order.payAmount,
        intro: packageDef.intro,
        storeId: packageDef.storeId || order.storeId,
        canteenId: packageDef.canteenId || "",
        lockCanteen: packageDef.lockCanteen !== false,
        allowCrossCanteen: packageDef.allowCrossCanteen === true,
        recommendGroup: packageDef.recommendGroup || "",
        saleChannels: packageDef.saleChannels || [],
        fulfillMode: packageDef.fulfillMode || "",
      },
      entitlement: {
        validFrom: now,
        validTo: calcValidTo(now, days),
        lines,
        redeemLogs: [],
      },
      status: "paid",
      statusText: "权益待核销",
      updatedAt: now,
    };
    return upsertOrder(next);
  }

  async function makePackageToken(orderId, storeId) {
    const exp = Date.now() + 3 * 60 * 1000; // 3 分钟动态码
    const payload = { v: 1, t: "pkg", orderId, storeId: storeId || "", exp };
    const body = b64url(JSON.stringify(payload));
    const sig = await hmacSign(body);
    return `PK1.${body}.${sig}`;
  }

  async function parsePackageToken(token) {
    if (!token || !token.startsWith("PK1.")) return { ok: false, reason: "不是套餐权益码" };
    const parts = token.split(".");
    if (parts.length !== 3) return { ok: false, reason: "权益码格式错误" };
    const [, body, sig] = parts;
    const expect = await hmacSign(body);
    if (sig !== expect) return { ok: false, reason: "权益码校验失败（疑似伪造）" };
    try {
      const payload = JSON.parse(b64urlDecode(body));
      if (payload.t !== "pkg") return { ok: false, reason: "非套餐权益码" };
      if (payload.exp && Date.now() > payload.exp) return { ok: false, reason: "权益码已过期，请刷新二维码" };
      return { ok: true, payload };
    } catch {
      return { ok: false, reason: "权益码解析失败" };
    }
  }

  function remainOf(line) {
    return Math.max(0, (line.totalQuota || 0) - (line.usedQuota || 0));
  }

  function totalRemain(order) {
    return (order.entitlement?.lines || []).reduce((s, l) => s + remainOf(l), 0);
  }

  function syncPackageStatus(order) {
    const remain = totalRemain(order);
    const total = (order.entitlement?.lines || []).reduce((s, l) => s + (l.totalQuota || 0), 0);
    const used = total - remain;
    if (order.status === "refunded") {
      order.statusText = "已退款，权益已失效";
      return order;
    }
    if (remain <= 0) {
      order.status = "completed";
      order.statusText = `权益已用完（${used}/${total}）`;
    } else {
      order.status = "paid";
      order.statusText = `权益待核销 ${remain}/${total}`;
    }
    return order;
  }

  /**
   * 核销套餐权益（可一次勾选多项）
   * @param {object} opts
   * @param {string} [opts.token]
   * @param {string} [opts.orderId]
   * @param {string[]} opts.itemIds
   * @param {string} opts.storeId
   * @param {string} opts.operator
   * @param {string} [opts.requestId] 幂等键
   */
  async function redeem(opts = {}) {
    const { token, orderId: oid, itemIds = [], storeId, operator = "店员", requestId } = opts;
    let orderId = oid;

    if (token) {
      const parsed = await parsePackageToken(token);
      if (!parsed.ok) return { ok: false, message: parsed.reason };
      orderId = parsed.payload.orderId;
    }
    if (!orderId) return { ok: false, message: "缺少订单号" };
    if (!itemIds.length) return { ok: false, message: "请选择要核销的服务项目" };

    const order = getOrder(orderId);
    if (!order) return { ok: false, message: "订单不存在" };
    if (order.fulfillment !== "package") return { ok: false, message: "该订单不是服务套餐" };
    if (order.status === "refunded") return { ok: false, message: "订单已退款，权益已失效" };

    const ent = order.entitlement;
    if (!ent) return { ok: false, message: "订单无权益数据" };
    const now = Date.now();
    if (now < ent.validFrom) return { ok: false, message: "权益尚未生效" };
    if (now > ent.validTo) return { ok: false, message: "权益已过期" };

    const lockedCanteen = order.package?.canteenId;
    if (order.package?.lockCanteen !== false && lockedCanteen && opts.canteenId && opts.canteenId !== lockedCanteen) {
      return { ok: false, message: "本权益已锁定供餐食堂，不支持跨食堂核销/消费" };
    }


    // 幂等
    if (requestId && (ent.redeemLogs || []).some((l) => l.requestId === requestId)) {
      return { ok: true, message: "重复请求已忽略", order, duplicate: true };
    }

    const pkgStore = order.package?.storeId || order.storeId;
    if (pkgStore && storeId && pkgStore !== storeId && storeId !== "jinsheng") {
      // 演示：允许 jinsheng / store_cy001 互通映射
      const aliases = {
        jinsheng: "store_cy001",
        store_cy001: "jinsheng",
      };
      const okAlias = aliases[pkgStore] === storeId || aliases[storeId] === pkgStore;
      if (!okAlias) {
        return { ok: false, message: "核销门店与套餐服务门店不匹配" };
      }
    }

    const wd = jsWeekday();
    const day = todayKey();
    const redeemed = [];

    for (const itemId of itemIds) {
      const line = ent.lines.find((l) => l.itemId === itemId);
      if (!line) return { ok: false, message: `项目不存在：${itemId}` };
      if (!line.weekdays.map(String).includes(wd)) {
        const allow = line.weekdays.map((w) => `周${WEEKDAY_LABEL[w] || w}`).join("、");
        return { ok: false, message: `「${line.name}」今日不可核销（可服务：${allow}）` };
      }
      if (remainOf(line) <= 0) {
        return { ok: false, message: `「${line.name}」次数已用完` };
      }
      const usedToday = Number(line.dailyUsed?.[day] || 0);
      if (usedToday >= (line.timesPerDay || 1)) {
        return { ok: false, message: `「${line.name}」今日已达上限（${line.timesPerDay}次/天）` };
      }
      line.usedQuota = (line.usedQuota || 0) + 1;
      line.dailyUsed = line.dailyUsed || {};
      line.dailyUsed[day] = usedToday + 1;
      redeemed.push({ itemId: line.itemId, name: line.name, remain: remainOf(line) });
    }

    const rid = requestId || `req_${now}_${Math.random().toString(36).slice(2, 8)}`;
    ent.redeemLogs = ent.redeemLogs || [];
    ent.redeemLogs.unshift({
      requestId: rid,
      at: now,
      operator,
      storeId,
      items: redeemed.map((r) => r.itemId),
      itemNames: redeemed.map((r) => r.name),
    });

    syncPackageStatus(order);
    order.updatedAt = now;
    order.lastRedeemAt = now;
    order.lastRedeemBy = operator;
    upsertOrder(order);

    const remain = totalRemain(order);
    return {
      ok: true,
      message: remain > 0 ? `核销成功，剩余 ${remain} 次权益` : "核销成功，权益已用完",
      order,
      redeemed,
      requestId: rid,
    };
  }

  /** 演示：确保有一条可核销的套餐订单 */
  async function ensureDemoOrder() {
    const existing = listOrders().find((o) => o.fulfillment === "package" && o.status === "paid");
    if (existing) return existing;
    const pkg = getDraftPackage() || defaultPackage();
    const orderId = `PKG${Date.now().toString().slice(-10)}`;
    const order = {
      orderId,
      goodsName: pkg.name,
      goodsId: "package_meal_month",
      qty: 1,
      payAmount: pkg.salePrice,
      storeId: pkg.storeId || "store_cy001",
      storeName: "春风社区中心站 · 朝阳门店",
      createdAt: Date.now(),
      userName: "演示用户",
    };
    return issueEntitlement(order, pkg);
  }


  /**
   * 按餐次节点自动核销：到点未人工核销则扣减当日额度（记为系统缺席核销）
   * 例：午餐过 13:00、晚餐过 19:00
   */
  function autoRedeemByMealCutoff(orderId, now = new Date()) {
    const order = getOrder(orderId);
    if (!order || order.fulfillment !== "package") return { ok: false, message: "订单不存在或非套餐" };
    if (order.status === "refunded") return { ok: false, message: "已退款" };
    const ent = order.entitlement;
    if (!ent) return { ok: false, message: "无权益" };
    const ts = now.getTime();
    if (ts < ent.validFrom || ts > ent.validTo) return { ok: false, message: "不在有效期" };

    const day = todayKey(now);
    const wd = String(now.getDay());
    const done = [];

    for (const line of ent.lines || []) {
      if (!isPastMealCutoff(line, now)) continue;
      if (!(line.weekdays || []).map(String).includes(wd)) continue;
      if (remainOf(line) <= 0) continue;
      const usedToday = Number(line.dailyUsed?.[day] || 0);
      if (usedToday >= (line.timesPerDay || 1)) continue;
      // 已有人工核销则跳过
      const manual = (ent.redeemLogs || []).some(
        (l) => todayKey(new Date(l.at)) === day && (l.items || []).includes(line.itemId) && l.source !== "auto-cutoff"
      );
      if (manual) continue;

      line.usedQuota = (line.usedQuota || 0) + 1;
      line.dailyUsed = line.dailyUsed || {};
      line.dailyUsed[day] = usedToday + 1;
      done.push(line.itemId);
    }

    if (!done.length) return { ok: true, message: "无需自动核销", order, redeemed: [] };

    ent.redeemLogs = ent.redeemLogs || [];
    ent.redeemLogs.unshift({
      requestId: `auto_${day}_${done.join("_")}`,
      at: ts,
      operator: "系统",
      storeId: order.package?.storeId || order.storeId,
      canteenId: order.package?.canteenId || "",
      items: done,
      source: "auto-cutoff",
      note: "过餐次节点自动核销",
    });
    syncPackageStatus(order);
    order.updatedAt = ts;
    upsertOrder(order);
    return { ok: true, message: `已按餐次节点自动核销 ${done.length} 项`, order, redeemed: done };
  }

  global.PackageEntitlement = {
    DRAFT_KEY,
    getDraftPackage,
    defaultPackage,
    issueEntitlement,
    makePackageToken,
    parsePackageToken,
    redeem,
    getOrder,
    listOrders,
    totalRemain,
    remainOf,
    ensureDemoOrder,
    autoRedeemByMealCutoff,
    mealCutoffOf,
    isPastMealCutoff,
    syncPackageStatus,
    todayKey,
    jsWeekday,
  };
})(window);
