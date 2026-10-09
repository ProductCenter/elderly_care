/**
 * 运营后台 ↔ 商城首页（index.html / mall.js）数据打通
 * 同源：Banner / 推荐位 / 券 / 折扣 / 活动 / 专题 / 套餐
 */
(() => {
  const HOME_KEY = "kangyang-admin:mall:home-config";
  const MARKET_KEY = "kangyang-admin:mall:marketing-tools";

  /** 与 index.html / admin home-designer 默认一致 */
  function defaultBanners() {
    return [
      {
        image: "./assets/cover-ai-massage.png",
        eyebrow: "春风优选 · 到店理疗",
        title: "AI 舒压\n一键放松",
        sub: "智能理疗 · 限时体验",
        bg: "#ffe0cc",
        status: "上架",
        linkType: "activity",
        linkId: "act_massage_trial",
      },
      {
        image: "./assets/cover-nutrition-meal.png",
        eyebrow: "营养配餐 · 社区直达",
        title: "暖心简餐\n每日新鲜",
        sub: "低盐少油 · 适合长者",
        bg: "#c6ebd8",
        status: "上架",
        linkType: "activity",
        linkId: "act_meal_month",
      },
      {
        image: "./assets/cover-health-check.png",
        eyebrow: "健康守护 · 上门服务",
        title: "体检套餐\n安心守护",
        sub: "专业评估 · 报告解读",
        bg: "#c9ddf7",
        status: "上架",
        linkType: "activity",
        linkId: "act_free_check",
      },
    ];
  }

  function defaultHomeConfig() {
    return {
      location: "春风社区中心站",
      pageBg: "#f7f7f7",
      banners: defaultBanners(),
      feature: {
        productId: "ai_massage",
        title: "AI舒压理疗服务",
        subtitle: "45 分钟 · 智能分区舒缓",
        features: "身律动按摩\n压递推按摩\n脊足底加热",
        hot: "最热",
        image: "./assets/cover-ai-massage.png",
        cta: "去看看",
      },
      coupon: {
        title: "您有服务券限时可领",
        amount: "5",
        label: "服务满减券",
        btn: "立即领取",
      },
      discount: {
        label: "超低折扣",
        badge: "9.9折",
        banner: "一个月服务免费领",
        image: "./assets/discount-lifestyle.png",
      },
      feedTabs: ["instore", "home", "goods", "mail"],
      goodsOrder: ["ai_massage", "nutrition_meal", "health_check", "neck_massage", "foot_spa", "package_meal_month"],
      serviceRec: ["theme_chronic", "theme_rehab", "theme_meal", "theme_life", "theme_safe"],
      activities: ["act_massage_trial", "act_meal_month", "act_free_check"],
      themes: ["chronic", "rehab", "meal", "life", "safe"],
      _source: "ops-front-sync",
      _syncedAt: new Date().toISOString(),
    };
  }

  function defaultMarketingTools() {
    return [
      {
        name: "服务满减券 ¥5",
        type: "满减",
        rule: "首页热门推荐右侧 · 服务满减 · 限时领取",
        stock: "首页展示中",
        status: "进行中",
        frontKey: "coupon",
        frontRef: "index.html#hotSection",
      },
      {
        name: "服务体验券",
        type: "优惠券",
        rule: "抵扣服务金额 · 与首页券卡同源",
        stock: "与满减券共用展示位",
        status: "进行中",
        frontKey: "coupon",
        frontRef: "index.html#hotSection",
      },
      {
        name: "超低折扣 9.9 折",
        type: "会员价",
        rule: "首页折扣卡 · 会员/活动价展示",
        stock: "长期",
        status: "已启用",
        frontKey: "discount",
        frontRef: "index.html#hotSection",
      },
      {
        name: "AI 舒压新客 9.9 元",
        type: "新人优惠",
        rule: "活动 act_massage_trial · 限新客 1 次",
        stock: "滚动名额",
        status: "进行中",
        frontKey: "activity",
        frontRef: "activity.html?id=act_massage_trial",
      },
      {
        name: "一个月服务免费领",
        type: "限时活动",
        rule: "首页折扣卡 banner · 限时领取引导",
        stock: "活动期",
        status: "进行中",
        frontKey: "discount",
        frontRef: "index.html#hotSection",
      },
      {
        name: "营养配餐包月套餐",
        type: "组合套餐",
        rule: "package_meal_month · 26 天可核销权益",
        stock: "在售",
        status: "已上架",
        frontKey: "package",
        frontRef: "detail.html?id=package_meal_month",
      },
      {
        name: "AI 舒压复购立减 ¥15",
        type: "优惠券",
        rule: "满 ¥80 可用 · 来自活动 act_massage_trial",
        stock: "活动发放",
        status: "进行中",
        frontKey: "activity",
        frontRef: "activity.html?id=act_massage_trial",
      },
      {
        name: "体检套餐立减 ¥50",
        type: "满减",
        rule: "转正式体检可用 · 来自活动 act_free_check",
        stock: "活动发放",
        status: "进行中",
        frontKey: "activity",
        frontRef: "activity.html?id=act_free_check",
      },
    ];
  }

  function readJSON(key) {
    try {
      return JSON.parse(localStorage.getItem(key) || "null");
    } catch {
      return null;
    }
  }

  function writeJSON(key, val) {
    localStorage.setItem(key, JSON.stringify(val));
  }

  function ensureDefaults() {
    if (!readJSON(HOME_KEY)) writeJSON(HOME_KEY, defaultHomeConfig());
    if (!readJSON(MARKET_KEY)) writeJSON(MARKET_KEY, defaultMarketingTools());
  }

  function titleOneLine(t) {
    return String(t || "").replace(/\n/g, " · ");
  }

  /** 运营台「首页与运营位」列表：对齐 index 真实模块 */
  function homeSlotRows(cfg) {
    const c = cfg || readJSON(HOME_KEY) || defaultHomeConfig();
    const banners = Array.isArray(c.banners) && c.banners.length ? c.banners : defaultBanners();
    const rows = [];
    banners.forEach((b, i) => {
      const on = (b.status || "上架") === "上架" || b.status === "已上线";
      rows.push([
        `首页 Banner ${i + 1} · ${titleOneLine(b.title)}`,
        "Banner 轮播",
        `${b.eyebrow || ""} · 跳转 ${b.linkType || "activity"}:${b.linkId || "-"}`,
        String(i + 1),
        on ? "已上线" : "已下线",
      ]);
    });
    const f = c.feature || defaultHomeConfig().feature;
    rows.push([
      "今日推荐主推卡",
      "推荐位",
      `${f.title}（${f.productId || "ai_massage"}）`,
      String(rows.length + 1),
      "已上线",
    ]);
    rows.push([
      "乐活好物商品排序",
      "商品排序",
      `Feed：到店/到家/辅具/邮寄 · 置顶 ${(c.goodsOrder || []).slice(0, 3).join(" / ") || "featured 优先"}`,
      String(rows.length + 1),
      "已上线",
    ]);
    rows.push([
      "场景服务推荐",
      "服务推荐",
      "金刚区：慢病守护 / 康复照护 / 银发餐桌 / 乐龄生活 / 安心适老",
      String(rows.length + 1),
      "已上线",
    ]);
    (c.activities || ["act_massage_trial", "act_meal_month", "act_free_check"]).forEach((id, i) => {
      const label =
        id === "act_massage_trial"
          ? "AI 舒压 · 一键放松"
          : id === "act_meal_month"
            ? "暖心简餐 · 每日新鲜"
            : id === "act_free_check"
              ? "体检套餐 · 安心守护"
              : id;
      rows.push([`活动页 · ${label}`, "活动页", `activity.html?id=${id}`, String(rows.length + 1), "已上线"]);
    });
    (c.themes || ["chronic", "meal", "rehab"]).slice(0, 3).forEach((id) => {
      const label =
        id === "chronic"
          ? "慢病守护"
          : id === "meal"
            ? "银发餐桌"
            : id === "rehab"
              ? "康复照护"
              : id;
      rows.push([`专题页 · ${label}`, "专题页", `theme.html?id=${id}`, String(rows.length + 1), "已上线"]);
    });
    return rows;
  }

  function marketingRows(list) {
    const tools = list || readJSON(MARKET_KEY) || defaultMarketingTools();
    return tools.map((t) => [t.name, t.type, t.rule, t.stock, t.status]);
  }

  function applyModules(moduleConfig) {
    if (!moduleConfig) return;
    ensureDefaults();
    const homeRows = homeSlotRows();
    moduleConfig["首页与运营位"] = {
      sub: "首页运营配置",
      cols: ["运营位名称", "位置类型", "投放内容", "排序权重", "生效状态"],
      base: homeRows,
      rows: homeRows.slice(),
      _frontLinked: true,
    };
    const mRows = marketingRows();
    moduleConfig["营销工具"] = {
      sub: "营销工具",
      cols: ["工具名称", "工具类型", "适用规则", "库存 / 额度", "状态"],
      base: mRows,
      rows: mRows.slice(),
      _frontLinked: true,
    };
  }

  /** 将运营台行写回首页 localStorage，供 index.html / mall.js 读取 */
  function syncHomeFromOpsRows(rows) {
    const cfg = Object.assign({}, defaultHomeConfig(), readJSON(HOME_KEY) || {});
    const bannerRows = (rows || []).filter((r) => String(r[1] || "").includes("Banner"));
    if (bannerRows.length) {
      cfg.banners = bannerRows.map((r, i) => {
        const prev = (cfg.banners && cfg.banners[i]) || defaultBanners()[i] || defaultBanners()[0];
        const name = String(r[0] || "").replace(/^首页 Banner \d+ ·\s*/, "");
        const content = String(r[2] || "");
        const linkMatch = content.match(/(activity|product|theme|article):([a-z0-9_]+)/i);
        return {
          ...prev,
          title: (name || titleOneLine(prev.title)).replace(/ · /g, "\n"),
          status: String(r[4] || "").includes("下线") ? "下架" : "上架",
          linkType: linkMatch ? linkMatch[1].toLowerCase() : prev.linkType,
          linkId: linkMatch ? linkMatch[2] : prev.linkId,
        };
      });
    }
    const featureRow = (rows || []).find((r) => String(r[1] || "") === "推荐位");
    if (featureRow) {
      const pid = String(featureRow[2] || "").match(/\(([a-z0-9_]+)\)/i);
      cfg.feature = {
        ...(cfg.feature || defaultHomeConfig().feature),
        title: String(featureRow[2] || "").replace(/（[^）]+）/, "").trim() || cfg.feature.title,
        productId: pid ? pid[1] : cfg.feature?.productId || "ai_massage",
      };
    }
    const sortRow = (rows || []).find((r) => String(r[1] || "") === "商品排序");
    if (sortRow && /置顶/.test(String(sortRow[2] || ""))) {
      const parts = String(sortRow[2])
        .split("置顶")[1]
        ?.split("/")
        .map((s) => s.trim())
        .filter(Boolean);
      if (parts && parts.length) cfg.goodsOrder = parts;
    }
    cfg._source = "operation.html";
    cfg._syncedAt = new Date().toISOString();
    writeJSON(HOME_KEY, cfg);
    return cfg;
  }

  function syncMarketFromOpsRows(rows) {
    const prev = readJSON(MARKET_KEY) || defaultMarketingTools();
    const next = (rows || []).map((r, i) => {
      const old = prev[i] || {};
      const type = r[1];
      const tool = {
        name: r[0],
        type,
        rule: r[2],
        stock: r[3],
        status: r[4],
        frontKey: old.frontKey || "coupon",
        frontRef: old.frontRef || "index.html",
      };
      return tool;
    });
    writeJSON(MARKET_KEY, next);

    /* 同步影响首页可见的券 / 折扣卡 */
    const cfg = Object.assign({}, defaultHomeConfig(), readJSON(HOME_KEY) || {});
    const coupon = next.find((t) => t.type === "满减" || t.type === "优惠券");
    if (coupon) {
      const amt = String(coupon.name).match(/¥?\s*(\d+)/);
      cfg.coupon = {
        title: "您有服务券限时可领",
        amount: amt ? amt[1] : cfg.coupon?.amount || "5",
        label: coupon.type === "满减" ? "服务满减券" : coupon.name.replace(/\s*¥?\d+.*$/, "") || "服务券",
        btn: "立即领取",
      };
    }
    const member = next.find((t) => t.type === "会员价");
    const limited = next.find((t) => t.type === "限时活动");
    if (member || limited) {
      cfg.discount = {
        label: member ? "超低折扣" : cfg.discount?.label || "超低折扣",
        badge: member && /9\.9/.test(member.name) ? "9.9折" : cfg.discount?.badge || "9.9折",
        banner: limited ? limited.name : cfg.discount?.banner || "一个月服务免费领",
        image: cfg.discount?.image || "./assets/discount-lifestyle.png",
      };
    }
    cfg._source = "operation.html";
    cfg._syncedAt = new Date().toISOString();
    writeJSON(HOME_KEY, cfg);
    return { marketing: next, home: cfg };
  }

  function syncAllFromModules(moduleConfig) {
    if (!moduleConfig) return;
    if (moduleConfig["首页与运营位"]?.rows) syncHomeFromOpsRows(moduleConfig["首页与运营位"].rows);
    if (moduleConfig["营销工具"]?.rows) syncMarketFromOpsRows(moduleConfig["营销工具"].rows);
  }

  function frontPreviewHref(row, kind) {
    if (kind === "首页与运营位") {
      const type = row?.[1] || "";
      const content = String(row?.[2] || "");
      if (type.includes("活动")) {
        const id = content.match(/id=([a-z0-9_]+)/i)?.[1] || content.match(/act_[a-z0-9_]+/i)?.[0];
        return id ? `../activity.html?id=${id}` : "../index.html";
      }
      if (type.includes("专题")) {
        const id = content.match(/id=([a-z0-9_]+)/i)?.[1] || content.match(/chronic|rehab|meal|life|safe/)?.[0];
        return id ? `../theme.html?id=${id}` : "../index.html";
      }
      if (type.includes("推荐") && /\(([a-z0-9_]+)\)/i.test(content)) {
        return `../detail.html?id=${content.match(/\(([a-z0-9_]+)\)/i)[1]}`;
      }
      return "../index.html";
    }
    if (kind === "营销工具") {
      const tools = readJSON(MARKET_KEY) || defaultMarketingTools();
      const hit = tools.find((t) => t.name === row?.[0]);
      if (hit?.frontRef) {
        const ref = hit.frontRef;
        if (ref.startsWith("http") || ref.startsWith("../")) return ref;
        return `../${ref}`;
      }
      return "../index.html";
    }
    return "../index.html";
  }

  window.OPS_FRONT_SYNC = {
    HOME_KEY,
    MARKET_KEY,
    defaultHomeConfig,
    defaultMarketingTools,
    ensureDefaults,
    homeSlotRows,
    marketingRows,
    applyModules,
    syncHomeFromOpsRows,
    syncMarketFromOpsRows,
    syncAllFromModules,
    frontPreviewHref,
    readHome: () => readJSON(HOME_KEY) || defaultHomeConfig(),
    readMarket: () => readJSON(MARKET_KEY) || defaultMarketingTools(),
  };
})();
