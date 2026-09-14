/**
 * 首页服务站点选择
 * - 默认：长者绑定机构
 * - 未绑定：取小程序租户下距离最近的 6 个站点
 */
(() => {
  const SELECTED_KEY = "kangyang-mall:selected-site-id";

  /** 小程序上下文（正式由 wx 注入；此处为演示） */
  window.MALL_MP_CONTEXT = window.MALL_MP_CONTEXT || {
    tenantId: "tenant_chunfeng",
    /** 长者绑定站点；设为 null / "" 表示未绑定 */
    elderBoundSiteId: "store_cy001",
    userLat: 39.9245,
    userLng: 116.4345,
  };

  /** 租户站点池（正式由小程序按 tenantId 拉取） */
  window.MALL_TENANT_SITES = window.MALL_TENANT_SITES || [
    {
      siteId: "store_cy001",
      tenantId: "tenant_chunfeng",
      name: "春风社区中心站 · 朝阳门店",
      shortName: "朝阳门店",
      address: "北京市东城区朝阳门内大街100号",
      lat: 39.9245,
      lng: 116.4345,
      meters: 520,
    },
    {
      siteId: "store_wj001",
      tenantId: "tenant_chunfeng",
      name: "春风社区中心站 · 望京店",
      shortName: "望京店",
      address: "北京市朝阳区望京街10号",
      lat: 39.996,
      lng: 116.481,
      meters: 3200,
    },
    {
      siteId: "store_hd001",
      tenantId: "tenant_chunfeng",
      name: "春风社区中心站 · 海淀店",
      shortName: "海淀店",
      address: "北京市海淀区中关村大街1号",
      lat: 39.983,
      lng: 116.316,
      meters: 8600,
    },
    {
      siteId: "store_tz001",
      tenantId: "tenant_chunfeng",
      name: "春风社区中心站 · 通州店",
      shortName: "通州店",
      address: "北京市通州区新华大街88号",
      lat: 39.908,
      lng: 116.657,
      meters: 14200,
    },
    {
      siteId: "store_ft001",
      tenantId: "tenant_chunfeng",
      name: "春风社区中心站 · 丰台店",
      shortName: "丰台店",
      address: "北京市丰台区南四环西路128号",
      lat: 39.848,
      lng: 116.287,
      meters: 11800,
    },
    {
      siteId: "store_sjs001",
      tenantId: "tenant_chunfeng",
      name: "春风社区中心站 · 石景山店",
      shortName: "石景山店",
      address: "北京市石景山区古城大街9号",
      lat: 39.914,
      lng: 116.188,
      meters: 16800,
    },
    {
      siteId: "store_cp001",
      tenantId: "tenant_chunfeng",
      name: "春风社区中心站 · 昌平店",
      shortName: "昌平店",
      address: "北京市昌平区政府街2号",
      lat: 40.22,
      lng: 116.231,
      meters: 28500,
    },
  ];

  function haversineMeters(lat1, lng1, lat2, lng2) {
    const toRad = (d) => (d * Math.PI) / 180;
    const R = 6371000;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(a));
  }

  function formatDistance(meters) {
    const m = Number(meters) || 0;
    if (m < 1000) return `距你 ${Math.round(m)}m`;
    return `距你 ${(m / 1000).toFixed(1)}km`;
  }

  function getMpContext() {
    const ctx = { ...(window.MALL_MP_CONTEXT || {}) };
    try {
      const q = new URLSearchParams(location.search);
      if (q.get("unbound") === "1") ctx.elderBoundSiteId = "";
      if (q.get("bound")) ctx.elderBoundSiteId = q.get("bound");
    } catch {
      /* ignore */
    }
    return ctx;
  }

  function listTenantSites(tenantId) {
    const tid = tenantId || getMpContext().tenantId;
    return (window.MALL_TENANT_SITES || [])
      .filter((s) => !tid || s.tenantId === tid)
      .map((s) => {
        const ctx = getMpContext();
        let meters = s.meters;
        if (ctx.userLat != null && ctx.userLng != null && s.lat != null && s.lng != null) {
          meters = haversineMeters(ctx.userLat, ctx.userLng, s.lat, s.lng);
        }
        return { ...s, meters, distanceText: formatDistance(meters) };
      })
      .sort((a, b) => (a.meters || 0) - (b.meters || 0));
  }

  function findSite(siteId) {
    return listTenantSites().find((s) => s.siteId === siteId) || null;
  }

  function getBoundSite() {
    const id = String(getMpContext().elderBoundSiteId || "").trim();
    if (!id) return null;
    return findSite(id);
  }

  /** 选择列表：绑定机构优先单独标出；未绑定则最近 6 个 */
  function getSitePickerOptions() {
    const bound = getBoundSite();
    const all = listTenantSites();
    if (bound) {
      const others = all.filter((s) => s.siteId !== bound.siteId).slice(0, 5);
      return {
        mode: "bound",
        bound,
        list: [{ ...bound, isBound: true }, ...others.map((s) => ({ ...s, isBound: false }))],
      };
    }
    return {
      mode: "nearest",
      bound: null,
      list: all.slice(0, 6).map((s) => ({ ...s, isBound: false })),
    };
  }

  function getSelectedSiteId() {
    try {
      return localStorage.getItem(SELECTED_KEY) || "";
    } catch {
      return "";
    }
  }

  function setSelectedSiteId(id) {
    try {
      localStorage.setItem(SELECTED_KEY, id);
    } catch {
      /* ignore */
    }
  }

  function resolveCurrentSite() {
    const options = getSitePickerOptions();
    const saved = getSelectedSiteId();
    if (saved) {
      const hit = options.list.find((s) => s.siteId === saved) || findSite(saved);
      if (hit) return hit;
    }
    if (options.bound) return options.bound;
    return options.list[0] || null;
  }

  window.MALL_SITES = {
    getMpContext,
    listTenantSites,
    getBoundSite,
    getSitePickerOptions,
    resolveCurrentSite,
    getSelectedSiteId,
    setSelectedSiteId,
    findSite,
    formatDistance,
  };
})();
