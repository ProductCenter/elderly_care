(() => {
  /**
   * 到店服务下单：移除收货地址；突出门店信息；保留预约时间
   * 到家服务下单：保留收货地址；流程不受影响
   */

  const UNIT_ORIGIN = 310;
  const UNIT_PRICE = 299;
  const DISCOUNT = 11;

  const app = document.getElementById("app");
  const addressCard = document.getElementById("addressCard");
  const storeCard = document.getElementById("storeCard");
  const feeShipRow = document.getElementById("feeShipRow");
  const appointValue = document.getElementById("appointValue");
  const toastEl = document.getElementById("toast");

  const state = {
    serviceType: "instore", // instore | home
    qty: 1,
    appointDay: null,
    appointSlot: null,
    address: {
      addressId: "addr_10086",
      receiverName: "安辉",
      receiverPhone: "15810633897",
      detailAddress:
        "山东省济南市历下区姚家街道科技金融大厦",
    },
    store: {
      storeId: "store_cy001",
      storeName: "春风康养 · 历下旗舰店",
      storeAddress: "山东省济南市历下区姚家街道科技金融大厦",
      storePhone: "010-64001234",
      businessHours: "09:00 – 21:00",
      // 科技金融大厦附近坐标（用于地图导航）
      storeLat: 39.9245,
      storeLng: 116.4345,
    },
    goods: {
      goodsId: "goods_003",
      goodsName: "中频理疗按摩仪",
      sku: "003",
      unitPrice: UNIT_PRICE,
    },
  };

  let toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.hidden = false;
    requestAnimationFrame(() => toastEl.classList.add("show"));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastEl.classList.remove("show");
      setTimeout(() => {
        toastEl.hidden = true;
      }, 200);
    }, 1600);
  }

  function syncTime() {
    const el = document.querySelector(".status-time");
    if (!el) return;
    const n = new Date();
    el.textContent = `${String(n.getHours()).padStart(2, "0")}:${String(
      n.getMinutes()
    ).padStart(2, "0")}`;
  }
  syncTime();
  setInterval(syncTime, 30_000);

  /** 按商品属性渲染下单 UI（不可切换）：到店服务 / 到家服务 / 实物商品 */
  function applyServiceType(type) {
    const attr = window.getProductAttr
      ? window.getProductAttr(type)
      : { key: type === "home" ? "home" : type === "goods" ? "goods" : "instore" };
    const locked = attr.key || "instore";
    const logic = attr.orderLogic || {};
    state.serviceType = locked;
    state.productAttr = locked;
    app.dataset.serviceType = locked;
    app.dataset.productAttr = locked;

    const isInstore = locked === "instore";
    const isHome = locked === "home";
    const isGoods = locked === "goods";

    addressCard.hidden = !logic.needAddress;
    storeCard.hidden = !logic.needStore;
    document.getElementById("appointCard").hidden = !logic.needAppoint;

    const badge = document.getElementById("typeBadge");
    const tip = document.getElementById("typeBadgeTip");
    if (badge) {
      badge.textContent = attr.label || (isGoods ? "实物商品" : isHome ? "到家服务" : "到店服务");
      badge.classList.toggle("is-home", isHome);
      badge.classList.toggle("is-goods", isGoods);
    }
    if (tip) tip.textContent = attr.tip || "";

    const payTip = document.getElementById("payTip");
    if (payTip) payTip.textContent = attr.payTip || "";

    feeShipRow.querySelector("span:first-child").textContent = isInstore
      ? "运费（到店自提）"
      : isGoods
        ? "运费（快递）"
        : "运费";

    if (logic.needAppoint) {
      appointValue.textContent = state.appointDay
        ? `${state.appointDay} ${state.appointSlot || ""}`.trim()
        : isInstore
          ? "请选择到店时间"
          : "请选择上门时间";
      appointValue.classList.toggle(
        "filled",
        Boolean(state.appointDay && state.appointSlot)
      );
    }

    recalc();
  }

  function currentLogic() {
    return (
      (window.getProductAttr && window.getProductAttr(state.serviceType).orderLogic) ||
      {}
    );
  }

  function memberDiscountRate() {
    const m = window.MemberStore?.current?.();
    if (!m || m.status !== "active") return 1;
    return Math.min(1, Math.max(0.5, (Number(m.discount) || 100) / 100));
  }

  function recalc() {
    const unit = Number(state.goods.unitPrice) || UNIT_PRICE;
    const origin = Math.round(unit + DISCOUNT);
    const goodsAmount = origin * state.qty;
    const discount = DISCOUNT * state.qty;
    const logic = currentLogic();
    const freight = logic.needFreight
      ? Number(state.goods.freight) || 0
      : 0;
    const rate = memberDiscountRate();
    const goodsPay = Math.round(unit * state.qty * rate * 100) / 100;
    const memberOff = Math.round((unit * state.qty - goodsPay) * 100) / 100;
    const total = goodsPay + freight;

    document.getElementById("qtyVal").textContent = String(state.qty);
    document.getElementById("feeGoods").textContent = `¥ ${goodsAmount}`;
    document.getElementById("feeShip").textContent =
      freight > 0 ? `¥ ${freight}` : logic.needFreight ? "包邮" : "0";
    const discountText =
      memberOff > 0
        ? `- ¥ ${(discount + memberOff).toFixed(2)}（含会员）`
        : `- ¥ ${discount.toFixed(2)}`;
    document.getElementById("feeDiscount").textContent = discountText;
    document.getElementById("feeTotal").textContent = `¥ ${total}`;
    document.getElementById("barTotal").textContent = `¥ ${total}`;

    const tip = document.getElementById("memberPayTip");
    if (tip) {
      const m = MemberStore.current();
      if (m) {
        tip.hidden = false;
        tip.textContent = `${m.levelName} · ${m.discount / 10} 折 · 预计得 ${Math.max(
          1,
          Math.round(total * (Number(m.pointsRate) || 1))
        )} 积分`;
      } else {
        tip.hidden = false;
        tip.innerHTML = `未登录会员，<a href="./member-login.html?redirect=${encodeURIComponent(
          location.href
        )}">登录享折扣与积分</a>`;
      }
    }
  }

  /**
   * 构建下单请求体
   * 到店：不含地址；到家/实物：含地址；实物含运费
   */
  function buildOrderPayload() {
    const unit = Number(state.goods.unitPrice) || UNIT_PRICE;
    const logic = currentLogic();
    const freight = logic.needFreight
      ? Number(state.goods.freight) || 0
      : 0;
    const rate = memberDiscountRate();
    const goodsPay = Math.round(unit * state.qty * rate * 100) / 100;
    const member = window.MemberStore?.current?.();
    const base = {
      productAttr: state.serviceType,
      serviceType: state.serviceType,
      goodsId: state.goods.goodsId,
      goodsName: state.goods.goodsName,
      sku: state.goods.sku,
      quantity: Math.min(9, Math.max(1, Number(state.qty) || 1)),
      unitPrice: state.goods.unitPrice,
      goodsAmount: Math.round(unit + DISCOUNT) * state.qty,
      discountAmount: DISCOUNT * state.qty + Math.round((unit * state.qty - goodsPay) * 100) / 100,
      freight,
      payAmount: goodsPay + freight,
      memberId: member?.id || null,
      memberLevel: member?.levelName || null,
      payMethod: "wechat",
      appointmentTime:
        logic.needAppoint && state.appointDay && state.appointSlot
          ? `${state.appointDay} ${state.appointSlot}`
          : null,
    };

    if (logic.needStore) {
      return {
        ...base,
        storeId: state.store.storeId,
        storeName: state.store.storeName,
        storeAddress: state.store.storeAddress,
        storePhone: state.store.storePhone,
        businessHours: state.store.businessHours,
      };
    }

    return {
      ...base,
      addressId: state.address.addressId,
      receiverName: state.address.receiverName,
      receiverPhone: state.address.receiverPhone,
      detailAddress: state.address.detailAddress,
      shipFrom: state.goods.shipFrom || null,
    };
  }

  /** 模拟下单接口：按商品属性校验字段 */
  async function submitOrder(payload) {
    const logic =
      (window.getProductAttr &&
        window.getProductAttr(payload.productAttr || payload.serviceType)
          .orderLogic) ||
      {};

    if (logic.needStore) {
      const forbidden = [
        "addressId",
        "receiverName",
        "receiverPhone",
        "detailAddress",
        "收件人",
        "联系电话",
        "详细地址",
      ];
      const leak = forbidden.filter((k) => k in payload && payload[k] != null);
      if (leak.length) {
        throw new Error(`到店订单不得包含地址字段: ${leak.join(", ")}`);
      }
      if (logic.needAppoint && !payload.appointmentTime) {
        throw new Error("请选择预约时间");
      }
      if (!payload.storeId) {
        throw new Error("缺少门店信息");
      }
    }

    if (logic.needAddress) {
      if (!payload.addressId || !payload.detailAddress) {
        throw new Error("请选择收货地址");
      }
    }

    // 模拟网络
    await new Promise((r) => setTimeout(r, 400));
    return {
      code: 0,
      message: "ok",
      data: {
        orderId: `O${Date.now()}`,
        saved: payload,
      },
    };
  }

  // —— 预约时间 ——
  const dayTabs = document.getElementById("dayTabs");
  const slotGrid = document.getElementById("slotGrid");
  const appointMask = document.getElementById("appointMask");
  const appointSheet = document.getElementById("appointSheet");
  const SLOTS = ["09:00", "10:30", "13:00", "14:30", "16:00", "18:30", "19:30"];

  function buildDays() {
    const week = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
    const days = [];
    const now = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() + i);
      const label =
        i === 0 ? "今天" : i === 1 ? "明天" : week[d.getDay()];
      const md = `${d.getMonth() + 1}/${d.getDate()}`;
      days.push({ key: `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`, label, md });
    }
    return days;
  }

  const days = buildDays();
  let draftDay = days[0].key;
  let draftSlot = null;

  function renderDays() {
    dayTabs.innerHTML = days
      .map(
        (d) =>
          `<button type="button" class="day-tab${d.key === draftDay ? " active" : ""}" data-day="${d.key}">
            <span>${d.label}</span><strong>${d.md}</strong>
          </button>`
      )
      .join("");
  }

  function renderSlots() {
    slotGrid.innerHTML = SLOTS.map(
      (s) =>
        `<button type="button" class="slot${s === draftSlot ? " active" : ""}" data-slot="${s}">${s}</button>`
    ).join("");
  }

  function openAppoint() {
    draftDay = state.appointDay || days[0].key;
    draftSlot = state.appointSlot;
    renderDays();
    renderSlots();
    appointMask.hidden = false;
    appointSheet.hidden = false;
  }

  function closeAppoint() {
    appointMask.hidden = true;
    appointSheet.hidden = true;
  }

  dayTabs.addEventListener("click", (e) => {
    const btn = e.target.closest(".day-tab");
    if (!btn) return;
    draftDay = btn.dataset.day;
    renderDays();
  });

  slotGrid.addEventListener("click", (e) => {
    const btn = e.target.closest(".slot");
    if (!btn) return;
    draftSlot = btn.dataset.slot;
    renderSlots();
  });

  document.getElementById("btnAppoint").addEventListener("click", openAppoint);
  document.getElementById("appointCancel").addEventListener("click", closeAppoint);
  appointMask.addEventListener("click", closeAppoint);
  document.getElementById("appointOk").addEventListener("click", () => {
    if (!draftSlot) {
      toast("请选择时段");
      return;
    }
    const day = days.find((d) => d.key === draftDay);
    state.appointDay = `${day.md}（${day.label}）`;
    state.appointSlot = draftSlot;
    appointValue.textContent = `${state.appointDay} ${state.appointSlot}`;
    appointValue.classList.add("filled");
    closeAppoint();
  });

  // —— 数量 ——
  document.getElementById("qtyMinus").addEventListener("click", () => {
    if (state.qty <= 1) return;
    state.qty -= 1;
    recalc();
  });
  document.getElementById("qtyPlus").addEventListener("click", () => {
    // 到店核销码最多 9 份；到家同样上限保持一致
    if (state.qty >= 9) return;
    state.qty += 1;
    recalc();
  });

  document.getElementById("btnAddress")?.addEventListener("click", () => {
    toast("选择收货地址");
  });

  document.getElementById("btnCoupon")?.addEventListener("click", () => {
    toast("暂无可用优惠券");
  });

  document.getElementById("btnBack")?.addEventListener("click", () => {
    if (history.length > 1) history.back();
    else location.href = "./index.html";
  });

  document.getElementById("btnSubmit").addEventListener("click", async () => {
    const btn = document.getElementById("btnSubmit");
    const logic = currentLogic();
    if (logic.needAppoint && !(state.appointDay && state.appointSlot)) {
      toast(state.serviceType === "instore" ? "请选择到店预约时间" : "请选择上门时间");
      openAppoint();
      return;
    }
    if (logic.needAddress && !state.address.addressId) {
      toast("请选择收货地址");
      return;
    }

    const payload = buildOrderPayload();
    btn.disabled = true;
    try {
      const res = await submitOrder(payload);
      console.log("[下单成功]", res.data);
      if (logic.needStore) {
        console.assert(
          !("addressId" in payload) &&
            !("receiverName" in payload) &&
            !("receiverPhone" in payload) &&
            !("detailAddress" in payload),
          "到店订单不应包含收货地址字段"
        );
      }

      // 模拟支付成功 → 按商品属性生成订单
      const catalog = window.MALL_PRODUCTS || {};
      const goodsMeta = catalog[payload.goodsId] || {};
      const paid = await VerifyCode.createPaidOrder({
        orderId: res.data.orderId,
        productAttr: payload.productAttr || payload.serviceType,
        serviceType: payload.serviceType,
        goodsId: payload.goodsId,
        goodsName: payload.goodsName,
        sku: payload.sku,
        quantity: payload.quantity,
        payAmount: payload.payAmount,
        payMethod: "wechat",
        storeId: payload.storeId || state.store.storeId,
        storeName: payload.storeName || state.store.storeName,
        storeAddress: payload.storeAddress || state.store.storeAddress,
        storePhone: payload.storePhone || state.store.storePhone,
        storeLat: state.store.storeLat,
        storeLng: state.store.storeLng,
        appointmentTime: payload.appointmentTime,
        cover: goodsMeta.cover || "./assets/cover-therapy-device.png",
        receiverName: payload.receiverName,
        receiverPhone: payload.receiverPhone,
        detailAddress: payload.detailAddress,
        freight: payload.freight || 0,
        shipFrom: payload.shipFrom || goodsMeta.shipFrom || null,
      });

      if (paid.serviceType === "instore") {
        const tickets = VerifyCode.getTickets(paid);
        console.assert(
          tickets.length === Math.min(payload.quantity || 1, 9) &&
            tickets.every((t) => t.code && t.token),
          "到店订单应按份数生成核销码（最多9个）"
        );
        toast(
          tickets.length > 1
            ? `支付成功，已生成 ${tickets.length} 个核销码`
            : "支付成功，已生成核销码"
        );
      } else if (paid.serviceType === "package" || paid.productAttr === "package") {
        if (window.PackageEntitlement) {
          const pkgOrder = PackageEntitlement.issueEntitlement(paid);
          toast(`支付成功，已生成套餐权益（剩余 ${PackageEntitlement.totalRemain(pkgOrder)} 次）`);
        } else {
          toast("支付成功，已创建套餐订单");
        }
      } else if (paid.serviceType === "goods") {
        console.assert(paid.logistics && paid.goodsStep === 0, "实物订单应进入待发货");
        toast("支付成功，等待商家发货");
      } else {
        console.assert(!paid.verifyCode && !paid.verifyToken, "到家订单不应生成核销码");
        toast("支付成功，已创建服务工单");
      }

      if (window.MemberStore) {
        if (!MemberStore.current()) MemberStore.ensureDemoSession();
        const memRes = MemberStore.onOrderPaid(paid);
        if (memRes.ok) {
          const extra = memRes.leveledUp
            ? `，恭喜升级 ${memRes.toLevel}`
            : `，+${memRes.pointsGain} 积分`;
          setTimeout(() => toast(`会员成长 +${memRes.growthGain}${extra}`), 350);
        }
      }

      setTimeout(() => {
        location.href = `./order-detail.html?orderId=${encodeURIComponent(paid.orderId)}`;
      }, 600);
    } catch (err) {
      toast(err.message || "下单失败");
      btn.disabled = false;
    }
  });

  // 订单逻辑完全由商品属性决定（productAttr），URL type 仅作无商品时的兜底
  const params = new URLSearchParams(location.search);
  const goodsId = params.get("goodsId");
  const urlStoreId = params.get("storeId");
  let lockedType = window.getProductAttrKey
    ? window.getProductAttrKey(params.get("type"))
    : params.get("type") === "home"
      ? "home"
      : params.get("type") === "goods"
        ? "goods"
        : "instore";
  if (goodsId && window.MALL_PRODUCTS?.[goodsId]) {
    if (window.applyPackageDraftToMall && goodsId === "package_meal_month") {
      window.applyPackageDraftToMall();
    }
    const g = window.MALL_PRODUCTS[goodsId];
    lockedType = window.getProductAttrKey
      ? window.getProductAttrKey(g)
      : g.productAttr || g.serviceType || "instore";
    state.goods = {
      goodsId: g.id,
      goodsName: g.name,
      sku: g.sku || "001",
      unitPrice: g.price,
      freight: g.freight || 0,
      shipFrom: g.shipFrom || "",
    };
    const nameEl = document.getElementById("goodsName");
    const skuEl = document.getElementById("goodsSku");
    const priceEl = document.getElementById("unitPrice");
    const thumb = document.querySelector(".goods-thumb");
    if (nameEl) nameEl.textContent = g.name;
    if (skuEl) skuEl.textContent = g.sku || "";
    if (priceEl) priceEl.textContent = String(g.price);
    if (thumb) {
      thumb.src = g.cover;
      thumb.alt = g.name;
    }
    // 套餐权益：门店取商品/草稿配置，保证与商家核销一致
    if (lockedType === "package") {
      const sid = g.storeId || urlStoreId || "store_cy001";
      const s = window.MALL_STORES?.[sid] || window.MALL_STORES?.store_cy001;
      if (s) {
        state.store = {
          storeId: s.storeId,
          storeName: s.storeName,
          storeAddress: s.storeAddress,
          storePhone: s.storePhone,
          businessHours: s.businessHours,
          storeLat: s.lat,
          storeLng: s.lng,
        };
        document.getElementById("storeName").textContent = s.storeName;
        document.getElementById("storeAddress").textContent = s.storeAddress;
        document.getElementById("storePhone").textContent = s.storePhone;
        document.getElementById("storePhone").href = `tel:${String(s.storePhone || "").replace(/-/g, "")}`;
        document.getElementById("storeHours").textContent = s.businessHours || "";
      }
    }
  }

  // 从详情页所选门店同步价格与门店信息（REQ-02）
  try {
    const raw = sessionStorage.getItem("kangyang_selected_store");
    const selected = raw ? JSON.parse(raw) : null;
    if (
      selected &&
      selected.goodsId === goodsId &&
      selected.store &&
      selected.sku &&
      (!urlStoreId || urlStoreId === selected.storeId)
    ) {
      state.store = {
        storeId: selected.store.storeId,
        storeName: selected.store.storeName,
        storeAddress: selected.store.storeAddress,
        storePhone: selected.store.storePhone,
        businessHours: selected.store.businessHours,
        storeLat: selected.store.lat,
        storeLng: selected.store.lng,
      };
      state.goods.unitPrice = selected.sku.price;
      const priceEl = document.getElementById("unitPrice");
      if (priceEl) priceEl.textContent = String(selected.sku.price);
      document.getElementById("storeName").textContent = selected.store.storeName;
      document.getElementById("storeAddress").textContent = selected.store.storeAddress;
      document.getElementById("storePhone").textContent = selected.store.storePhone;
      document.getElementById("storePhone").href = `tel:${String(selected.store.storePhone || "").replace(/-/g, "")}`;
      document.getElementById("storeHours").textContent = selected.store.businessHours || "";
    } else if (urlStoreId && window.MALL_STORES?.[urlStoreId]) {
      const s = window.MALL_STORES[urlStoreId];
      state.store = {
        storeId: s.storeId,
        storeName: s.storeName,
        storeAddress: s.storeAddress,
        storePhone: s.storePhone,
        businessHours: s.businessHours,
        storeLat: s.lat,
        storeLng: s.lng,
      };
    }
  } catch {
    /* ignore */
  }

  applyServiceType(lockedType);
})();
