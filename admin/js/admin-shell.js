(() => {
  const root = document.getElementById("admin-root");
  const pageTpl = document.getElementById("page-content");
  if (!root || !window.ADMIN_NAV) return;

  const cfg = document.body.dataset;
  const primaryId = cfg.primary || "home";
  const subId = cfg.sub || "";
  const tabLabel = cfg.tab || "首页";
  const flush = cfg.flush === "true";
  const assetPrefix = cfg.assetPrefix || "../../assets";
  const indexHref = cfg.indexHref || "../index.html";

  const primary = ADMIN_NAV.primary.find((p) => p.id === primaryId) || ADMIN_NAV.primary[0];
  const children = primary.children || [];

  function adminDepth() {
    const parts = location.pathname.split("/").filter(Boolean);
    const adminIdx = parts.lastIndexOf("admin");
    if (adminIdx < 0) return 1;
    return Math.max(1, parts.length - adminIdx - 1);
  }

  function adminPrefix() {
    const depth = adminDepth();
    return depth <= 1 ? "./" : "../".repeat(depth - 1);
  }

  function comingSoonHref(label, seq, primary) {
    const q = new URLSearchParams({
      title: label || "功能页面",
      seq: seq == null ? "" : String(seq),
      primary: primary || primaryId,
    });
    return `${adminPrefix()}coming-soon.html?${q.toString()}`;
  }

  /** 将导航里的 ../xxx 解析为相对当前页、且始终落在 /admin/ 下 */
  function resolveHref(href) {
    if (!href || href === "#") return "#";
    if (/^(https?:|mailto:|\/)/i.test(href)) return href;
    const relToAdmin = href.replace(/^(\.\.\/)+/, "").replace(/^\.\//, "");
    return adminPrefix() + relToAdmin;
  }

  root.innerHTML = `
    <div class="admin-app">
      <header class="top-header">
        <div class="brand">
          <img class="brand-logo" src="${assetPrefix}/clife-logo.png" alt="C-Life" width="28" height="28" />
          <span class="brand-name">C-Life</span>
          <span class="brand-title">${ADMIN_NAV.brandTitle}</span>
        </div>
        <div class="header-right">
          <label class="app-search">
            <svg class="search-ico" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="currentColor" d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
            <input type="search" placeholder="搜索应用" />
            <svg class="caret" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="currentColor" d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6z" />
            </svg>
          </label>
          <a class="hdr-icon" href="${indexHref}" title="功能清单" aria-label="功能清单">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
              <path d="M5 6h14M5 12h14M5 18h10" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
            </svg>
          </a>
          <button type="button" class="hdr-icon hdr-bell" aria-label="通知">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
              <path d="M12 3a5 5 0 0 0-5 5v2.2c0 .8-.3 1.5-.8 2.1L5 14.2V16h14v-1.8l-1.2-1.9c-.5-.6-.8-1.3-.8-2.1V8a5 5 0 0 0-5-5z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
              <path d="M10 17a2 2 0 0 0 4 0" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
            </svg>
            <i class="badge">3</i>
          </button>
          <button type="button" class="user-chip" aria-label="用户菜单">
            <img class="avatar" src="${assetPrefix}/admin-avatar.png" alt="" width="28" height="28" />
            <span>管理员</span>
            <svg class="caret" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="currentColor" d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6z" />
            </svg>
          </button>
        </div>
      </header>
      <div class="body-row">
        <aside class="nav-primary" aria-label="一级导航"></aside>
        <aside class="nav-secondary" aria-label="二级菜单"></aside>
        <main class="main-pane">
          <div class="tabs-bar">
            <div class="tabs">
              <a class="tab" href="${indexHref}">
                <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
                  <path fill="currentColor" d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                </svg>
                <span>功能清单</span>
              </a>
              <button type="button" class="tab active">${tabLabel}<span class="tab-x">×</span></button>
            </div>
            <button type="button" class="tabs-close" aria-label="关闭标签">×</button>
          </div>
          <div class="page-body${flush ? " is-flush" : ""}" id="page-body"></div>
        </main>
      </div>
    </div>
  `;

  const navPrimary = root.querySelector(".nav-primary");
  const navSecondary = root.querySelector(".nav-secondary");
  const pageBody = root.querySelector("#page-body");

  ADMIN_NAV.primary.forEach((item) => {
    const firstDone = (item.children || []).find((c) => c.status === "done");
    const btn = document.createElement("a");
    btn.href = firstDone ? resolveHref(firstDone.href) : comingSoonHref(item.label, "", item.id);
    btn.className = `nav-item${item.id === primaryId ? " active" : ""}`;
    btn.dataset.nav = item.id;
    btn.innerHTML = `<span class="nav-ico" aria-hidden="true">${ADMIN_ICONS[item.icon] || ""}</span><span>${item.label}</span>`;
    navPrimary.appendChild(btn);
  });

  children.forEach((child) => {
    const a = document.createElement("a");
    a.className = `sub-item${child.id === subId ? " active" : ""}${child.status === "todo" ? " is-todo" : ""}`;
    a.href =
      child.status === "done"
        ? resolveHref(child.href)
        : comingSoonHref(child.label, child.seq, primaryId);
    if (child.status !== "done") a.title = "待设计";
    a.textContent = child.label;
    navSecondary.appendChild(a);
  });

  if (pageTpl) {
    pageBody.appendChild(pageTpl.content.cloneNode(true));
  }

  window.__ADMIN_READY__ = true;
  // 延后到微任务，确保同页后续脚本已注册 admin:ready 监听
  queueMicrotask(() => {
    document.dispatchEvent(new CustomEvent("admin:ready"));
  });
})();
