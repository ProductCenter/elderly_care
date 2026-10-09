/* 春风康养 · 全局 App 外壳初始化（智伴暖橙主题） */
(() => {
  const phone =
    document.querySelector(".phone") ||
    document.querySelector(".shop-phone") ||
    document.getElementById("app");
  if (!phone) return;

  phone.classList.add("app-theme");

  let meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("name", "theme-color");
    document.head.appendChild(meta);
  }
  meta.setAttribute("content", "#f6eee2");

  function assetBase() {
    const scripts = document.querySelectorAll('script[src*="app-shell"]');
    const src = scripts[scripts.length - 1]?.getAttribute("src") || "./js/app-shell.js";
    if (src.includes("../")) return "../";
    return "./";
  }

  const base = assetBase();

  const AVATAR_FALLBACK = {
    xiaohu: "assets/moko-avatar.png",
    hello: "assets/moko/moko-hello.png",
    cheer: "assets/moko/moko-cheer.png",
    great: "assets/moko/moko-great.png",
    think: "assets/moko/moko-loading.png",
  };

  function resolveAvatarSrc() {
    if (window.AgentAvatar?.get) {
      const a = window.AgentAvatar.get();
      const src = a?.src || "";
      if (src.startsWith("./") || src.startsWith("../") || src.startsWith("http") || src.startsWith("/")) {
        return src.startsWith("./") ? base + src.slice(2) : src;
      }
      return src;
    }
    try {
      const id = localStorage.getItem("kangyang-agent:avatar-id") || "xiaohu";
      return base + (AVATAR_FALLBACK[id] || AVATAR_FALLBACK.xiaohu);
    } catch {
      return base + AVATAR_FALLBACK.xiaohu;
    }
  }

  function syncTabAvatars() {
    const src = resolveAvatarSrc();
    document.querySelectorAll("[data-tab-agent-avatar]").forEach((img) => {
      img.src = src;
    });
  }

  const pageFile = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  const pageHash = (location.hash || "").replace(/^#/, "").toLowerCase();

  /** 可作为「首页」入口的一级页（按浏览器地址择一记忆） */
  const HOME_ENTRY_PAGES = new Set(["home2.html", "home.html", "app-v10.html"]);
  const HOME_PREF_KEY = "kangyang-app:home-href";
  const DEFAULT_HOME = "home2.html";

  const DISCOVER_PAGES = new Set([
    "discover.html",
    "banshi.html",
    "moments.html",
    "broadcast.html",
    "broadcast-detail.html",
    "xue.html",
    "article.html",
  ]);

  /** 二级页：不展示底部主导航 Tab */
  const NO_TABBAR_PAGES = new Set([
    "detail.html",
    "shop.html",
    "order.html",
    "order-detail.html",
    "aftersale-apply.html",
    "logistics-track.html",
    "search.html",
    "activity.html",
    "product-add.html",
  ]);

  function shouldShowTabbar() {
    if (document.body?.hasAttribute("data-no-tabbar")) return false;
    if (phone.hasAttribute("data-no-tabbar")) return false;
    return !NO_TABBAR_PAGES.has(pageFile);
  }

  function normalizeHomeHref(href) {
    const raw = String(href || "").trim();
    if (!raw) return "";
    try {
      const u = new URL(raw, location.href);
      const file = (u.pathname.split("/").pop() || "").toLowerCase();
      if (!HOME_ENTRY_PAGES.has(file)) return "";
      if (file === "app-v10.html") return `${base}app-v10.html`;
      return `${base}${file}`;
    } catch {
      return "";
    }
  }

  function rememberHomeHref(href) {
    const n = normalizeHomeHref(href);
    if (!n) return;
    try {
      sessionStorage.setItem(HOME_PREF_KEY, n);
      localStorage.setItem(HOME_PREF_KEY, n);
    } catch {
      /* ignore */
    }
  }

  function readRememberedHomeHref() {
    try {
      const fromSession = normalizeHomeHref(sessionStorage.getItem(HOME_PREF_KEY) || "");
      if (fromSession) return fromSession;
    } catch {
      /* ignore */
    }
    try {
      return normalizeHomeHref(localStorage.getItem(HOME_PREF_KEY) || "");
    } catch {
      return "";
    }
  }

  /** app-v10 仅在无业务 hash（或 #home）时视为首页 */
  function isAppV10HomeHash(hash) {
    const h = String(hash || "").toLowerCase();
    return !h || h === "home";
  }

  /**
   * 根据当前浏览器地址选择「首页」跳转目标：
   * 1) 正在首页入口页 → 记为当前首页并返回
   * 2) 否则用会话/本地记忆的入口
   * 3) 默认 home2.html
   */
  function resolveHomeHref() {
    if (pageFile === "home2.html" || pageFile === "home.html") {
      const href = `${base}${pageFile}`;
      rememberHomeHref(href);
      return href;
    }
    if (pageFile === "app-v10.html") {
      const href = `${base}app-v10.html`;
      // 在 v10 壳内任意 Tab 时，点「首页」仍回 v10 首页
      rememberHomeHref(href);
      return isAppV10HomeHash(pageHash) ? href : `${href}#home`;
    }

    const remembered = readRememberedHomeHref();
    if (remembered) return remembered;
    return `${base}${DEFAULT_HOME}`;
  }

  function isOnResolvedHome(homeHref) {
    const target = normalizeHomeHref(homeHref) || homeHref;
    try {
      const u = new URL(target, location.href);
      const file = (u.pathname.split("/").pop() || "").toLowerCase();
      if (pageFile !== file) return false;
      if (file === "app-v10.html") return isAppV10HomeHash(pageHash);
      return true;
    } catch {
      return false;
    }
  }

  function activeKey() {
    if (pageFile === "home.html" || pageFile === "home2.html") return "home";
    if (pageFile === "app-v10.html") {
      if (isAppV10HomeHash(pageHash)) return "home";
      if (pageHash === "ai" || pageHash.indexOf("ai") === 0) return "agent";
      if (pageHash === "health") return "health";
      if (pageHash === "shop" || pageHash === "lehuo") return "shop";
      if (pageHash === "me" || pageHash === "mine") return "mine";
      return "home";
    }
    if (pageFile === "agent.html") return "agent";
    if (pageFile === "index.html") return "shop";
    if (DISCOVER_PAGES.has(pageFile)) return "shop";
    if (pageFile === "mine.html" || pageFile === "orders.html" || pageFile === "member.html") {
      return "mine";
    }
    return "";
  }

  const ICONS = {
    home: `<svg fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M3 12l9-9 9 9"/><path d="M5 10v10a1 1 0 001 1h4v-6h4v6h4a1 1 0 001-1V10"/></svg>`,
    health: `<svg fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>`,
    shop: `<svg fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><path d="M3 6h18M16 10a4 4 0 01-8 0"/></svg>`,
    mine: `<svg fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21v-1a6 6 0 016-6h4a6 6 0 016 6v1"/></svg>`,
  };

  function showToast(msg) {
    let el = phone.querySelector(".app-toast");
    if (!el) {
      el = document.createElement("div");
      el.className = "wx-toast app-toast";
      el.setAttribute("role", "status");
      phone.appendChild(el);
    }
    el.removeAttribute("hidden");
    el.hidden = false;
    el.textContent = String(msg || "");
    el.classList.add("show");
    el.style.cssText =
      "position:absolute;left:50%;top:42%;transform:translate(-50%,-50%);z-index:90;max-width:72%;padding:12px 18px;border-radius:3px;background:rgba(17,17,17,.8);color:#fff;font-size:14px;text-align:center;line-height:1.4;opacity:1;pointer-events:none;";
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => {
      el.style.opacity = "0";
      el.classList.remove("show");
      el.hidden = true;
      el.setAttribute("hidden", "");
    }, 1800);
  }

  function isPlaceholderHealthTab(a) {
    if (!a || !a.closest) return false;
    if (!a.closest(".tabbar, .home-tabbar, nav.tabbar")) return false;
    if (a.classList.contains("tab-agent") || a.classList.contains("tab-mid")) return false;
    if (a.getAttribute("data-tab") !== "health") return false;
    const href = (a.getAttribute("href") || "").trim().toLowerCase();
    if (!href || href === "#" || href.startsWith("javascript:")) return true;
    return false;
  }

  /** 统一五栏：对齐 app-v10 — 首页 / 健康 / 小象 / 乐活 / 我的 */
  function ensureMainTabbar() {
    let bar = phone.querySelector(".tabbar, .home-tabbar, nav.tabbar");

    if (!shouldShowTabbar()) {
      if (bar) bar.remove();
      phone.classList.add("no-tabbar");
      return;
    }

    phone.classList.remove("no-tabbar");
    if (!bar) {
      bar = document.createElement("nav");
      bar.className = "tabbar";
      bar.setAttribute("aria-label", "主导航");
      phone.appendChild(bar);
    }

    bar.classList.add("tabbar", "has-agent");
    bar.setAttribute("aria-label", "主导航");

    const homeHref =
      pageFile === "index.html" ? `${base}elder_app.html` : resolveHomeHref();
    const key = activeKey();
    const on = (k) => (key === k ? " active" : "");
    const cur = (k) => (key === k ? ' aria-current="page"' : "");
    const homeAttrs = isOnResolvedHome(homeHref)
      ? `${cur("home")} data-home-current="1"`
      : cur("home");

    bar.innerHTML = `
      <a class="tab${on("home")}" href="${homeHref}" data-tab="home"${homeAttrs}>
        ${ICONS.home}
        <span>首页</span>
      </a>
      <a class="tab${on("health")}" href="${base}app-v10.html#health" data-tab="health"${cur("health")}>
        ${ICONS.health}
        <span>健康</span>
      </a>
      <a class="tab tab-agent${on("agent")}" href="${base}app-v10.html#ai"${cur("agent")} aria-label="小象在线">
        <span class="moko-ring" aria-hidden="true"></span>
        <span class="tab-agent-avatar halo">
          <img data-tab-agent-avatar src="${resolveAvatarSrc()}" alt="小象" />
        </span>
        <span class="tab-agent-label">智伴</span>
      </a>
      <a class="tab${on("shop")}" href="${base}index.html"${cur("shop")}>
        ${ICONS.shop}
        <span>乐活</span>
      </a>
      <a class="tab${on("mine")}" href="${pageFile === "index.html" ? `${base}app-v10.html#me` : `${base}mine.html`}"${cur("mine")}>
        ${ICONS.mine}
        <span>我的</span>
      </a>
    `;
  }

  phone.addEventListener(
    "click",
    (e) => {
      const a = e.target.closest?.("a");
      if (!isPlaceholderHealthTab(a)) return;
      e.preventDefault();
      e.stopPropagation();
      showToast("正在建设中");
    },
    true
  );

  ensureMainTabbar();
  syncTabAvatars();

  window.addEventListener("hashchange", () => {
    if (pageFile === "app-v10.html") ensureMainTabbar();
  });

  window.addEventListener("storage", (e) => {
    if (e.key === "kangyang-agent:avatar-id") syncTabAvatars();
    if (e.key === HOME_PREF_KEY) ensureMainTabbar();
  });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") syncTabAvatars();
  });

  window.AppShell = {
    showToast,
    ensureMainTabbar,
    syncTabAvatars,
    resolveHomeHref,
  };
})();
