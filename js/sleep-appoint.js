(() => {
  const UI = window.SleepCareUI;
  const Care = window.SleepCare;
  const toast = UI.toastFactory(document.getElementById("toast"));
  UI.phoneShell("预约与核销", "./sleep-calendar.html");
  const root = document.getElementById("root");
  let booked = !!Care.loadState().appointment;
  let codeTick = 60;
  let timer;

  function render() {
    clearInterval(timer);
    root.innerHTML = `
      <nav class="sub-nav">
        <a href="./sleep-todo.html">待办</a>
        <a href="./sleep-calendar.html">日历</a>
        <a class="on" href="./sleep-appoint.html">预约核销</a>
        <a href="./sleep-forecast.html">今晚预测</a>
        <a href="./sleep-entitlements.html">我的权益</a>
      </nav>

      <section class="sr-card">
        <div class="sr-card-hd"><h2>到店预约</h2></div>
        <div class="edit-row"><span>服务</span><span>头部疗愈 60 分钟</span></div>
        <div class="edit-row"><span>门店</span><span>春风社区中心站 · 朝阳门店</span></div>
        <div class="lab" style="margin:8px 0">可选时段</div>
        <div class="slot-grid" id="slots">
          ${["周六 15:00", "周六 19:00", "周日 10:30", "周日 15:00"]
            .map((s, i) => `<button type="button" class="slot-chip ${i === 1 ? "on" : ""}" data-s="${s}">${s}</button>`)
            .join("")}
        </div>
        <button type="button" class="btn-primary" id="btnBook" style="width:100%;margin-top:14px">${booked ? "已预约（已冻结 1 次权益）" : "确认预约"}</button>
        <p class="section-note">T-4h 前免费改约；T-24h 前免费取消并解冻。</p>
      </section>

      <section class="sr-card">
        <div class="sr-card-hd"><h2>到店核销码</h2></div>
        <div class="qr-box">
          <div class="qr-fake" aria-hidden="true"></div>
          <p><strong id="codeText">KY-${Date.now().toString().slice(-6)}</strong></p>
          <p class="section-note" id="codeHint">一次性动态码 · ${codeTick}s 后刷新</p>
        </div>
        <button type="button" class="btn-ghost" id="btnRedeem" style="width:100%">模拟店员扫码核销完成</button>
      </section>

      <aside class="disclaimer">
        <div class="disclaimer-hd"><span class="warn-icon">!</span>履约后自动</div>
        <p>核销成功 → 扣权益 → 任务完成 → 5 分钟内推送今晚预测 → 2 小时后评价邀请。</p>
      </aside>
    `;

    root.querySelectorAll("[data-s]").forEach((b) => {
      b.addEventListener("click", () => {
        root.querySelectorAll("[data-s]").forEach((x) => x.classList.remove("on"));
        b.classList.add("on");
      });
    });
    document.getElementById("btnBook")?.addEventListener("click", () => {
      if (booked) {
        toast("已预约");
        return;
      }
      const slot = root.querySelector(".slot-chip.on")?.dataset.s;
      Care.saveState({
        appointment: { slot, elementId: "SE_TCM_HEAD_60", status: "booked", at: Date.now() },
      });
      booked = true;
      toast("预约成功，权益已冻结 1 次");
      render();
    });
    document.getElementById("btnRedeem")?.addEventListener("click", () => {
      Care.saveState({
        lastRedeemAt: Date.now(),
        appointment: { ...(Care.loadState().appointment || {}), status: "redeemed" },
      });
      toast("核销成功，正在生成今晚预测…");
      setTimeout(() => {
        location.href = "./sleep-forecast.html";
      }, 700);
    });

    timer = setInterval(() => {
      codeTick -= 1;
      if (codeTick <= 0) {
        codeTick = 60;
        const el = document.getElementById("codeText");
        if (el) el.textContent = "KY-" + Date.now().toString().slice(-6);
      }
      const hint = document.getElementById("codeHint");
      if (hint) hint.textContent = `一次性动态码 · ${codeTick}s 后刷新`;
    }, 1000);
  }

  render();
})();
