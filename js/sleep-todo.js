(() => {
  const UI = window.SleepCareUI;
  const Care = window.SleepCare;
  const toast = UI.toastFactory(document.getElementById("toast"));
  UI.phoneShell("今日待办", "./mine.html");
  const root = document.getElementById("root");
  let todos = JSON.parse(JSON.stringify(Care.DEMO_TODOS));

  function render() {
    const done = todos.filter((t) => t.status === "done").length;
    const total = todos.length;
    const mins = 45;
    root.innerHTML = `
      <nav class="sub-nav" aria-label="睡眠闭环导航">
        <a class="on" href="./sleep-todo.html">待办</a>
        <a href="./sleep-calendar.html">日历</a>
        <a href="./sleep-appoint.html">预约核销</a>
        <a href="./sleep-forecast.html">今晚预测</a>
        <a href="./sleep-entitlements.html">我的权益</a>
      </nav>

      <section class="todo-hero">
        <h2>今天 ${total - done} 件事，预计 ${mins} 分钟</h2>
        <p>不用思考，按时间做完即可。完成会自动回写计划与日历。</p>
      </section>

      <div class="progress-pair">
        <div class="p"><strong>${Math.round((done / total) * 100)}%</strong><span>今日完成</span></div>
        <div class="p"><strong>71%</strong><span>本周完成</span></div>
        <div class="p"><strong>5</strong><span>连续达标天</span></div>
      </div>

      ${todos
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
        .join("")}

      <button type="button" class="btn-ghost" id="btnDown" style="width:100%;margin:8px 0 16px">今天状态不好？一键降级任务</button>
      <a class="scheme-card" href="./sleep-forecast.html" style="box-shadow:none">
        <div class="sc-kicker">服务后反馈</div>
        <h3 style="font-size:16px">今晚预测已生成</h3>
        <p class="sc-one">做完到店服务后 5 分钟内可查看「今晚会变好多少」</p>
        <span class="sc-cta">去看看</span>
      </a>
    `;

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
      todos = todos.map((t, i) => (i === 0 || t.status === "done" ? t : { ...t, status: "done", action: "已降级跳过" }));
      toast("已保留核心 1 项，其余今日降级");
      render();
    });
  }

  render();
})();
