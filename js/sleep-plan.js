(() => {
  const UI = window.SleepCareUI;
  const Care = window.SleepCare;
  const toast = UI.toastFactory(document.getElementById("toast"));
  const reportId = UI.qs("reportId") || "sr_20260521";
  let packageId = UI.qs("packageId") || "SP_ONSET_ANXIETY_8W";
  const report = Care.enrichReport(window.getSleepReport(reportId));
  const root = document.getElementById("planRoot");

  UI.phoneShell("改善方案", `./sleep-report.html?id=${encodeURIComponent(reportId)}`);

  let budget = 4000;
  let weeklyHours = 4;
  let storeFreq = 1;
  let removed = new Set();
  let swapped = {};

  function currentPkg() {
    return Care.getPackage(packageId);
  }

  function render() {
    const pkg = currentPkg();
    if (!root || !pkg) {
      root.innerHTML = `<div class="empty">未找到方案</div>`;
      return;
    }

    const items = pkg.items
      .filter((it) => !removed.has(it.elementId))
      .map((it) => {
        const id = swapped[it.elementId] || it.elementId;
        return { ...it, elementId: id, el: Care.getElement(id) };
      });

    const valueSum = items.reduce((s, it) => s + (it.el?.price || 0) * it.qty, 0);
    const alts = (report?.altPackageIds || []).map((id) => Care.getPackage(id)).filter(Boolean);

    root.innerHTML = `
      <section class="sr-card">
        <div class="sr-card-hd"><h2>① 诊断摘要</h2></div>
        <div class="tag-row">
          <span class="chip">${report?.profileName || "睡眠分型"}</span>
          ${(report?.subTypes || []).map((t) => `<span class="chip">${t}</span>`).join("")}
        </div>
        <p class="diag-text">${(report?.diagnosis || "").replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")}</p>
      </section>

      <section class="sr-card">
        <div class="sr-card-hd"><h2>② 方案逻辑</h2></div>
        <p class="section-note">${pkg.title} · ${pkg.subtitle} · ${pkg.durationWeeks} 周</p>
        <div class="logic-steps">${(pkg.logic || []).map((x) => `<span>${x}</span>`).join("")}</div>
      </section>

      <section class="sr-card">
        <div class="sr-card-hd"><h2>③ 周计划预览</h2></div>
        <div class="week-grid">
          ${Array.from({ length: pkg.durationWeeks }, (_, i) => {
            const stage = pkg.stages.find((s) => {
              const m = String(s.weeks).match(/W(\\d+)/g);
              return true;
            });
            const label = i < 2 ? "导入" : i < pkg.durationWeeks - 2 ? "强化" : "巩固";
            return `<div class="week-cell ${i === 3 ? "on" : ""}">W${i + 1}<br/>${label}</div>`;
          }).join("")}
        </div>
        <p class="section-note">典型一周（第 4 周示意）</p>
        <div class="day-list">
          ${(pkg.weekPreview || [])
            .map(
              (d) => `<div class="day-row"><strong>${d.day}</strong><p>${d.tasks.join(" · ")}</p></div>`
            )
            .join("") || `<div class="day-row"><strong>日程</strong><p>选择主推方案可查看完整一周预览</p></div>`}
        </div>
      </section>

      <section class="sr-card">
        <div class="sr-card-hd"><h2>④ 要素清单</h2></div>
        <p class="section-note">每项可查看「为什么配它」；同组可替换，非核心可删</p>
        ${items
          .map((it) => {
            const el = it.el;
            return `<div class="item-row">
              <div class="item-ico">${UI.fulfillLabel(el?.fulfill).slice(0, 2)}</div>
              <div class="item-body">
                <h4>${el?.name || it.elementId}${it.core ? " · 核心" : ""}</h4>
                <p>${el?.explain || ""}</p>
                ${
                  !it.core
                    ? `<button type="button" class="swap-btn" data-del="${it.elementId}">删除此项</button>`
                    : ""
                }
                ${
                  it.group || el?.group
                    ? `<button type="button" class="swap-btn" data-swap="${it.elementId}">换一个</button>`
                    : ""
                }
              </div>
              <div class="item-meta">
                <em>×${it.qty}</em>
                ${it.freq}<br/>¥${Care.money((el?.price || 0) * it.qty)}
              </div>
            </div>`;
          })
          .join("")}
      </section>

      <section class="sr-card">
        <div class="sr-card-hd"><h2>⑤ 预期效果</h2></div>
        ${(pkg.outcomes || [])
          .map(
            (o) => `<article class="metric">
            <h3 class="metric-hd">${o.metric}：<span>${o.delta}</span></h3>
            <p>约第 ${o.byWeek} 周观察；${o.rate}。表述为区间与概率，非医学承诺。</p>
          </article>`
          )
          .join("")}
      </section>

      <section class="sr-card">
        <div class="sr-card-hd"><h2>⑥ 方案调整</h2></div>
        <div class="edit-row"><span>预算上限</span><span>¥${budget}</span></div>
        <input id="budgetRange" type="range" min="1000" max="10000" step="100" value="${budget}" style="width:100%" />
        <div class="edit-row">
          <span>每周可投入</span>
          <select id="weeklyHours">
            ${[2, 4, 6].map((h) => `<option value="${h}" ${h === weeklyHours ? "selected" : ""}>${h} 小时</option>`).join("")}
          </select>
        </div>
        <div class="edit-row">
          <span>每周到店</span>
          <select id="storeFreq">
            ${[0, 1, 2].map((h) => `<option value="${h}" ${h === storeFreq ? "selected" : ""}>${h} 次</option>`).join("")}
          </select>
        </div>
        <p class="section-note" id="editHint">调整后将重算排程密度与效果预期（演示）。</p>
      </section>

      <section class="sr-card">
        <div class="sr-card-hd"><h2>⑧ 备选方案</h2></div>
        <div class="alt-scroll">
          ${[pkg, ...alts.filter((a) => a.id !== pkg.id)]
            .map(
              (a) => `<button type="button" class="alt-card ${a.id === pkg.id ? "active" : ""}" data-pkg="${a.id}">
              <h4>${a.title}</h4>
              <p>${a.subtitle} · ${a.durationWeeks} 周</p>
              <div class="price">¥${Care.money(a.salePrice)}</div>
            </button>`
            )
            .join("")}
        </div>
      </section>

      <aside class="disclaimer">
        <div class="disclaimer-hd"><span class="warn-icon">!</span>合规说明</div>
        <p>在相似情况的用户中，约 62% 在 6 周内入睡时间缩短 15-25 分钟。本方案仅供健康管理参考，不能作为临床诊断依据。</p>
      </aside>

      <div class="sticky-buy">
        <div class="price-box">
          <div><span class="now">¥${Care.money(pkg.salePrice)}</span><span class="old">总价值 ¥${Care.money(Math.max(pkg.valueTotal, valueSum))}</span></div>
          <div class="section-note" style="margin:0">支持 ${ (pkg.installment || []).join("/") } 期 · 方案价锁 7 天</div>
        </div>
        <button type="button" class="btn-primary" id="btnBuy">去购买</button>
      </div>
    `;

    document.getElementById("budgetRange")?.addEventListener("change", (e) => {
      budget = Number(e.target.value);
      toast(`预算已设为 ¥${budget}，将重算要素组合（演示）`);
      const label = root.querySelector(".edit-row span:last-child");
      // update nearby budget display without full remount of range focus issues
      const rows = root.querySelectorAll(".edit-row");
      if (rows[0]) rows[0].querySelector("span:last-child").textContent = `¥${budget}`;
    });
    document.getElementById("weeklyHours")?.addEventListener("change", (e) => {
      weeklyHours = Number(e.target.value);
      toast(`已按每周 ${weeklyHours} 小时重排任务密度`);
    });
    document.getElementById("storeFreq")?.addEventListener("change", (e) => {
      storeFreq = Number(e.target.value);
      if (storeFreq === 0) toast("已切换为偏居家方案（需至少保留数据回收要素）");
      else toast(`每周到店 ${storeFreq} 次`);
    });
    root.querySelectorAll("[data-pkg]").forEach((btn) => {
      btn.addEventListener("click", () => {
        packageId = btn.getAttribute("data-pkg");
        removed = new Set();
        swapped = {};
        history.replaceState({}, "", `?reportId=${encodeURIComponent(reportId)}&packageId=${encodeURIComponent(packageId)}`);
        render();
      });
    });
    root.querySelectorAll("[data-del]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-del");
        const remainStore = items.filter((x) => x.el?.fulfill === "IN_STORE" && x.elementId !== id).length;
        if (remainStore < 1 && Care.getElement(id)?.fulfill === "IN_STORE") {
          toast("至少保留 1 项到店服务才能保证效果验证");
          return;
        }
        removed.add(id);
        toast("已删除，预计效果可能下降");
        render();
      });
    });
    root.querySelectorAll("[data-swap]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const from = btn.getAttribute("data-swap");
        const alt = from === "SE_TCM_HEAD_60" ? "SE_FOOT_BATH_30" : "SE_TCM_HEAD_60";
        if (from === "SE_FOOT_BATH_30" || from === "SE_TCM_HEAD_60") {
          swapped[from] = alt;
          toast(`已替换为 ${Care.getElement(alt)?.name}`);
          render();
        } else toast("同组暂无更多候选");
      });
    });
    document.getElementById("btnBuy")?.addEventListener("click", () => {
      Care.saveState({
        draftOrder: {
          reportId,
          packageId,
          budget,
          weeklyHours,
          storeFreq,
          removed: [...removed],
          swapped,
        },
      });
      location.href = `./sleep-checkout.html?reportId=${encodeURIComponent(reportId)}&packageId=${encodeURIComponent(packageId)}`;
    });
  }

  render();
})();
