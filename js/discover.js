/** 发现页 · APP 信息流（广播站 / 朋友圈 / 办事通，无商城） */
(() => {
  const TABS = [
    {
      key: "broadcast",
      label: "广播站",
      listHref: "./broadcast.html",
      hero: {
        eyebrow: "今日精选",
        title: "好状态，从读懂身体开始",
        sub: "科普讲座已更新",
      },
      quick: [
        { label: "政策", href: "./broadcast.html" },
        { label: "科普", href: "./broadcast.html" },
        { label: "讲座", href: "./broadcast.html" },
        { label: "全部", href: "./broadcast.html" },
      ],
      topic: { title: "本周康养专题", desc: "睡眠 · 营养 · 慢病", href: "./broadcast.html" },
    },
    {
      key: "moments",
      label: "朋友圈",
      listHref: "./moments.html",
      hero: {
        eyebrow: "社区动态",
        title: "邻里温暖，看见身边好时光",
        sub: "精选动态与延伸阅读",
      },
      quick: [
        { label: "动态", href: "./moments.html" },
        { label: "活动", href: "./activity.html" },
        { label: "兴趣", href: "./discover.html?tab=moments" },
        { label: "全部", href: "./moments.html" },
      ],
      topic: { title: "本周社区话题", desc: "乐龄活动 · 家人陪伴", href: "./moments.html" },
    },
    {
      key: "banshi",
      label: "办事通",
      listHref: "./banshi.html",
      hero: {
        eyebrow: "政务便民",
        title: "补贴与办事，少跑一趟腿",
        sub: "补贴 · 供需 · 培训",
      },
      quick: [
        { label: "补贴", href: "./banshi.html" },
        { label: "居家", href: "./banshi.html" },
        { label: "适老", href: "./banshi.html" },
        { label: "全部", href: "./banshi.html" },
      ],
      topic: { title: "本周办事指南", desc: "高龄津贴 · 照护补贴", href: "./banshi.html" },
    },
  ];

  const ICONS = {
    政策:
      '<path fill="currentColor" d="M5 4h14v2H5V4zm0 4h14v12H5V8zm3 3v2h8v-2H8zm0 4v2h6v-2H8z"/>',
    科普:
      '<path fill="currentColor" d="M12 3a6 6 0 0 0-3 11.2V17h6v-2.8A6 6 0 0 0 12 3zm-2 16h4v2h-4v-2z"/>',
    讲座:
      '<path fill="currentColor" d="M4 5h16v10H8l-4 3V5zm3 3v2h10V8H7zm0 4v2h7v-2H7z"/>',
    全部:
      '<path fill="currentColor" d="M4 5h7v7H4V5zm9 0h7v7h-7V5zM4 14h7v7H4v-7zm9 0h7v7h-7v-7z"/>',
    动态:
      '<path fill="currentColor" d="M5 5h14v2H5V5zm0 4h10v2H5V9zm0 4h14v2H5v-2zm0 4h10v2H5v-2z"/>',
    活动:
      '<path fill="currentColor" d="M7 3h2v2h6V3h2v2h3v16H4V5h3V3zm-1 6v10h12V9H6zm3 2h2v2H9v-2zm4 0h2v2h-2v-2z"/>',
    兴趣:
      '<path fill="currentColor" d="M12 21s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.6-7 10-7 10z"/>',
    补贴:
      '<path fill="currentColor" d="M12 2a7 7 0 0 1 7 7c0 4.4-3.2 7-7 11-3.8-4-7-6.6-7-11a7 7 0 0 1 7-7zm0 4a3 3 0 1 0 .01 6.01A3 3 0 0 0 12 6z"/>',
    居家:
      '<path fill="currentColor" d="M12 3l9 7v11h-6v-6H9v6H3V10l9-7z"/>',
    适老:
      '<path fill="currentColor" d="M12 2a3 3 0 1 1 0 6 3 3 0 0 1 0-6zM7 10h10v2H7v-2zm1 4h8l1 7H7l1-7z"/>',
  };

  const params = new URLSearchParams(location.search);
  const initialKey = params.get("tab") || "broadcast";
  const initialIdx = Math.max(
    0,
    TABS.findIndex((t) => t.key === initialKey)
  );

  const tabBar = document.getElementById("dcTabs");
  const pager = document.getElementById("dcPager");
  if (!tabBar || !pager) return;

  function esc(s) {
    return String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function articlesOf(section) {
    const all = window.MALL_ARTICLES || [];
    const matched = all.filter((a) => (a.sections || []).includes(section));
    return (matched.length ? matched : all).slice(0, 8);
  }

  function renderQuick(items) {
    return `<nav class="dc-quick" aria-label="快捷入口">${items
      .map((q) => {
        const path = ICONS[q.label] || ICONS["全部"];
        return `<a href="${esc(q.href)}"><span class="ico" aria-hidden="true"><svg viewBox="0 0 24 24">${path}</svg></span>${esc(q.label)}</a>`;
      })
      .join("")}</nav>`;
  }

  function renderFeed(section, listHref) {
    const list = articlesOf(section);
    if (!list.length) {
      return `<div class="dc-empty">暂无内容，稍后再来看看</div>`;
    }
    const cards = list
      .map((a) => {
        const tag = (a.tags && a.tags[0]) || "康养精选";
        const href =
          window.articleDetailHref?.(a.id, section) ||
          `./article.html?id=${encodeURIComponent(a.id)}&from=${encodeURIComponent(section)}`;
        const meta = [a.author || "春风康养", a.readMin ? `${a.readMin} 分钟` : ""]
          .filter(Boolean)
          .join(" · ");
        return `<a class="dc-art" href="${esc(href)}">
          <div class="body">
            <span class="tag">${esc(tag)}</span>
            <div class="title">${esc(a.title)}</div>
            <div class="meta">${esc(meta)}</div>
          </div>
          <div class="thumb"><img src="${esc(a.cover)}" alt="" loading="lazy" /></div>
        </a>`;
      })
      .join("");
    return `
      <div class="dc-feed-hd">
        <strong>最新内容</strong>
        <a href="${esc(listHref)}">全部 ›</a>
      </div>
      <section class="dc-feed">${cards}</section>`;
  }

  function panelHtml(cfg) {
    const d = new Date();
    const dateText = `${d.getMonth() + 1} 月 ${d.getDate()} 日 · ${cfg.hero.eyebrow}`;
    return `<section class="dc-panel" data-tab="${esc(cfg.key)}" role="tabpanel">
      <a class="dc-hero" href="${esc(cfg.listHref)}">
        <p class="eyebrow">${esc(dateText)}</p>
        <h2>${esc(cfg.hero.title)}</h2>
        <p class="sub">${esc(cfg.hero.sub)}</p>
        <span class="deco" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 21c-3.2-2.2-7-5.4-7-9.2A4.2 4.2 0 0 1 12 8.2a4.2 4.2 0 0 1 7 3.6c0 3.8-3.8 7-7 9.2z"/>
          </svg>
        </span>
      </a>
      ${renderQuick(cfg.quick)}
      ${renderFeed(cfg.key, cfg.listHref)}
      <a class="dc-topic" href="${esc(cfg.topic.href)}">
        <div>
          <strong>${esc(cfg.topic.title)}</strong>
          <p>${esc(cfg.topic.desc)}</p>
        </div>
        <span class="go">去看看 ›</span>
      </a>
    </section>`;
  }

  function renderTabs(activeKey) {
    tabBar.innerHTML = TABS.map(
      (t) =>
        `<button type="button" class="dc-tab${t.key === activeKey ? " is-on" : ""}" data-tab="${t.key}" role="tab" aria-selected="${t.key === activeKey}">${esc(t.label)}</button>`
    ).join("");
  }

  function syncFromScroll() {
    const w = pager.clientWidth || 1;
    const idx = Math.min(TABS.length - 1, Math.max(0, Math.round(pager.scrollLeft / w)));
    const key = TABS[idx].key;
    renderTabs(key);
    try {
      history.replaceState(null, "", `?tab=${encodeURIComponent(key)}`);
    } catch {
      /* ignore */
    }
  }

  function goTab(key, smooth = true) {
    const idx = Math.max(
      0,
      TABS.findIndex((t) => t.key === key)
    );
    const left = idx * (pager.clientWidth || 0);
    pager.scrollTo({ left, behavior: smooth ? "smooth" : "auto" });
    renderTabs(TABS[idx].key);
    try {
      history.replaceState(null, "", `?tab=${encodeURIComponent(TABS[idx].key)}`);
    } catch {
      /* ignore */
    }
  }

  pager.innerHTML = TABS.map(panelHtml).join("");
  renderTabs(TABS[initialIdx].key);

  requestAnimationFrame(() => {
    goTab(TABS[initialIdx].key, false);
  });

  tabBar.addEventListener("click", (e) => {
    const btn = e.target.closest(".dc-tab[data-tab]");
    if (!btn) return;
    goTab(btn.dataset.tab, true);
  });

  let ticking = false;
  pager.addEventListener(
    "scroll",
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        syncFromScroll();
        ticking = false;
      });
    },
    { passive: true }
  );

  window.addEventListener(
    "resize",
    () => {
      const active = tabBar.querySelector(".dc-tab.is-on")?.dataset?.tab || TABS[0].key;
      goTab(active, false);
    },
    { passive: true }
  );
})();
