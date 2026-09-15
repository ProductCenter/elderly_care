(() => {
  const UI = window.SleepCareUI;
  const Care = window.SleepCare;
  const toast = UI.toastFactory(document.getElementById("toast"));
  UI.phoneShell("预约核销", "./sleep-todo.html");

  const root = document.getElementById("root");
  const STORE = "春风康养 · 历下旗舰店";
  const SERVICES = [
    {
      elementId: "SE_TCM_HEAD_60",
      name: "头部疗愈 60 分钟",
      duration: 60,
      tip: "穿宽松衣物，到店前 1 小时勿饱食",
    },
    {
      elementId: "SE_FOOT_BATH_30",
      name: "足浴舒缓 30 分钟",
      duration: 30,
      tip: "建议穿易换鞋，服务后注意保暖",
    },
  ];

  const SLOT_DAYS = [
    {
      key: "2026-08-08",
      label: "本周六",
      dateLabel: "8月8日",
      slots: [
        { id: "s1", time: "15:00", seats: 2 },
        { id: "s2", time: "19:00", seats: 1, recommend: true },
        { id: "s3", time: "20:30", seats: 0 },
      ],
    },
    {
      key: "2026-08-09",
      label: "本周日",
      dateLabel: "8月9日",
      slots: [
        { id: "s4", time: "10:30", seats: 3 },
        { id: "s5", time: "15:00", seats: 2 },
        { id: "s6", time: "19:00", seats: 1 },
      ],
    },
    {
      key: "2026-08-15",
      label: "下周六",
      dateLabel: "8月15日",
      slots: [
        { id: "s7", time: "15:00", seats: 2 },
        { id: "s8", time: "19:00", seats: 2 },
      ],
    },
  ];

  const STEPS = ["选服务", "选时段", "确认预约", "到店核销", "完成"];

  let state = normalize(Care.loadState());
  let wizard = {
    step: state.phase === "idle" ? 0 : state.phase === "booked" ? 3 : 4,
    serviceId: state.appointment?.elementId || SERVICES[0].elementId,
    dayKey: state.appointment?.dayKey || "2026-08-08",
    slotId: state.appointment?.slotId || "s2",
  };
  let codeTick = 60;
  let codeValue = makeCode();
  let timer;

  function makeCode() {
    return "KY-" + Date.now().toString().slice(-6);
  }

  function getEntitlement(elementId) {
    const list = Care.loadState().entitlements || Care.DEMO_ENTITLEMENTS;
    return list.find((e) => e.elementId === elementId) || null;
  }

  function remainOf(elementId) {
    const e = getEntitlement(elementId);
    if (!e) return 0;
    return Math.max(0, (e.total || 0) - (e.used || 0) - (e.frozen || 0));
  }

  function normalize(raw) {
    const ap = raw.appointment ? { ...raw.appointment } : null;
    if (!ap) return { phase: "idle", appointment: null };
    if (!ap.time && ap.slot) {
      const parts = String(ap.slot).split(/\s+/);
      ap.weekdayLabel = parts[0] || "已约";
      ap.time = parts[1] || ap.slot;
      ap.dateLabel = ap.dateLabel || "预约日";
    }
    if (ap.status === "redeemed") return { phase: "done", appointment: ap };
    if (ap.status === "booked" || ap.status === "checked_in") {
      return { phase: "booked", appointment: ap };
    }
    return { phase: "idle", appointment: null };
  }

  function persist(patch) {
    Care.saveState(patch);
    state = normalize(Care.loadState());
  }

  function serviceById(id) {
    return SERVICES.find((s) => s.elementId === id) || SERVICES[0];
  }

  function dayByKey(key) {
    return SLOT_DAYS.find((d) => d.key === key) || SLOT_DAYS[0];
  }

  function slotById(dayKey, slotId) {
    return dayByKey(dayKey).slots.find((s) => s.id === slotId) || null;
  }

  function stepIndex() {
    if (state.phase === "done") return 4;
    if (state.phase === "booked") return 3;
    return Math.min(wizard.step, 2);
  }

  function renderSteps() {
    const cur = stepIndex();
    return `<ol class="flow-steps" aria-label="履约流程">
      ${STEPS.map((name, i) => {
        const cls = i < cur ? "done" : i === cur ? "on" : "";
        return `<li class="${cls}"><i>${i < cur ? "✓" : i + 1}</i><span>${name}</span></li>`;
      }).join("")}
    </ol>`;
  }

  function renderNav() {
    return `<nav class="sub-nav">
      <a href="./sleep-todo.html">日历</a>
      <a class="on" href="./sleep-appoint.html">预约核销</a>
      <a href="./sleep-forecast.html">今晚预测</a>
      <a href="./sleep-entitlements.html">我的权益</a>
    </nav>`;
  }

  function renderIdleWizard() {
    if (wizard.step === 0) return renderPickService();
    if (wizard.step === 1) return renderPickSlot();
    return renderConfirm();
  }

  function renderPickService() {
    return `
      <section class="flow-card">
        <div class="flow-card-hd">
          <h2>① 选择到店服务</h2>
          <p>预约成功会冻结 1 次权益，核销后转为已使用</p>
        </div>
        <div class="svc-list">
          ${SERVICES.map((s) => {
            const left = remainOf(s.elementId);
            const on = wizard.serviceId === s.elementId ? "on" : "";
            const disabled = left <= 0 ? "disabled" : "";
            return `<button type="button" class="svc-card ${on} ${disabled}" data-svc="${s.elementId}" ${
              left <= 0 ? "disabled" : ""
            }>
              <div class="svc-top">
                <strong>${s.name}</strong>
                <span class="svc-left">${left > 0 ? `剩余 ${left} 次` : "已用完"}</span>
              </div>
              <p>${s.duration} 分钟 · ${STORE}</p>
              <p class="svc-tip">${s.tip}</p>
            </button>`;
          }).join("")}
        </div>
        <button type="button" class="btn-primary flow-cta" id="btnNextService">下一步：选时段</button>
      </section>`;
  }

  function renderPickSlot() {
    const day = dayByKey(wizard.dayKey);
    return `
      <section class="flow-card">
        <div class="flow-card-hd">
          <h2>② 选择到店时段</h2>
          <p>仅展示有位时段；灰色为已满，可看最近可约</p>
        </div>
        <div class="day-tabs" id="dayTabs">
          ${SLOT_DAYS.map(
            (d) =>
              `<button type="button" class="day-tab ${d.key === wizard.dayKey ? "on" : ""}" data-day="${d.key}">
                <strong>${d.label}</strong><span>${d.dateLabel}</span>
              </button>`
          ).join("")}
        </div>
        <div class="slot-grid dense" id="slots">
          ${day.slots
            .map((s) => {
              const full = s.seats <= 0;
              const on = wizard.slotId === s.id && !full ? "on" : "";
              return `<button type="button" class="slot-chip ${on}" data-slot="${s.id}" ${
                full ? "disabled" : ""
              }>
                <strong>${s.time}</strong>
                <span>${full ? "已满" : s.recommend ? "推荐 · 余" + s.seats : "余 " + s.seats}</span>
              </button>`;
            })
            .join("")}
        </div>
        <div class="flow-actions">
          <button type="button" class="btn-ghost" id="btnBackStep">上一步</button>
          <button type="button" class="btn-primary" id="btnNextSlot">下一步：确认</button>
        </div>
      </section>`;
  }

  function renderConfirm() {
    const svc = serviceById(wizard.serviceId);
    const day = dayByKey(wizard.dayKey);
    const slot = slotById(wizard.dayKey, wizard.slotId);
    const left = remainOf(wizard.serviceId);
    return `
      <section class="flow-card">
        <div class="flow-card-hd">
          <h2>③ 确认预约信息</h2>
          <p>确认后立即冻结 1 次权益，并写入家庭日历</p>
        </div>
        <div class="confirm-sheet">
          <div class="edit-row"><span>服务</span><span>${svc.name}</span></div>
          <div class="edit-row"><span>门店</span><span>${STORE}</span></div>
          <div class="edit-row"><span>时间</span><span>${day.dateLabel} ${day.label} ${slot?.time || ""}</span></div>
          <div class="edit-row"><span>权益</span><span>冻结 1 次（剩余可约 ${Math.max(0, left - 1)} 次）</span></div>
          <div class="edit-row"><span>排期原因</span><span>你的可到店偏好 + 与上次间隔 ≥ 6 天 + 门店有位</span></div>
        </div>
        <ul class="flow-notes">
          <li>T-4h 前可免费改约</li>
          <li>T-24h 前取消将自动解冻权益</li>
          <li>到店出示动态核销码，由店员扫码完成</li>
        </ul>
        <div class="flow-actions">
          <button type="button" class="btn-ghost" id="btnBackStep">返回修改</button>
          <button type="button" class="btn-primary" id="btnConfirmBook">确认预约并冻结</button>
        </div>
      </section>`;
  }

  function renderBooked() {
    const ap = state.appointment;
    const svc = serviceById(ap.elementId);
    const checkedIn = ap.status === "checked_in";
    return `
      <section class="flow-hero booked">
        <div class="flow-badge">已预约 · 权益已冻结</div>
        <h2>${svc.name}</h2>
        <p class="flow-hero-time">${ap.dateLabel} ${ap.weekdayLabel} · ${ap.time}</p>
        <p class="flow-hero-store">${STORE}</p>
        <div class="flow-hero-actions">
          <button type="button" class="btn-ghost" id="btnReschedule">改约</button>
          <button type="button" class="btn-ghost danger" id="btnCancel">取消预约</button>
        </div>
      </section>

      <section class="flow-card">
        <div class="flow-card-hd">
          <h2>④ 到店履约</h2>
          <p>按顺序完成：签到 → 出示核销码 → 服务完成</p>
        </div>

        <div class="checkin-row ${checkedIn ? "done" : ""}">
          <div>
            <strong>${checkedIn ? "已签到" : "到店签到"}</strong>
            <p>${checkedIn ? "可出示下方动态核销码给店员" : "到达门店后先点签到，再展示核销码"}</p>
          </div>
          <button type="button" class="btn-primary mini" id="btnCheckIn" ${checkedIn ? "disabled" : ""}>
            ${checkedIn ? "已完成" : "我已到店"}
          </button>
        </div>

        <div class="qr-panel ${checkedIn ? "open" : "locked"}">
          ${
            checkedIn
              ? `<div class="qr-box">
                  <div class="qr-fake" aria-hidden="true"></div>
                  <p class="qr-code"><strong id="codeText">${codeValue}</strong></p>
                  <p class="section-note" id="codeHint">一次性动态码 · ${codeTick}s 后刷新</p>
                </div>
                <button type="button" class="btn-primary flow-cta" id="btnRedeem">模拟店员扫码 · 完成核销</button>
                <p class="section-note center">核销成功后将自动扣减权益，并在 5 分钟内生成今晚预测</p>`
              : `<div class="qr-lock">
                  <p>核销码将在签到后显示</p>
                  <span>用于防止未到店误核销</span>
                </div>`
          }
        </div>
      </section>

      <aside class="disclaimer">
        <div class="disclaimer-hd"><span class="warn-icon">!</span>到店前准备</div>
        <p>${svc.tip}。过敏与禁忌已同步门店：精油过敏（演示）。</p>
      </aside>`;
  }

  function renderDone() {
    const ap = state.appointment || {};
    const svc = serviceById(ap.elementId || SERVICES[0].elementId);
    return `
      <section class="flow-hero done">
        <div class="flow-badge ok">核销完成</div>
        <h2>${svc.name}</h2>
        <p class="flow-hero-time">${ap.dateLabel || ""} ${ap.time || ""} · 已扣减 1 次权益</p>
        <p class="flow-hero-store">服务记录已生成，可查看今晚预测</p>
      </section>

      <section class="flow-card">
        <div class="flow-card-hd">
          <h2>⑤ 下一步</h2>
          <p>履约闭环已触发，建议按顺序完成</p>
        </div>
        <div class="next-list">
          <a class="next-item" href="./sleep-forecast.html">
            <strong>查看今晚预测</strong>
            <span>核销后 5 分钟内已生成</span>
          </a>
          <a class="next-item" href="./sleep-todo.html">
            <strong>回到睡眠日历</strong>
            <span>今日到店任务已自动勾选完成</span>
          </a>
          <a class="next-item" href="./sleep-entitlements.html">
            <strong>查看剩余权益</strong>
            <span>剩余次数与有效期</span>
          </a>
        </div>
        <button type="button" class="btn-ghost flow-cta" id="btnBookAgain">再约一次</button>
      </section>`;
  }

  function startCodeTimer() {
    clearInterval(timer);
    if (!(state.phase === "booked" && state.appointment?.status === "checked_in")) return;
    timer = setInterval(() => {
      codeTick -= 1;
      if (codeTick <= 0) {
        codeTick = 60;
        codeValue = makeCode();
        const el = document.getElementById("codeText");
        if (el) el.textContent = codeValue;
      }
      const hint = document.getElementById("codeHint");
      if (hint) hint.textContent = `一次性动态码 · ${codeTick}s 后刷新`;
    }, 1000);
  }

  function freezeEntitlement(elementId) {
    const list = JSON.parse(JSON.stringify(Care.loadState().entitlements || Care.DEMO_ENTITLEMENTS));
    const row = list.find((e) => e.elementId === elementId);
    if (row) row.frozen = (row.frozen || 0) + 1;
    return list;
  }

  function unfreezeAndUse(elementId) {
    const list = JSON.parse(JSON.stringify(Care.loadState().entitlements || Care.DEMO_ENTITLEMENTS));
    const row = list.find((e) => e.elementId === elementId);
    if (row) {
      row.frozen = Math.max(0, (row.frozen || 0) - 1);
      row.used = (row.used || 0) + 1;
    }
    return list;
  }

  function unfreezeOnly(elementId) {
    const list = JSON.parse(JSON.stringify(Care.loadState().entitlements || Care.DEMO_ENTITLEMENTS));
    const row = list.find((e) => e.elementId === elementId);
    if (row) row.frozen = Math.max(0, (row.frozen || 0) - 1);
    return list;
  }

  function bindIdle() {
    root.querySelectorAll("[data-svc]").forEach((btn) => {
      btn.addEventListener("click", () => {
        wizard.serviceId = btn.getAttribute("data-svc");
        render();
      });
    });
    document.getElementById("btnNextService")?.addEventListener("click", () => {
      if (remainOf(wizard.serviceId) <= 0) {
        toast("该服务权益不足");
        return;
      }
      wizard.step = 1;
      render();
    });
    root.querySelectorAll("[data-day]").forEach((btn) => {
      btn.addEventListener("click", () => {
        wizard.dayKey = btn.getAttribute("data-day");
        const firstOpen = dayByKey(wizard.dayKey).slots.find((s) => s.seats > 0);
        wizard.slotId = firstOpen?.id || wizard.slotId;
        render();
      });
    });
    root.querySelectorAll("[data-slot]").forEach((btn) => {
      btn.addEventListener("click", () => {
        wizard.slotId = btn.getAttribute("data-slot");
        render();
      });
    });
    document.getElementById("btnNextSlot")?.addEventListener("click", () => {
      const slot = slotById(wizard.dayKey, wizard.slotId);
      if (!slot || slot.seats <= 0) {
        toast("请选择有位时段");
        return;
      }
      wizard.step = 2;
      render();
    });
    document.getElementById("btnBackStep")?.addEventListener("click", () => {
      wizard.step = Math.max(0, wizard.step - 1);
      render();
    });
    document.getElementById("btnConfirmBook")?.addEventListener("click", () => {
      const svc = serviceById(wizard.serviceId);
      const day = dayByKey(wizard.dayKey);
      const slot = slotById(wizard.dayKey, wizard.slotId);
      if (!slot || remainOf(wizard.serviceId) <= 0) {
        toast("无法预约，请重新选择");
        return;
      }
      const appointment = {
        elementId: svc.elementId,
        name: svc.name,
        dayKey: day.key,
        dateLabel: day.dateLabel,
        weekdayLabel: day.label,
        slotId: slot.id,
        time: slot.time,
        store: STORE,
        status: "booked",
        at: Date.now(),
      };
      persist({
        appointment,
        entitlements: freezeEntitlement(svc.elementId),
      });
      toast("预约成功，已冻结 1 次权益");
      wizard.step = 3;
      render();
    });
  }

  function bindBooked() {
    document.getElementById("btnCheckIn")?.addEventListener("click", () => {
      const appointment = { ...state.appointment, status: "checked_in", checkInAt: Date.now() };
      persist({ appointment });
      codeTick = 60;
      codeValue = makeCode();
      toast("签到成功，请出示核销码");
      render();
    });
    document.getElementById("btnRedeem")?.addEventListener("click", () => {
      const ap = state.appointment;
      persist({
        appointment: { ...ap, status: "redeemed", redeemedAt: Date.now() },
        entitlements: unfreezeAndUse(ap.elementId),
        lastRedeemAt: Date.now(),
      });
      toast("核销成功，正在生成今晚预测…");
      render();
      setTimeout(() => {
        location.href = "./sleep-forecast.html";
      }, 900);
    });
    document.getElementById("btnCancel")?.addEventListener("click", () => {
      const ap = state.appointment;
      persist({
        appointment: null,
        entitlements: unfreezeOnly(ap.elementId),
      });
      wizard.step = 0;
      toast("已取消预约，权益已解冻");
      render();
    });
    document.getElementById("btnReschedule")?.addEventListener("click", () => {
      const ap = state.appointment;
      persist({
        appointment: null,
        entitlements: unfreezeOnly(ap.elementId),
      });
      wizard = {
        step: 1,
        serviceId: ap.elementId,
        dayKey: ap.dayKey || "2026-08-08",
        slotId: ap.slotId || "s2",
      };
      toast("请重新选择时段");
      render();
    });
  }

  function bindDone() {
    document.getElementById("btnBookAgain")?.addEventListener("click", () => {
      persist({ appointment: null });
      wizard.step = 0;
      render();
    });
  }

  function render() {
    clearInterval(timer);
    const body =
      state.phase === "done" ? renderDone() : state.phase === "booked" ? renderBooked() : renderIdleWizard();

    root.innerHTML = `${renderNav()}${renderSteps()}${body}`;

    if (state.phase === "idle") bindIdle();
    if (state.phase === "booked") bindBooked();
    if (state.phase === "done") bindDone();
    startCodeTimer();
  }

  render();
})();
