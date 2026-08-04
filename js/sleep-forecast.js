(() => {
  const UI = window.SleepCareUI;
  const Care = window.SleepCare;
  const toast = UI.toastFactory(document.getElementById("toast"));
  UI.phoneShell("今晚预测", "./sleep-todo.html");
  const f = Care.DEMO_FORECAST;
  const root = document.getElementById("root");
  let tab = "tonight";

  function render() {
    root.innerHTML = `
      <nav class="sub-nav">
        <a href="./sleep-todo.html">待办</a>
        <a href="./sleep-calendar.html">日历</a>
        <a href="./sleep-appoint.html">预约核销</a>
        <a class="on" href="./sleep-forecast.html">今晚预测</a>
        <a href="./sleep-entitlements.html">我的权益</a>
      </nav>

      <div class="cal-tabs">
        <button type="button" class="${tab === "tonight" ? "on" : ""}" data-t="tonight">即时预测</button>
        <button type="button" class="${tab === "morning" ? "on" : ""}" data-t="morning">晨间对照</button>
      </div>

      ${
        tab === "tonight"
          ? `
        <section class="sr-card">
          <div class="forecast-score">
            <div class="score-ring"><div><strong>${f.predictedScore}</strong><div><span>分</span></div></div></div>
            <h2>今晚预测睡眠质量 ${f.predictedScore} 分</h2>
            <p>近 7 天均值 ${f.baseline7d} 分，↑${f.delta}</p>
          </div>
          <div class="edit-row"><span>放松度</span><strong style="color:var(--sr-low)">${f.relaxLevel}</strong></div>
          <p class="section-note">${f.relaxDetail}</p>
          <div class="edit-row"><span>预测置信度</span><span>${f.confidence}（${f.confidenceNote}）</span></div>
        </section>

        <section class="sr-card">
          <div class="sr-card-hd"><h2>归因拆解</h2></div>
          <div class="attr-list">
            ${f.attribution
              .map(
                (a) => `<div class="attr-row"><span>${a.name}</span><span class="${a.delta >= 0 ? "up" : "down"}">${a.delta >= 0 ? "+" : ""}${a.delta}</span></div>`
              )
              .join("")}
          </div>
          <p class="section-note" style="margin-top:10px">⚠️ 今天下午摄入咖啡因，可能抵消约 4 分</p>
        </section>

        <section class="sr-card">
          <div class="sr-card-hd"><h2>今晚行动</h2></div>
          <div class="action-links">
            ${f.actions.map((a) => `<a href="${a.href}"><span>${a.text}</span><span>›</span></a>`).join("")}
          </div>
        </section>
        `
          : `
        <section class="sr-card">
          <div class="forecast-score">
            <h2>昨晚预测 ${f.morning.predicted}，实际 ${f.morning.actual}</h2>
            <p>偏差 ${f.morning.absError} 分，预测准确</p>
          </div>
          <article class="metric">
            <h3 class="metric-hd">入睡用时：<span>${f.morning.latency}</span></h3>
            <p>${f.morning.tip}</p>
          </article>
        </section>
        <section class="sr-card">
          <div class="sr-card-hd"><h2>维持建议</h2></div>
          <p class="diag-text">保持每周六疗愈节奏；本周深睡仍偏低，建议增加日间步数。</p>
        </section>
        `
      }

      <div style="display:flex;gap:8px;margin-bottom:12px">
        <button type="button" class="btn-ghost" id="btnBad" style="flex:1">我觉得不准</button>
        <button type="button" class="btn-ghost" id="btnQuick" style="flex:1">3 题快问</button>
      </div>

      <aside class="disclaimer">
        <div class="disclaimer-hd"><span class="warn-icon">!</span>重要提示</div>
        <p>本预测基于你的行为与体征数据估算，参考值，非医学诊断。禁止理解为「保证今晚睡好」。</p>
      </aside>
    `;

    root.querySelectorAll("[data-t]").forEach((b) => {
      b.addEventListener("click", () => {
        tab = b.getAttribute("data-t");
        render();
      });
    });
    document.getElementById("btnBad")?.addEventListener("click", () => toast("已记录反馈，进入模型评估队列"));
    document.getElementById("btnQuick")?.addEventListener("click", () => toast("放松程度 / 身体感受 / 困倦程度（可跳过）"));
  }

  render();
})();
