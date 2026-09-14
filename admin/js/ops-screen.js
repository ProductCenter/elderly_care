(() => {
  const COLORS = ["#1677ff", "#36cfc9", "#73d13d", "#ffc53d", "#ff7a45", "#9254de"];

  function bar(el, labels, series) {
    const w = 360, h = 180, pad = { l: 34, r: 10, t: 12, b: 28 };
    const iw = w - pad.l - pad.r, ih = h - pad.t - pad.b;
    const max = Math.max(...series.flatMap((s) => s.data), 1) * 1.15;
    const gw = iw / labels.length, bw = Math.min(16, (gw * 0.7) / series.length);
    let svg = `<svg viewBox="0 0 ${w} ${h}">`;
    for (let i = 0; i <= 4; i++) {
      const y = pad.t + ih - (ih * i) / 4;
      svg += `<line x1="${pad.l}" y1="${y}" x2="${w - pad.r}" y2="${y}" stroke="rgba(143,176,217,.12)"/>`;
    }
    labels.forEach((lab, i) => {
      const gx = pad.l + gw * i + gw / 2;
      svg += `<text x="${gx}" y="${h - 8}" fill="#8fb0d9" font-size="10" text-anchor="middle">${lab}</text>`;
      series.forEach((s, si) => {
        const val = s.data[i] || 0;
        const bh = (val / max) * ih;
        const x = gx - (series.length * bw) / 2 + si * bw;
        svg += `<rect x="${x}" y="${pad.t + ih - bh}" width="${bw - 2}" height="${bh}" rx="2" fill="${s.color || COLORS[si]}" opacity=".92"><title>${val}</title></rect>`;
      });
    });
    svg += `</svg><div class="ops-legend">${series.map((s, i) => `<span><i style="background:${s.color || COLORS[i]}"></i>${s.name}</span>`).join("")}</div>`;
    el.innerHTML = svg;
  }

  function line(el, labels, data, color = "#36cfc9") {
    const w = 360, h = 180, pad = { l: 34, r: 10, t: 12, b: 28 };
    const iw = w - pad.l - pad.r, ih = h - pad.t - pad.b;
    const max = Math.max(...data, 1) * 1.2;
    const xAt = (i) => pad.l + (iw * i) / Math.max(labels.length - 1, 1);
    const yAt = (v) => pad.t + ih - (v / max) * ih;
    let d = data.map((v, i) => `${i ? "L" : "M"}${xAt(i)},${yAt(v)}`).join(" ");
    let svg = `<svg viewBox="0 0 ${w} ${h}">`;
    labels.forEach((lab, i) => {
      svg += `<text x="${xAt(i)}" y="${h - 8}" fill="#8fb0d9" font-size="10" text-anchor="middle">${lab}</text>`;
    });
    svg += `<path d="${d}" fill="none" stroke="${color}" stroke-width="2.2"/>`;
    data.forEach((v, i) => {
      svg += `<circle cx="${xAt(i)}" cy="${yAt(v)}" r="2.8" fill="${color}"><title>${v}</title></circle>`;
    });
    svg += `</svg>`;
    el.innerHTML = svg;
  }

  function pie(el, items) {
    const cx = 100, cy = 90, r = 58, r0 = 32;
    const total = items.reduce((s, it) => s + it.value, 0) || 1;
    let angle = -Math.PI / 2, paths = "", ly = 28;
    items.forEach((it, i) => {
      const a0 = angle, a1 = angle + (it.value / total) * Math.PI * 2;
      const x0 = cx + Math.cos(a0) * r, y0 = cy + Math.sin(a0) * r;
      const x1 = cx + Math.cos(a1) * r, y1 = cy + Math.sin(a1) * r;
      const xi0 = cx + Math.cos(a0) * r0, yi0 = cy + Math.sin(a0) * r0;
      const xi1 = cx + Math.cos(a1) * r0, yi1 = cy + Math.sin(a1) * r0;
      const large = a1 - a0 > Math.PI ? 1 : 0;
      const color = it.color || COLORS[i % COLORS.length];
      paths += `<path d="M${x0},${y0} A${r},${r} 0 ${large} 1 ${x1},${y1} L${xi1},${yi1} A${r0},${r0} 0 ${large} 0 ${xi0},${yi0} Z" fill="${color}" opacity=".92"/>`;
      paths += `<rect x="190" y="${ly - 8}" width="8" height="8" rx="2" fill="${color}"/><text x="204" y="${ly}" fill="#c7dbf5" font-size="11">${it.name} ${Math.round((it.value / total) * 100)}%</text>`;
      ly += 20;
      angle = a1;
    });
    el.innerHTML = `<svg viewBox="0 0 360 180">${paths}</svg>`;
  }

  function rank(el, rows) {
    el.innerHTML = `<div style="display:grid;gap:10px;padding-top:6px">${rows
      .map(
        (r, i) => `<div style="display:grid;grid-template-columns:28px 1fr 48px;gap:8px;align-items:center;font-size:13px">
        <span style="width:22px;height:22px;border-radius:6px;display:grid;place-items:center;background:${i < 3 ? "#1677ff" : "rgba(255,255,255,.08)"};font-size:12px">${i + 1}</span>
        <div><div>${r.name}</div><div style="height:6px;margin-top:4px;border-radius:3px;background:rgba(255,255,255,.08);overflow:hidden"><div style="height:100%;width:${r.pct}%;background:linear-gradient(90deg,#1677ff,#69b1ff)"></div></div></div>
        <span style="text-align:right;color:#9ec5ff">${r.val}</span>
      </div>`
      )
      .join("")}</div>`;
  }

  AdminUI.onReady(() => {
    const days = ["一", "二", "三", "四", "五", "六", "日"].map((d) => `周${d}`);
    bar(document.getElementById("c1"), days, [
      { name: "使用率%", data: [84, 85, 85.5, 86, 86.2, 86.4, 86.4], color: "#1677ff" },
      { name: "就餐人数/10", data: [36, 38, 40, 39, 41, 43, 41], color: "#36cfc9" },
    ]);
    pie(document.getElementById("c2"), [
      { name: "托养", value: 42 },
      { name: "食堂", value: 28 },
      { name: "上门", value: 14 },
      { name: "便民", value: 10 },
      { name: "团购", value: 6 },
    ]);
    rank(document.getElementById("c3"), [
      { name: "助浴服务", val: "86次", pct: 100 },
      { name: "中医推拿", val: "72次", pct: 84 },
      { name: "理发", val: "64次", pct: 74 },
      { name: "家政保洁", val: "51次", pct: 59 },
      { name: "修脚", val: "43次", pct: 50 },
    ]);
    line(document.getElementById("c4"), days, [48, 52, 55, 60, 58, 62, 63], "#ffc53d");
    bar(document.getElementById("c5"), ["河东", "河西", "和平", "南开", "河北"], [
      { name: "上门次数", data: [12, 9, 7, 6, 4], color: "#ff7a45" },
    ]);
    bar(document.getElementById("c6"), ["防跌倒", "智能床垫", "血压仪", "烟感", "血氧"], [
      { name: "体验人次", data: [18, 14, 12, 8, 7], color: "#9254de" },
    ]);

    const tick = () => {
      const n = new Date();
      const p = (v) => String(v).padStart(2, "0");
      const el = document.getElementById("opsClock");
      if (el) el.textContent = `${n.getFullYear()}-${p(n.getMonth() + 1)}-${p(n.getDate())} ${p(n.getHours())}:${p(n.getMinutes())}:${p(n.getSeconds())}`;
    };
    tick();
    setInterval(tick, 1000);
    document.getElementById("btnFs")?.addEventListener("click", () => {
      const page = document.querySelector(".ops-screen");
      if (!document.fullscreenElement) page?.requestFullscreen?.();
      else document.exitFullscreen?.();
    });
  });
})();
