(() => {
  const resultText = { match: "已对齐", diff: "有差异", pending: "未对账" };
  const resultClass = { match: "status-on", diff: "status-repair", pending: "status-busy" };
  const SEED = [
    { month: "2026-07", elder: "张秀英", sys: 7200, bank: 7200, sn: "BK20260728001", result: "match" },
    { month: "2026-07", elder: "李建国", sys: 12900, bank: 10000, sn: "BK20260728002", result: "diff" },
    { month: "2026-07", elder: "陈桂兰", sys: 6000, bank: 6000, sn: "BK20260729001", result: "match" },
    { month: "2026-07", elder: "王德福", sys: 8300, bank: 0, sn: "—", result: "pending" },
    { month: "2026-07", elder: "赵国强", sys: 8200, bank: 8200, sn: "BK20260730001", result: "match" },
    { month: "2026-07", elder: "周明", sys: 13200, bank: 13000, sn: "BK20260730002", result: "diff" },
  ].map((r) => ({ ...r, diff: r.bank - r.sys }));
  let rows = AdminStore.load("org-reconcile", SEED);
  function persist() {
    AdminStore.save("org-reconcile", rows);
  }

  function filtered() {
    const month = qMonth.value;
    const result = qResult.value;
    const kw = qKeyword.value.trim();
    return rows.filter((r) => {
      if (month && r.month !== month) return false;
      if (result && r.result !== result) return false;
      if (kw && !(r.elder.includes(kw) || r.sn.includes(kw))) return false;
      return true;
    });
  }

  function render() {
    const list = filtered();
    stTotal.textContent = list.length;
    stMatch.textContent = list.filter((r) => r.result === "match").length;
    stDiff.textContent = list.filter((r) => r.result === "diff").length;
    const amount = list.filter((r) => r.result === "diff").reduce((s, r) => s + Math.abs(r.diff), 0);
    stAmount.innerHTML = `${amount}<em>元</em>`;
    pagerInfo.textContent = `共 ${list.length} 条`;
    body.innerHTML = list
      .map((r) => {
        const i = rows.indexOf(r);
        return `<tr>
          <td>${r.month}</td><td>${r.elder}</td><td>${r.sys}</td><td>${r.bank}</td>
          <td style="color:${r.diff === 0 ? "#389e0d" : "#cf1322"}">${r.diff > 0 ? "+" : ""}${r.diff}</td>
          <td>${r.sn}</td>
          <td><span class="status ${resultClass[r.result]}">${resultText[r.result]}</span></td>
          <td>
            <button type="button" class="link" data-match="${i}">标记已核</button>
            <button type="button" class="link danger" data-del="${i}">删除</button>
          </td>
        </tr>`;
      })
      .join("");
  }

  AdminUI.onReady(() => {
    btnSearch.onclick = render;
    btnReset.onclick = () => {
      qMonth.value = "2026-07";
      qResult.value = "";
      qKeyword.value = "";
      render();
    };
    btnExport.onclick = () => AdminUI.toast("已导出对账表（演示）", "info");
    btnAuto.onclick = () => {
      rows = rows.map((r) => {
        if (r.result === "pending" && r.bank === 0) return r;
        if (r.sys === r.bank) return { ...r, result: "match", diff: 0 };
        return { ...r, result: "diff", diff: r.bank - r.sys };
      });
      persist();
      render();
      AdminUI.toast("自动对账完成");
    };
    body.onclick = async (e) => {
      const match = e.target.closest("[data-match]");
      const del = e.target.closest("[data-del]");
      if (match) {
        const i = Number(match.dataset.match);
        rows[i].result = "match";
        rows[i].bank = rows[i].sys;
        rows[i].diff = 0;
        if (rows[i].sn === "—") rows[i].sn = `MANUAL${Date.now().toString().slice(-6)}`;
        persist();
        AdminUI.toast("已标记核销");
        render();
      }
      if (del) {
        const ok = await AdminUI.confirm("确定删除该对账记录？", { title: "删除确认", okText: "删除" });
        if (!ok) return;
        rows.splice(Number(del.dataset.del), 1);
        persist();
        AdminUI.toast("已删除");
        render();
      }
    };
    render();
  });
})();
