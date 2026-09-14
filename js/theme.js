(() => {
  const $ = (id) => document.getElementById(id);

  function esc(s) {
    return String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
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

  function remain(endAt) {
    const end = new Date(endAt).getTime();
    const now = Date.now();
    if (!end || end <= now) return "活动进行中";
    const ms = end - now;
    const d = Math.floor(ms / 86400000);
    const h = Math.floor((ms % 86400000) / 3600000);
    return `距结束 ${d}天${h}小时`;
  }

  const id = new URLSearchParams(location.search).get("id") || "chronic";
  const theme = window.getMallTheme?.(id);
  const root = $("root");
  const bar = $("bottomBar");

  if (!theme || !root) {
    if (root) {
      root.innerHTML = `<div class="th-empty">未找到主题活动，请从首页金刚区进入。</div>`;
    }
    return;
  }

  document.title = `${theme.name} · 春风康养`;
  $("navTitle").textContent = theme.name;
  document.documentElement.style.setProperty("--th-tone", theme.tone || "#e36a12");

  const stats = (theme.stats || [])
    .map((s) => `<div class="th-stat"><strong>${esc(s.n)}</strong><span>${esc(s.l)}</span></div>`)
    .join("");

  const coupons = (theme.coupons || [])
    .map(
      (c) => `
      <button type="button" class="th-coupon" data-coupon="${esc(c.name)}">
        <b>${esc(c.value)}</b>
        <span>${esc(c.name)}<i>${esc(c.tip)}</i></span>
      </button>`
    )
    .join("");

  const live = theme.live
    ? `<section class="th-card th-live">
        <div>
          <em>${esc(theme.live.status)}</em>
          <h3>${esc(theme.live.title)}</h3>
          <p>${esc(theme.live.speaker)}</p>
        </div>
        <a class="th-mini-cta" href="${esc(theme.live.href)}">预约直播</a>
      </section>`
    : "";

  const checkin = theme.checkin
    ? `<section class="th-card">
        <h2 class="th-h">打卡 · ${esc(theme.checkin.title)}</h2>
        <div class="th-week">${theme.checkin.days
          .map((d, i) => `<i class="${theme.checkin.done[i] ? "on" : ""}">${esc(d)}</i>`)
          .join("")}</div>
        <button type="button" class="th-line-btn" id="btnCheckin">今日打卡</button>
      </section>`
    : "";

  const seckill = theme.seckill
    ? `<section class="th-card th-seckill">
        <h2 class="th-h">${esc(theme.seckill.title)}</h2>
        <p class="th-kill-meta">${esc(theme.seckill.stock)}</p>
        <div class="th-kill-price"><b>¥${esc(theme.seckill.price)}</b><s>¥${esc(theme.seckill.origin)}</s></div>
        <a class="th-mini-cta" href="./detail.html?id=${esc(theme.seckill.productId)}">马上抢</a>
      </section>`
    : "";

  const schedule = theme.schedule
    ? `<section class="th-card">
        <h2 class="th-h">本周上门时间轴</h2>
        <div class="th-timeline">${theme.schedule
          .map(
            (s) => `<div class="th-tl"><b>${esc(s.day)} ${esc(s.time)}</b><strong>${esc(s.name)}</strong><span>${esc(s.meta)}</span></div>`
          )
          .join("")}</div>
      </section>`
    : "";

  const rank = theme.rank
    ? `<section class="th-card">
        <h2 class="th-h">${esc(theme.rank.title)}</h2>
        <ol class="th-rank">${theme.rank.items
          .map((it, i) => `<li><em>${i + 1}</em><div><strong>${esc(it.name)}</strong><span>${esc(it.desc)}</span></div></li>`)
          .join("")}</ol>
      </section>`
    : "";

  const menu = theme.menu
    ? `<section class="th-card">
        <h2 class="th-h">本周控糖软食菜单</h2>
        <div class="th-menu">${theme.menu
          .map((m) => `<div><b>${esc(m.day)}</b><span>${esc(m.name)}</span><i>${esc(m.tag)}</i></div>`)
          .join("")}</div>
      </section>`
    : "";

  const groupbuy = theme.groupbuy
    ? `<section class="th-card">
        <h2 class="th-h">${esc(theme.groupbuy.title)}</h2>
        <p class="th-sub">${esc(theme.groupbuy.tip)}</p>
        <div class="th-bar"><i style="width:${Math.round((theme.groupbuy.progress / theme.groupbuy.total) * 100)}%"></i></div>
        <p class="th-sub">已有 ${theme.groupbuy.progress}/${theme.groupbuy.total} 户加入</p>
        <a class="th-mini-cta" href="./detail.html?id=${esc(theme.groupbuy.productId)}">去拼团</a>
      </section>`
    : "";

  const events = theme.events
    ? `<section class="th-card">
        <h2 class="th-h">活动日历</h2>
        <div class="th-events">${theme.events
          .map((e) => `<div><b>${esc(e.day)}</b><strong>${esc(e.name)}</strong><span>${esc(e.meta)}</span></div>`)
          .join("")}</div>
      </section>`
    : "";

  const checklist = theme.checklist
    ? `<section class="th-card">
        <h2 class="th-h">居家安全清单</h2>
        <div class="th-checks">${theme.checklist
          .map((c) => `<label><input type="checkbox" ${c.on ? "checked" : ""} />${esc(c.name)}</label>`)
          .join("")}</div>
      </section>`
    : "";

  root.innerHTML = `
    <section class="th-hero">
      <img src="${esc(theme.cover)}" alt="" />
      <div class="th-hero-copy">
        <span class="th-badge">${esc(theme.badge)}</span>
        <h1>${esc(theme.title)}</h1>
        <p>${esc(theme.summary)}</p>
        <div class="th-hero-meta">
          <span>${esc(theme.period)}</span>
          <span id="thCount">${esc(remain(theme.endAt))}</span>
        </div>
      </div>
    </section>
    <section class="th-stats">${stats}</section>
    ${coupons ? `<section class="th-coupons">${coupons}</section>` : ""}
    ${live}
    ${checkin}
    ${seckill}
    ${schedule}
    ${rank}
    ${menu}
    ${groupbuy}
    ${events}
    ${checklist}
    <section class="goods-feed" id="thGoodsFeed"></section>
  `;

  bar.innerHTML = `
    <a class="th-bar-ghost" href="./agent.html?q=${encodeURIComponent(theme.agentQ)}">问智伴</a>
    <button type="button" class="th-bar-main" id="btnJoin">参加活动</button>
  `;

  $("btnBack")?.addEventListener("click", () => {
    if (history.length > 1) history.back();
    else location.href = "./index.html";
  });

  $("btnJoin")?.addEventListener("click", () => {
    toast(`已为你记下「${theme.name}」，可到订单或智伴继续`);
  });

  $("btnCheckin")?.addEventListener("click", () => {
    toast("今日打卡已记下，坚持到第 7 天有监测补贴");
  });

  root.addEventListener("click", (e) => {
    const coupon = e.target.closest("[data-coupon]");
    if (coupon) toast(`已领取「${coupon.dataset.coupon}」`);
  });

  window.GoodsFeed?.mount({
    host: $("thGoodsFeed"),
    title: "活动相关推荐",
    products: theme.products,
    articles: theme.articles,
    online: theme.online,
    heroId: theme.products?.[0],
  });
})();
