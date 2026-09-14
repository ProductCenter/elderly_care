(() => {
  const UI = window.SleepCareUI;
  const Care = window.SleepCare;
  const toast = UI.toastFactory(document.getElementById("toast"));
  UI.phoneShell("睡眠日历", "./mine.html");

  const root = document.getElementById("root");
  const TODAY = Care.DEMO_TODAY || "2026-08-04";
  const YEAR = 2026;
  const MONTH = 8; // 1-12

  let todos = JSON.parse(JSON.stringify(Care.DEMO_TODOS));
  let selected = TODAY;
  let monthCursor = { y: YEAR, m: MONTH };

  const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];
  const TYPE_LABEL = { store: "到店", home: "居家", food: "膳食", sport: "运动", check: "检测" };

  function pad(n) {
    return String(n).padStart(2, "0");
  }

  function toKey(y, m, d) {
    return `${y}-${pad(m)}-${pad(d)}`;
  }

  function mdFromKey(key) {
    return key.slice(5); // MM-DD
  }

  function parseKey(key) {
    const [y, m, d] = key.split("-").map(Number);
    return { y, m, d };
  }

  function dayMap() {
    const map = {};
    (Care.DEMO_CALENDAR || []).forEach((day) => {
      map[`${YEAR}-${day.date}`] = day;
    });
    return map;
  }

  function dayTone(day) {
    if (!day || !day.items?.length) return "";
    const items = day.items;
    if (items.some((i) => i.status === "pending_confirm" || i.type === "store")) return "store";
    if (items.every((i) => i.status === "done")) return "done";
    if (items.some((i) => i.status === "missed")) return "missed";
    if (items.some((i) => i.status === "doing")) return "doing";
    return "busy";
  }

  function buildMonthCells(y, m) {
    const first = new Date(y, m - 1, 1);
    const startWeekday = first.getDay();
    const daysInMonth = new Date(y, m, 0).getDate();
    const prevDays = new Date(y, m - 1, 0).getDate();
    const map = dayMap();
    const cells = [];

    for (let i = 0; i < startWeekday; i++) {
      const d = prevDays - startWeekday + 1 + i;
      const pm = m === 1 ? 12 : m - 1;
      const py = m === 1 ? y - 1 : y;
      cells.push({ key: toKey(py, pm, d), day: d, muted: true, data: map[toKey(py, pm, d)] });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const key = toKey(y, m, d);
      cells.push({ key, day: d, muted: false, data: map[key] });
    }
    while (cells.length % 7 !== 0) {
      const d = cells.length - (startWeekday + daysInMonth) + 1;
      const nm = m === 12 ? 1 : m + 1;
      const ny = m === 12 ? y + 1 : y;
      cells.push({ key: toKey(ny, nm, d), day: d, muted: true, data: map[toKey(ny, nm, d)] });
    }
    return cells;
  }

  function selectedLabel(key) {
    const { y, m, d } = parseKey(key);
    const data = dayMap()[key];
    const wd = data?.weekday || `周${WEEKDAYS[new Date(y, m - 1, d).getDay()]}`;
    if (key === TODAY) return `今天 ${m}月${d}日 · ${wd}`;
    return `${m}月${d}日 · ${wd}`;
  }

  function todayStats() {
    const done = todos.filter((t) => t.status === "done").length;
    const total = todos.length;
    const left = total - done;
    return { done, total, left, pct: total ? Math.round((done / total) * 100) : 0 };
  }

  function weekDoneRate() {
    const map = dayMap();
    let doneDays = 0;
    let tracked = 0;
    for (let d = 1; d <= 4; d++) {
      const day = map[toKey(YEAR, MONTH, d)];
      if (!day?.items?.length) continue;
      tracked += 1;
      if (day.items.every((i) => i.status === "done") || (d === 4 && todayStats().left === 0)) doneDays += 1;
    }
    if (todayStats().pct >= 50) doneDays = Math.max(doneDays, 2);
    return tracked ? Math.round((Math.min(doneDays + 1, 5) / 5) * 100) : 71;
  }

  function renderTodosForDay(key) {
    if (key === TODAY) {
      return todos
        .map((t) => {
          const doneCls = t.status === "done" ? "done" : "";
          return `<article class="todo-item ${doneCls}" data-id="${t.id}">
            <div class="todo-check" aria-hidden="true"></div>
            <div class="todo-main">
              <h3>${t.name}</h3>
              <p>${t.time}${t.progressText ? " · " + t.progressText : ""}</p>
              ${
                t.progress != null
                  ? `<div class="bar"><i style="width:${Math.round(t.progress * 100)}%"></i></div>`
                  : ""
              }
            </div>
            <button type="button" class="todo-action" data-act="${t.id}">${t.action}</button>
          </article>`;
        })
        .join("");
    }

    const day = dayMap()[key];
    if (!day?.items?.length) {
      return `<div class="cal-empty">这天暂无安排，点选其他日期或查看本周排期。</div>`;
    }

    return day.items
      .map((it) => {
        const st =
          it.status === "done"
            ? "已完成"
            : it.status === "missed"
              ? "已错过"
              : it.status === "pending_confirm"
                ? "待确认预约"
                : "已排期";
        const cls = [
          "todo-item",
          "cal-linked",
          it.status === "done" ? "done" : "",
          it.status === "missed" ? "missed" : "",
          it.type === "store" ? "is-store" : "",
        ]
          .filter(Boolean)
          .join(" ");
        const action =
          it.type === "store" && it.status === "pending_confirm"
            ? `<a class="todo-action" href="./sleep-appoint.html">去预约</a>`
            : it.type === "store"
              ? `<a class="todo-action" href="./sleep-appoint.html">查看</a>`
              : `<span class="todo-tag">${st}</span>`;
        return `<article class="${cls}">
          <div class="todo-type ${it.type}" aria-hidden="true">${TYPE_LABEL[it.type] || "任务"}</div>
          <div class="todo-main">
            <h3>${it.name}</h3>
            <p>${it.time}${it.reason ? " · " + it.reason : ""}</p>
            ${it.status === "pending_confirm" ? `<span class="badge-soft">待确认预约</span>` : ""}
          </div>
          ${action}
        </article>`;
      })
      .join("");
  }

  function shiftMonth(delta) {
    let { y, m } = monthCursor;
    m += delta;
    if (m < 1) {
      m = 12;
      y -= 1;
    }
    if (m > 12) {
      m = 1;
      y += 1;
    }
    monthCursor = { y, m };
    render();
  }

  function syncCellSize() {
    const grid = root.querySelector(".cal-grid");
    const cell = grid?.querySelector(".cal-cell");
    if (!grid || !cell) return;
    const w = cell.getBoundingClientRect().width;
    if (w > 0) grid.style.setProperty("--cal-cell-size", `${Math.round(w * 100) / 100}px`);
  }

  function render() {
    const stats = todayStats();
    const cells = buildMonthCells(monthCursor.y, monthCursor.m);
    const isTodaySelected = selected === TODAY;
    const selDay = dayMap()[selected];
    const selCount = isTodaySelected ? todos.length : selDay?.items?.length || 0;

    root.innerHTML = `
      <nav class="sub-nav" aria-label="睡眠闭环导航">
        <a class="on" href="./sleep-todo.html">日历</a>
        <a href="./sleep-appoint.html">预约核销</a>
        <a href="./sleep-forecast.html">今晚预测</a>
        <a href="./sleep-entitlements.html">我的权益</a>
      </nav>

      <section class="cal-board" aria-label="月历">
        <div class="cal-toolbar">
          <button type="button" class="cal-nav-btn" id="btnPrev" aria-label="上一月">‹</button>
          <h2 class="cal-month">${monthCursor.y}年${monthCursor.m}月</h2>
          <button type="button" class="cal-nav-btn" id="btnNext" aria-label="下一月">›</button>
        </div>

        <div class="cal-weekdays" aria-hidden="true">
          ${WEEKDAYS.map((w) => `<span>${w}</span>`).join("")}
        </div>

        <div class="cal-grid" role="grid" aria-label="${monthCursor.y}年${monthCursor.m}月">
          ${cells
            .map((c) => {
              const tone = dayTone(c.data);
              const count = c.data?.items?.length || 0;
              const cls = [
                "cal-cell",
                c.muted ? "is-muted" : "",
                c.key === TODAY ? "is-today" : "",
                c.key === selected ? "is-selected" : "",
                tone ? `tone-${tone}` : "",
                count ? "has-events" : "",
              ]
                .filter(Boolean)
                .join(" ");
              return `<div class="${cls}" data-day="${c.key}" role="button" tabindex="0" aria-pressed="${
                c.key === selected
              }">
                <span class="num">${c.day}</span>
                ${
                  count
                    ? `<span class="dots" aria-hidden="true">${"<i></i>".repeat(Math.min(count, 3))}</span>`
                    : `<span class="dots" aria-hidden="true"><i class="ghost"></i></span>`
                }
              </div>`;
            })
            .join("")}
        </div>

        <div class="cal-legend" aria-hidden="true">
          <span><i class="lg done"></i>已完成</span>
          <span><i class="lg busy"></i>有安排</span>
          <span><i class="lg store"></i>到店</span>
          <span><i class="lg missed"></i>错过</span>
        </div>
      </section>

      <section class="cal-day-panel">
        <div class="cal-day-hd">
          <div>
            <h3>${selectedLabel(selected)}</h3>
            <p>${
              isTodaySelected
                ? `还剩 ${stats.left} 件事 · 预计 45 分钟`
                : selCount
                  ? `共 ${selCount} 项安排`
                  : "暂无安排"
            }</p>
          </div>
          ${
            isTodaySelected
              ? `<div class="cal-day-ring" aria-label="今日完成 ${stats.pct}%">
                  <strong>${stats.pct}%</strong>
                  <span>完成</span>
                </div>`
              : `<a class="cal-jump-today" href="#" id="jumpToday">回今天</a>`
          }
        </div>

        ${
          isTodaySelected
            ? `<div class="progress-pair compact">
                <div class="p"><strong>${stats.done}/${stats.total}</strong><span>今日</span></div>
                <div class="p"><strong>${weekDoneRate()}%</strong><span>本周</span></div>
                <div class="p"><strong>5</strong><span>连续天</span></div>
              </div>`
            : ""
        }

        <div class="cal-day-list">
          ${renderTodosForDay(selected)}
        </div>

        ${
          isTodaySelected
            ? `<button type="button" class="btn-ghost" id="btnDown" style="width:100%;margin:4px 0 12px">今天状态不好？一键降级任务</button>`
            : ""
        }

        <a class="scheme-card" href="./sleep-forecast.html" style="box-shadow:none;margin-bottom:16px">
          <div class="sc-kicker">服务后反馈</div>
          <h3 style="font-size:16px">今晚预测已生成</h3>
          <p class="sc-one">做完到店服务后 5 分钟内可查看「今晚会变好多少」</p>
          <span class="sc-cta">去看看</span>
        </a>
      </section>
    `;

    document.getElementById("btnPrev")?.addEventListener("click", () => shiftMonth(-1));
    document.getElementById("btnNext")?.addEventListener("click", () => shiftMonth(1));
    document.getElementById("jumpToday")?.addEventListener("click", (e) => {
      e.preventDefault();
      selected = TODAY;
      monthCursor = { y: YEAR, m: MONTH };
      render();
    });

    root.querySelectorAll("[data-day]").forEach((btn) => {
      const pick = () => {
        selected = btn.getAttribute("data-day");
        render();
        root.querySelector(".cal-day-panel")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      };
      btn.addEventListener("click", pick);
      btn.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          pick();
        }
      });
    });

    root.querySelectorAll("[data-act]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-act");
        const item = todos.find((t) => t.id === id);
        if (!item || item.status === "done") return;
        if (item.actionType === "play") toast("开始播放 8 分钟呼吸训练…");
        if (item.actionType === "checkin") toast("打卡成功");
        if (item.actionType === "progress") toast("已从手环同步步数");
        item.status = "done";
        item.action = "已完成";
        if (item.progress != null) {
          item.progress = 1;
          item.progressText = "已完成";
        }
        render();
      });
    });

    document.getElementById("btnDown")?.addEventListener("click", () => {
      todos = todos.map((t, i) =>
        i === 0 || t.status === "done" ? t : { ...t, status: "done", action: "已降级跳过" }
      );
      toast("已保留核心 1 项，其余今日降级");
      render();
    });

    syncCellSize();
    requestAnimationFrame(syncCellSize);
  }

  window.addEventListener("resize", syncCellSize);
  render();
})();
