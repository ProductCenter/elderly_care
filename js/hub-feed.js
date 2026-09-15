(() => {
  function byCats(cats, limit = 8) {
    const set = new Set(cats || []);
    const all = Object.values(window.MALL_PRODUCTS || {});
    const hit = all.filter((p) => set.has(p.cat));
    return (hit.length ? hit : all).slice(0, limit);
  }

  function byIds(ids, limit = 8) {
    const catalog = window.MALL_PRODUCTS || {};
    const list = (ids || []).map((id) => catalog[id]).filter(Boolean);
    if (list.length) return list.slice(0, limit);
    return Object.values(catalog).slice(0, limit);
  }

  function renderFeed(el, opts = {}) {
    if (!el) return;
    const titleEl = opts.countEl;
    const items = opts.ids
      ? byIds(opts.ids, opts.limit || 8)
      : byCats(opts.cats || [], opts.limit || 8);
    if (titleEl) titleEl.textContent = items.length ? `精选 ${items.length}` : "";
    if (!items.length) {
      el.innerHTML = `<div style="grid-column:1/-1;padding:20px;text-align:center;color:#8a7a68;font-size:13px;">暂无推荐商品</div>`;
      return;
    }
    el.innerHTML = items
      .map((p) => {
        const cover = p.cover || "./assets/cover-wellness-kit.png";
        const meta = p.subtitle || p.tag || "";
        return `<a class="hub-feed-card" href="./detail.html?id=${encodeURIComponent(p.id)}">
          <img src="${cover}" alt="" loading="lazy" />
          <div class="bd">
            <h3>${p.name}</h3>
            <div class="price">¥${p.price ?? "-"}</div>
            ${meta ? `<div class="meta">${meta}</div>` : ""}
          </div>
        </a>`;
      })
      .join("");
  }

  function syncTime(id) {
    const el = document.getElementById(id || "statusTime");
    if (!el) return;
    const d = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    el.textContent = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  function bindBack(id) {
    document.getElementById(id || "btnBack")?.addEventListener("click", () => {
      if (history.length > 1) history.back();
      else location.href = "./index.html";
    });
  }

  window.HubLanding = { byCats, byIds, renderFeed, syncTime, bindBack };
})();
