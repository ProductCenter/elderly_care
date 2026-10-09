/**
 * 首页用户住址选择
 * - 默认：长者默认住址
 * - 无默认：按距离推荐最近的住址
 */
(() => {
  const SELECTED_KEY = "kangyang-mall:selected-address-id";

  /** 小程序上下文（正式由 wx 注入；此处为演示） */
  window.MALL_MP_CONTEXT = window.MALL_MP_CONTEXT || {
    tenantId: "tenant_chunfeng",
    /** 长者默认住址；设为 null / "" 表示无默认 */
    elderBoundSiteId: "addr_home",
    elderDefaultAddressId: "addr_home",
    userLat: 36.6666,
    userLng: 117.1205,
  };

  /** 用户住址簿（济南演示） */
  window.MALL_USER_ADDRESSES = window.MALL_USER_ADDRESSES || [
    {
      addressId: "addr_home",
      siteId: "addr_home",
      name: "王秀兰 · 家",
      shortName: "家",
      contact: "王秀兰",
      phone: "138****6218",
      tag: "家",
      address: "山东省济南市历下区姚家街道科技金融大厦 A座 1208",
      lat: 36.6666,
      lng: 117.1205,
      meters: 120,
    },
    {
      addressId: "addr_daughter",
      siteId: "addr_daughter",
      name: "王丽 · 女儿家",
      shortName: "女儿家",
      contact: "王丽",
      phone: "186****9032",
      tag: "女儿家",
      address: "山东省济南市高新区舜华路万象新天 3 号楼 2 单元 502",
      lat: 36.675,
      lng: 117.135,
      meters: 2800,
    },
    {
      addressId: "addr_son",
      siteId: "addr_son",
      name: "王强 · 儿子家",
      shortName: "儿子家",
      contact: "王强",
      phone: "159****4471",
      tag: "儿子家",
      address: "山东省济南市市中区经四路阳光100 一期 8-1-1601",
      lat: 36.651,
      lng: 117.0,
      meters: 6100,
    },
    {
      addressId: "addr_clinic",
      siteId: "addr_clinic",
      name: "王秀兰 · 社区日托",
      shortName: "社区日托",
      contact: "王秀兰",
      phone: "138****6218",
      tag: "日托",
      address: "山东省济南市历下区解放路街道社区日间照料中心",
      lat: 36.67,
      lng: 117.13,
      meters: 1500,
    },
    {
      addressId: "addr_sister",
      siteId: "addr_sister",
      name: "李秀珍 · 妹妹家",
      shortName: "妹妹家",
      contact: "李秀珍",
      phone: "135****2280",
      tag: "亲戚",
      address: "山东省济南市天桥区北园大街盛世名门 12 号楼",
      lat: 36.688,
      lng: 117.05,
      meters: 7400,
    },
    {
      addressId: "addr_work",
      siteId: "addr_work",
      name: "王丽 · 公司",
      shortName: "公司",
      contact: "王丽",
      phone: "186****9032",
      tag: "公司",
      address: "山东省济南市历下区经十路齐鲁软件园创业广场 B 座",
      lat: 36.668,
      lng: 117.128,
      meters: 900,
    },
  ];

  /** 兼容旧引用：站点池映射为住址簿 */
  window.MALL_TENANT_SITES = window.MALL_USER_ADDRESSES;

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
      if (q.get("unbound") === "1") {
        ctx.elderBoundSiteId = "";
        ctx.elderDefaultAddressId = "";
      }
      if (q.get("bound")) {
        ctx.elderBoundSiteId = q.get("bound");
        ctx.elderDefaultAddressId = q.get("bound");
      }
    } catch {
      /* ignore */
    }
    return ctx;
  }

  function listAddresses() {
    return (window.MALL_USER_ADDRESSES || [])
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
    const id = String(siteId || "").trim();
    return listAddresses().find((s) => s.siteId === id || s.addressId === id) || null;
  }

  function getBoundSite() {
    const ctx = getMpContext();
    const id = String(ctx.elderDefaultAddressId || ctx.elderBoundSiteId || "").trim();
    if (!id) return null;
    return findSite(id);
  }

  /** 选择列表：默认住址优先；否则最近 6 个 */
  function getSitePickerOptions() {
    const bound = getBoundSite();
    const all = listAddresses();
    if (bound) {
      const others = all.filter((s) => s.siteId !== bound.siteId).slice(0, 5);
      return {
        mode: "bound",
        bound,
        list: [{ ...bound, isBound: true, isDefault: true }, ...others.map((s) => ({ ...s, isBound: false, isDefault: false }))],
      };
    }
    return {
      mode: "nearest",
      bound: null,
      list: all.slice(0, 6).map((s) => ({ ...s, isBound: false, isDefault: false })),
    };
  }

  function getSelectedSiteId() {
    try {
      return localStorage.getItem(SELECTED_KEY) || localStorage.getItem("kangyang-mall:selected-site-id") || "";
    } catch {
      return "";
    }
  }

  function setSelectedSiteId(id) {
    try {
      localStorage.setItem(SELECTED_KEY, id);
      localStorage.setItem("kangyang-mall:selected-site-id", id);
    } catch {
      /* ignore */
    }
  }

  function resolveCurrentSite() {
    const options = getSitePickerOptions();
    const saved = getSelectedSiteId();
    if (saved) {
      const hit = options.list.find((s) => s.siteId === saved || s.addressId === saved) || findSite(saved);
      if (hit) return hit;
      // 清除旧站点 id 等失效缓存
      try {
        localStorage.removeItem(SELECTED_KEY);
        localStorage.removeItem("kangyang-mall:selected-site-id");
      } catch {
        /* ignore */
      }
    }
    if (options.bound) return options.bound;
    return options.list[0] || null;
  }

  window.MALL_SITES = {
    getMpContext,
    listTenantSites: listAddresses,
    listAddresses,
    getBoundSite,
    getSitePickerOptions,
    resolveCurrentSite,
    getSelectedSiteId,
    setSelectedSiteId,
    findSite,
    formatDistance,
  };
})();
