(() => {
  const rows = [
    { elder: "张秀英", bed: "3F 312-A", bedFee: 3600, care: 2200, meal: 1200, other: 200, paid: 7200 },
    { elder: "李建国", bed: "3F 312-B", bedFee: 6800, care: 4200, meal: 1400, other: 500, paid: 10000 },
    { elder: "陈桂兰", bed: "2F 215-A", bedFee: 3600, care: 1200, meal: 1200, other: 0, paid: 6000 },
    { elder: "王德福", bed: "1F 108-B", bedFee: 3600, care: 3200, meal: 1200, other: 300, paid: 7000 },
    { elder: "赵国强", bed: "4F 408-A", bedFee: 4800, care: 2200, meal: 1200, other: 0, paid: 8200 },
    { elder: "周明", bed: "5F 502-A", bedFee: 6800, care: 4200, meal: 1400, other: 800, paid: 9000 },
  ].map((r) => ({ ...r, recv: r.bedFee + r.care + r.meal + r.other }));

  function filtered() {
    const floor = qFloor.value;
    return rows.filter((r) => !floor || r.bed.startsWith(floor));
  }

  function renderChart(list) {
    const parts = [
      { name: "床位费", value: list.reduce((s, r) => s + r.bedFee, 0), color: "#1677ff" },
      { name: "护理费", value: list.reduce((s, r) => s + r.care, 0), color: "#36cfc9" },
      { name: "餐费", value: list.reduce((s, r) => s + r.meal, 0), color: "#ffc53d" },
      { name: "其他", value: list.reduce((s, r) => s + r.other, 0), color: "#9254de" },
    ];
    const max = Math.max(...parts.map((p) => p.value), 1);
    feeChart.innerHTML = `<div style="display:grid;gap:10px">${parts
      .map(
        (p) => `<div style="display:grid;grid-template-columns:64px 1fr 72px;gap:8px;align-items:center;font-size:13px">
          <span style="color:#595959">${p.name}</span>
          <div style="height:10px;background:#f5f5f5;border-radius:5px;overflow:hidden"><div style="height:100%;width:${(p.value / max) * 100}%;background:${p.color}"></div></div>
          <span style="text-align:right;color:#262626;font-variant-numeric:tabular-nums">${(p.value / 10000).toFixed(2)}万</span>
        </div>`
      )
      .join("")}</div>`;
  }

  function render() {
    const list = filtered();
    const recv = list.reduce((s, r) => s + r.recv, 0);
    const paid = list.reduce((s, r) => s + r.paid, 0);
    stRecv.innerHTML = `${(recv / 10000).toFixed(2)}<em>万</em>`;
    stPaid.innerHTML = `${(paid / 10000).toFixed(2)}<em>万</em>`;
    stDebt.innerHTML = `${(Math.max(recv - paid, 0) / 10000).toFixed(2)}<em>万</em>`;
    stElders.innerHTML = `${list.length}<em>人</em>`;
    pagerInfo.textContent = `共 ${list.length} 条 · 统计区间 ${qStart.value} ~ ${qEnd.value}`;
    renderChart(list);
    body.innerHTML = list
      .map((r) => {
        const ok = r.paid >= r.recv;
        return `<tr>
          <td>${r.elder}</td><td>${r.bed}</td><td>${r.bedFee}</td><td>${r.care}</td><td>${r.meal}</td><td>${r.other}</td>
          <td>${r.recv}</td><td>${r.paid}</td>
          <td><span class="status ${ok ? "status-on" : "status-busy"}">${ok ? "已结清" : "部分欠费"}</span></td>
        </tr>`;
      })
      .join("");
  }

  AdminUI.onReady(() => {
    btnSearch.onclick = render;
    btnReset.onclick = () => {
      qStart.value = "2026-07-01";
      qEnd.value = "2026-07-31";
      qFloor.value = "";
      render();
    };
    btnExport.onclick = () => AdminUI.toast(`已导出 ${qStart.value} ~ ${qEnd.value} 费用统计表（演示）`);
    render();
  });
})();
