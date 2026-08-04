(() => {
  const UI = window.SleepCareUI;
  const Care = window.SleepCare;
  const toast = UI.toastFactory(document.getElementById("toast"));
  const reportId = UI.qs("reportId") || "sr_20260521";
  const packageId = UI.qs("packageId") || "SP_ONSET_ANXIETY_8W";
  const pkg = Care.getPackage(packageId);
  const root = document.getElementById("root");
  UI.phoneShell("确认订单", `./sleep-plan.html?reportId=${reportId}&packageId=${packageId}`);

  if (!pkg || !root) {
    root.innerHTML = `<div class="empty">订单信息缺失</div>`;
    return;
  }

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const startDefault = tomorrow.toISOString().slice(0, 10);

  root.innerHTML = `
    <section class="sr-card">
      <div class="sr-card-hd"><h2>商品信息</h2></div>
      <h3 style="margin:0 0 4px;font-size:16px">${pkg.title}</h3>
      <p class="section-note">${pkg.subtitle} · ${pkg.durationWeeks} 周 · 权益 ${pkg.validDays} 天</p>
      <div class="edit-row"><span>总价值</span><strong>¥${Care.money(pkg.valueTotal)}</strong></div>
      <div class="edit-row"><span>到手价</span><strong style="color:var(--sr-high)">¥${Care.money(pkg.salePrice)}</strong></div>
    </section>

    <section class="sr-card form-card">
      <div class="sr-card-hd"><h2>履约信息（排期必需）</h2></div>
      <label><span class="lab">服务对象</span>
        <select id="member"><option>李长乐（本人）</option><option>配偶 · 王先生</option></select>
      </label>
      <label><span class="lab">计划开始日</span>
        <input id="startDate" type="date" value="${startDefault}" />
      </label>
      <label><span class="lab">常去门店</span>
        <select id="store"><option>春风社区中心站 · 朝阳门店</option><option>春风望京站</option></select>
      </label>
      <div class="lab" style="margin-bottom:8px">每周可到店时段</div>
      <div class="slot-grid" id="slots">
        ${["周二 18-21", "周四 18-21", "周六 全天", "周日 下午"].map(
          (s, i) => `<button type="button" class="slot-chip ${i === 0 || i === 2 ? "on" : ""}" data-slot="${s}">${s}</button>`
        ).join("")}
      </div>
      <label style="margin-top:12px"><span class="lab">习惯上床时间</span>
        <input id="bedtime" type="time" value="22:45" />
      </label>
      <label><span class="lab">免打扰时段（选填）</span>
        <input id="dnd" type="text" placeholder="例如 12:00-13:30" />
      </label>
    </section>

    <section class="sr-card">
      <div class="sr-card-hd"><h2>禁忌确认（必填）</h2></div>
      <div class="check-list">
        <label><input type="checkbox" id="ck1" /> 我已知晓本方案非医疗诊断</label>
        <label><input type="checkbox" id="ck2" /> 我已如实告知孕期/起搏器/皮肤破损等禁忌</label>
        <label><input type="checkbox" id="ck3" /> 我已阅读退款与爽约规则</label>
      </div>
    </section>

    <section class="sr-card">
      <div class="sr-card-hd"><h2>支付方式</h2></div>
      <div class="pay-bar on"><strong>微信支付</strong><span style="margin-left:auto;font-size:12px;color:var(--sr-text-2)">推荐</span></div>
      <p class="section-note" style="margin-top:10px">可加购助眠餐周包 / 监测设备租赁（演示略）</p>
    </section>

    <div class="sticky-buy">
      <div class="price-box">
        <div><span class="now">¥${Care.money(pkg.salePrice)}</span></div>
        <div class="section-note" style="margin:0">支付成功后发放权益并生成计划</div>
      </div>
      <button type="button" class="btn-primary" id="btnPay">模拟支付</button>
    </div>
  `;

  root.querySelectorAll("[data-slot]").forEach((btn) => {
    btn.addEventListener("click", () => btn.classList.toggle("on"));
  });

  document.getElementById("btnPay")?.addEventListener("click", () => {
    if (![1, 2, 3].every((n) => document.getElementById(`ck${n}`)?.checked)) {
      toast("请完成禁忌与规则确认");
      return;
    }
    const slots = [...root.querySelectorAll(".slot-chip.on")].map((b) => b.dataset.slot);
    if (!slots.length) {
      toast("请选择至少 1 个可到店时段");
      return;
    }
    const orderId = "SO" + Date.now();
    Care.saveState({
      order: {
        orderId,
        packageId,
        reportId,
        amount: pkg.salePrice,
        status: "paid",
        member: document.getElementById("member").value,
        startDate: document.getElementById("startDate").value,
        store: document.getElementById("store").value,
        slots,
        bedtime: document.getElementById("bedtime").value,
        paidAt: Date.now(),
      },
      planStatus: "pending_confirm",
      entitlements: Care.DEMO_ENTITLEMENTS,
    });
    toast("支付成功，正在生成计划…");
    setTimeout(() => {
      location.href = `./sleep-plan-ready.html?orderId=${encodeURIComponent(orderId)}`;
    }, 700);
  });
})();
