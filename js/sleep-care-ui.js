/** 睡眠闭环页共用 UI 工具 */
(function (global) {
  function tickTime(el) {
    if (!el) return;
    const now = new Date();
    el.textContent = `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes()
    ).padStart(2, "0")}`;
  }

  function toastFactory(toastEl) {
    let timer;
    return function toast(message) {
      if (!toastEl) return;
      toastEl.textContent = message;
      toastEl.hidden = false;
      requestAnimationFrame(() => toastEl.classList.add("show"));
      clearTimeout(timer);
      timer = setTimeout(() => {
        toastEl.classList.remove("show");
        setTimeout(() => {
          toastEl.hidden = true;
        }, 200);
      }, 1600);
    };
  }

  function bindBack(btn, fallback) {
    btn?.addEventListener("click", () => {
      if (history.length > 1) history.back();
      else location.href = fallback || "./mine.html";
    });
  }

  function qs(name) {
    return new URLSearchParams(location.search).get(name);
  }

  function phoneShell(title, backFallback) {
    tickTime(document.getElementById("statusTime"));
    bindBack(document.getElementById("btnBack"), backFallback);
    document.title = title;
  }

  function fulfillLabel(f) {
    return (
      {
        IN_STORE: "到店",
        AT_HOME: "到家",
        ONLINE: "线上",
        DELIVERY: "配送",
        SELF: "自我管理",
      }[f] || f
    );
  }

  global.SleepCareUI = {
    tickTime,
    toastFactory,
    bindBack,
    qs,
    phoneShell,
    fulfillLabel,
  };
})(window);
