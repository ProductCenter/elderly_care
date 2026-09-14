(() => {
  const toastEl = document.getElementById("toast");
  let toastTimer;

  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.hidden = false;
    requestAnimationFrame(() => toastEl.classList.add("show"));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastEl.classList.remove("show");
      setTimeout(() => {
        toastEl.hidden = true;
      }, 200);
    }, 1500);
  }

  function syncTime() {
    const el = document.querySelector(".status-time");
    if (!el) return;
    const n = new Date();
    el.textContent = `${String(n.getHours()).padStart(2, "0")}:${String(
      n.getMinutes()
    ).padStart(2, "0")}`;
  }
  syncTime();
  setInterval(syncTime, 30_000);

  function refreshCounts() {
    const orders = VerifyCode.listOrders();
    const paidCount = orders.filter((o) => o.status === "paid").length;
    const badge = document.getElementById("badgePaid");
    if (badge) badge.dataset.count = String(Math.min(paidCount, 99));
    const countEl = document.getElementById("orderCount");
    if (countEl) countEl.textContent = `${orders.length} 笔`;
  }

  function renderMember() {
    const m = window.MemberStore ? MemberStore.current() : null;
    const avatar = document.getElementById("profileAvatar");
    const name = document.getElementById("profileName");
    const station = document.getElementById("profileStation");
    const level = document.getElementById("profileLevel");
    const dot = document.getElementById("profileDot");
    const btn = document.getElementById("btnProfile");
    const entry = document.getElementById("memberEntry");
    const extra = document.getElementById("memberExtra");

    if (!m) {
      if (avatar) avatar.textContent = "会";
      if (name) name.textContent = "未登录";
      if (station) station.textContent = "登录后享受会员折扣与积分";
      if (level) {
        level.hidden = true;
        level.textContent = "";
      }
      if (dot) dot.hidden = true;
      if (btn) btn.textContent = "登录";
      if (entry) entry.hidden = true;
      if (extra) extra.textContent = "未登录";
      return;
    }

    if (avatar) avatar.textContent = m.avatarText || m.name.slice(0, 1);
    if (name) name.textContent = m.name;
    if (station) station.textContent = m.station || "春风社区中心站";
    if (level) {
      level.hidden = false;
      level.textContent = m.levelName;
    }
    if (dot) dot.hidden = false;
    if (btn) btn.textContent = "会员";
    if (entry) entry.hidden = false;
    document.getElementById("stripLevel").textContent = m.levelName;
    document.getElementById("stripPoints").textContent = `${m.points} 积分 · 成长值 ${m.growth}`;
    if (extra) extra.textContent = `${m.points} 分`;
  }

  refreshCounts();
  renderMember();

  document.getElementById("btnProfile")?.addEventListener("click", () => {
    if (MemberStore.current()) location.href = "./member.html";
    else location.href = "./member-login.html?redirect=" + encodeURIComponent("./mine.html");
  });
  document.getElementById("btnAddress")?.addEventListener("click", () => {
    toast("收货地址管理");
  });
  document.getElementById("btnCoupon")?.addEventListener("click", () => {
    toast("优惠券");
  });
  document.getElementById("btnService")?.addEventListener("click", () => {
    toast("客服热线 400-000-0000");
  });
  document.getElementById("btnAbout")?.addEventListener("click", () => {
    toast("春风康养 · 社区健康服务");
  });
  document.getElementById("tabHealth")?.addEventListener("click", (e) => {
    e.preventDefault();
    toast("健康页面开发中");
  });
})();
