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

  let member = MemberStore.current();
  if (!member) {
    location.href = `./member-login.html?redirect=${encodeURIComponent("./member.html")}`;
    return;
  }

  function fmtTime(ts) {
    if (!ts) return "";
    const d = new Date(ts);
    const p = (n) => String(n).padStart(2, "0");
    return `${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
  }

  function render() {
    member = MemberStore.current() || MemberStore.getMember(member.id);
    if (!member) {
      location.href = "./member-login.html";
      return;
    }
    document.getElementById("mcLevel").textContent = member.levelName;
    document.getElementById("mcLevel").style.color = member.levelColor || "";
    document.getElementById("mcName").textContent = member.name;
    document.getElementById("mcPoints").textContent = String(member.points || 0);
    document.getElementById("mcBar").style.width = `${member.levelProgress || 0}%`;
    document.getElementById("mcProgressText").textContent = member.nextLevelName
      ? `距 ${member.nextLevelName} 还需成长值 ${member.nextLevelNeed}`
      : "已达最高等级";
    document.getElementById("mcMeta").textContent = `成长值 ${member.growth} · 折扣 ${
      member.discount / 10
    } 折 · ${member.station || ""}`;

    document.getElementById("perkList").innerHTML = (member.perks || [])
      .map((p) => `<li>${p}</li>`)
      .join("") || "<li>暂无权益</li>";

    document.getElementById("levelList").innerHTML = MemberStore.getLevels()
      .map(
        (lv) =>
          `<li class="${lv.id === member.levelId ? "is-current" : ""}">
            <strong>${lv.name}</strong>
            <span>成长值 ≥ ${lv.minGrowth} · ${lv.discount / 10} 折 · 积分 ×${lv.pointsRate}</span>
          </li>`
      )
      .join("");

    const ledger = MemberStore.listLedger(member.id).slice(0, 20);
    document.getElementById("ledgerList").innerHTML = ledger.length
      ? ledger
          .map(
            (x) =>
              `<li>
                <div>
                  <strong>${x.reason || "积分变动"}</strong>
                  <span>${fmtTime(x.createdAt)}</span>
                </div>
                <em class="${Number(x.points) >= 0 ? "plus" : "minus"}">${
                Number(x.points) >= 0 ? "+" : ""
              }${x.points}</em>
              </li>`
          )
          .join("")
      : "<li class='empty'>暂无积分明细</li>";
  }

  document.getElementById("btnBack")?.addEventListener("click", () => {
    location.href = "./mine.html";
  });
  document.getElementById("btnRefreshLedger")?.addEventListener("click", () => {
    render();
    toast("已刷新");
  });
  document.getElementById("btnLogout")?.addEventListener("click", () => {
    MemberStore.logout();
    location.href = "./mine.html";
  });

  render();
})();
