(() => {
  const UI = window.SleepCareUI;
  const Care = window.SleepCare;
  UI.phoneShell("睡眠评估报告", "./sleep-reports.html");
  const toast = UI.toastFactory(document.getElementById("toast"));

  const raw = window.getSleepReport(UI.qs("id"));
  const report = Care.enrichReport(raw);
  const root = document.getElementById("reportDetail");
  if (!root || !report) {
    if (root) root.innerHTML = `<div class="empty">未找到报告</div>`;
    return;
  }

  const initial = (report.name || "报").slice(0, 1);
  const tone = report.riskTone || "mid";
  const pkg = report.primaryPackageId ? Care.getPackage(report.primaryPackageId) : null;

  const schemeHtml = report.medicalHold
    ? `<aside class="medical-box">
        <h3>医疗优先 · 暂不自动推销服务包</h3>
        <p>${report.medicalTip}</p>
        <p style="margin-top:8px">可导出监测摘要供就诊使用；解除医疗态后由管家协助重配方案。</p>
      </aside>`
    : pkg
      ? `<a class="scheme-card" href="./sleep-plan.html?reportId=${encodeURIComponent(
          report.id
        )}&packageId=${encodeURIComponent(pkg.id)}">
        <div class="sc-kicker">你的 ${pkg.durationWeeks} 周改善方案</div>
        <h3>${pkg.title} · ${pkg.subtitle}</h3>
        <p class="sc-one">${report.diagnosis.replace(/\*\*/g, "")}</p>
        <div class="sc-icons">
          ${(pkg.interventions || [])
            .map((i) => `<div class="sc-icon">${i.label}</div>`)
            .join("")}
        </div>
        <div class="sc-foot">
          <div>
            <div style="font-size:12px;opacity:.9;margin-bottom:2px">${pkg.expectedText}</div>
            <div class="sc-price">¥${Care.money(pkg.salePrice)}<small>起</small></div>
          </div>
          <span class="sc-cta">查看我的方案</span>
        </div>
      </a>`
      : "";

  root.innerHTML = `
    <section class="profile-hero">
      <div class="avatar" aria-hidden="true">${initial}</div>
      <div class="profile-meta">
        <h2 class="profile-name">${report.name}<em>${report.gender} | ${report.age}岁</em></h2>
        <p class="profile-line">身份证号：${report.idMask}</p>
        <p class="profile-line">服务站点：${report.station}</p>
        <p class="profile-line">报告日期：${report.reportAt}</p>
      </div>
      <svg class="shield-deco" viewBox="0 0 120 120" aria-hidden="true">
        <defs>
          <linearGradient id="sg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#8eb0ff"/>
            <stop offset="100%" stop-color="#5a84ff"/>
          </linearGradient>
        </defs>
        <path d="M60 10 98 26v28c0 28-16 48-38 56-22-8-38-28-38-56V26L60 10z" fill="url(#sg)" opacity=".9"/>
        <path d="M60 38v28M46 52h28" stroke="#fff" stroke-width="8" stroke-linecap="round"/>
      </svg>
    </section>

    <section class="sr-card">
      <div class="sr-card-hd"><h2>睡眠画像与分型</h2></div>
      <div class="tag-row">
        <span class="chip">${report.profileName || report.mainType}</span>
        ${(report.subTypes || []).map((t) => `<span class="chip">${t}</span>`).join("")}
        ${report.medicalHold ? `<span class="chip warn">医疗优先</span>` : ""}
      </div>
      <p class="diag-text">${(report.diagnosis || report.summary).replace(
        /\*\*(.*?)\*\*/g,
        "<strong>$1</strong>"
      )}</p>
      ${
        report.priorityAsk
          ? `<p class="section-note" style="margin-top:10px;margin-bottom:0">${report.priorityAsk}</p>`
          : ""
      }
    </section>

    <section class="sr-card">
      <div class="sr-card-hd"><h2>风险类型与等级评估</h2></div>
      <div class="risk-row">
        <div>主要类型：${report.mainType}</div>
        <div>风险等级：<strong class="${tone}">${report.riskLevel}</strong></div>
      </div>
    </section>

    <section class="sr-card">
      <div class="sr-card-hd"><h2>关键数据支撑</h2></div>
      ${(report.metrics || [])
        .map(
          (m) => `<article class="metric">
          <h3 class="metric-hd">${m.label}：<span>${m.value}</span></h3>
          <p>${m.desc}</p>
        </article>`
        )
        .join("")}
    </section>

    <section class="sr-card">
      <div class="sr-card-hd"><h2>睡眠健康指标</h2></div>
      <div class="indicator-grid">
        ${(report.indicators || [])
          .map(
            (i) => `<div class="indicator">
            <span class="lab">${i.name}</span>
            <strong>${i.value}</strong>
            <span class="tip">${i.tip || ""}</span>
          </div>`
          )
          .join("")}
      </div>
    </section>

    <section class="sr-card">
      <div class="sr-card-hd"><h2>干预与生活建议</h2></div>
      <ul class="advice-list">
        ${(report.advices || []).map((a) => `<li class="advice-item">${a}</li>`).join("")}
      </ul>
    </section>

    ${schemeHtml}

    ${
      !report.medicalHold
        ? `<button type="button" class="plan-btn" id="btnPlanAnchor">
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 19V5M5 12l7-7 7 7" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      ${pkg ? "查看完整改善方案" : report.planHint || "个性化疗愈方案"}
    </button>`
        : ""
    }

    <aside class="disclaimer">
      <div class="disclaimer-hd"><span class="warn-icon">!</span>重要提示</div>
      <p>${report.disclaimer}</p>
    </aside>
  `;

  document.getElementById("btnPlanAnchor")?.addEventListener("click", () => {
    if (pkg) {
      location.href = `./sleep-plan.html?reportId=${encodeURIComponent(
        report.id
      )}&packageId=${encodeURIComponent(pkg.id)}`;
      return;
    }
    toast("暂无匹配方案");
  });
})();
