(() => {
  const $ = (id) => document.getElementById(id);

  function goBack() {
    if (history.length > 1) history.back();
    else location.href = "./index.html";
  }

  function toast(msg) {
    const el = $("toast");
    if (!el) return;
    el.textContent = msg;
    el.hidden = false;
    clearTimeout(toast._t);
    toast._t = setTimeout(() => {
      el.hidden = true;
    }, 1800);
  }

  function esc(s) {
    return String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  $("btnBack")?.addEventListener("click", goBack);

  const id = new URLSearchParams(location.search).get("id") || "act_massage_trial";
  const act = window.getMallActivity?.(id);
  const root = $("root");
  const bar = $("bottomBar");

  if (!act) {
    root.innerHTML = `<div class="empty-state">未找到活动，请从 Banner 重新进入。</div>`;
    bar.innerHTML = `<button class="btn-primary" type="button" id="btnHome">返回商城</button>`;
    $("btnHome")?.addEventListener("click", () => {
      location.href = "./index.html";
    });
    return;
  }

  document.title = `${act.title} · 春风康养`;
  const nav = document.querySelector(".nav-title");
  if (nav) nav.textContent = act.title;

  const stats = (act.stats || [])
    .map((s) => `<div class="act-stat"><strong>${esc(s.n)}</strong><span>${esc(s.l)}</span></div>`)
    .join("");
  const coupons = (act.coupons || [])
    .map(
      (c) => `
      <button type="button" class="act-coupon" data-coupon="${esc(c.name)}">
        <b>${esc(c.value)}</b>
        <span>${esc(c.name)}<i>${esc(c.tip)}</i></span>
      </button>`
    )
    .join("");
  const live = act.live
    ? `<section class="card act-live">
        <div>
          <em>直播 / 开放日</em>
          <h3>${esc(act.live.title)}</h3>
          <p>${esc(act.live.speaker || "")}</p>
        </div>
        <a class="act-mini-cta" href="${esc(act.live.href)}">去预约</a>
      </section>`
    : "";
  const checkin = act.checkin
    ? `<section class="card">
        <h3 class="sec-title">${esc(act.checkin.title)}</h3>
        <div class="act-week">${act.checkin.days
          .map((d, i) => `<i class="${act.checkin.done[i] ? "on" : ""}">${esc(d)}</i>`)
          .join("")}</div>
      </section>`
    : "";
  const seckill = act.seckill
    ? `<section class="card act-kill">
        <h3 class="sec-title">${esc(act.seckill.title)}</h3>
        <p class="meta-line">${esc(act.seckill.stock || "")}</p>
        <div class="act-kill-price"><b>¥${esc(act.seckill.price)}</b><s>¥${esc(act.seckill.origin)}</s></div>
        <a class="act-mini-cta" href="./detail.html?id=${esc(act.seckill.productId)}">马上抢</a>
      </section>`
    : "";
  const menu = act.menu
    ? `<section class="card">
        <h3 class="sec-title">本周菜单</h3>
        <div class="act-menu">${act.menu
          .map((m) => `<div><b>${esc(m.day)}</b><span>${esc(m.name)}</span><i>${esc(m.tag)}</i></div>`)
          .join("")}</div>
      </section>`
    : "";
  const groupbuy = act.groupbuy
    ? `<section class="card">
        <h3 class="sec-title">${esc(act.groupbuy.title)}</h3>
        <p class="meta-line">${esc(act.groupbuy.tip)}</p>
        <div class="act-bar"><i style="width:${Math.round((act.groupbuy.progress / act.groupbuy.total) * 100)}%"></i></div>
        <p class="meta-line">已有 ${act.groupbuy.progress}/${act.groupbuy.total} 户加入</p>
        <a class="act-mini-cta" href="./detail.html?id=${esc(act.groupbuy.productId)}">去拼团</a>
      </section>`
    : "";

  root.innerHTML = `
    <div class="act-hero">
      <img src="${esc(act.cover)}" alt="" />
      <div class="act-hero-copy">
        ${act.badge ? `<span class="act-badge">${esc(act.badge)}</span>` : ""}
        <h1>${esc(act.title)}</h1>
        <p>${esc(act.summary || "")}</p>
      </div>
    </div>
    ${stats ? `<section class="act-stats">${stats}</section>` : ""}
    ${coupons ? `<section class="act-coupons">${coupons}</section>` : ""}
    <section class="card">
      <div class="highlight-box">${esc(act.highlight || act.summary || "")}</div>
      <p class="meta-line">活动时间：${esc(act.period || "详见站点公告")}</p>
    </section>
    ${live}
    ${checkin}
    ${seckill}
    ${menu}
    ${groupbuy}
    ${
      act.benefits?.length
        ? `<section class="card"><h3 class="sec-title">活动权益</h3><ul class="benefit-list">${act.benefits
            .map((b) => `<li>${esc(b)}</li>`)
            .join("")}</ul></section>`
        : ""
    }
    <section class="goods-feed" id="actGoodsFeed"></section>
    ${
      act.rules?.length
        ? `<section class="card"><h3 class="sec-title">活动说明</h3><ul class="rule-list">${act.rules
            .map((r) => `<li>${esc(r)}</li>`)
            .join("")}</ul></section>`
        : ""
    }
  `;

  const productId = act.relatedProductId || "";
  bar.innerHTML = `
    <a class="btn-ghost" href="./agent.html?q=${encodeURIComponent(act.title)}">问智伴</a>
    <button class="btn-primary" type="button" id="btnCta">${esc(act.cta || "立即参与")}</button>
  `;

  $("btnCta")?.addEventListener("click", () => {
    if (productId) {
      location.href = `./detail.html?id=${encodeURIComponent(productId)}`;
      return;
    }
    toast("活动报名入口即将开放");
  });

  root.addEventListener("click", (e) => {
    const coupon = e.target.closest("[data-coupon]");
    if (coupon) toast(`已领取「${coupon.dataset.coupon}」`);
  });

  window.GoodsFeed?.mount({
    host: $("actGoodsFeed"),
    title: "活动相关推荐",
    products: act.products,
    articles: act.articles,
    online: act.online,
    heroId: act.relatedProductId,
  });
})();
