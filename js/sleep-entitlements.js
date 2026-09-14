(() => {
  const UI = window.SleepCareUI;
  const Care = window.SleepCare;
  UI.phoneShell("我的权益", "./mine.html");
  const state = Care.loadState();
  const list = state.entitlements || Care.DEMO_ENTITLEMENTS;
  const order = state.order;
  const root = document.getElementById("root");

  root.innerHTML = `
    <nav class="sub-nav">
      <a href="./sleep-todo.html">日历</a>
      <a href="./sleep-appoint.html">预约核销</a>
      <a href="./sleep-forecast.html">今晚预测</a>
      <a class="on" href="./sleep-entitlements.html">我的权益</a>
    </nav>

    <section class="list-hero">
      <h2>${order ? "履约中权益账户" : "演示权益账户"}</h2>
      <p>${order ? `订单 ${order.orderId} · 已支付 ¥${Care.money(order.amount)}` : "完成购买后将按要素发放次数/有效期"}</p>
    </section>

    <section class="sr-card">
      <div class="sr-card-hd"><h2>权益条目</h2></div>
      ${list
        .map((e) => {
          const el = Care.getElement(e.elementId);
          const remain = e.total - e.used - e.frozen;
          return `<div class="ent-row">
            <div>
              <h4>${el?.name || e.elementId}</h4>
              <p>有效期至 ${e.expireAt} · 冻结 ${e.frozen}</p>
            </div>
            <div style="text-align:right">
              <strong style="color:var(--sr-blue)">${remain}</strong>
              <div style="font-size:12px;color:var(--sr-text-2)">剩余 / 共 ${e.total}</div>
            </div>
          </div>`;
        })
        .join("")}
    </section>

    <p class="section-note">预约成功冻结 1 次；核销后转已用；取消预约解冻。家庭共享可设成员上限（演示）。</p>
    <a class="btn-primary" href="./sleep-appoint.html" style="display:flex;align-items:center;justify-content:center;text-decoration:none;margin-bottom:16px">去预约到店</a>
  `;
})();
