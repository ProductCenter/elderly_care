/** 活动 / 主题落地页：活动相关推荐流（不是商城到店/到家/辅具分类） */
(function (global) {
  const PRODUCT_REASONS = ["常和本场一起选", "适合同一批家人", "活动配套更省心", "看过这场的人也选"];

  function esc(s) {
    return String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function attrOf(p) {
    if (typeof global.getProductAttr === "function") return global.getProductAttr(p);
    return { short: "到店" };
  }

  function sellPoint(p) {
    if (p.subtitle) return p.subtitle;
    if (p.features?.length) return p.features.slice(0, 2).join(" · ");
    return "";
  }

  function productById(id) {
    return (global.MALL_PRODUCTS || {})[id] || null;
  }

  function articleById(id) {
    return (global.MALL_ARTICLES || []).find((a) => a.id === id) || null;
  }

  function buildStream({ products, articles, online, heroId }) {
    const prods = (products || []).map(productById).filter(Boolean);
    const arts = (articles || []).map(articleById).filter(Boolean);
    const lines = (online || []).filter((o) => o && o.name && o.href);
    const hero = prods.find((p) => p.id === heroId) || prods[0] || null;
    const rest = prods.filter((p) => p !== hero);
    const stream = [];

    if (hero) stream.push({ kind: "product", item: hero, reason: "本场主推" });
    if (arts[0]) stream.push({ kind: "article", item: arts[0], reason: "先看这一篇" });

    rest.forEach((p, i) => {
      stream.push({ kind: "product", item: p, reason: PRODUCT_REASONS[i % PRODUCT_REASONS.length] });
      if (i === 0 && lines[0]) stream.push({ kind: "online", item: lines[0], reason: "线上就能办" });
      if (i === 1 && arts[1]) stream.push({ kind: "article", item: arts[1], reason: "相关内容" });
    });

    if (!rest.length && lines[0]) stream.push({ kind: "online", item: lines[0], reason: "线上就能办" });
    if (!rest.length && arts[1]) stream.push({ kind: "article", item: arts[1], reason: "相关内容" });
    lines.slice(1).forEach((o) => stream.push({ kind: "online", item: o, reason: "线上入口" }));

    return stream;
  }

  function productCard(p, reason) {
    const attr = attrOf(p);
    const point = sellPoint(p);
    return `<a class="rec-card rec-product" href="./detail.html?id=${esc(p.id)}">
      <div class="rec-pic">
        <img src="${esc(p.cover)}" alt="" />
        <em class="rec-reason">${esc(reason)}</em>
      </div>
      <div class="rec-body">
        <h3>${esc(p.name)}</h3>
        ${point ? `<p>${esc(point)}</p>` : ""}
        <div class="rec-foot">
          <strong>¥${esc(p.price)}</strong>
          ${p.originPrice ? `<s>¥${esc(p.originPrice)}</s>` : ""}
          <span>${esc(attr.short || "")}</span>
        </div>
      </div>
    </a>`;
  }

  function articleCard(a, reason) {
    return `<a class="rec-card rec-article" href="./article.html?id=${esc(a.id)}">
      <div class="rec-pic">
        <img src="${esc(a.cover)}" alt="" />
        <em class="rec-reason">${esc(reason)}</em>
      </div>
      <div class="rec-body">
        <h3>${esc(a.title)}</h3>
        <p>${esc(a.summary || "")}</p>
        <div class="rec-foot"><span>内容 · ${esc(a.readMin || 5)} 分钟</span></div>
      </div>
    </a>`;
  }

  function onlineCard(o, reason) {
    return `<a class="rec-card rec-online" href="${esc(o.href)}">
      <div class="rec-pic">
        <div class="rec-online-mark">线</div>
        <em class="rec-reason">${esc(reason)}</em>
      </div>
      <div class="rec-body">
        <h3>${esc(o.name)}</h3>
        <p>${esc(o.desc || "")}</p>
        <div class="rec-foot"><span>去办理</span></div>
      </div>
    </a>`;
  }

  function renderItem(it) {
    if (it.kind === "article") return articleCard(it.item, it.reason);
    if (it.kind === "online") return onlineCard(it.item, it.reason);
    return productCard(it.item, it.reason);
  }

  function mount({ host, title, products, articles, online, heroId }) {
    if (!host) return;
    const stream = buildStream({ products, articles, online, heroId });
    if (!stream.length) {
      host.hidden = true;
      return;
    }
    host.hidden = false;
    host.classList.add("rec-feed");
    const left = [];
    const right = [];
    stream.forEach((it, i) => (i % 2 === 0 ? left : right).push(renderItem(it)));
    host.innerHTML = `
      ${title ? `<h3 class="feed-sec-title">${esc(title)}</h3>` : ""}
      <p class="rec-feed-tip">按这场活动为你穿插商品、内容和线上入口</p>
      <div class="rec-list">
        <div class="rec-col">${left.join("")}</div>
        <div class="rec-col">${right.join("")}</div>
      </div>
    `;
  }

  global.GoodsFeed = { mount };
})(window);
