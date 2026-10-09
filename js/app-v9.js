(() => {
  const $ = (id) => document.getElementById(id);
  const SITES = [
    "柳州市春风社区中心站",
    "春风康养 · 历下旗舰店",
    "春风康养 · 高新区店",
    "春风社区中心站 · 海淀店",
  ];

  const statusTime = $("statusTime");
  if (statusTime) statusTime.textContent = "9:41";

  const toastEl = $("toast");
  let toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastEl.hidden = true;
    }, 1600);
  }

  const mask = $("siteMask");
  const sheet = $("siteSheet");
  const list = $("siteList");
  const nameEl = $("siteName");

  function renderSites() {
    const cur = nameEl?.textContent || SITES[0];
    list.innerHTML = SITES.map(
      (name) =>
        `<button type="button" class="site-item${name === cur ? " on" : ""}" data-name="${name}">${name}</button>`
    ).join("");
  }

  function openSheet() {
    renderSites();
    mask.hidden = false;
    sheet.hidden = false;
  }

  function closeSheet() {
    mask.hidden = true;
    sheet.hidden = true;
  }

  $("btnSite")?.addEventListener("click", openSheet);
  $("siteSheetClose")?.addEventListener("click", closeSheet);
  mask?.addEventListener("click", closeSheet);
  list?.addEventListener("click", (e) => {
    const btn = e.target.closest(".site-item");
    if (!btn) return;
    if (nameEl) nameEl.textContent = btn.dataset.name;
    closeSheet();
    toast(`已切换至${btn.dataset.name}`);
  });

  document.querySelector(".capsule-more")?.addEventListener("click", () => toast("更多菜单"));
  document.querySelector(".capsule-home")?.addEventListener("click", () => toast("返回微信"));
})();
