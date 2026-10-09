/** 春风康养 · home2 首页交互（v10 视觉） */
(() => {
  const phone = document.getElementById("app");
  if (!phone) return;

  const WEEK = ["日", "一", "二", "三", "四", "五", "六"];
  const now = new Date();
  const hour = now.getHours();
  const greetWord =
    hour < 6 ? "夜深了" : hour < 11 ? "早上好" : hour < 14 ? "中午好" : hour < 18 ? "下午好" : "晚上好";

  const greetH1 = document.querySelector(".h2-greet h1");
  if (greetH1) {
    greetH1.innerHTML = `${greetWord}，<em>慢慢来</em>`;
  }

  const dateChip = document.getElementById("h2DateChip");
  if (dateChip) {
    dateChip.textContent = `${now.getMonth() + 1}月${now.getDate()}日 · 周${WEEK[now.getDay()]}`;
  }

  const todayDateEl = document.querySelector(".today-date");
  if (todayDateEl) {
    todayDateEl.textContent = `${now.getMonth() + 1} 月 ${now.getDate()} 日 · 周${WEEK[now.getDay()]}`;
  }

  const statusTime = document.getElementById("statusTime");
  if (statusTime) {
    const pad = (n) => String(n).padStart(2, "0");
    const tick = () => {
      const d = new Date();
      statusTime.textContent = `${d.getHours()}:${pad(d.getMinutes())}`;
    };
    tick();
    setInterval(tick, 30000);
  }

  const elderBtn = document.getElementById("btnElder");
  const ELDER_KEY = "kangyang-home2:elder";

  function applyElder(on) {
    phone.classList.toggle("is-elder", on);
    elderBtn?.setAttribute("aria-pressed", on ? "true" : "false");
    try {
      localStorage.setItem(ELDER_KEY, on ? "1" : "0");
    } catch {
      /* ignore */
    }
  }

  try {
    applyElder(localStorage.getItem(ELDER_KEY) === "1");
  } catch {
    /* ignore */
  }

  elderBtn?.addEventListener("click", () => {
    const next = !phone.classList.contains("is-elder");
    applyElder(next);
    if (window.AppShell?.showToast) {
      window.AppShell.showToast(next ? "已开启大字模式" : "已关闭大字模式");
    }
  });

  document.getElementById("navSearch")?.addEventListener("click", () => {
    location.href = "./search.html";
  });

  /* —— 选择地址 —— */
  const ADDR_KEY = "kangyang-home2:addr-id";
  const ADDRESSES = [
    {
      id: "addr_jr",
      short: "科技金融大厦",
      detail: "山东省济南市历下区姚家街道科技金融大厦",
      tag: "家",
      user: "安辉",
      phone: "158****3897",
    },
    {
      id: "addr_ys",
      short: "燕山立交附近",
      detail: "山东省济南市历下区燕山立交东南侧燕山小区 3 号楼",
      tag: "父母",
      user: "王秀兰",
      phone: "139****6210",
    },
    {
      id: "addr_qf",
      short: "泉城路步行街",
      detail: "山东省济南市历下区泉城路 180 号附近",
      tag: "常用",
      user: "安辉",
      phone: "158****3897",
    },
    {
      id: "addr_hq",
      short: "高新区舜华路",
      detail: "山东省济南市高新区舜华路 1500 号",
      tag: "办公",
      user: "安辉",
      phone: "158****3897",
    },
  ];

  const locNameEl = document.getElementById("locName");
  const btnLoc = document.getElementById("btnLoc");
  const addrMask = document.getElementById("addrMask");
  const addrSheet = document.getElementById("addrSheet");
  const addrList = document.getElementById("addrList");

  function escapeHtml(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function getSelectedAddr() {
    let id = "";
    try {
      id = localStorage.getItem(ADDR_KEY) || "";
    } catch {
      /* ignore */
    }
    return ADDRESSES.find((a) => a.id === id) || ADDRESSES[0];
  }

  function syncLocName(addr) {
    if (!locNameEl || !addr) return;
    locNameEl.textContent = addr.short || "选择地址";
  }

  function closeAddrSheet() {
    if (addrMask) {
      addrMask.hidden = true;
      addrMask.setAttribute("hidden", "");
    }
    if (addrSheet) {
      addrSheet.hidden = true;
      addrSheet.setAttribute("hidden", "");
    }
    btnLoc?.setAttribute("aria-expanded", "false");
  }

  function openAddrSheet() {
    if (!addrSheet || !addrList) return;
    const current = getSelectedAddr();
    addrList.innerHTML = ADDRESSES.map((a) => {
      const on = current && a.id === current.id;
      return `<button type="button" class="addr-item${on ? " is-on" : ""}" data-addr-id="${escapeHtml(a.id)}">
        <div class="addr-item-main">
          <div class="addr-item-name">
            <span>${escapeHtml(a.short)}</span>
            ${a.tag ? `<span class="badge">${escapeHtml(a.tag)}</span>` : ""}
          </div>
          <div class="addr-item-detail">${escapeHtml(a.detail)}</div>
          <div class="addr-item-user">${escapeHtml(a.user)} · ${escapeHtml(a.phone)}</div>
        </div>
        <i class="addr-item-check" aria-hidden="true"></i>
      </button>`;
    }).join("");

    if (addrMask) {
      addrMask.hidden = false;
      addrMask.removeAttribute("hidden");
    }
    addrSheet.hidden = false;
    addrSheet.removeAttribute("hidden");
    btnLoc?.setAttribute("aria-expanded", "true");
  }

  syncLocName(getSelectedAddr());

  btnLoc?.addEventListener("click", openAddrSheet);
  document.getElementById("addrSheetClose")?.addEventListener("click", closeAddrSheet);
  addrMask?.addEventListener("click", closeAddrSheet);
  addrList?.addEventListener("click", (e) => {
    const item = e.target.closest?.("[data-addr-id]");
    if (!item) return;
    const id = item.dataset.addrId || "";
    const addr = ADDRESSES.find((a) => a.id === id);
    if (!addr) return;
    try {
      localStorage.setItem(ADDR_KEY, id);
    } catch {
      /* ignore */
    }
    syncLocName(addr);
    closeAddrSheet();
    if (window.AppShell?.showToast) {
      window.AppShell.showToast(`已切换至「${addr.short}」`);
    }
  });

  const body = document.getElementById("h2Body");
  body?.addEventListener(
    "scroll",
    () => {
      phone.classList.toggle("is-scrolled", (body.scrollTop || 0) > 48);
    },
    { passive: true }
  );

  /* —— 头图轮播 —— */
  const heroTrack = document.getElementById("heroTrack");
  const heroDots = document.getElementById("heroDots");
  if (heroTrack && heroDots) {
    const slides = [...heroTrack.querySelectorAll(".h2-hero-slide")];
    let heroIdx = Math.max(
      0,
      slides.findIndex((s) => s.classList.contains("is-on"))
    );
    let timer = null;

    heroDots.innerHTML = slides
      .map(
        (_, i) =>
          `<button type="button" class="${i === heroIdx ? "is-on" : ""}" data-i="${i}" aria-label="头图第${i + 1}张"></button>`
      )
      .join("");

    function showHero(i) {
      heroIdx = (i + slides.length) % slides.length;
      slides.forEach((s, n) => s.classList.toggle("is-on", n === heroIdx));
      heroDots.querySelectorAll("button").forEach((b, n) => b.classList.toggle("is-on", n === heroIdx));
    }

    function startHero() {
      stopHero();
      timer = setInterval(() => showHero(heroIdx + 1), 4200);
    }

    function stopHero() {
      if (timer) clearInterval(timer);
      timer = null;
    }

    heroDots.addEventListener("click", (e) => {
      const i = e.target?.closest?.("button")?.dataset?.i;
      if (i == null) return;
      showHero(Number(i));
      startHero();
    });

    heroTrack.addEventListener("pointerenter", stopHero);
    heroTrack.addEventListener("pointerleave", startHero);
    showHero(heroIdx);
    startHero();
  }

  /* —— APP 双列信息流：康养 / 活动 / 课堂 —— */
  const TYPE_LABEL = { care: "康养", promo: "活动", class: "课堂" };
  const FEED_ITEMS = [
    {
      id: "care_sleep",
      type: "care",
      title: "长者睡眠改善指南：三件小事让夜醒变少",
      meta: "康养内容 · 6 分钟",
      cover: "./assets/cover-sleep-breath.png",
      ratio: "wide",
      href: "./broadcast-detail.html?id=bc_lecture_sugar",
    },
    {
      id: "promo_carnival",
      type: "promo",
      title: "春风乐龄嘉年华 · 限时报名",
      meta: "营销活动 · 济南历下",
      cover: "./assets/home2/h2-promo.png",
      ratio: "tall",
      href: "./activity.html",
    },
    {
      id: "class_sugar",
      type: "class",
      title: "控糖饮食三原则 · 学堂精讲",
      meta: "康养课堂 · 本周日",
      cover: "./assets/home2/h2-school.png",
      ratio: "wide",
      href: "./xue.html",
    },
    {
      id: "care_rehab",
      type: "care",
      title: "居家照护：防跌倒角落自查清单",
      meta: "康养内容 · 适老化",
      cover: "./assets/cover-companion-care.png",
      ratio: "tall",
      href: "./broadcast.html",
    },
    {
      id: "promo_massage",
      type: "promo",
      title: "AI 舒压理疗限时体验券",
      meta: "营销活动 · 到店核销",
      cover: "./assets/cover-ai-massage.png",
      ratio: "wide",
      href: "./activity.html?id=act_massage_trial",
    },
    {
      id: "class_finger",
      type: "class",
      title: "认知训练手指操示范要点",
      meta: "康养课堂 · 视频图文",
      cover: "./assets/cover-calligraphy.png",
      ratio: "tall",
      href: "./xue.html",
    },
    {
      id: "care_meal",
      type: "care",
      title: "社区营养配餐怎么吃更合适",
      meta: "康养内容 · 营养组",
      cover: "./assets/cover-nutrition-meal.png",
      ratio: "wide",
      href: "./broadcast.html",
    },
    {
      id: "promo_check",
      type: "promo",
      title: "社区健康检测包 9.9 元体验",
      meta: "营销活动 · 本周特惠",
      cover: "./assets/cover-health-check.png",
      ratio: "wide",
      href: "./activity.html?id=act_free_check",
    },
    {
      id: "class_bp",
      type: "class",
      title: "血压自测课堂：家用臂式怎么测准",
      meta: "康养课堂 · 5 分钟",
      cover: "./assets/cover-bp-monitor.png",
      ratio: "tall",
      href: "./xue.html",
    },
  ];

  const feedGrid = document.getElementById("feedGrid");
  const feedTabs = document.getElementById("feedTabs");
  let feedFilter = "all";

  function renderFeed(filter) {
    if (!feedGrid) return;
    const list =
      filter === "all" ? FEED_ITEMS : FEED_ITEMS.filter((it) => it.type === filter);
    if (!list.length) {
      feedGrid.innerHTML = `<div class="feed-empty">暂无相关内容</div>`;
      return;
    }
    feedGrid.innerHTML = list
      .map((it) => {
        const ratio = it.ratio === "tall" ? "is-tall" : "is-wide";
        return `<a class="feed-card" data-type="${escapeHtml(it.type)}" href="${escapeHtml(it.href)}">
          <div class="thumb ${ratio}">
            <span class="badge">${escapeHtml(TYPE_LABEL[it.type] || "")}</span>
            <img src="${escapeHtml(it.cover)}" alt="" loading="lazy" />
          </div>
          <div class="body">
            <h3 class="title">${escapeHtml(it.title)}</h3>
            <p class="meta">${escapeHtml(it.meta)}</p>
          </div>
        </a>`;
      })
      .join("");
  }

  feedTabs?.addEventListener("click", (e) => {
    const btn = e.target.closest?.("button[data-filter]");
    if (!btn) return;
    feedFilter = btn.dataset.filter || "all";
    feedTabs.querySelectorAll("button").forEach((b) => {
      const on = b === btn;
      b.classList.toggle("is-on", on);
      b.setAttribute("aria-selected", on ? "true" : "false");
    });
    renderFeed(feedFilter);
  });

  renderFeed(feedFilter);
})();
