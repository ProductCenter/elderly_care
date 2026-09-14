(() => {
  const COLORS = ["#1677ff", "#36cfc9", "#73d13d", "#ffc53d", "#ff7a45", "#9254de", "#f759ab", "#597ef7"];

  function el(id) {
    return document.getElementById(id);
  }

  function svgWrap(inner, view = "0 0 360 180") {
    return `<svg class="chart-svg" viewBox="${view}" preserveAspectRatio="xMidYMid meet">${inner}</svg>`;
  }

  function axis(w, h, pad = { l: 36, r: 12, t: 12, b: 28 }) {
    const iw = w - pad.l - pad.r;
    const ih = h - pad.t - pad.b;
    return { w, h, pad, iw, ih, x0: pad.l, y0: pad.t, x1: w - pad.r, y1: h - pad.b };
  }

  function barChart(container, labels, series, opts = {}) {
    const w = 360;
    const h = 180;
    const a = axis(w, h);
    const max = Math.max(...series.flatMap((s) => s.data), 1) * 1.15;
    const groupW = a.iw / labels.length;
    const barW = Math.min(18, (groupW * 0.7) / series.length);
    let bars = "";
    let axes = `<line x1="${a.x0}" y1="${a.y1}" x2="${a.x1}" y2="${a.y1}" stroke="rgba(143,176,217,.35)" />`;
    for (let i = 0; i <= 4; i++) {
      const y = a.y1 - a.ih * (i / 4);
      axes += `<line x1="${a.x0}" y1="${y}" x2="${a.x1}" y2="${y}" stroke="rgba(143,176,217,.12)" />`;
      axes += `<text x="${a.x0 - 6}" y="${y + 3}" fill="#8fb0d9" font-size="10" text-anchor="end">${Math.round((max * i) / 4)}</text>`;
    }
    labels.forEach((lab, i) => {
      const gx = a.x0 + groupW * i + groupW / 2;
      axes += `<text x="${gx}" y="${a.y1 + 16}" fill="#8fb0d9" font-size="10" text-anchor="middle">${lab}</text>`;
      series.forEach((s, si) => {
        const val = s.data[i] || 0;
        const bh = (val / max) * a.ih;
        const x = gx - (series.length * barW) / 2 + si * barW;
        const y = a.y1 - bh;
        bars += `<rect x="${x}" y="${y}" width="${barW - 2}" height="${bh}" rx="2" fill="${s.color || COLORS[si]}" opacity="0.92">
          <title>${s.name} ${lab}: ${val}</title></rect>`;
      });
    });
    const legend = series
      .map((s, i) => `<span><i style="background:${s.color || COLORS[i]}"></i>${s.name}</span>`)
      .join("");
    container.innerHTML = svgWrap(axes + bars) + (opts.hideLegend ? "" : `<div class="legend">${legend}</div>`);
  }

  function lineChart(container, labels, series) {
    const w = 360;
    const h = 180;
    const a = axis(w, h);
    const max = Math.max(...series.flatMap((s) => s.data), 1) * 1.15;
    let grid = `<line x1="${a.x0}" y1="${a.y1}" x2="${a.x1}" y2="${a.y1}" stroke="rgba(143,176,217,.35)" />`;
    for (let i = 0; i <= 4; i++) {
      const y = a.y1 - a.ih * (i / 4);
      grid += `<line x1="${a.x0}" y1="${y}" x2="${a.x1}" y2="${y}" stroke="rgba(143,176,217,.12)" />`;
    }
    labels.forEach((lab, i) => {
      const x = a.x0 + (a.iw * i) / Math.max(labels.length - 1, 1);
      grid += `<text x="${x}" y="${a.y1 + 16}" fill="#8fb0d9" font-size="10" text-anchor="middle">${lab}</text>`;
    });
    let paths = "";
    series.forEach((s, si) => {
      const pts = s.data.map((v, i) => {
        const x = a.x0 + (a.iw * i) / Math.max(labels.length - 1, 1);
        const y = a.y1 - (v / max) * a.ih;
        return [x, y];
      });
      const d = pts.map((p, i) => `${i ? "L" : "M"}${p[0]},${p[1]}`).join(" ");
      const area = `${d} L${pts[pts.length - 1][0]},${a.y1} L${pts[0][0]},${a.y1} Z`;
      const color = s.color || COLORS[si];
      paths += `<path d="${area}" fill="${color}" opacity="0.12"/><path d="${d}" fill="none" stroke="${color}" stroke-width="2"/>`;
      pts.forEach(([x, y], i) => {
        paths += `<circle cx="${x}" cy="${y}" r="2.5" fill="${color}"><title>${s.name} ${labels[i]}: ${s.data[i]}</title></circle>`;
      });
    });
    const legend = series
      .map((s, i) => `<span><i style="background:${s.color || COLORS[i]}"></i>${s.name}</span>`)
      .join("");
    container.innerHTML = svgWrap(grid + paths) + `<div class="legend">${legend}</div>`;
  }

  function pieChart(container, items, opts = {}) {
    const w = 360;
    const h = 180;
    const cx = opts.donut ? 110 : 120;
    const cy = 90;
    const r = 62;
    const r0 = opts.donut ? 36 : 0;
    const total = items.reduce((s, it) => s + it.value, 0) || 1;
    let angle = -Math.PI / 2;
    let paths = "";
    items.forEach((it, i) => {
      const a0 = angle;
      const a1 = angle + (it.value / total) * Math.PI * 2;
      const x0 = cx + Math.cos(a0) * r;
      const y0 = cy + Math.sin(a0) * r;
      const x1 = cx + Math.cos(a1) * r;
      const y1 = cy + Math.sin(a1) * r;
      const large = a1 - a0 > Math.PI ? 1 : 0;
      const color = it.color || COLORS[i % COLORS.length];
      if (r0) {
        const xi0 = cx + Math.cos(a0) * r0;
        const yi0 = cy + Math.sin(a0) * r0;
        const xi1 = cx + Math.cos(a1) * r0;
        const yi1 = cy + Math.sin(a1) * r0;
        paths += `<path d="M${x0},${y0} A${r},${r} 0 ${large} 1 ${x1},${y1} L${xi1},${yi1} A${r0},${r0} 0 ${large} 0 ${xi0},${yi0} Z" fill="${color}" opacity="0.92"><title>${it.name}: ${it.value}</title></path>`;
      } else {
        paths += `<path d="M${cx},${cy} L${x0},${y0} A${r},${r} 0 ${large} 1 ${x1},${y1} Z" fill="${color}" opacity="0.92"><title>${it.name}: ${it.value}</title></path>`;
      }
      angle = a1;
    });
    let legendY = 28;
    let legend = "";
    items.forEach((it, i) => {
      const color = it.color || COLORS[i % COLORS.length];
      const pct = Math.round((it.value / total) * 100);
      legend += `<rect x="210" y="${legendY - 8}" width="8" height="8" rx="2" fill="${color}"/>
        <text x="224" y="${legendY}" fill="#c7dbf5" font-size="11">${it.name} ${pct}%</text>`;
      legendY += 20;
    });
    const center = opts.center
      ? `<text x="${cx}" y="${cy - 2}" fill="#fff" font-size="18" font-weight="700" text-anchor="middle">${opts.center}</text>
         <text x="${cx}" y="${cy + 16}" fill="#8fb0d9" font-size="11" text-anchor="middle">${opts.centerSub || ""}</text>`
      : "";
    container.innerHTML = svgWrap(paths + center + legend);
  }

  function stackedBar(container, labels, stacks) {
    const w = 360;
    const h = 180;
    const a = axis(w, h);
    const totals = labels.map((_, i) => stacks.reduce((s, st) => s + (st.data[i] || 0), 0));
    const max = Math.max(...totals, 1) * 1.1;
    const groupW = a.iw / labels.length;
    const barW = Math.min(28, groupW * 0.55);
    let html = `<line x1="${a.x0}" y1="${a.y1}" x2="${a.x1}" y2="${a.y1}" stroke="rgba(143,176,217,.35)" />`;
    labels.forEach((lab, i) => {
      const x = a.x0 + groupW * i + groupW / 2 - barW / 2;
      let y = a.y1;
      stacks.forEach((st, si) => {
        const val = st.data[i] || 0;
        const bh = (val / max) * a.ih;
        y -= bh;
        html += `<rect x="${x}" y="${y}" width="${barW}" height="${bh}" fill="${st.color || COLORS[si]}" opacity="0.92"><title>${st.name} ${lab}: ${val}</title></rect>`;
      });
      html += `<text x="${x + barW / 2}" y="${a.y1 + 16}" fill="#8fb0d9" font-size="10" text-anchor="middle">${lab}</text>`;
    });
    const legend = stacks
      .map((s, i) => `<span><i style="background:${s.color || COLORS[i]}"></i>${s.name}</span>`)
      .join("");
    container.innerHTML = svgWrap(html) + `<div class="legend">${legend}</div>`;
  }

  function gauge(container, value, label) {
    const pct = Math.max(0, Math.min(100, value)) / 100;
    const cx = 180;
    const cy = 110;
    const r = 70;
    const start = Math.PI;
    const end = 0;
    const ang = start + (end - start) * pct;
    const x = cx + Math.cos(ang) * r;
    const y = cy + Math.sin(ang) * r;
    const bg = `M${cx - r},${cy} A${r},${r} 0 0 1 ${cx + r},${cy}`;
    const fg = `M${cx - r},${cy} A${r},${r} 0 0 1 ${x},${y}`;
    container.innerHTML = svgWrap(
      `<path d="${bg}" fill="none" stroke="rgba(143,176,217,.2)" stroke-width="14" stroke-linecap="round"/>
       <path d="${fg}" fill="none" stroke="#36cfc9" stroke-width="14" stroke-linecap="round"/>
       <text x="${cx}" y="${cy - 8}" fill="#fff" font-size="28" font-weight="700" text-anchor="middle">${value}%</text>
       <text x="${cx}" y="${cy + 16}" fill="#8fb0d9" font-size="12" text-anchor="middle">${label}</text>`,
      "0 0 360 150"
    );
  }

  const months = ["8", "9", "10", "11", "12", "1", "2", "3", "4", "5", "6", "7"].map((m) => `${m}月`);
  const floors = ["1F", "2F", "3F", "4F", "5F"];

  function renderAll() {
    barChart(el("chartA"), ["金盛中心", "朝阳站", "和平站", "河西站", "南开站"], [
      { name: "在院长者", data: [128, 76, 54, 42, 28], color: "#1677ff" },
      { name: "员工", data: [36, 22, 16, 14, 8], color: "#36cfc9" },
    ]);

    gauge(el("chartB1"), 86.4, "总入住率");
    pieChart(el("chartB2"), [
      { name: "1F", value: 18 },
      { name: "2F", value: 22 },
      { name: "3F", value: 24 },
      { name: "4F", value: 20 },
      { name: "5F", value: 16 },
    ], { donut: true });

    lineChart(el("chartC"), months, [
      { name: "入院", data: [12, 15, 11, 18, 14, 16, 19, 13, 17, 15, 20, 18], color: "#1677ff" },
      { name: "出院", data: [8, 10, 9, 12, 11, 13, 10, 14, 12, 11, 15, 12], color: "#ff7a45" },
    ]);

    barChart(el("chartD"), floors, [
      { name: "使用率%", data: [92, 88, 84, 79, 73], color: "#73d13d" },
    ], { hideLegend: true });

    pieChart(el("chartE1"), [
      { name: "男", value: 142, color: "#1677ff" },
      { name: "女", value: 186, color: "#f759ab" },
    ], { donut: true, center: "328", centerSub: "在院" });

    barChart(el("chartE2"), ["60-69", "70-79", "80-89", "90+"], [
      { name: "人数", data: [48, 126, 112, 42], color: "#9254de" },
    ], { hideLegend: true });

    lineChart(el("chartF"), months, [
      { name: "来访人次", data: [160, 172, 155, 190, 188, 201, 176, 210, 198, 205, 191, 214], color: "#36cfc9" },
    ]);

    pieChart(el("chartG1"), [
      { name: "男", value: 28 },
      { name: "女", value: 68 },
    ], { donut: true, center: "96", centerSub: "员工" });

    barChart(el("chartG2"), ["护理组", "医疗组", "后勤组", "行政组"], [
      { name: "男", data: [12, 6, 7, 3], color: "#1677ff" },
      { name: "女", data: [34, 10, 12, 12], color: "#f759ab" },
    ]);

    pieChart(el("chartH"), [
      { name: "护理员", value: 46 },
      { name: "护士", value: 14 },
      { name: "医生", value: 6 },
      { name: "后勤", value: 18 },
      { name: "行政", value: 12 },
    ], { donut: true });

    barChart(el("chartI"), floors, [
      { name: "长者", data: [72, 70, 68, 62, 56], color: "#1677ff" },
      { name: "护理员", data: [18, 20, 22, 18, 18], color: "#ffc53d" },
    ]);

    stackedBar(el("chartJ"), floors, [
      { name: "自理", data: [30, 22, 18, 12, 10], color: "#73d13d" },
      { name: "半护理", data: [24, 28, 26, 22, 20], color: "#1677ff" },
      { name: "全护理", data: [14, 16, 18, 20, 18], color: "#ff7a45" },
      { name: "特护", data: [4, 4, 6, 8, 8], color: "#9254de" },
    ]);

    const ranks = [
      { name: "半护理", count: 120, pct: 100 },
      { name: "自理", count: 92, pct: 77 },
      { name: "全护理", count: 86, pct: 72 },
      { name: "特护", count: 30, pct: 25 },
    ];
    el("rankK").innerHTML = ranks
      .map(
        (r, i) => `<li>
          <span class="rank-no">${i + 1}</span>
          <div>
            <div>${r.name}</div>
            <div class="rank-bar"><span style="width:${r.pct}%"></span></div>
          </div>
          <span class="rank-val">${r.count}人</span>
        </li>`
      )
      .join("");

    const feeRows = [
      { name: "床位费", recv: 82.4, paid: 80.1, yoy: "+3.2%" },
      { name: "护理费", recv: 56.8, paid: 55.2, yoy: "+1.4%" },
      { name: "餐费", recv: 24.6, paid: 24.1, yoy: "-0.6%" },
      { name: "医疗耗材", recv: 12.2, paid: 11.8, yoy: "+5.1%" },
      { name: "增值服务", recv: 10.2, paid: 9.6, yoy: "+8.4%" },
    ];
    el("feeTable").querySelector("tbody").innerHTML = feeRows
      .map(
        (r) => `<tr>
          <td>${r.name}</td>
          <td>${r.recv}万</td>
          <td>${r.paid}万</td>
          <td>${r.yoy}</td>
        </tr>`
      )
      .join("");

    renderFee("month");
  }

  const feeData = {
    month: {
      labels: ["1月", "2月", "3月", "4月", "5月", "6月", "7月"],
      series: [
        { name: "床位费", data: [78, 79, 80, 81, 82, 81, 82], color: "#1677ff" },
        { name: "护理费", data: [50, 51, 52, 53, 54, 55, 57], color: "#36cfc9" },
        { name: "餐费", data: [22, 23, 23, 24, 24, 24, 25], color: "#ffc53d" },
        { name: "其他", data: [18, 19, 20, 20, 21, 22, 22], color: "#9254de" },
      ],
    },
    yearMonth: {
      labels: ["2025-Q3", "2025-Q4", "2026-Q1", "2026-Q2"],
      series: [
        { name: "床位费", data: [230, 238, 245, 248], color: "#1677ff" },
        { name: "护理费", data: [150, 158, 162, 168], color: "#36cfc9" },
        { name: "餐费", data: [66, 68, 70, 72], color: "#ffc53d" },
      ],
    },
    year: {
      labels: ["2023", "2024", "2025", "2026YTD"],
      series: [
        { name: "床位费", data: [820, 880, 940, 560], color: "#1677ff" },
        { name: "护理费", data: [520, 560, 610, 360], color: "#36cfc9" },
        { name: "餐费", data: [240, 255, 270, 160], color: "#ffc53d" },
      ],
    },
    floorMonth: {
      labels: floors,
      series: [
        { name: "床位费", data: [18, 17, 16, 15, 14], color: "#1677ff" },
        { name: "护理费", data: [12, 13, 12, 11, 10], color: "#36cfc9" },
        { name: "餐费", data: [5, 5, 5, 4, 4], color: "#ffc53d" },
      ],
    },
    floor: {
      labels: floors,
      series: [{ name: "累计费用(万)", data: [420, 398, 376, 340, 298], color: "#597ef7" }],
    },
    total: {
      labels: months,
      series: [{ name: "总费用(万)", data: [150, 152, 155, 160, 162, 168, 170, 172, 175, 178, 180, 186], color: "#1677ff" }],
    },
  };

  function renderFee(key) {
    const d = feeData[key];
    if (!d) return;
    if (d.series.length === 1 && key === "total") lineChart(el("chartFee"), d.labels, d.series);
    else if (key === "floorMonth" || key === "yearMonth" || key === "year" || key === "month")
      stackedBar(el("chartFee"), d.labels, d.series);
    else barChart(el("chartFee"), d.labels, d.series);
  }

  function tickClock() {
    const n = new Date();
    const pad = (v) => String(v).padStart(2, "0");
    const node = el("clockNow");
    if (node) {
      node.textContent = `${n.getFullYear()}-${pad(n.getMonth() + 1)}-${pad(n.getDate())} ${pad(n.getHours())}:${pad(n.getMinutes())}:${pad(n.getSeconds())}`;
    }
  }

  function bind() {
    el("feeSeg")?.querySelectorAll(".seg").forEach((btn) => {
      btn.addEventListener("click", () => {
        el("feeSeg").querySelectorAll(".seg").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        renderFee(btn.dataset.fee);
      });
    });

    el("btnExportFee")?.addEventListener("click", () => {
      window.alert("已导出费用统计报表（演示）");
    });

    el("btnFullscreen")?.addEventListener("click", () => {
      const page = document.querySelector(".screen-page");
      if (!page) return;
      if (!document.fullscreenElement) page.requestFullscreen?.();
      else document.exitFullscreen?.();
    });

    tickClock();
    setInterval(tickClock, 1000);
  }

  AdminUI.onReady(() => {
    renderAll();
    bind();
  });
})();
