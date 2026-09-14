window.AdminUI = {
  openDrawer(id) {
    document.getElementById(id)?.classList.add("open");
    document.querySelector(`[data-drawer-mask="${id}"]`)?.classList.add("open");
    document.body.classList.add("drawer-open");
  },
  closeDrawer(id) {
    document.getElementById(id)?.classList.remove("open");
    document.querySelector(`[data-drawer-mask="${id}"]`)?.classList.remove("open");
    if (!document.querySelector(".drawer.open")) {
      document.body.classList.remove("drawer-open");
    }
    document.dispatchEvent(new CustomEvent("admin:drawer-close", { detail: { id } }));
  },
  bindDrawer(id) {
    document.querySelectorAll(`[data-close-drawer="${id}"]`).forEach((el) => {
      el.addEventListener("click", () => this.closeDrawer(id));
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") this.closeDrawer(id);
    });
  },

  /** 页面脚本统一等待壳层就绪（避免 admin:ready 竞态） */
  onReady(fn) {
    let done = false;
    const run = () => {
      if (done) return;
      done = true;
      fn();
    };
    document.addEventListener("admin:ready", run);
    if (window.__ADMIN_READY__) queueMicrotask(run);
  },

  /** 轻提示：success | error | info */
  toast(message, type = "success", duration = 2200) {
    let host = document.getElementById("admin-toast-host");
    if (!host) {
      host = document.createElement("div");
      host.id = "admin-toast-host";
      host.className = "admin-toast-host";
      document.body.appendChild(host);
    }
    const el = document.createElement("div");
    el.className = `admin-toast admin-toast-${type}`;
    el.textContent = message;
    host.appendChild(el);
    requestAnimationFrame(() => el.classList.add("show"));
    setTimeout(() => {
      el.classList.remove("show");
      setTimeout(() => el.remove(), 220);
    }, duration);
  },

  /** Promise 确认框 */
  confirm(message, opts = {}) {
    const title = opts.title || "确认操作";
    const okText = opts.okText || "确定";
    const cancelText = opts.cancelText || "取消";
    const danger = opts.danger !== false;

    return new Promise((resolve) => {
      const mask = document.createElement("div");
      mask.className = "admin-confirm-mask";
      mask.innerHTML = `
        <div class="admin-confirm" role="dialog" aria-modal="true">
          <h4>${title}</h4>
          <p>${message}</p>
          <div class="admin-confirm-foot">
            <button type="button" class="btn btn-default" data-cancel>${cancelText}</button>
            <button type="button" class="btn ${danger ? "btn-danger" : "btn-primary"}" data-ok>${okText}</button>
          </div>
        </div>`;
      document.body.appendChild(mask);
      requestAnimationFrame(() => mask.classList.add("open"));

      const done = (ok) => {
        mask.classList.remove("open");
        setTimeout(() => mask.remove(), 180);
        resolve(ok);
      };
      mask.querySelector("[data-cancel]").onclick = () => done(false);
      mask.querySelector("[data-ok]").onclick = () => done(true);
      mask.addEventListener("click", (e) => {
        if (e.target === mask) done(false);
      });
    });
  },
};

/** 本地演示数据持久化 */
window.AdminStore = {
  key(name) {
    return `kangyang-admin:${name || location.pathname}`;
  },
  load(name, seed) {
    try {
      const raw = localStorage.getItem(this.key(name));
      if (!raw) return seed.slice ? seed.slice() : structuredClone?.(seed) ?? JSON.parse(JSON.stringify(seed));
      return JSON.parse(raw);
    } catch {
      return seed.slice ? seed.slice() : JSON.parse(JSON.stringify(seed));
    }
  },
  save(name, data) {
    try {
      localStorage.setItem(this.key(name), JSON.stringify(data));
    } catch (_) {
      /* quota / private mode */
    }
  },
  clear(name) {
    localStorage.removeItem(this.key(name));
  },
};
