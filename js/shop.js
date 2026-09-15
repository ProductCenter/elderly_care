(() => {
  const id = new URLSearchParams(location.search).get("id") || "store_cy001";
  const store =
    (window.MALL_STORES && window.MALL_STORES[id]) || {
      storeId: id,
      storeName: "春风康养店铺",
      storeAddress: "山东省济南市历下区姚家街道科技金融大厦",
      intro: "济南康养服务门店演示",
      tags: ["济南"],
      businessHours: "09:00 – 21:00",
      openStart: "09:00",
      openEnd: "21:00",
      storePhone: "0531-86001234",
      distance: "",
      rating: 4.8,
      salesText: "月售 —",
      cover: "./assets/home/home-hero-full-bg-v3.png",
      logo: "./assets/moko-avatar.png",
      notice: "",
    };

  const navTitle = document.getElementById("navShopTitle");
  if (navTitle) navTitle.textContent = store.storeName || "商家店铺";
  document.title = `${store.storeName || "商家店铺"} · 春风康养`;

  function parseHm(s) {
    const m = String(s || "").match(/(\d{1,2}):(\d{2})/);
    if (!m) return null;
    return Number(m[1]) * 60 + Number(m[2]);
  }

  function openStatus(st) {
    const start = parseHm(st.openStart || st.businessHours);
    const end = parseHm(st.openEnd) || (() => {
      const parts = String(st.businessHours || "").split(/[–—-]/);
      return parts.length > 1 ? parseHm(parts[1]) : null;
    })();
    if (start == null || end == null) {
      return { open: true, label: "营业中", hours: st.businessHours || "营业时间详见门店" };
    }
    const now = new Date();
    const mins = now.getHours() * 60 + now.getMinutes();
    const open = mins >= start && mins < end;
    return {
      open,
      label: open ? "营业中" : "已打烊",
      hours: st.businessHours || `${st.openStart} – ${st.openEnd}`,
    };
  }

  const status = openStatus(store);
  const hero = document.getElementById("shopHero");
  if (hero) {
    const tags = (store.tags || []).map((t) => `<span>${t}</span>`).join("");
    const phone = store.storePhone ? `tel:${store.storePhone.replace(/-/g, "")}` : "";
    const mapQs = encodeURIComponent(store.storeAddress || store.storeName || "");
    hero.innerHTML = `
      <section class="shop-door" aria-label="门店门头">
        <img src="${store.cover || "./assets/home/home-hero-full-bg-v3.png"}" alt="${store.storeName || ""}门头" />
        <span class="shop-door-badge ${status.open ? "" : "is-closed"}"><i></i>${status.label}</span>
      </section>
      <section class="shop-panel" aria-label="店铺信息">
        <div class="shop-panel-hd">
          <img class="shop-logo" src="${store.logo || store.cover || "./assets/moko-avatar.png"}" alt="" />
          <div>
            <h1>${store.storeName || "商家店铺"}</h1>
            <div class="shop-meta-row">
              ${store.rating != null ? `<span class="shop-score">${store.rating} 分</span>` : ""}
              ${store.salesText ? `<span>${store.salesText}</span>` : ""}
              ${store.distance ? `<span>${store.distance}</span>` : ""}
            </div>
            ${tags ? `<div class="shop-tags">${tags}</div>` : ""}
          </div>
        </div>
        ${store.intro ? `<p class="shop-intro">${store.intro}</p>` : ""}
        <div class="shop-rows">
          <div class="shop-row">
            <div class="shop-row-k">营业时间</div>
            <div class="shop-row-v">
              <em>${status.label}</em>
              <span>${status.hours}</span>
              <div class="muted" style="margin-top:2px">周一至周日（节假日不休）</div>
            </div>
            <div class="shop-row-act"></div>
          </div>
          <div class="shop-row">
            <div class="shop-row-k">门店地址</div>
            <div class="shop-row-v">${store.storeAddress || "地址更新中"}</div>
            <div class="shop-row-act">
              <a class="shop-act" href="https://uri.amap.com/search?keyword=${mapQs}" target="_blank" rel="noopener">导航</a>
            </div>
          </div>
          <div class="shop-row">
            <div class="shop-row-k">联系电话</div>
            <div class="shop-row-v">${store.storePhone || "暂无"}</div>
            <div class="shop-row-act">
              ${phone ? `<a class="shop-act" href="${phone}">电话</a>` : ""}
            </div>
          </div>
        </div>
        ${store.notice ? `<p class="shop-notice">公告：${store.notice}</p>` : ""}
      </section>
    `;
  }

  function productsForStore(storeId) {
    const all = Object.values(window.MALL_PRODUCTS || {});
    const skuRoot = window.MALL_STORE_SKUS || {};
    const matched = all.filter((p) => {
      if (p.storeId === storeId) return true;
      const map = skuRoot[p.id];
      return !!(map && map[storeId]);
    });
    return matched.length ? matched : all.slice(0, 12);
  }

  function priceOf(p, storeId) {
    const sku = (window.MALL_STORE_SKUS || {})[p.id]?.[storeId];
    if (sku && sku.price != null) return sku.price;
    return p.price;
  }

  const list = productsForStore(id);
  const countEl = document.getElementById("shopGoodsCount");
  if (countEl) countEl.textContent = list.length ? `共 ${list.length} 件` : "";

  const grid = document.getElementById("shopGrid");
  if (grid) {
    if (!list.length) {
      grid.outerHTML = `<div class="shop-empty">本店暂无可展示商品，稍后再来看看</div>`;
    } else {
      grid.innerHTML = list
        .map((p) => {
          const price = priceOf(p, id);
          const cover = p.cover || "./assets/cover-wellness-kit.png";
          const meta = p.subtitle || p.tag || "";
          return `<a class="shop-card" href="./detail.html?id=${encodeURIComponent(p.id)}&storeId=${encodeURIComponent(id)}">
            <img src="${cover}" alt="" loading="lazy" />
            <div class="bd">
              <h3>${p.name}</h3>
              <div class="price">¥${price ?? "-"}</div>
              ${meta ? `<div class="meta">${meta}</div>` : ""}
            </div>
          </a>`;
        })
        .join("");
    }
  }

  const pad = (n) => String(n).padStart(2, "0");
  const syncTime = () => {
    const el = document.getElementById("statusTime");
    if (!el) return;
    const d = new Date();
    el.textContent = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };
  syncTime();
  setInterval(syncTime, 30_000);

  document.getElementById("btnBack")?.addEventListener("click", () => {
    if (history.length > 1) history.back();
    else location.href = "./index.html";
  });
})();
