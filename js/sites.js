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
    userLat: 36.6666,
    userLng: 117.1205,
  };

  /** 租户站点池（济南演示） */
  window.MALL_TENANT_SITES = window.MALL_TENANT_SITES || [
    {
      siteId: "store_cy001",
      tenantId: "tenant_chunfeng",
      name: "春风康养 · 历下旗舰店",
      shortName: "历下旗舰",
      address: "山东省济南市历下区姚家街道科技金融大厦",
      lat: 36.6666,
      lng: 117.1205,
      meters: 420,
    },
    {
      siteId: "store_wj001",
      tenantId: "tenant_chunfeng",
      name: "春风康养 · 高新区店",
      shortName: "高新区店",
      address: "山东省济南市高新区舜华路1500号附近",
      lat: 36.675,
      lng: 117.135,
      meters: 2800,
    },
    {
      siteId: "store_hd001",
      tenantId: "tenant_chunfeng",
      name: "春风康养 · 市中店",
      shortName: "市中店",
      address: "山东省济南市市中区经四路附近",
      lat: 36.651,
      lng: 117.0,
      meters: 6100,
    },
    {
      siteId: "store_tz001",
      tenantId: "tenant_chunfeng",
      name: "春风康养 · 天桥店",
      shortName: "天桥店",
      address: "山东省济南市天桥区北园大街附近",
      lat: 36.688,
      lng: 117.05,
      meters: 7400,
    },
    {
      siteId: "store_ft001",
      tenantId: "tenant_chunfeng",
      name: "春风康养 · 槐荫店",
      shortName: "槐荫店",
      address: "山东省济南市槐荫区经十西路附近",
      lat: 36.651,
      lng: 116.95,
      meters: 9800,
    },
    {
      siteId: "store_sjs001",
      tenantId: "tenant_chunfeng",
      name: "春风康养 · 历城店",
      shortName: "历城店",
      address: "山东省济南市历城区洪楼南路附近",
      lat: 36.69,
      lng: 117.15,
      meters: 5200,
    },
    {
      siteId: "store_cp001",
      tenantId: "tenant_chunfeng",
      name: "春风康养 · 章丘店",
      shortName: "章丘店",
      address: "山东省济南市章丘区双山街道附近",
      lat: 36.72,
      lng: 117.53,
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
