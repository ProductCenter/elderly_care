(() => {
  const UI = window.SleepCareUI;
  const Care = window.SleepCare;
  UI.phoneShell("睡眠报告", "./mine.html");

  const listEl = document.getElementById("reportList");
  const emptyEl = document.getElementById("empty");
  const reports = (window.SLEEP_REPORTS || []).map((r) => Care.enrichReport(r));

  if (!reports.length) {
    if (emptyEl) emptyEl.hidden = false;
    return;
  }

  listEl.innerHTML = reports
    .map((r) => {
      const tip = r.medicalHold
        ? "医疗优先 · 建议先就医评估"
        : r.primaryPackageId
          ? "可查看改善方案"
          : "查看详情";
      return `<li>
      <a class="report-item" href="./sleep-report.html?id=${encodeURIComponent(r.id)}">
        <div class="ri-top">
          <div>
            <h3 class="ri-title">${r.title}</h3>
            <div class="ri-date">${r.reportAt}</div>
          </div>
          <span class="risk-pill ${r.riskTone}">${r.riskLevel}</span>
        </div>
        <p class="ri-summary">${r.summary}</p>
        <div class="ri-foot">
          <span class="ri-type">${r.profileName || r.mainType}</span>
          <span>${tip} ›</span>
        </div>
      </a>
    </li>`;
    })
    .join("");
})();
