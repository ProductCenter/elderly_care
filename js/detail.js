(() => {
  const toastEl = document.getElementById("toast");
  let toastTimer;
  let product = null;
  let currentStoreId = "store_cy001";
  let currentSku = null;
  let switching = false;

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
    }, 1500);
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


  function syncEnterShopBtn(storeId) {
    const btn = document.getElementById("btnEnterShop");
    if (!btn || !product) return;
    const sid = storeId || product.storeId || currentStoreId || "store_cy001";
    btn.hidden = false;
    btn.dataset.storeId = sid;
  }

  function formatPrice(n) {
    return Number.isInteger(n) ? String(n) : Number(n).toFixed(1);
  }

  function setLoading(on) {
    document.getElementById("storeLoading").hidden = !on;
    document.getElementById("storeBlock").style.opacity = on ? "0.45" : "1";
    document.getElementById("btnSwitchStore").disabled = on;
  }

  function applySkuToUI(store, sku) {
    currentSku = sku;
    document.getElementById("price").textContent = formatPrice(sku.price);
    document.getElementById("originPrice").textContent = sku.originPrice
      ? `¥${formatPrice(sku.originPrice)}`
      : "";
    document.getElementById("distance").textContent = store.distance || "";
    document.getElementById("storeName").textContent = store.storeName || "";
    document.getElementById("storeAddress").textContent = store.storeAddress || "";
    document.getElementById("storeExtra").textContent = [
      store.storePhone ? `电话 ${store.storePhone}` : "",
      store.businessHours ? `营业 ${store.businessHours}` : "",
    ]
      .filter(Boolean)
      .join(" · ");

    const soldOut = !sku.stock || sku.stock <= 0;
    const stockTag = document.getElementById("stockTag");
    const stockText = document.getElementById("stockText");
    stockTag.hidden = !soldOut;
    stockText.textContent = soldOut ? "库存 0" : `库存 ${sku.stock}`;

    const durationTag = document.getElementById("durationTag");
    if (sku.duration) {
      durationTag.hidden = false;
      durationTag.textContent = `时长 ${sku.duration}`;
    } else {
      durationTag.hidden = true;
    }

    const scopeCard = document.getElementById("scopeCard");
    const scope = sku.scope || [];
    if (scope.length) {
      scopeCard.hidden = false;
      document.getElementById("scopeList").innerHTML = scope
        .map((f) => `<li>${f}</li>`)
        .join("");
      document.getElementById("slotLine").textContent = sku.slots?.length
        ? `可约时段：${sku.slots.join("、")}`
        : "";
    } else {
      scopeCard.hidden = true;
    }

    const btnBuy = document.getElementById("btnBuy");
    btnBuy.disabled = soldOut;
    btnBuy.textContent = soldOut ? "已售罄" : "立即购买";
    btnBuy.classList.toggle("is-disabled", soldOut);
    syncEnterShopBtn(store.storeId || currentStoreId);
  }

  function renderBase(p) {
    product = p;
    document.title = p.name;
    document.getElementById("cover").src = p.cover;
    document.getElementById("cover").alt = p.name;
    document.getElementById("name").textContent = p.name;
    document.getElementById("subtitle").textContent = p.subtitle || "";
    document.getElementById("sales").textContent = `销量 ${p.sales}`;
    document.getElementById("desc").textContent = p.desc || "";

    const serviceTag = document.getElementById("serviceTag");
    const attr = window.getProductAttr
      ? window.getProductAttr(p)
      : {
          key: p.serviceType || "instore",
          short: p.serviceType === "goods" ? "实物" : p.serviceType === "home" ? "到家" : "到店",
          tagClass:
            p.serviceType === "goods"
              ? "svc-goods"
              : p.serviceType === "home"
                ? "svc-home"
                : "svc-instore",
        };
    const isHome = attr.key === "home";
    const isGoods = attr.key === "goods";
    const isInstore = attr.key === "instore";
    serviceTag.textContent = attr.short;
    serviceTag.className = `svc-tag ${attr.tagClass}`;
    serviceTag.title = attr.label || "";

    const tag = document.getElementById("tag");
    if (p.tag) {
      tag.hidden = false;
      tag.textContent = p.tag;
    } else {
      tag.hidden = true;
    }

    document.getElementById("features").innerHTML = (p.features || [])
      .map((f) => `<li>${f}</li>`)
      .join("");

    // 仅到店支持切换门店
    document.getElementById("btnSwitchStore").hidden = !isInstore;
    if (!isInstore) {
      document.getElementById("price").textContent = formatPrice(p.price);
      document.getElementById("originPrice").textContent = p.originPrice
        ? `¥${formatPrice(p.originPrice)}`
        : "";
      document.getElementById("distance").textContent = p.distance || "";
      document.getElementById("storeName").textContent = isGoods
        ? p.shipFrom
          ? `发货仓 · ${p.shipFrom}`
          : "快递发货"
        : p.storeName || "";
      document.getElementById("storeAddress").textContent = isGoods
        ? p.deliveryHint || "支付后仓库发货，物流全程可追踪"
        : p.storeAddress || "";
      document.getElementById("storeExtra").textContent = isGoods
        ? `运费 ${p.freight ? `¥${p.freight}` : "包邮"} · 库存 ${p.stock ?? "—"}`
        : "";
      const soldOut = isGoods && p.stock != null && p.stock <= 0;
      document.getElementById("stockTag").hidden = !soldOut;
      document.getElementById("stockText").textContent = isGoods
        ? soldOut
          ? "库存 0"
          : `库存 ${p.stock}`
        : "";
      document.getElementById("scopeCard").hidden = true;
      document.getElementById("durationTag").hidden = true;
      const btnBuy = document.getElementById("btnBuy");
      btnBuy.disabled = soldOut;
      btnBuy.textContent = soldOut ? "已售罄" : "立即购买";
      btnBuy.classList.toggle("is-disabled", soldOut);
      const storeTitle = document.querySelector("#storeSection .sec-title");
      if (storeTitle) storeTitle.textContent = isGoods ? "发货与配送" : "适用门店";
      syncEnterShopBtn(p.storeId || "store_cy001");
    } else {
      const storeTitle = document.querySelector("#storeSection .sec-title");
      if (storeTitle) storeTitle.textContent = "适用门店";
      syncEnterShopBtn(currentStoreId);
    }
  }

  async function loadStoreSku(storeId, { silentFail = false } = {}) {
    if (!product || window.getProductAttrKey(product) !== "instore") return;
    if (switching) return;
    switching = true;
    setLoading(true);
    try {
      const { store, sku } = await window.fetchStoreProductSku(product.id, storeId);
      currentStoreId = storeId;
      applySkuToUI(store, sku);
      // 同步到 session，下单页可读取
      sessionStorage.setItem(
        "kangyang_selected_store",
        JSON.stringify({ goodsId: product.id, storeId, store, sku })
      );
    } catch (err) {
      if (!silentFail) toast(err.message || "门店数据加载失败");
      // 保留原门店数据不变
    } finally {
      setLoading(false);
      switching = false;
    }
  }

  function openStoreSheet() {
    const list = document.getElementById("storeList");
    const stores = window.MALL_STORES || {};
    const skuMap = (window.MALL_STORE_SKUS || {})[product.id] || {};
    list.innerHTML = Object.keys(stores)
      .map((id) => {
        const s = stores[id];
        const sku = skuMap[id];
        if (!sku) return "";
        const sold = !sku.stock;
        return `<button type="button" class="store-option ${id === currentStoreId ? "active" : ""}" data-store-id="${id}">
          <div class="so-name">${s.storeName}${id === currentStoreId ? " · 当前" : ""}</div>
          <div class="so-addr">${s.storeAddress}</div>
          <div class="so-meta">¥${formatPrice(sku.price)} · ${sold ? "售罄" : `库存 ${sku.stock}`} · ${s.distance || ""}</div>
        </button>`;
      })
      .join("");
    document.getElementById("storeMask").hidden = false;
    document.getElementById("storeSheet").hidden = false;
  }

  function closeStoreSheet() {
    document.getElementById("storeMask").hidden = true;
    document.getElementById("storeSheet").hidden = true;
  }

  const id = new URLSearchParams(location.search).get("id") || "ai_massage";
  const catalog = window.MALL_PRODUCTS || {};
  const found = catalog[id];

  if (!found) {
    toast("商品不存在");
    setTimeout(() => {
      location.href = "./index.html";
    }, 800);
  } else {
    renderBase(found);
    if (window.getProductAttrKey(found) === "instore") {
      loadStoreSku(currentStoreId);
    }
  }

  document.getElementById("btnBack")?.addEventListener("click", () => {
    if (history.length > 1) history.back();
    else location.href = "./index.html";
  });

  document.getElementById("btnShop")?.addEventListener("click", () => {
    const sid =
      document.getElementById("btnEnterShop")?.dataset.storeId ||
      currentStoreId ||
      product?.storeId ||
      "store_cy001";
    location.href = `./shop.html?id=${encodeURIComponent(sid)}`;
  });

  document.getElementById("btnCart")?.addEventListener("click", () => {
    if (currentSku && currentSku.stock <= 0) {
      toast("该门店已售罄");
      return;
    }
    toast("已加入购物车");
  });

  function goCheckout(proxy) {
    if (!product) return;
    const attrKey = window.getProductAttrKey(product);
    if (attrKey === "instore" && currentSku && currentSku.stock <= 0) {
      toast("该门店已售罄，请切换其他门店");
      return;
    }
    if (attrKey === "goods" && product.stock != null && product.stock <= 0) {
      toast("商品已售罄");
      return;
    }
    const qs = new URLSearchParams({
      type: attrKey,
      goodsId: product.id,
    });
    if (attrKey === "instore") qs.set("storeId", currentStoreId);
    if (attrKey === "package") {
      qs.set("storeId", product.storeId || currentStoreId || "store_cy001");
    }
    if (proxy) qs.set("proxy", "1");
    location.href = `./order.html?${qs.toString()}`;
  }

  document.getElementById("btnBuy")?.addEventListener("click", () => goCheckout(false));
  document.getElementById("btnProxyBuy")?.addEventListener("click", () => goCheckout(true));

  document.getElementById("btnEnterShop")?.addEventListener("click", () => {
    const btn = document.getElementById("btnEnterShop");
    const sid = btn?.dataset.storeId || currentStoreId || product?.storeId || "store_cy001";
    location.href = `./shop.html?id=${encodeURIComponent(sid)}`;
  });
  document.getElementById("btnSwitchStore")?.addEventListener("click", openStoreSheet);
  document.getElementById("storeSheetClose")?.addEventListener("click", closeStoreSheet);
  document.getElementById("storeMask")?.addEventListener("click", closeStoreSheet);
  document.getElementById("storeList")?.addEventListener("click", async (e) => {
    const btn = e.target.closest(".store-option[data-store-id]");
    if (!btn) return;
    const sid = btn.dataset.storeId;
    closeStoreSheet();
    if (sid === currentStoreId) return;
    await loadStoreSku(sid);
  });
})();
