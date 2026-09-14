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
    }, 1600);
  }

  function syncTime() {
    const el = document.querySelector(".status-time");
    if (!el) return;
    const n = new Date();
    el.textContent = `${String(n.getHours()).padStart(2, "0")}:${String(n.getMinutes()).padStart(2, "0")}`;
  }
  syncTime();

  const redirect = new URLSearchParams(location.search).get("redirect") || "./member.html";

  document.getElementById("btnBack")?.addEventListener("click", () => {
    history.length > 1 ? history.back() : (location.href = "./mine.html");
  });

  function doLogin(phone, name) {
    const res = MemberStore.login({ phone, name });
    if (!res.ok) {
      toast(res.message || "登录失败");
      return;
    }
    toast(res.member.levelName ? `欢迎回来，${res.member.levelName}` : "登录成功");
    setTimeout(() => {
      location.href = redirect;
    }, 500);
  }

  document.getElementById("btnLogin")?.addEventListener("click", () => {
    doLogin(document.getElementById("phone")?.value, document.getElementById("name")?.value);
  });

  document.getElementById("btnDemo")?.addEventListener("click", () => {
    document.getElementById("phone").value = "13800001234";
    document.getElementById("name").value = "安辉";
    doLogin("13800001234", "安辉");
  });
})();
