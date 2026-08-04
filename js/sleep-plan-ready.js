(() => {
  const UI = window.SleepCareUI;
  const Care = window.SleepCare;
  const toast = UI.toastFactory(document.getElementById("toast"));
  const state = Care.loadState();
  const order = state.order || {};
  const pkg = Care.getPackage(order.packageId || "SP_ONSET_ANXIETY_8W");
  const root = document.getElementById("root");
  UI.phoneShell("计划已就绪", "./sleep-todo.html");

  root.innerHTML = `
    <section class="list-hero">
      <h2>健康计划已生成</h2>
      <p>目标：${pkg?.durationWeeks || 8} 周改善入睡体验。请确认起始日与偏好，确认后写入家庭日历。</p>
    </section>

    <section class="sr-card">
      <div class="sr-card-hd"><h2>计划总览</h2></div>
      <div class="edit-row"><span>订单号</span><span>${order.orderId || "—"}</span></div>
      <div class="edit-row"><span>方案</span><span>${pkg?.title || "—"}</span></div>
      <div class="edit-row"><span>开始日</span><span>${order.startDate || "—"}</span></div>
      <div class="edit-row"><span>门店</span><span>${order.store || "—"}</span></div>
      <div class="edit-row"><span>可到店</span><span>${(order.slots || []).join(" / ") || "—"}</span></div>
      <div class="edit-row"><span>上床时间</span><span>${order.bedtime || "22:45"}</span></div>
    </section>

    <section class="sr-card">
      <div class="sr-card-hd"><h2>阶段目标</h2></div>
      <div class="stage-list">
        ${(pkg?.stages || [])
          .map(
            (s) => `<div class="stage-item"><strong>${s.name} · ${s.weeks}</strong><span>${s.goal}</span></div>`
          )
          .join("")}
      </div>
    </section>

    <section class="sr-card">
      <div class="sr-card-hd"><h2>第一周日程预览</h2></div>
      <div class="day-list">
        ${(pkg?.weekPreview || Care.DEMO_CALENDAR.slice(0, 7).map((d) => ({ day: d.weekday, tasks: d.items.map((i) => i.name) })))
          .map((d) => `<div class="day-row"><strong>${d.day}</strong><p>${(d.tasks || []).join(" · ")}</p></div>`)
          .join("")}
      </div>
    </section>

    <p class="section-note">48 小时未确认将自动生效并通知。权益与任务一一对应，退款会同步清理日历。</p>

    <div style="display:flex;gap:8px;margin:12px 0 20px">
      <button type="button" class="btn-ghost" id="btnAdjust" style="flex:1">一键调整</button>
      <button type="button" class="btn-primary" id="btnConfirm" style="flex:1">确认并开启</button>
    </div>
  `;

  document.getElementById("btnAdjust")?.addEventListener("click", () => {
    toast("可改到店时间 / 整体延后 / 降低任务密度");
  });
  document.getElementById("btnConfirm")?.addEventListener("click", () => {
    Care.saveState({ planStatus: "active", planConfirmedAt: Date.now() });
    toast("计划已生效");
    setTimeout(() => {
      location.href = "./sleep-todo.html";
    }, 600);
  });
})();
