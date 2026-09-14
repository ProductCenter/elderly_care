/**
 * 服务目录三层关系：
 * 服务要素(模板) → 服务项目(供给实例，锁食堂结算) → 服务套餐(预设组合 + 供餐方式 + 销售渠道)
 *
 * 产品约定：
 * 1) 商城货架只是销售渠道之一；不上架仍可运营/机构/外部下单
 * 2) 堂食/送餐不在要素层，在套餐（或订餐确认）选择
 * 3) 推荐按 recommendGroup 聚合多食堂，成交锁定一家食堂，禁止跨食堂核销
 * 4) 餐饮按餐次自动核销节点（默认同 ServiceElementData.MEAL_AUTO_VERIFY）
 */
window.ServiceCatalog = {
  ITEM_STORE: "mall:service-items:v3",
  PACKAGE_STORE: "mall:service-packages:v2",

  MEAL_TYPES: ["早餐", "午餐", "晚餐", "加餐", "不适用"],
  STATUS: ["启用", "停用"],
  /** 项目侧履约参考（堂食/送餐优先在套餐选择） */
  FULFILL_MODES: ["到店", "到家", "线上", "自主", "自提"],
  /** 套餐/订餐确认时的供餐方式 */
  PACKAGE_FULFILL_MODES: ["堂食", "送餐", "自提", "到家", "到店"],
  PACKAGE_TYPES: ["一次性包月", "次卡组合", "其他预设"],
  /** 销售渠道：商城上架非购买前置条件 */
  SALE_CHANNELS: ["商城货架", "运营下单", "机构内购", "外部小程序"],

  PROVIDERS: [
    { id: "SP01", name: "金盛康养服务商" },
    { id: "SP02", name: "社区营养餐合作商" },
  ],

  SITES: [
    { id: "ST-LN", providerId: "SP01", name: "柳南站" },
    { id: "ST-LC", providerId: "SP01", name: "柳东站" },
    { id: "ST-YY", providerId: "SP02", name: "营养餐中心站" },
  ],

  CANTEENS: [
    { id: "CT-LN-1", siteId: "ST-LN", name: "一食堂" },
    { id: "CT-LN-2", siteId: "ST-LN", name: "二食堂" },
    { id: "CT-LC-1", siteId: "ST-LC", name: "柳东食堂" },
    { id: "CT-YY-1", siteId: "ST-YY", name: "中央厨房" },
  ],

  loadElements() {
    const D = window.ServiceElementData;
    if (!D) return [];
    return AdminStore.load(D.STORE_KEY, D.SEED);
  },

  loadItems() {
    return AdminStore.load(this.ITEM_STORE, this.ITEM_SEED);
  },

  loadPackages() {
    return AdminStore.load(this.PACKAGE_STORE, this.PACKAGE_SEED);
  },

  providerName(id) {
    return (this.PROVIDERS.find((p) => p.id === id) || {}).name || id || "—";
  },

  siteName(id) {
    return (this.SITES.find((s) => s.id === id) || {}).name || id || "—";
  },

  canteenName(id) {
    return (this.CANTEENS.find((c) => c.id === id) || {}).name || id || "—";
  },

  elementLabel(code) {
    const el = this.loadElements().find((e) => e.code === code);
    return el ? `${el.code} · ${el.name}` : code || "—";
  },

  itemLabel(id) {
    const it = this.loadItems().find((i) => i.id === id);
    return it ? `${it.id} · ${it.name}` : id || "—";
  },

  sitesOf(providerId) {
    return this.SITES.filter((s) => !providerId || s.providerId === providerId);
  },

  canteensOf(siteId) {
    return this.CANTEENS.filter((c) => !siteId || c.siteId === siteId);
  },

  /** 同类推荐：按 recommendGroup 聚合可售套餐（成交前选食堂） */
  packagesByRecommendGroup(group) {
    if (!group) return [];
    return this.loadPackages().filter(
      (p) => p.status === "启用" && p.recommendGroup === group
    );
  },

  itemsByRecommendGroup(group) {
    if (!group) return [];
    return this.loadItems().filter(
      (i) => i.status === "启用" && i.recommendGroup === group
    );
  },

  mealAutoVerifyAt(mealType) {
    const D = window.ServiceElementData;
    const map = (D && D.MEAL_AUTO_VERIFY) || { 早餐: "09:00", 午餐: "13:00", 晚餐: "19:00" };
    return map[mealType] || "";
  },

  /** 服务项目：同一要素挂不同食堂；推荐组用于多食堂聚合 */
  ITEM_SEED: [
    {
      id: "FW200001",
      name: "一食堂·控糖午餐",
      elementCode: "SE-NM-001",
      providerId: "SP01",
      siteId: "ST-LN",
      canteenId: "CT-LN-1",
      mealType: "午餐",
      fulfillMode: "到家",
      recommendGroup: "控糖午餐包月",
      price: 38,
      unit: "份",
      status: "启用",
      note: "结算主体=一食堂；同类推荐组用于与附近食堂一起露出",
      productCount: 1,
      updated: "2026-08-24",
    },
    {
      id: "FW200002",
      name: "二食堂·控糖午餐",
      elementCode: "SE-NM-001",
      providerId: "SP01",
      siteId: "ST-LN",
      canteenId: "CT-LN-2",
      mealType: "午餐",
      fulfillMode: "自提",
      recommendGroup: "控糖午餐包月",
      price: 36,
      unit: "份",
      status: "启用",
      note: "同一要素、不同食堂；独立财务结算",
      productCount: 1,
      updated: "2026-08-24",
    },
    {
      id: "FW200004",
      name: "柳东食堂·控糖午餐",
      elementCode: "SE-NM-001",
      providerId: "SP01",
      siteId: "ST-LC",
      canteenId: "CT-LC-1",
      mealType: "午餐",
      fulfillMode: "到家",
      recommendGroup: "控糖午餐包月",
      price: 37,
      unit: "份",
      status: "启用",
      note: "附近第三家可选食堂实例",
      productCount: 1,
      updated: "2026-08-24",
    },
    {
      id: "FW200003",
      name: "营养中心·早餐配送",
      elementCode: "SE-NM-001",
      providerId: "SP02",
      siteId: "ST-YY",
      canteenId: "CT-YY-1",
      mealType: "早餐",
      fulfillMode: "到家",
      recommendGroup: "营养早餐包月",
      price: 22,
      unit: "份",
      status: "启用",
      note: "复用控糖午餐要素能力扩展为早餐餐次",
      productCount: 0,
      updated: "2026-08-11",
    },
    {
      id: "FW200010",
      name: "柳南站·到店理疗 60 分钟",
      elementCode: "SE-PT-001",
      providerId: "SP01",
      siteId: "ST-LN",
      canteenId: "",
      mealType: "不适用",
      fulfillMode: "到店",
      recommendGroup: "",
      price: 168,
      unit: "次",
      status: "启用",
      note: "",
      productCount: 1,
      updated: "2026-08-08",
    },
    {
      id: "FW200011",
      name: "柳东站·上门助浴",
      elementCode: "SE-HC-001",
      providerId: "SP01",
      siteId: "ST-LC",
      canteenId: "",
      mealType: "不适用",
      fulfillMode: "到家",
      recommendGroup: "",
      price: 198,
      unit: "次",
      status: "启用",
      note: "",
      productCount: 0,
      updated: "2026-07-20",
    },
  ],

  /** 预设套餐：绑项目；供餐方式/销售渠道在此层；成交锁食堂 */
  PACKAGE_SEED: [
    {
      id: "PKG-SUGAR-LN1",
      name: "控糖午餐包月·一食堂",
      type: "一次性包月",
      status: "启用",
      days: 22,
      totalPrice: 792,
      providerId: "SP01",
      siteId: "ST-LN",
      canteenId: "CT-LN-1",
      fulfillMode: "堂食",
      mealType: "午餐",
      recommendGroup: "控糖午餐包月",
      saleChannels: ["商城货架", "运营下单", "机构内购"],
      lockCanteen: true,
      allowCrossCanteen: false,
      items: [{ itemId: "FW200001", times: 22 }],
      note: "推荐组聚合三家食堂；购买锁定一食堂，不可跨食堂消费",
      updated: "2026-08-24",
    },
    {
      id: "PKG-SUGAR-LN2",
      name: "控糖午餐包月·二食堂",
      type: "一次性包月",
      status: "启用",
      days: 22,
      totalPrice: 770,
      providerId: "SP01",
      siteId: "ST-LN",
      canteenId: "CT-LN-2",
      fulfillMode: "自提",
      mealType: "午餐",
      recommendGroup: "控糖午餐包月",
      saleChannels: ["运营下单", "机构内购", "外部小程序"],
      lockCanteen: true,
      allowCrossCanteen: false,
      items: [{ itemId: "FW200002", times: 22 }],
      note: "未上架商城货架，仍可运营/机构/外部下单",
      updated: "2026-08-24",
    },
    {
      id: "PKG-SUGAR-LC1",
      name: "控糖午餐包月·柳东食堂",
      type: "一次性包月",
      status: "启用",
      days: 22,
      totalPrice: 780,
      providerId: "SP01",
      siteId: "ST-LC",
      canteenId: "CT-LC-1",
      fulfillMode: "送餐",
      mealType: "午餐",
      recommendGroup: "控糖午餐包月",
      saleChannels: ["商城货架", "运营下单"],
      lockCanteen: true,
      allowCrossCanteen: false,
      items: [{ itemId: "FW200004", times: 22 }],
      note: "供餐方式在套餐层选择（送餐），不在要素层拆分",
      updated: "2026-08-24",
    },
    {
      id: "PKG-MEAL-BF",
      name: "营养早餐包月 20 天",
      type: "一次性包月",
      status: "启用",
      days: 20,
      totalPrice: 400,
      providerId: "SP02",
      siteId: "ST-YY",
      canteenId: "CT-YY-1",
      fulfillMode: "送餐",
      mealType: "早餐",
      recommendGroup: "营养早餐包月",
      saleChannels: ["商城货架", "运营下单"],
      lockCanteen: true,
      allowCrossCanteen: false,
      items: [{ itemId: "FW200003", times: 20 }],
      note: "早餐默认 09:00 自动核销节点",
      updated: "2026-08-24",
    },
    {
      id: "PKG-PT-10",
      name: "到店理疗 10 次卡",
      type: "次卡组合",
      status: "停用",
      days: 0,
      totalPrice: 1500,
      providerId: "SP01",
      siteId: "ST-LN",
      canteenId: "",
      fulfillMode: "到店",
      mealType: "不适用",
      recommendGroup: "",
      saleChannels: ["商城货架"],
      lockCanteen: false,
      allowCrossCanteen: false,
      items: [{ itemId: "FW200010", times: 10 }],
      note: "",
      updated: "2026-08-01",
    },
  ],
};
