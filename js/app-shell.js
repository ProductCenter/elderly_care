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

  // 同步 tabbar 当前页高亮
  const currentPath = location.pathname.split("/").pop() || "index.html";
  const tabSelectors = ".tab, .tab-item";
  phone.querySelectorAll(tabSelectors).forEach((tab) => {
    const href = tab.getAttribute("href") || "";
    const target = href.split("/").pop() || "";
    if (target === currentPath || (currentPath === "" && target === "index.html")) {
      tab.classList.add("active");
      tab.setAttribute("aria-current", "page");
    }
  });
})();
