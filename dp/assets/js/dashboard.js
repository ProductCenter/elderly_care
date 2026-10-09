/*
 * 小象智伴 · 智能照护服务运营大屏
 * 单页体验程序：1920×1080 舞台等比缩放，内置实时数据模拟器与三类联动详情。
 */

(function () {
  'use strict';

  /* =================== 工具 =================== */

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var rnd = function (a, b) { return a + Math.random() * (b - a); };
  var irnd = function (a, b) { return Math.round(rnd(a, b)); };
  var pick = function (arr) { return arr[irnd(0, arr.length - 1)]; };
  var pad = function (n) { return n < 10 ? '0' + n : '' + n; };
  var num = function (n) { return String(Math.round(n * 10) / 10).replace(/\.0$/, ''); };

  function timeStr(d) { return pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds()); }
  function hhmm(d) { return pad(d.getHours()) + ':' + pad(d.getMinutes()); }

  function css(name) {
    return getComputedStyle(document.body).getPropertyValue(name).trim();
  }

  /* =================== 静态素材 =================== */

  var SURNAMES = ['王', '李', '张', '陈', '刘', '赵', '孙', '周', '吴', '郑', '钱', '冯', '许', '何', '吕', '施'];
  var GIVEN = ['秀兰', '国栋', '玉梅', '志远', '贵芳', '启明', '淑珍', '文华', '兰英', '福生', '锦程', '月娥', '守信', '家安', '静娴', '长顺'];

  var RISK_TYPES = [
    '血压异常升高', '心率持续过快', '夜间离床超时', '血氧饱和度下降', '体动骤减',
    '血糖偏低', '体温升高', '跌倒姿态识别', '呼吸频率异常', '进食量下降'
  ];

  var RISK_LEVELS = [
    { key: '高', color: 'var(--coral)', raw: '#ff7a7a' },
    { key: '中', color: 'var(--amber)', raw: '#ffc457' },
    { key: '低', color: 'var(--cyan)', raw: '#35e6d0' }
  ];

  var STATUS_FLOW = ['待处置', '已派单', '处置中', '已闭环'];

  var NURSES = ['护工 · 陈静', '护工 · 刘敏', '护士 · 何佳', '社工 · 杨帆', '护工 · 徐磊', '康复师 · 罗珊'];

  var TASK_CATS = [
    { name: '床上照护', total: 168, color: 'var(--cyan)' },
    { name: '助浴清洁', total: 64, color: 'var(--blue)' },
    { name: '户外活动', total: 48, color: 'var(--purple)' },
    { name: '巡房探视', total: 220, color: 'var(--green)' },
    { name: '褥疮预防翻身', total: 96, color: 'var(--amber)' },
    { name: '情绪陪伴', total: 72, color: 'var(--coral)' }
  ];

  var CARE_LEVELS = [
    { name: '自理长者', cnt: 186, color: 'var(--green)' },
    { name: '半失能', cnt: 214, color: 'var(--cyan)' },
    { name: '失能', cnt: 148, color: 'var(--blue)' },
    { name: '重度失能', cnt: 62, color: 'var(--amber)' },
    { name: '认知障碍专区', cnt: 74, color: 'var(--purple)' }
  ];

  var HW_LIST = [
    { name: '智能眼镜', on: 42, all: 45 },
    { name: '电子胸牌', on: 88, all: 92 },
    { name: '护工平板', on: 36, all: 38 },
    { name: '智能床', on: 120, all: 128 },
    { name: '分拣设备', on: 3, all: 3 },
    { name: '送药机器人', on: 6, all: 6 },
    { name: '康复机器人', on: 9, all: 10 },
    { name: '助浴机器人', on: 4, all: 4 },
    { name: '照护机器人', on: 12, all: 12 },
    { name: '体征监测垫', on: 96, all: 104 },
    { name: '血压血糖终端', on: 30, all: 32 },
    { name: '体姿体态相机', on: 8, all: 8 }
  ];

  var AGENTS = [
    {
      name: '护理过程自动记录智能体',
      short: '自动记录',
      input: '智能眼镜、电子胸牌的音视频流',
      action: '识别护理动作与关键观察项，按机构模板生成结构化护理总结',
      output: '结构化护理记录、长者健康档案更新条目',
      calls: 1286, rt: 1.4, state: '运行中'
    },
    {
      name: '护理过程专业指导智能体',
      short: '专业指导',
      input: '照护 SOP、长者护理方案、眼镜 / Pad 实时画面',
      action: '在服务过程中分步提示操作要点、风险提醒与应急话术',
      output: '分步骤服务指引、异常纠偏提示',
      calls: 964, rt: 0.9, state: '运行中'
    },
    {
      name: '用药计划及分拣智能体',
      short: '用药分拣',
      input: '处方、药品存放位置与存量、长者健康动态',
      action: '生成配药计划并驱动分拣机器人完成拣药',
      output: '配药清单、拣药作业指令',
      calls: 742, rt: 2.1, state: '运行中'
    },
    {
      name: '用药配送智能体',
      short: '用药配送',
      input: '用药计划、拣药完成事件、床边位置',
      action: '生成到床配送计划，调度送药机器人或护理人员执行',
      output: '配送任务、服药确认记录',
      calls: 638, rt: 1.8, state: '待触发'
    },
    {
      name: '康复计划生成智能体',
      short: '康复计划',
      input: '健康档案、机能评估、动态监测数据、机构设备清单',
      action: '根因分析与需求推理，编排个性化康复计划与设备参数',
      output: '个性化康复方案、设备联动配置',
      calls: 214, rt: 3.6, state: '运行中'
    },
    {
      name: '康复过程跟踪、效果复盘智能体',
      short: '效果复盘',
      input: '体姿体态监测、任务完成情况、机能复评数据',
      action: '即时反馈鼓励与纠偏，分析方案有效性并给出调整建议',
      output: '效果复盘报告、方案调整建议',
      calls: 356, rt: 2.9, state: '运行中'
    }
  ];

  var MED_STEPS = ['处方核验', '配药单生成', '分拣拣药', '双人复核', '机器人配送', '到床确认', '服药记录'];
  var LOOP_STEPS = ['感知', '研判', '指引', '执行', '记录', '复盘'];

  var TICKER_TPL = [
    { ch: '护工智助', msg: '<b>{nurse}</b> 完成 {room} {name} 的 {task}，记录已自动归档' },
    { ch: '长者智伴', msg: '{name} 家属收到今日照护简报，已点赞 <b>{k}</b> 次' },
    { ch: '护工智助', msg: '{room} {name} 触发 {risk}，系统已推送处置方案' },
    { ch: '长者智伴', msg: '{name} 今日步数达 <b>{k}</b> 步，康复训练完成今日目标' },
    { ch: '护工智助', msg: '用药计划已执行，{name} 的 {k} 种药品完成复核配送' },
    { ch: '长者智伴', msg: '{name} 血压回落至正常区间，健康档案已更新' },
    { ch: '护工智助', msg: '智能眼镜识别到 {room} 夜间的离床行为，已通知值班护工' },
    { ch: '长者智伴', msg: '{name} 本周机能评分提升 <b>{k}</b> 分，家属端报告已生成' }
  ];

  /* =================== 运行时状态 =================== */

  var state = {
    running: true,
    speed: 1,
    risks: [],
    tasks: TASK_CATS.map(function (t) { return { name: t.name, total: t.total, done: irnd(Math.round(t.total * 0.3), Math.round(t.total * 0.8)), color: t.color }; }),
    elderTotal: CARE_LEVELS.reduce(function (s, c) { return s + c.cnt; }, 0),
    eventsToday: irnd(320, 420),
    handled: irnd(280, 380),
    familyTouch: irnd(180, 260),
    vitals: { hr: [], spo2: [] },
    rehabScore: [],
    medTotal: 486, medPacked: 402, medDelivered: 366,
    robotBusy: 4,
    rehabWeek: 268, rehabDone: irnd(150, 220), deviceUse: irnd(72, 88),
    floors: [
      { name: '2F 生活自理区', rooms: 16, focus: ['李国栋 · 208', '晨间血压平稳'] },
      { name: '3F 失能照护区', rooms: 18, focus: ['王秀兰 · 312', '血压持续偏高，已推送处置方案'] },
      { name: '4F 认知照护专区', rooms: 14, focus: ['陈志远 · 405', '夜间游走行为增多'] },
      { name: '5F 康复训练中心', rooms: 12, focus: ['吴兰英 · 501', '上下肢训练已完成 3 组'] }
    ],
    floorIndex: 2,
    scale: 1
  };

  var scaleNow = 1;

  var nameSeed = irnd(0, 15);

  function elderName() {
    nameSeed = (nameSeed + 1) % 256;
    var s = Math.floor(nameSeed / 16) % 16;
    var g = (nameSeed * 7 + 3) % 16;
    return SURNAMES[s] + GIVEN[g];
  }

  function roomNo() {
    return String(state.floorIndex + 1) + pad(irnd(1, 19));
  }

  function makeRisk() {
    var r = Math.random();
    var level = r < 0.14 ? 0 : (r < 0.45 ? 1 : 2);
    var t = new Date();
    return {
      id: 'e' + Date.now() + Math.random().toString(36).slice(2, 6),
      name: elderName(),
      room: roomNo(),
      type: pick(RISK_TYPES),
      level: level,
      time: new Date(t.getTime() - irnd(0, 3600) * 1000),
      status: pick(STATUS_FLOW)
    };
  }

  for (var i = 0; i < 9; i++) { state.risks.push(makeRisk()); }
  state.risks.sort(function (a, b) { return a.time - b.time; });

  for (var v = 0; v < 30; v++) {
    state.vitals.hr.push(rnd(66, 88));
    state.vitals.spo2.push(rnd(94, 99));
  }
  for (var rb = 0; rb < 8; rb++) {
    state.rehabScore.push(round1(58 + rb * 1.9 + rnd(-1.6, 1.6)));
  }

  function round1(n) { return Math.round(n * 10) / 10; }

  /* =================== 舞台缩放 =================== */

  var stage = $('#stage');

  function fit() {
    var s = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
    scaleNow = s;
    stage.style.transform = 'scale(' + s + ')';
    drawAllCharts();
  }
  window.addEventListener('resize', fit);

  /* =================== Canvas 图表 =================== */

  function prepCanvas(cv) {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var s = scaleNow * dpr;
    var w = cv.clientWidth || 420;
    var h = cv.clientHeight || 86;
    if (cv.width !== Math.round(w * s) || cv.height !== Math.round(h * s)) {
      cv.width = Math.round(w * s);
      cv.height = Math.round(h * s);
    }
    var ctx = cv.getContext('2d');
    ctx.setTransform(s, 0, 0, s, 0, 0);
    ctx.clearRect(0, 0, w, h);
    return { ctx: ctx, w: w, h: h };
  }

  function lineChart(cv, series, opts) {
    var p = prepCanvas(cv);
    var ctx = p.ctx, w = p.w, h = p.h;
    var o = opts || {};
    var padL = o.padL === undefined ? 30 : o.padL;
    var min = o.min, max = o.max;

    ctx.strokeStyle = getComputedStyle(document.body).getPropertyValue('--line').trim() || 'rgba(120,170,210,.2)';
    ctx.lineWidth = 1;
    ctx.font = '10px sans-serif';
    ctx.fillStyle = css('--txt-mute');
    for (var g = 0; g <= 3; g++) {
      var y = 8 + (h - 24) * g / 3;
      ctx.beginPath();
      ctx.moveTo(padL, y);
      ctx.lineTo(w, y);
      ctx.stroke();
      ctx.textAlign = 'right';
      ctx.fillText(String(Math.round(max - (max - min) * g / 3)), padL - 6, y + 3);
    }

    series.forEach(function (ser) {
      var pts = ser.data;
      if (!pts.length) return;
      ctx.beginPath();
      pts.forEach(function (v, i) {
        var x = padL + (w - padL - 6) * i / (pts.length - 1);
        var y = 8 + (h - 24) * (1 - (v - min) / (max - min));
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      });
      ctx.strokeStyle = ser.color;
      ctx.lineWidth = 2;
      ctx.lineJoin = 'round';
      ctx.stroke();

      if (o.area) {
        ctx.lineTo(padL + (w - padL - 6), h - 16);
        ctx.lineTo(padL, h - 16);
        ctx.closePath();
        var grd = ctx.createLinearGradient(0, 0, 0, h);
        grd.addColorStop(0, hexA(ser.color, .35));
        grd.addColorStop(1, hexA(ser.color, 0));
        ctx.fillStyle = grd;
        ctx.fill();
      }

      var lx = padL + (w - padL - 6);
      var ly = 8 + (h - 24) * (1 - (pts[pts.length - 1] - min) / (max - min));
      ctx.beginPath();
      ctx.arc(lx - 2, ly, 3, 0, Math.PI * 2);
      ctx.fillStyle = ser.color;
      ctx.fill();
    });
  }

  function hexA(color, a) {
    var c = (color || '').trim();
    if (c.indexOf('#') === 0) {
      var d = document.createElement('span');
      d.style.color = c;
      document.body.appendChild(d);
      c = getComputedStyle(d).color;
      document.body.removeChild(d);
    }
    var m = c.match(/rgba?\(([^)]+)\)/);
    if (m) {
      var parts = m[1].split(',').map(function (x) { return x.trim(); });
      return 'rgba(' + parts[0] + ',' + parts[1] + ',' + parts[2] + ',' + a + ')';
    }
    return c;
  }

  /* =================== 环形图 =================== */

  function donut(box, center, sub, segments) {
    var size = 128, r = 50, cx = size / 2, cy = size / 2, sw = 13;
    var total = segments.reduce(function (s, x) { return s + x.value; }, 0) || 1;
    var offset = 0;
    var C = 2 * Math.PI * r;
    var svg = '<svg viewBox="0 0 ' + size + ' ' + size + '" width="100%" height="100%">';
    svg += '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="rgba(120,170,210,.18)" stroke-width="' + sw + '"/>';
    segments.forEach(function (s) {
      var len = C * s.value / total;
      svg += '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="' + s.color +
        '" stroke-width="' + sw + '" stroke-linecap="butt" stroke-dasharray="' + (len - 2) + ' ' + (C - len + 2) +
        '" stroke-dashoffset="' + (-offset) + '" transform="rotate(-90 ' + cx + ' ' + cy + ')" style="transition:stroke-dasharray .6s,stroke-dashoffset .6s"/>';
      offset += len;
    });
    svg += '<text x="' + cx + '" y="' + (cy - 2) + '" text-anchor="middle" class="num" style="font-size:24px;font-weight:700;fill:' + css('--txt') + '">' + center + '</text>';
    svg += '<text x="' + cx + '" y="' + (cy + 16) + '" text-anchor="middle" style="font-size:11px;fill:' + css('--txt-mute') + '">' + sub + '</text>';
    svg += '</svg>';
    box.innerHTML = svg;
  }

  function spark(values, color) {
    var w = 84, h = 26;
    var max = Math.max.apply(null, values), min = Math.min.apply(null, values);
    var d = values.map(function (v, i) {
      var x = w * i / (values.length - 1);
      var y = h - 2 - (h - 6) * (v - min) / ((max - min) || 1);
      return x.toFixed(1) + ',' + y.toFixed(1);
    }).join(' ');
    return '<svg class="spark" width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + ' ' + h + '">' +
      '<polyline points="' + d + '" fill="none" stroke="' + color + '" stroke-width="1.6"/>' +
      '<polyline points="0,' + h + ' ' + d + ' ' + w + ',' + h + '" fill="' + hexA(color, .16) + '" stroke="none"/></svg>';
  }

  /* =================== 各区块渲染 =================== */

  var kpiSeries = {};

  function renderKPI() {
    var doneTasks = state.tasks.reduce(function (s, t) { return s + t.done; }, 0);
    var totalTasks = state.tasks.reduce(function (s, t) { return s + t.total; }, 0);
    var pending = state.risks.filter(function (r) { return r.status !== '已闭环'; }).length;
    var hwOn = HW_LIST.reduce(function (s, h) { return s + h.on; }, 0);
    var hwAll = HW_LIST.reduce(function (s, h) { return s + h.all; }, 0);

    var items = [
      { label: '在护长者', v: state.elderTotal, unit: '人', color: 'var(--cyan)', d: '较昨日 +' + irnd(1, 6) },
      { label: '今日健康事件', v: state.eventsToday, unit: '件', color: 'var(--blue)', d: '同比 -' + irnd(2, 9) + '%' },
      { label: '待处置风险', v: pending, unit: '件', color: 'var(--coral)', d: '平均响应 ' + num(rnd(0.6, 2)) + ' 分钟' },
      { label: '护理任务完成率', v: num(doneTasks * 100 / totalTasks), unit: '%', color: 'var(--green)', d: '完成 ' + doneTasks + ' / ' + totalTasks },
      { label: '设备在线率', v: num(hwOn * 100 / hwAll), unit: '%', color: 'var(--purple)', d: hwOn + ' / ' + hwAll + ' 台在线' },
      { label: '家属互动', v: state.familyTouch, unit: '次', color: 'var(--amber)', d: '本周 +' + irnd(20, 60) + '%' }
    ];

    var html = items.map(function (it, i) {
      var key = 'k' + i;
      if (!kpiSeries[key]) {
        kpiSeries[key] = [];
        var base = typeof it.v === 'number' ? it.v : 10;
        for (var q = 0; q < 12; q++) kpiSeries[key].push(base * rnd(.82, 1.18));
      }
      kpiSeries[key].push(parseFloat(it.v));
      if (kpiSeries[key].length > 12) kpiSeries[key].shift();
      return '<div class="kpi" style="--k:' + it.color + '">' +
        '<div class="label">' + it.label + '</div>' +
        '<div><span class="value">' + it.v + '</span><span class="unit">' + it.unit + '</span></div>' +
        '<div class="delta">' + it.d + '</div>' +
        spark(kpiSeries[key], it.color) +
        '</div>';
    }).join('');
    $('#kpiRow').innerHTML = html;
  }

  function renderRisk() {
    var high = state.risks.filter(function (r) { return r.level === 0; }).length;
    var mid = state.risks.filter(function (r) { return r.level === 1; }).length;
    var low = state.risks.filter(function (r) { return r.level === 2; }).length;
    var total = state.risks.length || 1;

    donut($('#riskDonut'), total, '近 1 小时事件', [
      { value: high, color: css('--coral') },
      { value: mid, color: css('--amber') },
      { value: low, color: css('--cyan') }
    ]);

    $('#riskLegend').innerHTML = RISK_LEVELS.map(function (lv, i) {
      var cnt = [high, mid, low][i];
      return '<div class="row"><i class="dot" style="background:' + lv.raw + '"></i>' + lv.key + '风险' +
        '<span class="val" style="color:' + lv.raw + '">' + cnt + '</span>' +
        '<span class="pct">' + Math.round(cnt * 100 / total) + '%</span></div>';
    }).join('') +
      '<div class="row" style="margin-top:2px"><span style="color:var(--txt-mute)">今日累计</span>' +
      '<span class="val val-b">' + state.eventsToday + '</span><span class="pct">已闭环 ' + Math.round(state.handled * 100 / state.eventsToday) + '%</span></div>';

    list = state.risks.slice(0, 8);
    $('#riskList').innerHTML = list.map(function (r) {
      var lv = RISK_LEVELS[r.level];
      var stColor = r.status === '已闭环' ? 'var(--green)' : (r.status === '待处置' ? 'var(--coral)' : 'var(--amber)');
      return '<div class="evt" data-id="' + r.id + '">' +
        '<i class="lvl" style="background:' + lv.raw + '"></i>' +
        '<span class="who">' + r.name + '</span>' +
        '<span class="desc">' + r.room + ' · ' + r.type + '</span>' +
        '<span class="t">' + hhmm(r.time) + '</span>' +
        '<span class="st" style="color:' + stColor + '">' + r.status + '</span></div>';
    }).join('');

    $$('#riskList .evt').forEach(function (el) {
      el.addEventListener('click', function () {
        var r = state.risks.filter(function (x) { return x.id === el.dataset.id; })[0];
        if (r) openRiskDialog(r);
      });
    });
  }
  var list;

  function renderTasks() {
    var done = state.tasks.reduce(function (s, t) { return s + t.done; }, 0);
    var total = state.tasks.reduce(function (s, t) { return s + t.total; }, 0);
    var pct = Math.round(done * 100 / total);
    donut($('#taskDonut'), pct + '%', '今日任务', [
      { value: done, color: css('--cyan') },
      { value: total - done, color: 'rgba(120,170,210,.25)' }
    ]);

    $('#taskStat').innerHTML =
      '已完成 <b class="val-c">' + done + '</b> / ' + total + '<br>' +
      '待执行 <b class="val-a">' + (total - done) + '</b><br>' +
      'SOP 指引 <b class="val-b">' + (done * 3 + irnd(20, 60)) + '</b> 次<br>' +
      '超时未执行 <b class="val-r">' + irnd(0, 4) + '</b> 项';

    $('#taskTag').textContent = '完成 ' + pct + '%';

    $('#taskBars').innerHTML = state.tasks.map(function (t) {
      return '<div class="task"><span>' + t.name + '</span>' +
        '<div class="bar-wrap"><div class="bar-inner" style="width:' + (t.done * 100 / t.total).toFixed(1) + '%;background:linear-gradient(90deg,' + t.color + ',' + t.color + 'cc)"></div></div>' +
        '<span class="num">' + t.done + '/' + t.total + '</span></div>';
    }).join('');
  }

  /* 在护长者构成：压缩为一排轻量标签，放在护理任务面板底部 */
  function renderElderChips() {
    $('#elderChips').innerHTML = CARE_LEVELS.map(function (c) {
      return '<div class="chip-lite"><span>' + c.name + '</span> <b style="color:' + c.color + '">' + c.cnt + '</b></div>';
    }).join('');
  }

  /* ---------- 院区平面图 ---------- */

  function renderPlan() {
    var W = 760, H = 300;
    var rows = [
      { y: 16, cnt: 9 },
      { y: 156, cnt: 9 }
    ];
    var rw = 72, gap = 8, x0 = 24, rh = 96;
    var svg = '<svg viewBox="0 0 ' + W + ' ' + H + '" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" style="display:block">';
    svg += '<defs><linearGradient id="cor" x1="0" y1="0" x2="1" y2="0">' +
      '<stop offset="0" stop-color="' + css('--blue') + '" stop-opacity=".08"/>' +
      '<stop offset=".5" stop-color="' + css('--cyan') + '" stop-opacity=".16"/>' +
      '<stop offset="1" stop-color="' + css('--blue') + '" stop-opacity=".08"/></linearGradient></defs>';

    // 服务通道
    svg += '<rect x="14" y="120" width="732" height="30" rx="6" fill="url(#cor)" stroke="' + css('--line') + '"/>' +
      '<text x="380" y="139" text-anchor="middle" style="font-size:11px;fill:' + css('--txt-mute') + ';letter-spacing:3px">服务通道 SERVICE CORRIDOR</text>';

    var hoverRooms = state.risks.slice(0, 4).map(function (r) { return r.room; });
    ['303', '308'].forEach(function (r) {
      if (hoverRooms.length < 2 && hoverRooms.indexOf(r) < 0) hoverRooms.push(r);
    });

    rows.forEach(function (row, ri) {
      for (var i = 0; i < row.cnt; i++) {
        var id = String(state.floorIndex + 1) + pad(ri === 0 ? i + 1 : i + 11);
        var x = x0 + i * (rw + gap);
        var alert = hoverRooms.indexOf(id) >= 0;
        var busy = Math.random() < .18;
        var fill = alert ? 'rgba(255,122,122,.22)' : (busy ? 'rgba(53,230,208,.16)' : 'rgba(74,168,255,.10)');
        var stroke = alert ? css('--coral') : (busy ? css('--cyan') : css('--line'));
        svg += '<g class="room" data-room="' + id + '">' +
          '<rect x="' + x + '" y="' + row.y + '" width="' + rw + '" height="' + rh + '" rx="6" fill="' + fill + '" stroke="' + stroke + '" stroke-width="1"/>' +
          '<text x="' + (x + rw / 2) + '" y="' + (row.y + 22) + '" text-anchor="middle" style="font-size:13px;font-weight:600;fill:' + css('--txt') + '">' + id + '</text>' +
          '<text x="' + (x + rw / 2) + '" y="' + (row.y + 40) + '" text-anchor="middle" style="font-size:11px;fill:' + css('--txt-mute') + '">' + SURNAMES[(i * 7 + ri * 3) % 16] + GIVEN[(i * 5 + ri * 11) % 16] + '</text>' +
          '<line x1="' + (x + 8) + '" y1="' + (row.y + 50) + '" x2="' + (x + rw - 8) + '" y2="' + (row.y + 50) + '" stroke="' + css('--line') + '"/>' +
          '<text x="' + (x + rw / 2) + '" y="' + (row.y + 68) + '" text-anchor="middle" style="font-size:11px;fill:' + css('--txt-dim') + '">' + (alert ? '重点关注' : (busy ? '服务进行中' : '状态平稳')) + '</text>' +
          '<text x="' + (x + rw / 2) + '" y="' + (row.y + 86) + '" text-anchor="middle" style="font-size:10.5px;fill:' + css('--txt-dim') + '">' + irnd(1, 3) + ' 床 · ' + irnd(0, 2) + ' 待办</text>' +
          (alert ? '<circle class="pulse" cx="' + (x + rw - 12) + '" cy="' + (row.y + 12) + '" r="4" fill="' + css('--coral') + '"/>' : '') +
          '</g>';
      }
    });

    // 送药机器人沿服务通道巡检
    svg += '<g id="robotG"><rect id="robotBox" x="30" y="126" width="26" height="18" rx="5" fill="' + css('--cyan') + '" opacity=".85"/>' +
      '<text id="robotTxt" x="43" y="122" text-anchor="middle" style="font-size:10px;fill:' + css('--cyan') + '">送药机器人</text></g>';

    // 图例
    var legend = [['重点关注', css('--coral')], ['服务进行中', css('--cyan')], ['状态平稳', css('--line-strong')]];
    legend.forEach(function (l, i) {
      var lx = 24 + i * 110;
      svg += '<rect x="' + lx + '" y="270" width="10" height="10" rx="2" fill="' + l[1] + '" opacity=".8"/>';
      svg += '<text x="' + (lx + 16) + '" y="280" style="font-size:11px;fill:' + css('--txt-mute') + '">' + l[0] + '</text>';
    });
    svg += '<text x="736" y="280" text-anchor="end" style="font-size:11px;fill:' + css('--txt-mute') + '">共 60 个照护单元 · 点击房间查看详情</text>';

    svg += '</svg>';
    $('#planBox').innerHTML = svg;

    $$('#planBox .room').forEach(function (g) {
      g.addEventListener('click', function () { openRoomDialog(g.dataset.room); });
    });
  }

  // 送药机器人：贴近院内低速巡航（约 0.4–0.6 m/s）+ 床边停靠核验
  var robotX = 30, robotDir = 1, robotPause = 0, robotSkipStop = -1;
  var ROBOT_STOPS = [30, 118, 206, 294, 382, 470, 558, 646, 706];
  function moveRobot() {
    var box = $('#robotBox'), txt = $('#robotTxt');
    if (!box) return;
    if (robotPause > 0) {
      robotPause -= 1;
      box.setAttribute('opacity', '0.55');
      return;
    }
    box.setAttribute('opacity', '0.85');
    var prev = robotX;
    // 每帧约 0.55px @80ms ≈ 单程走廊约 100s，接近实际送药节奏
    robotX += robotDir * 0.55;
    if (robotX > 706) { robotX = 706; robotDir = -1; robotPause = 48; robotSkipStop = ROBOT_STOPS.length - 1; }
    else if (robotX < 20) { robotX = 20; robotDir = 1; robotPause = 48; robotSkipStop = 0; }
    else {
      for (var i = 0; i < ROBOT_STOPS.length; i++) {
        if (i === robotSkipStop) continue;
        var sx = ROBOT_STOPS[i];
        // 路过照护单元时短暂停靠（核验身份 / 交接药品）
        if ((prev - sx) * (robotX - sx) <= 0) {
          robotX = sx;
          robotPause = 22 + irnd(0, 10);
          robotSkipStop = i;
          break;
        }
      }
      if (robotPause === 0) robotSkipStop = -1;
    }
    box.setAttribute('x', robotX.toFixed(1));
    txt.setAttribute('x', (robotX + 13).toFixed(1));
  }

  /* ---------- 智能体矩阵 ---------- */

  function renderAgents() {
    var colors = { '运行中': 'var(--green)', '待触发': 'var(--amber)', '学习优化': 'var(--blue)' };
    $('#agentGrid').innerHTML = AGENTS.map(function (a, i) {
      var c = colors[a.state];
      return '<div class="agent" data-i="' + i + '">' +
        '<div class="top"><span class="name">' + a.short + '</span>' +
        '<span class="state" style="color:' + c + '">' + a.state + '</span></div>' +
        '<div class="desc">' + a.action + '</div>' +
        '<div class="metric"><span>今日调用 <b>' + a.calls + '</b></span><span>响应 <b>' + a.rt + 's</b></span></div>' +
        (a.state === '运行中' ? '<div class="flow"></div>' : '') +
        '</div>';
    }).join('');

    $$('#agentGrid .agent').forEach(function (el) {
      el.addEventListener('click', function () { openAgentDialog(AGENTS[+el.dataset.i]); });
    });

    var totalCalls = AGENTS.reduce(function (s, a) { return s + a.calls; }, 0);
    $('#agentCalls').innerHTML = totalCalls.toLocaleString() + ' <small style="font-size:12px">次</small>';
    var avg = AGENTS.reduce(function (s, a) { return s + a.rt; }, 0) / AGENTS.length;
    $('#agentRt').textContent = avg.toFixed(1);
  }

  function renderLoop() {
    var cnts = [state.eventsToday, state.eventsToday - irnd(20, 40), irnd(240, 300), irnd(230, 290), irnd(220, 280), irnd(60, 90)];
    $('#loopFlow').innerHTML = LOOP_STEPS.map(function (s, i) {
      return '<div class="step"><i>' + (i + 1) + '</i><span class="nm">' + s + '</span><b>' + cnts[i] + '</b></div>';
    }).join('');
  }

  /* ---------- 用药 ---------- */

  function renderMed() {
    var packPct = Math.round(state.medPacked * 100 / state.medTotal);
    var delPct = Math.round(state.medDelivered * 100 / state.medTotal);
    $('#medRings').innerHTML = [
      { c: Math.round(state.medPacked * 100 / state.medTotal), l: '已配药', n: state.medPacked, color: css('--cyan') },
      { c: delPct, l: '已配送', n: state.medDelivered, color: css('--green') },
      { c: 99.98, l: '准确率', n: '99.98', color: css('--blue') }
    ].map(function (r) { return ringItem(r); }).join('');

    $('#medTag').textContent = '配药进度 ' + packPct + '% · 配送 ' + delPct + '%';

    var rows = [];
    for (var i = 0; i < 6; i++) {
      rows.push({
        name: elderName() + ' · ' + roomNo(),
        step: MED_STEPS[irnd(2, 6)],
        robot: pick(['机器人 B2', '机器人 C1', '护理员配送', '志愿者配送'])
      });
    }
    $('#medQueue').innerHTML = rows.map(function (r) {
      var color = r.step === '到床确认' || r.step === '服药记录' ? 'var(--green)' : (r.step === '双人复核' ? 'var(--amber)' : 'var(--cyan)');
      return '<div class="q-row"><span class="who">' + r.name + '</span>' +
        '<span class="chip" style="color:' + color + '">' + r.step + '</span>' +
        '<span style="color:var(--txt-mute);font-size:12px;text-align:right">' + r.robot + '</span></div>';
    }).join('');
  }

  function ringItem(r) {
    var size = 96, cx = size / 2, rad = 38, sw = 8, C = 2 * Math.PI * rad;
    var len = C * Math.min(r.c, 100) / 100;
    return '<div class="ring"><svg width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + ' ' + size + '">' +
      '<circle cx="' + cx + '" cy="' + cx + '" r="' + rad + '" fill="none" stroke="rgba(120,170,210,.18)" stroke-width="' + sw + '"/>' +
      '<circle cx="' + cx + '" cy="' + cx + '" r="' + rad + '" fill="none" stroke="' + r.color + '" stroke-width="' + sw + '" stroke-linecap="round" stroke-dasharray="' + len + ' ' + (C - len) + '" transform="rotate(-90 ' + cx + ' ' + cx + ')" style="transition:stroke-dasharray .8s"/>' +
      '<text x="' + cx + '" y="' + (cx + 4) + '" text-anchor="middle" style="font-size:17px;font-weight:700;fill:' + r.color + '">' + (typeof r.n === 'number' ? r.n : r.n) + '</text>' +
      '</svg><div class="cap">' + r.l + '</div></div>';
  }

  /* ---------- 康复 ---------- */

  function renderRehab() {
    $('#rehabTag').textContent = '本周训练 ' + state.rehabWeek + ' 人次';
    state.rehabDone = Math.min(state.rehabWeek, state.rehabDone + irnd(0, 3));
    $('#rehabStat').innerHTML = [
      { k: '本周训练人次', v: state.rehabDone + '/' + state.rehabWeek, c: 'val-c' },
      { k: '设备利用率', v: state.deviceUse + '%', c: 'val-p' },
      { k: '在训长者', v: 86 + ' 人', c: 'val-g' }
    ].map(function (x) {
      return '<div class="box"><div class="mini-title">' + x.k + '</div><div class="n ' + x.c + '">' + x.v + '</div></div>';
    }).join('');
    $('#rehabNote').innerHTML = '近 8 周综合机能评分提升 <b class="val-g">' +
      (state.rehabScore[state.rehabScore.length - 1] - state.rehabScore[0]).toFixed(1) +
      '</b> 分 · 方案由「康复计划生成智能体」自动编排，执行数据回流至「效果复盘智能体」';
  }

  /* ---------- 硬件在线带 ---------- */

  function renderHW() {
    var on = HW_LIST.reduce(function (s, h) { return s + h.on; }, 0);
    var all = HW_LIST.reduce(function (s, h) { return s + h.all; }, 0);
    var rate = Math.round(on * 100 / all);
    $('#hwRate').textContent = rate + '%';
    $('#hwGrid').innerHTML = HW_LIST.map(function (h) {
      var pct = Math.round(h.on * 100 / h.all);
      var c = pct >= 99 ? 'val-g' : (pct >= 92 ? 'val-c' : 'val-a');
      return '<div class="hw"><div class="n">' + h.name + '</div><div class="v ' + c + '">' + h.on + '<small>/' + h.all + '</small></div></div>';
    }).join('');
  }

  /* ---------- 双通道消息流 ---------- */

  function tickerItems() {
    return TICKER_TPL.map(function (t) {
      return '<span><b style="color:' + (t.ch === '护工智助' ? css('--cyan') : css('--purple')) + '">[' + t.ch + ']</b> ' +
        t.msg.replace('{nurse}', pick(NURSES))
          .replace('{name}', elderName())
          .replace('{room}', roomNo())
          .replace('{task}', pick(['床上照护', '助浴清洁', '巡房探视', '户外活动']))
          .replace('{risk}', pick(RISK_TYPES))
          .replace(/\{k\}/g, irnd(2, 12)) + '</span>';
    }).join('');
  }

  function renderTicker() {
    $('#tickerTrack').innerHTML = tickerItems() + tickerItems();
  }

  /* ---------- 图表汇总绘制 ---------- */

  function drawAllCharts() {
    lineChart($('#vitalChart'), [
      { data: state.vitals.hr, color: css('--coral') },
      { data: state.vitals.spo2, color: css('--cyan') }
    ], { min: 55, max: 100, area: false, padL: 26 });

    lineChart($('#rehabChart'), [
      { data: state.rehabScore, color: css('--green') }
    ], { min: 50, max: 85, area: true, padL: 30 });
  }

  /* =================== 弹层 =================== */

  var mask = $('#mask'), dialog = $('#dialog');

  function closeDialog() { mask.classList.remove('show'); }

  mask.addEventListener('click', function (e) {
    if (e.target === mask) closeDialog();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeDialog();
  });

  function rowsHtml(list) {
    return '<div class="rows">' + list.map(function (r) {
      return '<div class="r"><span>' + r[0] + '</span><div>' + r[1] + '</div></div>';
    }).join('') + '</div>';
  }

  function openRiskDialog(r) {
    var lv = RISK_LEVELS[r.level];
    var plan = pick([
      '① 3 分钟内到床复核体征 ② 记录血压与心率 ③ 按医嘱调整用药 ④ 30 分钟后复测并归档',
      '① 立即到场查看长者状态 ② 协助取舒适体位 ③ 通知值班医生 ④ 完成后填写护理记录',
      '① 推送任务至当班护工 ② 开启智能眼镜全程记录 ③ 按 SOP 完成助浴/转移 ④ 生成服务文档'
    ]);
    dialog.innerHTML =
      '<h4>' + r.name + ' · ' + r.type + '</h4>' +
      '<div class="meta">' + r.room + ' 房 · 触发时间 ' + timeStr(r.time) + ' · 当前状态 ' + r.status + '</div>' +
      rowsHtml([
        ['风险等级', '<span style="color:' + lv.raw + ';font-weight:600">' + lv.key + '风险</span>'],
        ['识别来源', pick(['智能床垫 + 体征雷达', '智能手表', '智能眼镜姿态识别', '电子胸牌定位'])],
        ['关联智能体', '护理过程专业指导智能体 / 自动记录智能体'],
        ['推荐处置', plan],
        ['责任人员', pick(NURSES)],
        ['家属同步', '长者智伴已向 2 位家属推送健康事件（含处置进度）']
      ]) +
      '<div class="acts"><button class="tbtn" id="dClose">关闭</button>' +
      '<button class="tbtn primary" id="dPush">派发任务到护工智助</button></div>';
    mask.classList.add('show');
    $('#dClose').addEventListener('click', closeDialog);
    $('#dPush').addEventListener('click', function () {
      r.status = '处置中';
      XZ.db.insert('service_dispatch', { room: r.room, type: r.type, level: lv.key, at: new Date().toISOString() })
        .catch(function () { /* 离线演示环境忽略 */ });
      renderRisk();
      closeDialog();
      toast('任务已推送至 ' + pick(NURSES));
    });
  }

  function openRoomDialog(id) {
    var elder = elderName();
    dialog.innerHTML =
      '<h4>' + id + ' 照护单元</h4>' +
      '<div class="meta">' + state.floors[state.floorIndex].name + ' · 实时状态</div>' +
      rowsHtml([
        ['在住长者', elder + '（' + irnd(72, 92) + ' 岁 · ' + pick(['半失能', '失能', '自理']) + '）'],
        ['今日已完成', '晨间护理、血压测量、助餐、服药到床（共 ' + irnd(6, 12) + ' 项）'],
        ['待办任务', '晚间翻身 22:00 · 夜间巡房 23:30 · 明日康复训练 09:00'],
        ['在用设备', '智能床 / 体征监测垫 / 电子胸牌 / 机器人配送'],
        ['最近记录', '14:20 血压 138/86 mmHg，较昨日下降 6 mmHg，已归档至健康档案']
      ]) +
      '<div class="acts"><button class="tbtn" id="dClose">关闭</button></div>';
    mask.classList.add('show');
    $('#dClose').addEventListener('click', closeDialog);
  }

  function openAgentDialog(a) {
    dialog.innerHTML =
      '<h4>' + a.name + '</h4>' +
      '<div class="meta">运行状态 ' + a.state + ' · 今日调用 ' + a.calls + ' 次 · 平均响应 ' + a.rt + ' 秒</div>' +
      rowsHtml([
        ['输入数据', a.input],
        ['执行动作', a.action],
        ['产出结果', a.output],
        ['协同硬件', pick(['智能眼镜、电子胸牌、护工平板', '分拣设备、送药机器人', '康复机器人、体姿体态相机', '智能床、体征监测垫'])],
        ['典型场景', pick(['夜间突发体征异常的即时研判', '术后康复第 3 周的方案调整', '慢病长者的每日用药编排', '失能长者的服务过程留痕'])],
        ['近期日志', '最近 3 次调用均成功闭环，无人工介入 ' + irnd(60, 92) + '%']
      ]) +
      '<div class="acts"><button class="tbtn" id="dClose">关闭</button></div>';
    mask.classList.add('show');
    $('#dClose').addEventListener('click', closeDialog);
  }

  /* ---------- 轻提示 ---------- */

  function toast(msg) {
    var el = document.createElement('div');
    el.textContent = msg;
    el.style.cssText = 'position:fixed;left:50%;bottom:60px;transform:translateX(-50%);padding:12px 22px;border-radius:10px;' +
      'background:linear-gradient(120deg,' + css('--cyan') + ',' + css('--blue') + ');color:#04283a;font-size:14px;font-weight:600;z-index:99;box-shadow:0 10px 30px rgba(0,0,0,.35)';
    document.body.appendChild(el);
    setTimeout(function () {
      el.style.transition = 'opacity .4s,transform .4s';
      el.style.opacity = '0';
      el.style.transform = 'translateX(-50%) translateY(10px)';
      setTimeout(function () { el.remove(); }, 420);
    }, 2200);
  }

  /* =================== 登录 =================== */

  var authMode = 'login';

  function refreshAuthUI() {
    var btn = $('#btnAuth');
    var chip = $('#userChip');
    if (!btn || !chip) return;
    var u = XZ.auth.user();
    if (u) {
      btn.textContent = '退出';
      chip.hidden = false;
      chip.textContent = '你好，' + (u.name || u.account);
    } else {
      btn.textContent = '登录';
      chip.hidden = true;
    }
  }

  function openAuth() {
    if (XZ.auth.user()) {
      XZ.auth.logout();
      refreshAuthUI();
      toast('已退出登录');
      return;
    }
    renderAuthDialog();
    mask.classList.add('show');
  }

  function renderAuthDialog() {
    var isLogin = authMode === 'login';
    dialog.className = 'dialog auth-card';
    dialog.innerHTML =
      '<h4>' + (isLogin ? '登录控制台' : '注册机构账号') + '</h4>' +
      '<div class="meta">数据由云端数据库托管，未配置时自动回退本地演示存储</div>' +
      '<div class="tabs"><div class="tab' + (isLogin ? ' on' : '') + '" data-m="login">登录</div><div class="tab' + (isLogin ? '' : ' on') + '" data-m="reg">注册</div></div>' +
      (isLogin ?
        '<div class="field"><label>手机号 / 账号</label><input id="fAccount" placeholder="请输入手机号" value="13800000001"></div>' +
        '<div class="field"><label>密码</label><input id="fPass" type="password" placeholder="请输入密码" value="xiaoxiang"></div>'
        :
        '<div class="field"><label>姓名</label><input id="fName" placeholder="请输入联系人姓名"></div>' +
        '<div class="field"><label>机构名称</label><input id="fOrg" placeholder="例如：夕阳红护理院"></div>' +
        '<div class="field"><label>手机号 / 账号</label><input id="fAccount" placeholder="请输入手机号"></div>' +
        '<div class="field"><label>密码</label><input id="fPass" type="password" placeholder="设置登录密码"></div>'
      ) +
      '<div class="err" id="fErr"></div>' +
      '<div class="acts"><button class="tbtn" id="dClose">取消</button>' +
      '<button class="tbtn primary" id="fSubmit">' + (isLogin ? '登录' : '注册并登录') + '</button></div>';

    $$('#dialog .tab').forEach(function (t) {
      t.addEventListener('click', function () { authMode = t.dataset.m; renderAuthDialog(); });
    });
    $('#dClose').addEventListener('click', closeDialog);
    $('#fSubmit').addEventListener('click', submitAuth);
  }

  function submitAuth() {
    var err = $('#fErr');
    err.textContent = '';
    var account = $('#fAccount').value.trim();
    var pass = $('#fPass').value;
    if (!account || !pass) { err.textContent = '请填写完整信息'; return; }

    var task;
    if (authMode === 'login') {
      task = XZ.auth.login(account, pass);
    } else {
      task = XZ.auth.register({
        name: $('#fName').value.trim(),
        org: $('#fOrg').value.trim(),
        account: account,
        password: pass
      });
    }
    task.then(function (user) {
      refreshAuthUI();
      closeDialog();
      toast('欢迎回来，' + (user.name || user.account));
    }).catch(function (e) {
      err.textContent = e.message || '操作失败，请稍后重试';
    });
  }

  /* =================== 顶栏控件 =================== */

  var btnAuth = $('#btnAuth');
  if (btnAuth) btnAuth.addEventListener('click', openAuth);
  var btnBack = $('#btnBack');
  if (btnBack) {
    btnBack.addEventListener('click', function () { location.href = 'index.html'; });
  }

  $('#btnTheme').addEventListener('click', function () {
    document.body.classList.toggle('theme-light');
    $('#btnTheme').textContent = document.body.classList.contains('theme-light') ? '深色模式' : '浅色模式';
    renderAll();
  });

  $('#btnFlow').addEventListener('click', function () {
    state.running = !state.running;
    $('#btnFlow').textContent = state.running ? '暂停数据' : '恢复数据';
  });

  var speeds = [1, 2, 4];
  $('#btnSpeed').addEventListener('click', function () {
    state.speed = speeds[(speeds.indexOf(state.speed) + 1) % speeds.length];
    $('#btnSpeed').textContent = state.speed + '×';
    restartLoop();
  });

  $('#btnFull').addEventListener('click', function () {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  });

  document.addEventListener('fullscreenchange', fit);

  /* =================== 数据循环 =================== */

  var timer = null;

  function tick() {
    if (!state.running) return;

    // 体征流
    var hr = state.vitals.hr;
    hr.push(Math.max(58, Math.min(110, hr[hr.length - 1] + rnd(-3, 3))));
    if (hr.length > 30) hr.shift();
    var sp = state.vitals.spo2;
    sp.push(Math.max(90, Math.min(100, sp[sp.length - 1] + rnd(-.8, .8))));
    if (sp.length > 30) sp.shift();

    // 新健康事件
    if (Math.random() < .55) {
      state.risks.unshift(makeRisk());
      state.eventsToday += 1;
      if (state.risks.length > 40) state.risks.pop();
      if (Math.random() < .5) state.handled += 1;
      renderRisk();
      renderPlan();
    }

    // 任务推进
    state.tasks.forEach(function (t) {
      t.done = Math.min(t.total, t.done + irnd(0, 3));
    });

    // 用药推进：分拣略快于配送；送药机器人按批次慢速闭环
    if (Math.random() < 0.45) {
      state.medPacked = Math.min(state.medTotal, state.medPacked + irnd(0, 2));
    }
    if (Math.random() < 0.28) {
      state.medDelivered = Math.min(state.medPacked, state.medDelivered + irnd(0, 1));
    }

    // 智能体
    AGENTS.forEach(function (a) {
      if (a.state === '运行中') a.calls += irnd(1, 7);
      else if (Math.random() < .25) { a.state = '运行中'; }
      else if (Math.random() < .1) { a.state = '待触发'; }
      if (Math.random() < .3) a.rt = round1(Math.max(.6, a.rt + rnd(-.2, .2)));
    });

    // 硬件
    HW_LIST.forEach(function (h) {
      if (h.on < h.all && Math.random() < .35) h.on += 1;
      else if (h.on > 0 && Math.random() < .12) h.on -= 1;
    });

    // 康复
    state.rehabScore.push(round1(Math.min(84, state.rehabScore[state.rehabScore.length - 1] + rnd(-.4, .8))));
    if (state.rehabScore.length > 8) state.rehabScore.shift();
    state.deviceUse = Math.max(60, Math.min(96, state.deviceUse + irnd(-2, 2)));
    state.familyTouch += irnd(0, 3);

    // 楼层轮播
    if (Math.random() < .18) {
      state.floorIndex = (state.floorIndex + 1) % state.floors.length;
      var f = state.floors[state.floorIndex];
      $('#floorName').textContent = f.name;
      $('#focusName').textContent = f.focus[0];
      $('#focusDesc').textContent = f.focus[1];
      renderPlan();
    }

    $('#staffOn').innerHTML = irnd(30, 38) + ' <small style="font-size:12px">/ 38 人</small>';
    $('#staffRatio').textContent = num(state.elderTotal / 32);

    renderKPI();
    renderTasks();
    renderElderChips();
    renderAgents();
    renderLoop();
    renderMed();
    renderRehab();
    renderHW();
    drawAllCharts();
  }

  function restartLoop() {
    if (timer) clearInterval(timer);
    timer = setInterval(tick, 2000 / state.speed);
  }

  setInterval(moveRobot, 80);
  setInterval(function () {
    var d = new Date();
    var wk = '日一二三四五六'[d.getDay()];
    $('#clock').textContent = d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) +
      ' 星期' + wk + ' ' + timeStr(d) + ' · 数据源：云端照护数据库';
  }, 1000);

  setInterval(function () {
    if (state.running) renderTicker();
  }, 18000);

  function renderAll() {
    renderKPI();
    renderRisk();
    renderTasks();
    renderElderChips();
    renderPlan();
    renderAgents();
    renderLoop();
    renderMed();
    renderRehab();
    renderHW();
    renderTicker();
    drawAllCharts();
  }

  /* =================== 启动 =================== */

  fit();
  renderAll();
  refreshAuthUI();
  restartLoop();

})();
