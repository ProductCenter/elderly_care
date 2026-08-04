(() => {
  const UI = window.SleepCareUI;
  const Care = window.SleepCare;
  const toast = UI.toastFactory(document.getElementById("toast"));
  UI.phoneShell("家庭日历", "./sleep-todo.html");
  const root = document.getElementById("root");
  let view = "week";

  function typeLabel(t) {
    return { store: "到店", home: "居家", food: "膳食", sport: "运动", check: "检测" }[t] || t;
  }

  function render() {
    root.innerHTML = `
      <nav class="sub-nav">
        <a href="./sleep-todo.html">待办</a>
        <a class="on" href="./sleep-calendar.html">日历</a>
        <a href="./sleep-appoint.html">预约核销</a>
        <a href="./sleep-forecast.html">今晚预测</a>
        <a href="./sleep-entitlements.html">我的权益</a>
      </nav>

      <div class="cal-tabs">
        <button type="button" class="${view === "week" ? "on" : ""}" data-v="week">周视图</button>
        <button type="button" class="${view === "day" ? "on" : ""}" data-v="day">日视图</button>
        <button type="button" class="${view === "month" ? "on" : ""}" data-v="month">月视图</button>
      </div>

      <p class="section-note">成员：李长乐（演示）。到店事件确认预约前显示「待确认」。</p>

      ${Care.DEMO_CALENDAR.map((day) => {
        if (view === "day" && day.date !== "08-08") return "";
        return `<section class="cal-day">
          <div class="cal-day-hd"><strong>${day.date}</strong><span>${day.weekday}</span></div>
          ${day.items
            .map(
              (it) => `<article class="cal-event ${it.type}">
              <div class="t">${it.time}</div>
              <div class="body">
                <h4>${it.name}</h4>
                <p>${typeLabel(it.type)}${it.reason ? " · " + it.reason : ""}</p>
                ${it.status === "pending_confirm" ? `<span class="badge-soft">待确认预约</span>` : ""}
              </div>
            </article>`
            )
            .join("")}
        </section>`;
      }).join("")}

      ${
        view === "month"
          ? `<section class="sr-card"><div class="sr-card-hd"><h2>本月密度</h2></div>
          <div class="week-grid">${Array.from({ length: 28 }, (_, i) => {
            const dens = [0, 1, 2, 3, 2, 4, 1][i % 7];
            return `<div class="week-cell ${dens > 2 ? "on" : ""}">${i + 1}</div>`;
          }).join("")}</div></section>`
          : ""
      }

      <button type="button" class="btn-ghost" id="btnIcal" style="width:100%;margin-bottom:16px">导出 iCal 订阅链接</button>
    `;

    root.querySelectorAll("[data-v]").forEach((b) => {
      b.addEventListener("click", () => {
        view = b.getAttribute("data-v");
        render();
      });
    });
    document.getElementById("btnIcal")?.addEventListener("click", () => {
      toast("已复制订阅链接（演示）");
    });
    root.querySelectorAll(".cal-event.store").forEach((el) => {
      el.addEventListener("click", () => {
        location.href = "./sleep-appoint.html";
      });
    });
  }

  render();
})();
