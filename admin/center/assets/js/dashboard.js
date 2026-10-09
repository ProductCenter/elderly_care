/* ============================================================
   智慧康养需供匹配运营大屏 · 交互逻辑
   需求侧 DEMAND ｜ 需供匹配 MATCHING ｜ 供给侧 SUPPLY
   ============================================================ */
(function () {
  'use strict';

  const $  = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const C  = { pri:'#3b9eff', grn:'#3ddea8', org:'#ff9a1a', red:'#ff4d4f', cyn:'#00e5ff', pur:'#8b7cff', ind:'#8b7cff' };
  const GCOLOR = { '需':'#3b9eff', '供':'#3ddea8', '配':'#8b7cff' };
  const KIND_COLOR = { '供给缺口':'#ff4d4f', '需求升级':'#8b7cff', '履约超时':'#ff9a1a',
                       '未满足需求':'#ffc070', '履约异常':'#ff4d4f', '错配提示':'#00e5ff' };

  const nf = (v, dec) => {
    const n = dec ? Number(v).toFixed(dec) : String(Math.round(v));
    const p = n.split('.');
    p[0] = p[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return p.join('.');
  };
  const svgIcon = (name, size) =>
    '<svg class="icn" viewBox="0 0 24 24" style="width:' + size + 'px;height:' + size + 'px"><path d="' + ICONS[name] + '"/></svg>';

  /* 六大引擎今日供给履约量（人次，合计 = 全域今日履约服务 4,732） */
  const VOL = { car:1186, nut:818, mon:794, spt:731, slp:628, cog:575 };
  const matchOf = e => Math.min(100, (e.supply / Math.max(e.demand, 1)) * 100);

  /* ============================ 舞台自适应 ============================ */
  const stage = $('#stage');
  function fit () {
    const s = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
    stage.style.transform = 'translate(-50%,-50%) scale(' + s + ')';
  }
  window.addEventListener('resize', () => { fit(); drawTrend(); });
  fit();

  /* ============================ 时钟 ============================ */
  const WD = ['星期日','星期一','星期二','星期三','星期四','星期五','星期六'];
  function tickClock () {
    const d = new Date();
    const p = n => String(n).padStart(2, '0');
    $('#clockTime').textContent = p(d.getHours()) + ':' + p(d.getMinutes()) + ':' + p(d.getSeconds());
    $('#clockDate').textContent = d.getFullYear() + '年' + p(d.getMonth() + 1) + '月' + p(d.getDate()) + '日 ' + WD[d.getDay()];
  }
  tickClock(); setInterval(tickClock, 1000);

  /* ============================ KPI 带（需 / 供 / 配） ============================ */
  function renderKPI () {
    $('#kpiRow').innerHTML = KPIs.map(k => {
      const c = C[k.c], g = GCOLOR[k.g];
      return '<div class="kpi">' +
        '<div class="ic" style="background:' + c + '22;border:1px solid ' + c + '55;color:' + c + '">' + svgIcon(k.icon, 22) + '</div>' +
        '<div><div class="lb"><i class="gp" style="background:' + g + '22;color:' + g + '">' + k.g + '</i>' + k.k + '</div>' +
        '<div class="vl" style="color:' + c + '" data-k="' + k.k + '">' + (typeof k.v === 'number' ? nf(k.v, k.dec) : k.v) +
        (k.u ? '<small>' + k.u + '</small>' : '') + '</div>' +
        '<div class="dl">较昨日 <b style="color:' + (String(k.d).indexOf('-') === 0 ? C.grn : c) + '">' + k.d + '</b></div></div></div>';
    }).join('');
  }

  /* ============================ 匹配闭环带 ============================ */
  function renderLoop () {
    $('#loopBar').innerHTML =
      '<div class="cap"><b>六环节匹配闭环</b>需求驱动供给 · 缺口反向调度</div>' +
      LOOP.map(s =>
        '<div class="lpstep"><div class="n" style="background:' + s.c + '22;color:' + s.c + ';border:1px solid ' + s.c + '55">' + s.n + '</div>' +
        '<div class="t">' + s.t + '<small>' + s.s + '</small></div></div>'
      ).join('');
  }

  /* ============================ 迷你趋势线（匹配率 % · 固定纵轴） ============================ */
  function sparkline (data, color) {
    const w = 220, h = 48, padT = 6, padB = 8, padX = 2;
    /* 统一 78–100% 刻度，避免每条被拉满导致“假陡” */
    const yMin = 78, yMax = 100;
    const yAt = v => {
      const t = (Math.max(yMin, Math.min(yMax, v)) - yMin) / (yMax - yMin);
      return padT + (1 - t) * (h - padT - padB);
    };
    const pts = data.map((v, i) => [
      padX + (i / (data.length - 1)) * (w - padX * 2),
      yAt(v)
    ]);
    const line = pts.map(p => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');
    const last = pts[pts.length - 1];
    const area = pts[0][0].toFixed(1) + ',' + h + ' ' + line + ' ' + last[0].toFixed(1) + ',' + h;
    const id = 'g' + Math.random().toString(36).slice(2, 8);
    const g90 = yAt(90), g95 = yAt(95);
    return '<svg class="ec-sp" viewBox="0 0 ' + w + ' ' + h + '" preserveAspectRatio="none">' +
      '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0" stop-color="' + color + '" stop-opacity=".32"/><stop offset="1" stop-color="' + color + '" stop-opacity="0"/></linearGradient></defs>' +
      '<line x1="0" y1="' + g90 + '" x2="' + w + '" y2="' + g90 + '" stroke="rgba(255,255,255,.08)" stroke-dasharray="3 4"/>' +
      '<line x1="0" y1="' + g95 + '" x2="' + w + '" y2="' + g95 + '" stroke="rgba(61,222,168,.16)" stroke-dasharray="3 4"/>' +
      '<polygon points="' + area + '" fill="url(#' + id + ')"/>' +
      '<polyline points="' + line + '" fill="none" stroke="' + color + '" stroke-width="1.7" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke"/>' +
      '<circle cx="' + last[0].toFixed(1) + '" cy="' + last[1].toFixed(1) + '" r="2.5" fill="' + color + '" stroke="rgba(4,10,24,.85)" stroke-width="1"/>' +
      '</svg>';
  }

  /* ============================ 六大引擎 · 需供匹配卡片 ============================ */
  function renderEngines () {
    $('#engineGrid').innerHTML = ENGINES.map(e => {
      const mr = matchOf(e), gap = e.demand - e.supply;
      const good = mr >= 95;
      return '<div class="ecard fadeUp" data-id="' + e.id + '" style="--c:' + e.color + ';--c-soft:' + e.soft + '">' +
        '<div class="ec-h">' +
          '<div class="ec-ic" style="background:' + e.color + '22;color:' + e.color + ';border:1px solid ' + e.color + '55">' + svgIcon(e.icon, 19) + '</div>' +
          '<div><div class="ec-nm">' + e.name + '</div><div class="ec-en">' + e.en + '</div></div>' +
          '<div class="ec-st run" style="margin-left:auto;background:' + (good ? C.grn : C.org) + '18;color:' + (good ? C.grn : C.org) + '">' +
            '<i class="bl" style="background:' + (good ? C.grn : C.org) + '"></i>' + (good ? '匹配良好' : '存在缺口') + '</div>' +
          '<div class="ec-al' + (gap ? '' : ' zero') + '">缺口 ' + nf(gap) + '</div>' +
        '</div>' +
        '<div class="ec-flow"><span class="d">需求 <b style="color:' + e.color + '" data-d="' + e.id + '">' + nf(e.demand) + '</b></span>' +
          '<i class="ar" style="color:' + e.color + '">→</i>' +
          '<span class="s">覆盖 <b style="color:' + e.color + '" data-s="' + e.id + '">' + nf(e.supply) + '</b></span></div>' +
        sparkline(e.spark, e.color) +
        '<div class="ec-b"><div class="lb">需供匹配率<b data-mr="' + e.id + '">' + mr.toFixed(1) + '%</b></div>' +
          '<div class="tk"><i class="fl" style="--w:' + Math.min(100, mr) + '%;background:linear-gradient(90deg,' + e.color + ',rgba(255,255,255,.4))"></i></div>' +
        '</div>' +
      '</div>';
    }).join('');
    $$('#engineGrid .ecard').forEach(el =>
      el.addEventListener('click', () => openEngine(ENGINES.find(x => x.id === el.dataset.id))));
  }

  /* ============================ 需求侧 · 人群画像 ============================ */
  function renderPeople () {
    const maxD = Math.max.apply(null, DISEASE.map(d => d.v));
    $('#diseaseBars').innerHTML = DISEASE.map(d =>
      '<div class="bar-row"><span class="nm">' + d.n + '</span>' +
      '<span class="tk"><i class="fl" style="--w:' + (d.v / maxD * 100) + '%;--c1:' + d.c1 + ';--c2:' + d.c2 + '"></i></span>' +
      '<span class="vv">' + d.v + '<small> ' + d.u + '</small></span></div>').join('');

    const maxA = Math.max.apply(null, AGE.map(a => a.v));
    $('#ageBars').innerHTML =
      '<div style="display:flex;gap:7px;margin-top:8px;height:56px;width:100%;flex:none">' +
      AGE.map(a =>
        '<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:3px">' +
        '<div style="font-family:var(--num);font-size:12px;color:var(--ink)">' + a.v + '</div>' +
        '<div style="width:100%;flex:1;display:flex;align-items:flex-end">' +
        '<div style="width:100%;height:' + (a.v / maxA * 100) + '%;border-radius:4px 4px 0 0;background:linear-gradient(180deg,#00e5ff,rgba(59,158,255,.28))"></div></div>' +
        '<div style="font-size:10.5px;color:var(--t3)">' + a.n + '</div></div>').join('') +
      '</div>';
  }

  /* ============================ 需求侧 · 需求识别热度 ============================ */
  function renderDemandTop () {
    const list = DEMAND_TOP.slice().sort((a, b) => b.v - a.v);
    const max = list[0].v;
    $('#demandTop').innerHTML = list.map(d => {
      const lv = d.lv === '高' ? C.red : d.lv === '中高' ? C.org : C.pri;
      return '<div class="rankitem">' +
        '<span class="no"><i class="dot" style="background:' + d.c + '"></i></span>' +
        '<span class="nm">' + d.n + ' <i class="lvtag" style="background:' + lv + '1f;color:' + lv + '">' + d.lv + '</i></span>' +
        '<span class="vv">' + nf(d.v) + '<small> 项</small></span>' +
        '<span class="tk"><i class="fl" style="--w:' + (d.v / max * 100) + '%;--c:' + d.c + '"></i></span>' +
        '</div>';
    }).join('');
    $('#demandSum').textContent = nf(DEMAND_TOP.reduce((s, d) => s + d.v, 0));
  }

  /* ============================ 需求侧 · 需求来源 ============================ */
  function renderDemandSrc () {
    $('#demandSrc').innerHTML = DEMAND_SRC.map(s =>
      '<div class="src"><div class="nm"><i style="background:' + s.c + '"></i>' + s.n + '</div>' +
      '<div class="v" style="color:' + s.c + '">' + s.v + '<small> %</small></div>' +
      '<div class="tk"><i class="fl" style="--w:' + s.v + '%;--c:' + s.c + '"></i></div></div>').join('');
  }

  /* ============================ 供给侧 · 资源池与履约 ============================ */
  function renderRes () {
    $('#resGrid').innerHTML = SUPPLY_RES.map(r =>
      '<div class="res"><div class="ic" style="background:' + r.c + '22;color:' + r.c + '">' + svgIcon(r.icon, 15) + '</div>' +
      '<div><div class="t">' + r.n + '</div><div class="v" style="color:' + r.c + '">' + r.v + '<small> ' + r.u + '</small></div></div></div>').join('');
    const total = AGENTS.reduce((s, a) => s + a.v, 0);
    $('#agentSum').innerHTML =
      '<span class="k">数字供给 · 专业智能体</span>' +
      '<span class="v">' + nf(total) + '<small> 次</small></span>' +
      '<span class="chips">' + AGENTS.map((a, i) =>
        '<i class="achip" title="' + a.n + ' · ' + nf(a.v) + ' 次" style="--c:' + a.c + ';--c-soft:' + a.c + '22">' +
        ['需','配','认','营','睡','运'][i] + '</i>').join('') + '</span>';
  }

  function renderRank () {
    const list = ENGINES.map(e => ({ e: e, v: VOL[e.id] })).sort((a, b) => b.v - a.v);
    const max = list[0].v;
    $('#rankList').innerHTML = list.map((it, i) =>
      '<div class="rankitem">' +
      '<span class="no">' + (i + 1) + '</span>' +
      '<span class="nm"><i class="dot" style="background:' + it.e.color + '"></i>' + it.e.name + '</span>' +
      '<span class="vv">' + nf(it.v) + '<small> 人次</small></span>' +
      '<span class="tk"><i class="fl" style="--w:' + (it.v / max * 100) + '%;--c:' + it.e.color + '"></i></span>' +
      '</div>').join('');
    $('#supplySum').textContent = nf(list.reduce((s, i) => s + i.v, 0));
  }

  /* ============================ 匹配异常预警 ============================ */
  let alertIdx = 0;
  function alertHTML (a, fresh) {
    const e = ENGINES.find(x => x.id === a.eng);
    const c = a.lv === '高危' ? C.red : C.org;
    const kc = KIND_COLOR[a.kind] || C.pri;
    const t = new Date(Date.now() - Math.floor(Math.random() * 40) * 60000);
    const p = n => String(n).padStart(2, '0');
    return '<div class="alert' + (fresh ? ' fadeUp' : '') + '" style="border-left:2px solid ' + e.color + '">' +
      '<span class="lv" style="background:' + c + '1f;color:' + c + '">' + a.lv + '</span>' +
      '<div class="bd"><div class="t">' + a.t + '</div></div>' +
      '<span class="tm">' + p(t.getHours()) + ':' + p(t.getMinutes()) + '</span>' +
      '<div class="kd"><em style="background:' + kc + '26;color:' + kc + '">' + a.kind + '</em> ' +
      '<span style="color:' + e.color + '">' + e.name + '</span> · ' + a.s + ' · ' + a.r + '</div>' +
      '</div>';
  }
  function renderAlerts () {
    const list = [];
    for (let i = 0; i < 8; i++) list.push(ALERT_POOL[(alertIdx + i) % ALERT_POOL.length]);
    $('#alertTrack').innerHTML = list.map(a => alertHTML(a, false)).join('');
  }
  function rotateAlerts () {
    if (paused) return;
    alertIdx = (alertIdx + 1) % ALERT_POOL.length;
    const box = $('#alertTrack');
    box.removeChild(box.firstElementChild);
    box.insertAdjacentHTML('beforeend', alertHTML(ALERT_POOL[(alertIdx + 7) % ALERT_POOL.length], true));
  }

  /* ============================ 底部滚动条 ============================ */
  function buildTicker () {
    const one = TICKER.map(t =>
      '<span class="it"><i style="color:' + t[0] + '">●</i><b style="color:' + t[0] + '">' + t[1] + '</b>' + t[2] + '</span>').join('');
    $('#tickerTrack').innerHTML = one + one + one;
  }
  const tkState = new Map();
  function animTickers () {
    $$('.ticker .tr').forEach(tr => {
      let st = tkState.get(tr);
      if (!st) { st = { o: 0, w: tr.scrollWidth / 3 }; tkState.set(tr, st); }
      if (!st.w) st.w = tr.scrollWidth / 3;
      if (!paused) st.o -= 0.6 * speed;
      if (st.w && Math.abs(st.o) >= st.w) st.o += st.w;
      tr.style.transform = 'translateX(' + st.o + 'px)';
    });
    requestAnimationFrame(animTickers);
  }

  /* ============================ 需求量 × 供给量 走势 ============================ */
  const DM = ENGINES.map(e => {
    const arr = [];
    let seed = e.id.charCodeAt(0) * 11 + e.id.charCodeAt(1) * 3;
    for (let i = 0; i < 30; i++) {
      seed++;
      const r = Math.sin(seed * 1.7) * 0.5 + Math.cos(seed * 0.9) * 0.5;
      arr.push(e.demand * (0.74 + i * 0.01 + r * 0.07));
    }
    return arr;
  });
  const SP = ENGINES.map((e, k) => DM[k].map((v, i) => {
    const seed = (k + 1) * 31 + i * 7;
    const r = Math.sin(seed) * 0.5 + Math.cos(seed * 1.3) * 0.5;
    return v * (e.supply / e.demand) * (0.965 + r * 0.03);
  }));

  function renderLgd () {
    $('#trendLgd').innerHTML =
      '<span><i style="background:#ff9a1a"></i>需求量</span>' +
      '<span><i style="background:#00e5ff"></i>供给量</span>' +
      '<span><i style="background:#ff4d4f"></i>供给缺口</span>';
  }

  let trendProg = 0;
  function drawTrend () {
    const cv = $('#trendChart');
    const W = cv.clientWidth || 400, H = cv.clientHeight || 120;
    const dpr = window.devicePixelRatio || 1;
    cv.width = W * dpr; cv.height = H * dpr;
    const g = cv.getContext('2d');
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, W, H);

    const pl = 46, pr = 10, pt = 8, pb = 20;
    const iw = W - pl - pr, ih = H - pt - pb, n = 30;
    const demand = [], supply = [];
    for (let i = 0; i < n; i++) {
      let a = 0, b = 0;
      DM.forEach(s => a += s[i]); SP.forEach(s => b += s[i]);
      demand.push(a); supply.push(b);
    }
    const maxT = Math.max.apply(null, demand) * 1.05;
    const minT = Math.min.apply(null, supply) * 0.92;
    const X = i => pl + (i / (n - 1)) * iw;
    const Y = v => pt + ih - ((v - minT) / (maxT - minT)) * ih * trendProg;

    g.strokeStyle = 'rgba(59,158,255,.12)'; g.lineWidth = 1;
    g.fillStyle = '#5E7391'; g.font = '11px sans-serif'; g.textAlign = 'right';
    for (let k = 0; k <= 4; k++) {
      const y = pt + (ih / 4) * k;
      g.beginPath(); g.moveTo(pl, y); g.lineTo(W - pr, y); g.stroke();
      g.fillText(nf(minT + (maxT - minT) * (1 - k / 4)), pl - 8, y + 4);
    }

    /* 缺口区域（需求高于供给部分） */
    g.beginPath();
    for (let i = 0; i < n; i++) { const x = X(i), y = Y(demand[i]); i === 0 ? g.moveTo(x, y) : g.lineTo(x, y); }
    for (let i = n - 1; i >= 0; i--) g.lineTo(X(i), Y(supply[i]));
    g.closePath();
    g.fillStyle = 'rgba(255,77,79,.20)'; g.fill();

    /* 供给面 */
    g.beginPath(); g.moveTo(X(0), pt + ih);
    for (let i = 0; i < n; i++) g.lineTo(X(i), Y(supply[i]));
    g.lineTo(X(n - 1), pt + ih); g.closePath();
    const grd = g.createLinearGradient(0, pt, 0, pt + ih);
    grd.addColorStop(0, 'rgba(0,229,255,.55)'); grd.addColorStop(1, 'rgba(0,229,255,.06)');
    g.fillStyle = grd; g.fill();

    /* 供给线 */
    g.beginPath();
    for (let i = 0; i < n; i++) { const x = X(i), y = Y(supply[i]); i === 0 ? g.moveTo(x, y) : g.lineTo(x, y); }
    g.strokeStyle = '#00e5ff'; g.lineWidth = 2; g.stroke();

    /* 需求线 */
    g.beginPath();
    for (let i = 0; i < n; i++) { const x = X(i), y = Y(demand[i]); i === 0 ? g.moveTo(x, y) : g.lineTo(x, y); }
    g.strokeStyle = '#ff9a1a'; g.lineWidth = 2; g.setLineDash([5, 3]); g.stroke(); g.setLineDash([]);

    g.fillStyle = '#5E7391'; g.textAlign = 'center';
    [0, 9, 19, 29].forEach(i => {
      const d = new Date(Date.now() - (29 - i) * 86400000);
      g.fillText((d.getMonth() + 1) + '/' + d.getDate(), X(i), H - 5);
    });
  }
  function animTrend () {
    if (trendProg < 1) { trendProg = Math.min(1, trendProg + 0.03); drawTrend(); requestAnimationFrame(animTrend); }
  }

  /* ============================ 详情弹窗 ============================ */
  const mask = $('#mask'), dlg = $('#dlg');
  mask.addEventListener('click', ev => { if (ev.target === mask) closeDlg(); });
  document.addEventListener('keydown', ev => { if (ev.key === 'Escape') closeDlg(); });
  function closeDlg () { mask.classList.remove('on'); dlg.innerHTML = ''; }

  function sectionHTML (s, color) {
    let body = '';
    if (s.type === 'bars') {
      body = s.items.map(it => {
        const v = it.b !== undefined ? it.b : it.a;
        const pct = Math.min(100, (v / it.max) * 100);
        const extra = it.b !== undefined ? '<span style="color:var(--t3);font-size:10.5px"> ← ' + it.a + '</span>' : '';
        return '<div class="dbar"><span class="nm" style="color:var(--t2)">' + it.n + '</span>' +
          '<span class="tk"><i class="fl" style="--w:' + pct + '%;--c:' + color + '"></i></span>' +
          '<span class="vv">' + v + (it.u && it.u !== '达标' && it.u !== '接近' && it.u !== '偏离' && it.u !== '边界' ? '<small style="color:var(--t3)">' + it.u + '</small>' : '') + extra + '</span></div>';
      }).join('');
    } else if (s.type === 'kv') {
      body = '<div class="dkv">' + s.items.map(it =>
        '<div class="i"><div class="k">' + it.k + '</div><div class="v" style="color:' + color + '">' + it.v +
        (it.u ? '<small> ' + it.u + '</small>' : '') + '</div></div>').join('') + '</div>';
    } else if (s.type === 'table') {
      const hasStatus = s.cols[s.cols.length - 1] === '状态';
      body = '<table class="dtbl"><thead><tr>' + s.cols.map(c => '<th>' + c + '</th>').join('') +
        '</tr></thead><tbody>' + s.rows.map(r => {
          if (hasStatus) {
            const cells = r.slice(0, -1);
            const status = cells[cells.length - 1];
            const colorKey = r[r.length - 1];
            return '<tr>' + cells.slice(0, -1).map((c, i) =>
              '<td' + (i > 0 ? ' class="num"' : '') + '>' + c + '</td>').join('') +
              '<td><span class="pill" style="background:' + (C[colorKey] || C.pri) + '1f;color:' + (C[colorKey] || C.pri) + '">' +
              status + '</span></td></tr>';
          }
          return '<tr>' + r.map((c, i) =>
            '<td' + (i > 0 ? ' class="num"' : '') + '>' + c + '</td>').join('') + '</tr>';
        }).join('') + '</tbody></table>';
    } else {
      body = '<ul class="dlist">' + s.items.map(t => '<li>' + t + '</li>').join('') + '</ul>';
    }
    return '<div class="dsec' + (s.wide ? ' wide' : '') + '"><h4><i class="bar" style="background:' + color + '"></i>' +
      s.title + (s.note ? '<span class="rt">' + s.note + '</span>' : '') + '</h4>' + body + '</div>';
  }

  function openEngine (e) {
    if (!e) return;
    const mr = matchOf(e), gap = e.demand - e.supply;
    /* 仅展示群体分析模块，过滤个案 / 个人名单类内容 */
    const sections = (e.detail.sections || []).filter(s =>
      !/个案|个人|主诉|床位|患者名单|E-\d/.test(s.title + (s.note || '')));
    dlg.innerHTML =
      '<div class="dlg-h"><div class="ic" style="background:' + e.color + '22;color:' + e.color + ';border:1px solid ' + e.color + '55">' +
      svgIcon(e.icon, 25) + '</div><div><b>' + e.name + ' · 群体需供分析</b><div class="en">GROUP DEMAND · SUPPLY ANALYSIS</div></div>' +
      '<div class="x" id="dlgX">' + svgIcon('close', 18) + '</div></div>' +
      '<div class="dlg-kpis">' +
        '<div class="dk"><div class="k">群体需求</div><div class="v" style="color:' + C.org + '">' + nf(e.demand) + '<small> 项</small></div></div>' +
        '<div class="dk"><div class="k">已安排供给</div><div class="v" style="color:' + C.cyn + '">' + nf(e.supply) + '<small> 项</small></div></div>' +
        '<div class="dk"><div class="k">需供匹配率</div><div class="v" style="color:' + e.color + '">' + mr.toFixed(1) + '<small> %</small></div></div>' +
        '<div class="dk"><div class="k">待安排缺口</div><div class="v" style="color:' + C.red + '">' + nf(gap) + '<small> 项</small></div></div>' +
      '</div>' +
      '<div class="dlg-grid">' + sections.map(s => sectionHTML(s, e.color)).join('') + '</div>';
    $('#dlgX').onclick = closeDlg;
    mask.classList.add('on');
  }

  function openAlertDlg () {
    const totD = ENGINES.reduce((s, e) => s + e.demand, 0);
    const totS = ENGINES.reduce((s, e) => s + e.supply, 0);
    const totG = totD - totS;
    dlg.innerHTML =
      '<div class="dlg-h"><div class="ic" style="background:' + C.red + '22;color:' + C.red + ';border:1px solid ' + C.red + '55">' +
      svgIcon('alert', 25) + '</div><div><b>需供匹配异常处置中心</b><div class="en">DEMAND-SUPPLY MATCHING ANOMALY CENTER</div></div>' +
      '<div class="x" id="dlgX">' + svgIcon('close', 18) + '</div></div>' +
      '<div class="dlg-kpis">' +
        '<div class="dk"><div class="k">全域识别需求</div><div class="v" style="color:' + C.org + '">' + nf(totD) + '<small> 项</small></div></div>' +
        '<div class="dk"><div class="k">已覆盖供给</div><div class="v" style="color:' + C.cyn + '">' + nf(totS) + '<small> 项</small></div></div>' +
        '<div class="dk"><div class="k">待满足缺口</div><div class="v" style="color:' + C.red + '">' + nf(totG) + '<small> 项</small></div></div>' +
        '<div class="dk"><div class="k">全域匹配率</div><div class="v" style="color:' + C.grn + '">' + Math.min(100, totS / Math.max(totD, 1) * 100).toFixed(1) + '<small> %</small></div></div>' +
        '<div class="dk"><div class="k">异常事件</div><div class="v" style="color:' + C.pri + '">' + ALERT_POOL.length + '<small> 项</small></div></div>' +
      '</div>' +
      '<div class="dlg-grid">' +
        '<div class="dsec"><h4><i class="bar" style="background:' + C.red + '"></i>各引擎需供缺口<span class="rt">需求 − 供给</span></h4>' +
        ENGINES.slice().sort((a, b) => (b.demand - b.supply) - (a.demand - a.supply)).map(e => {
          const gap = e.demand - e.supply;
          return '<div class="dbar"><span class="nm" style="color:var(--t2)">' + e.name + '</span>' +
            '<span class="tk"><i class="fl" style="--w:' + Math.min(100, gap / 50 * 100) + '%;--c:' + e.color + '"></i></span>' +
            '<span class="vv">' + gap + '<small style="color:var(--t3)"> 项</small></span></div>';
        }).join('') + '</div>' +
        '<div class="dsec"><h4><i class="bar" style="background:' + C.org + '"></i>供给侧资源缺口<span class="rt">待补充</span></h4>' +
        SUPPLY_GAP.map(s =>
          '<div class="dbar"><span class="nm" style="color:var(--t2)">' + s.n + '</span>' +
          '<span class="tk"><i class="fl" style="--w:' + Math.min(100, s.v / 5 * 100) + '%;--c:' + s.c + '"></i></span>' +
          '<span class="vv">' + s.v + '<small style="color:var(--t3)"> ' + s.u + '</small></span></div>').join('') + '</div>' +
      '</div>' +
      '<div class="dsec wide" style="margin-top:14px"><h4><i class="bar" style="background:' + C.pur + '"></i>全部异常事件<span class="rt">按异常类型归类</span></h4>' +
      '<table class="dtbl"><thead><tr><th>级别</th><th>异常类型</th><th>来源引擎</th><th>事件</th><th>处置动作</th></tr></thead><tbody>' +
      ALERT_POOL.map(a => {
        const e = ENGINES.find(x => x.id === a.eng);
        const kc = KIND_COLOR[a.kind] || C.pri;
        return '<tr><td><span class="pill" style="background:' + (a.lv === '高危' ? C.red : C.org) + '1f;color:' + (a.lv === '高危' ? C.red : C.org) + '">' + a.lv + '</span></td>' +
          '<td><span class="pill" style="background:' + kc + '26;color:' + kc + '">' + a.kind + '</span></td>' +
          '<td style="color:' + e.color + '">' + e.name + '</td><td>' + a.t + '</td><td>' + a.r + '</td></tr>';
      }).join('') + '</tbody></table></div>';
    $('#dlgX').onclick = closeDlg;
    mask.classList.add('on');
  }

  /* ============================ 实时数据流 ============================ */
  let paused = false, speed = 1;
  function jitter () {
    if (paused) return;
    KPIs.forEach(k => {
      if (typeof k.v !== 'number' || !k.dv) return;
      k.v += k.dv * (0.4 + Math.random() * 1.2) * (Math.random() < 0.55 ? 1 : -1);
      /* 百分比类指标限制在合理区间，避免抖动冲破 100% */
      if (k.u === '%') {
        const lo = Math.max(0, (k._basePct != null ? k._basePct : k.v) - 4);
        const hi = Math.min(99.5, (k._basePct != null ? k._basePct : 95) + 3);
        if (k._basePct == null) k._basePct = Math.min(99.5, k.v);
        k.v = Math.max(lo, Math.min(hi, k.v));
      } else if (k.v < 0) {
        k.v = 0;
      }
      const el = $('[data-k="' + k.k + '"]');
      if (el) el.innerHTML = nf(k.v, k.dec) + (k.u ? '<small>' + k.u + '</small>' : '');
    });
    $('#agentTotal') && ($('#agentTotal').textContent = nf(Number($('#agentTotal').textContent.replace(/,/g, '')) + Math.round(9 * speed)));

    /* 供给持续追赶需求：覆盖数缓增，匹配率抬升（不超过需求） */
    ENGINES.forEach(e => {
      if (e.supply < e.demand && Math.random() < 0.55) e.supply += 1;
      if (e.supply > e.demand) e.supply = e.demand;
      const mr = matchOf(e);
      const d = $('[data-d="' + e.id + '"]'), s = $('[data-s="' + e.id + '"]'), m = $('[data-mr="' + e.id + '"]');
      if (d) d.textContent = nf(e.demand);
      if (s) s.textContent = nf(e.supply);
      if (m) m.textContent = mr.toFixed(1) + '%';
      const fl = $('[data-id="' + e.id + '"] .fl');
      if (fl) fl.style.setProperty('--w', Math.min(100, mr) + '%');
    });
  }

  /* ============================ 工具栏 ============================ */
  $('#btnFlow').onclick = function () {
    paused = !paused;
    this.textContent = paused ? '恢复数据流' : '暂停数据流';
    this.classList.toggle('on', paused);
  };
  $('#btnSpeed').onclick = function () {
    speed = speed === 1 ? 2 : speed === 2 ? 4 : 1;
    this.textContent = speed + '×';
    this.classList.toggle('on', speed !== 1);
  };
  $('#btnFull').onclick = function () {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen();
    else document.exitFullscreen();
  };
  $('#btnAlert').onclick = function () {
    openAlertDlg();
    this.classList.remove('hot'); void this.offsetWidth; this.classList.add('hot');
  };

  /* ============================ 启动 ============================ */
  renderKPI(); renderLoop(); renderEngines(); renderPeople();
  renderDemandTop(); renderDemandSrc(); renderRank(); renderRes(); renderAlerts(); renderLgd();
  buildTicker();
  initAnalysis();
  requestAnimationFrame(() => { drawTrend(); animTrend(); animTickers(); });
  setInterval(jitter, 3000);
  setInterval(rotateAlerts, 4200);
  setInterval(() => {
    const n = 20 + Math.floor(Math.random() * 14);
    $('#alertCnt').textContent = n; $('#alertToday').textContent = n;
  }, 9000);


  /* ============================================================
     视图二 · 需供匹配深度分析
     ============================================================ */
  function gapOf (e) { return e.demand - e.supply; }
  function restOf (e) { return e.capacity - e.supply; }
  function totalGap () { return ENGINES.reduce((s, e) => s + gapOf(e), 0); }
  function totalRest () { return ENGINES.reduce((s, e) => s + restOf(e), 0); }

  function renderKPI2 () {
    $('#kpiRow2').innerHTML = KPIs2.map(k => {
      const c = C[k.c], g = GCOLOR[k.g];
      return '<div class="kpi">' +
        '<div class="ic" style="background:' + c + '22;border:1px solid ' + c + '55;color:' + c + '">' + svgIcon(k.icon, 22) + '</div>' +
        '<div><div class="lb"><i class="gp" style="background:' + g + '22;color:' + g + '">' + k.g + '</i>' + k.k + '</div>' +
        '<div class="vl" style="color:' + c + '">' + nf(k.v, k.dec) + (k.u ? '<small>' + k.u + '</small>' : '') + '</div>' +
        '<div class="dl">较昨日 <b style="color:' + (String(k.d).indexOf('-') === 0 ? C.grn : c) + '">' + k.d + '</b></div></div></div>';
    }).join('');
  }

  /* ---- 匹配质量五态环形图 ---- */
  function drawDonut () {
    const cv = $('#qualityDonut'); if (!cv) return;
    const W = cv.clientWidth || 130, H = cv.clientHeight || 130, dpr = window.devicePixelRatio || 1;
    cv.width = W * dpr; cv.height = H * dpr;
    const g = cv.getContext('2d');
    g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, W, H);
    const cx = W / 2, cy = H / 2, R = Math.min(W, H) / 2 - 5, r = R * 0.63;
    const total = MATCH_QUALITY.reduce((s, q) => s + q.v, 0);
    let a = -Math.PI / 2;
    MATCH_QUALITY.forEach(q => {
      const ang = (q.v / total) * Math.PI * 2;
      g.beginPath();
      g.arc(cx, cy, R, a, a + ang);
      g.arc(cx, cy, r, a + ang, a, true);
      g.closePath();
      g.fillStyle = q.c; g.fill();
      g.strokeStyle = 'rgba(5,12,26,.92)'; g.lineWidth = 2; g.stroke();
      a += ang;
    });
    g.textAlign = 'center';
    g.fillStyle = '#E8F1FF'; g.font = '700 21px "Bahnschrift",Arial Narrow,sans-serif';
    g.fillText((MATCH_QUALITY[0].v / total * 100).toFixed(1) + '%', cx, cy + 3);
    g.fillStyle = '#5E7391'; g.font = '10px sans-serif';
    g.fillText('充分匹配', cx, cy + 17);
  }

  function renderQuality () {
    const total = MATCH_QUALITY.reduce((s, q) => s + q.v, 0);
    $('#qualityLgd').innerHTML = MATCH_QUALITY.map(q =>
      '<div class="dlgi"><i style="background:' + q.c + '"></i><b>' + q.n + '</b>' +
      '<span class="v" style="color:' + q.c + '">' + nf(q.v) + '<small> ' + (q.v / total * 100).toFixed(1) + '%</small></span>' +
      '<span class="d">' + q.d + '</span></div>').join('');
    drawDonut();
  }

  /* ---- 缺口归因 ---- */
  function renderGapReason () {
    const total = GAP_REASON.reduce((s, r) => s + r.v, 0);
    const max = GAP_REASON[0].v;
    $('#gapReason').innerHTML = GAP_REASON.map(r =>
      '<div class="rsn" style="--c:' + r.c + '"><div class="h"><i style="background:' + r.c + '"></i>' + r.n +
      '<span class="v" style="color:' + r.c + '">' + r.v + '<small> 项 · ' + (r.v / total * 100).toFixed(1) + '%</small></span></div>' +
      '<div class="t"><i class="f" style="--w:' + (r.v / max * 100) + '%"></i></div>' +
      '<div class="d">' + r.d + '</div></div>').join('');
  }

  /* ---- 四象限 ---- */
  function drawQuadrant () {
    const cv = $('#quadChart'); if (!cv) return;
    const W = cv.clientWidth || 600, H = cv.clientHeight || 300, dpr = window.devicePixelRatio || 1;
    cv.width = W * dpr; cv.height = H * dpr;
    const g = cv.getContext('2d');
    g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, W, H);

    const pl = 40, pr = 18, pt = 16, pb = 34;
    const xmin = 85, xmax = 115, ymin = 48, ymax = 100;
    const iw = W - pl - pr, ih = H - pt - pb;
    const X = v => pl + ((v - xmin) / (xmax - xmin)) * iw;
    const Y = v => pt + ih - ((v - ymin) / (ymax - ymin)) * ih;
    const xm = X(100), ym = Y(75);

    /* 象限底纹 */
    g.fillStyle = 'rgba(255,77,79,.085)'; g.fillRect(pl, pt, xm - pl, ym - pt);
    g.fillStyle = 'rgba(61,222,168,.075)';  g.fillRect(xm, pt, W - pr - xm, ym - pt);
    g.fillStyle = 'rgba(255,154,26,.075)'; g.fillRect(pl, ym, xm - pl, H - pb - ym);
    g.fillStyle = 'rgba(0,229,255,.075)';  g.fillRect(xm, ym, W - pr - xm, H - pb - ym);

    /* 网格 */
    g.strokeStyle = 'rgba(59,158,255,.10)'; g.lineWidth = 1;
    [90, 95, 100, 105, 110].forEach(v => {
      g.beginPath(); g.moveTo(X(v), pt); g.lineTo(X(v), pt + ih); g.stroke();
      g.fillStyle = '#5E7391'; g.font = '10px sans-serif'; g.textAlign = 'center';
      g.fillText(v, X(v), H - pb + 14);
    });
    [50, 60, 70, 80, 90, 100].forEach(v => {
      g.beginPath(); g.moveTo(pl, Y(v)); g.lineTo(W - pr, Y(v)); g.stroke();
      g.fillStyle = '#5E7391'; g.font = '10px sans-serif'; g.textAlign = 'right';
      g.fillText(v, pl - 6, Y(v) + 3);
    });

    /* 分界线 */
    g.setLineDash([4, 4]); g.lineWidth = 1.4;
    g.strokeStyle = 'rgba(232,241,255,.45)';
    g.beginPath(); g.moveTo(xm, pt); g.lineTo(xm, pt + ih); g.stroke();
    g.beginPath(); g.moveTo(pl, ym); g.lineTo(W - pr, ym); g.stroke();
    g.setLineDash([]);

    /* 象限名 */
    g.font = '700 11.5px sans-serif'; g.textAlign = 'left';
    g.fillStyle = 'rgba(255,138,153,.9)'; g.fillText('扩容区', pl + 8, pt + 14);
    g.textAlign = 'right';
    g.fillStyle = 'rgba(61,222,168,.9)';  g.fillText('稳固区', W - pr - 8, pt + 14);
    g.textAlign = 'left';
    g.fillStyle = 'rgba(255,154,26,.9)'; g.fillText('观察区', pl + 8, H - pb - 8);
    g.textAlign = 'right';
    g.fillStyle = 'rgba(0,229,255,.9)';  g.fillText('溢出区', W - pr - 8, H - pb - 8);

    /* 轴名 */
    g.fillStyle = '#93AACB'; g.font = '10.5px sans-serif'; g.textAlign = 'center';
    g.fillText('供给能力指数（产能 ÷ 需求 × 100）', pl + iw / 2, H - 4);
    g.save(); g.translate(13, pt + ih / 2); g.rotate(-Math.PI / 2);
    g.fillText('需求紧迫度指数', 0, 0); g.restore();

    /* 落点 */
    QUADRANT.forEach(q => {
      const e = ENGINES.find(x => x.id === q.id);
      const x = X(q.s), y = Y(q.d);
      g.beginPath(); g.arc(x, y, 17, 0, Math.PI * 2); g.fillStyle = e.color + '1f'; g.fill();
      g.beginPath(); g.arc(x, y, 7, 0, Math.PI * 2); g.fillStyle = e.color; g.fill();
      g.strokeStyle = 'rgba(4,10,24,.9)'; g.lineWidth = 2; g.stroke();
      g.fillStyle = '#E8F1FF'; g.font = '600 12px sans-serif'; g.textAlign = 'center';
      g.fillText(q.n, x, y - 15);
      g.fillStyle = e.color; g.font = '10px "Bahnschrift",Arial Narrow,sans-serif';
      g.fillText(q.d + ' / ' + q.s, x, y + 24);
    });
  }

  function renderQuadStrat () {
    $('#quadStrat').innerHTML = QUAD_STRATEGY.map(q =>
      '<div class="qs" style="--c:' + q.c + '"><div class="q">' + q.q + '</div>' +
      '<div class="sub">' + q.sub + '</div><div class="t">' + q.t + '</div>' +
      '<div class="e">' + q.eng.join(' · ') + '</div></div>').join('');
  }

  /* ---- 缺口 × 剩余产能 ---- */
  function renderCap () {
    const rows = ENGINES.slice().sort((a, b) => gapOf(b) - gapOf(a));
    const maxV = Math.max.apply(null, ENGINES.map(e => Math.max(gapOf(e), restOf(e))));
    $('#capList').innerHTML = rows.map(e => {
      const gp = gapOf(e), rs = restOf(e);
      return '<div class="cap"><span class="n"><i style="background:' + e.color + '"></i>' + e.name + '</span>' +
        '<span class="b bg" style="width:' + (gp / maxV * 100) + '%;margin-left:auto"></span>' +
        '<span class="b br" style="width:' + (rs / maxV * 100) + '%"></span>' +
        '<span class="vv"><b style="color:#ff4d4f">' + gp + '</b> / <b style="color:#3ddea8">' + rs + '</b></span></div>';
    }).join('');

    /* 结构性错配判定 */
    const short = ENGINES.filter(e => gapOf(e) > restOf(e));
    const donors = ENGINES.filter(e => restOf(e) > gapOf(e)).sort((a, b) => (restOf(b) - gapOf(b)) - (restOf(a) - gapOf(a)));
    const help = donors.slice(0, 2).map(e => e.name + '（剩余 ' + restOf(e) + '）').join('、');
    let txt = '检测结论：全域剩余产能 <b>' + totalRest() + '</b> 项已覆盖待满足缺口 <b>' + totalGap() +
      '</b> 项，产能总量并不短缺；';
    if (short.length) {
      txt += '但存在<b>结构性错配</b> —— ' + short.map(e =>
        e.name + '缺口 ' + gapOf(e) + ' 项 > 自身剩余 ' + restOf(e) + ' 项').join('；') +
        '。建议由 ' + help + ' 跨引擎调度产能，预计可一次性消化 <b>' +
        Math.min(totalGap(), donors.reduce((s, e) => s + (restOf(e) - gapOf(e)), 0)) + '</b> 项缺口。';
    } else {
      txt += '且各引擎剩余产能均可覆盖自身缺口，无需跨引擎调度。';
    }
    $('#capNote').innerHTML = txt;
  }

  /* ---- 低效匹配复盘 ---- */
  function renderLowEff () {
    $('#lowEff').innerHTML = LOW_EFF.map(l => {
      const e = ENGINES.find(x => x.id === l.eng);
      const good = l.g !== '-';
      return '<div class="low" style="--c:' + e.color + '"><div class="t"><em>' + e.name + '</em>' + l.t +
        '<span class="g"' + (good ? '' : ' style="color:var(--t3)"') + '>' + (good ? '已改善 ' + l.g : '迭代中') + '</span></div>' +
        '<div class="a">处置动作：<b>' + l.a + '</b></div></div>';
    }).join('');
  }

  /* ---- 分析视图播报 ---- */
    function buildTicker2 () {
    const INSIGHTS = [
    ['#3ddea8','匹配质量','充分匹配率 68.4%，认知训练为最低，列为扩容优先级第一'],
    ['#ff4d4f','缺口归因','资源产能不足 85 项占缺口总量 41.9%，为第一归因'],
    ['#ff9a1a','结构错配','全域剩余产能 269 项 > 缺口 203 项，但认知训练 37 > 19 无法自消化'],
    ['#00e5ff','调度建议','营养膳食（54）、智能照护（48）外溢产能可支援认知训练'],
    ['#3b9eff','复盘迭代','低效匹配 6 项已触发方案迭代，平均效果改善 +9.3pt']
  ];
    const one = INSIGHTS.map(t =>
      '<span class="it"><i style="color:' + t[0] + '">●</i><b style="color:' + t[0] + '">' + t[1] + '</b>' + t[2] + '</span>').join('');
    $('#tickerTrack2').innerHTML = one + one + one;
  }

  /* ---- 初始化与视图切换 ---- */
  function initAnalysis () {
    renderKPI2(); renderQuality(); renderGapReason();
    renderQuadStrat(); renderCap(); renderLowEff(); buildTicker2();
  }

  $$('.vsbtn').forEach(btn => btn.addEventListener('click', () => {
    $$('.vsbtn').forEach(b => b.classList.toggle('on', b === btn));
    const v = btn.dataset.v;
    $('#viewMain').classList.toggle('on', v === 'main');
    $('#viewAnalysis').classList.toggle('on', v === 'analysis');
    requestAnimationFrame(() => {
      if (v === 'main') drawTrend();
      else { drawDonut(); drawQuadrant(); }
    });
  }));

  /* 支持直达：?dlg=cog|nut|slp|spt|mon|car|alerts */
  const qs = new URLSearchParams(location.search);
  const q = qs.get('dlg'), v0 = qs.get('v');
  if (v0 === 'analysis') {
    $$('.vsbtn').forEach(b => b.classList.toggle('on', b.dataset.v === 'analysis'));
    $('#viewMain').classList.remove('on');
    $('#viewAnalysis').classList.add('on');
    requestAnimationFrame(() => { drawDonut(); drawQuadrant(); });
  }
  if (q === 'alerts') openAlertDlg();
  else if (q) openEngine(ENGINES.find(x => x.id === q));
})();
