/* 春风康养 · 全局 App 外壳初始化（智伴暖橙主题） */
(() => {
  const phone = document.querySelector(".phone");
  if (!phone) return;

  phone.classList.add("app-theme");

  // 设置 theme-color 与智伴主题一致
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

  /** 在底部 tab 栏正中间插入智伴卡通入口 */
  function injectAgentTab() {
    const page = (location.pathname.split("/").pop() || "").toLowerCase();
    if (page === "agent.html") return;

    const bars = phone.querySelectorAll(".tabbar, .home-tabbar, nav.tabbar");
    bars.forEach((bar) => {
      if (bar.querySelector(".tab-agent, .tab-mid")) {
        // 已有中间入口：统一换卡通形象
        bar.classList.add("has-agent");
        const img = bar.querySelector(".tab-agent img, .tab-mid img, [data-tab-agent-avatar]");
        if (img) {
          img.setAttribute("data-tab-agent-avatar", "");
          img.src = resolveAvatarSrc();
        }
        return;
      }

      const tabs = [...bar.querySelectorAll(":scope > .tab, :scope > .tab-item")];
      if (tabs.length < 2) return;

      const mid = document.createElement("a");
      mid.className = "tab-agent";
      mid.href = `${base}agent.html`;
      mid.setAttribute("aria-label", "打开智伴");
      mid.innerHTML = `
        <span class="tab-agent-avatar">
          <img data-tab-agent-avatar src="${resolveAvatarSrc()}" alt="康小护" />
        </span>
        <span class="tab-agent-label">智伴</span>
      `;

      const insertAt = Math.floor(tabs.length / 2);
      const ref = tabs[insertAt] || null;
      if (ref) bar.insertBefore(mid, ref);
      else bar.appendChild(mid);

      bar.classList.add("has-agent");
    });
  }

  injectAgentTab();
  syncTabAvatars();

  // 同步 tabbar 当前页高亮（跳过中间智伴入口）
  const pathParts = location.pathname.split("/").filter(Boolean);
  const currentFile = pathParts.slice(-1)[0] || "index.html";
  const currentDirFile = pathParts.slice(-2).join("/") || currentFile;
  const tabSelectors = ".tabbar .tab, .tabbar .tab-item, nav.tabbar .tab, nav.tabbar .tab-item, .home-tabbar .tab";
  phone.querySelectorAll(tabSelectors).forEach((tab) => {
    if (tab.classList.contains("tab-agent") || tab.classList.contains("tab-mid")) return;
    tab.classList.remove("active");
    tab.removeAttribute("aria-current");
    const href = (tab.getAttribute("href") || "").split("?")[0].split("#")[0];
    if (!href || href === "#" || href.startsWith("javascript:")) return;
    const hrefParts = href.replace(/^\.\//, "").split("/").filter(Boolean);
    const targetFile = hrefParts.slice(-1)[0] || "";
    const targetDirFile = hrefParts.slice(-2).join("/") || targetFile;
    // 用「目录+文件」比对，避免 health-service/index.html 误匹配商城 index.html
    const hit =
      targetDirFile === currentDirFile ||
      (hrefParts.length === 1 && targetFile === currentFile && !currentDirFile.includes("/"));
    if (hit) {
      tab.classList.add("active");
      tab.setAttribute("aria-current", "page");
    }
  });

  // 换形象后刷新底部头像
  window.addEventListener("storage", (e) => {
    if (e.key === "kangyang-agent:avatar-id") syncTabAvatars();
  });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") syncTabAvatars();
  });
})();
