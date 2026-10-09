/**
 * Lightweight A2UI v0.9 / v0.9.1 client renderer (Basic Catalog subset).
 * Envelope keys: createSurface | updateComponents | updateDataModel | deleteSurface
 */
(function (global) {
  'use strict';

  var CATALOG_ID = 'https://a2ui.org/specification/v0_9/catalogs/basic/catalog.json';
  var surfaces = Object.create(null);

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function getByPointer(obj, path) {
    if (path == null || path === '' || path === '/') return obj;
    var parts = String(path).replace(/^\//, '').split('/');
    var cur = obj;
    for (var i = 0; i < parts.length; i++) {
      if (cur == null) return undefined;
      var key = parts[i].replace(/~1/g, '/').replace(/~0/g, '~');
      cur = cur[key];
    }
    return cur;
  }

  function setByPointer(obj, path, value) {
    if (path == null || path === '' || path === '/') {
      return value;
    }
    var parts = String(path).replace(/^\//, '').split('/');
    var cur = obj;
    for (var i = 0; i < parts.length - 1; i++) {
      var key = parts[i].replace(/~1/g, '/').replace(/~0/g, '~');
      if (cur[key] == null || typeof cur[key] !== 'object') cur[key] = {};
      cur = cur[key];
    }
    var last = parts[parts.length - 1].replace(/~1/g, '/').replace(/~0/g, '~');
    if (arguments.length < 3) delete cur[last];
    else cur[last] = value;
    return obj;
  }

  function resolveDyn(val, dataModel) {
    if (val == null) return '';
    if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') return val;
    if (typeof val === 'object') {
      if (Object.prototype.hasOwnProperty.call(val, 'path')) {
        var v = getByPointer(dataModel, val.path);
        return v == null ? '' : v;
      }
      if (Object.prototype.hasOwnProperty.call(val, 'literal')) return val.literal;
      if (Object.prototype.hasOwnProperty.call(val, 'value') && !val.path) return val.value;
    }
    return val;
  }

  function ensureSurface(id) {
    if (!surfaces[id]) {
      surfaces[id] = {
        id: id,
        catalogId: CATALOG_ID,
        components: Object.create(null),
        dataModel: {},
        host: null,
        onAction: null
      };
    }
    return surfaces[id];
  }

  function componentType(comp) {
    if (!comp) return '';
    if (typeof comp.component === 'string') return comp.component;
    if (comp.component && typeof comp.component === 'object') {
      var keys = Object.keys(comp.component);
      return keys[0] || '';
    }
    return comp.type || '';
  }

  function componentProps(comp) {
    if (!comp) return {};
    if (typeof comp.component === 'string') {
      var out = {};
      Object.keys(comp).forEach(function (k) {
        if (k !== 'id' && k !== 'component') out[k] = comp[k];
      });
      return out;
    }
    if (comp.component && typeof comp.component === 'object') {
      var t = componentType(comp);
      return comp.component[t] || {};
    }
    return comp;
  }

  function childIds(props) {
    if (!props) return [];
    if (Array.isArray(props.children)) return props.children;
    if (props.children && Array.isArray(props.children.explicitList)) return props.children.explicitList;
    if (props.child) return [props.child];
    return [];
  }

  function renderChart(props, dm) {
    var wrap = document.createElement('div');
    wrap.className = 'a2ui-chart';
    var type = String(resolveDyn(props.chartType || props.type, dm) || 'bar');
    var values = resolveDyn(props.values, dm);
    if (!Array.isArray(values)) values = [];
    values = values.map(function (v) { return Number(v) || 0; });
    var labels = resolveDyn(props.labels, dm);
    if (!Array.isArray(labels)) labels = [];
    var caption = String(resolveDyn(props.caption || props.title, dm) || '');
    var unit = String(resolveDyn(props.unit, dm) || '');
    var vmax = Number(resolveDyn(props.max, dm)) || 0;
    values.forEach(function (v) { if (v > vmax) vmax = v; });
    if (!vmax) vmax = 1;
    if (caption) {
      var cap = document.createElement('div');
      cap.className = 'a2ui-chart-cap';
      cap.textContent = caption + (unit ? '（' + unit + '）' : '');
      wrap.appendChild(cap);
    }
    if (type === 'donut' || type === 'ring') {
      var pct = Math.max(0, Math.min(100, values[0] || 0));
      var donut = document.createElement('div');
      donut.className = 'a2ui-donut';
      donut.style.background = 'conic-gradient(#FF9E42 0 ' + pct + '%, #F3EDE0 ' + pct + '% 100%)';
      var inner = document.createElement('div');
      inner.className = 'a2ui-donut-inner';
      inner.innerHTML = '<b>' + pct + '</b><small>' + esc(labels[0] || '%') + '</small>';
      donut.appendChild(inner);
      wrap.appendChild(donut);
      return wrap;
    }
    if (type === 'line' || type === 'spark') {
      var w = 280, h = 88, pad = 8;
      var svgNS = 'http://www.w3.org/2000/svg';
      var svg = document.createElementNS(svgNS, 'svg');
      svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
      svg.setAttribute('class', 'a2ui-spark');
      var n = Math.max(values.length, 2);
      var pts = values.map(function (v, i) {
        var x = pad + (i * (w - pad * 2)) / (n - 1);
        var y = h - pad - ((v / vmax) * (h - pad * 2));
        return x.toFixed(1) + ',' + y.toFixed(1);
      });
      var poly = document.createElementNS(svgNS, 'polyline');
      poly.setAttribute('fill', 'none');
      poly.setAttribute('stroke', '#E8892A');
      poly.setAttribute('stroke-width', '2.4');
      poly.setAttribute('stroke-linecap', 'round');
      poly.setAttribute('stroke-linejoin', 'round');
      poly.setAttribute('points', pts.join(' '));
      svg.appendChild(poly);
      wrap.appendChild(svg);
      if (labels.length) {
        var labrow = document.createElement('div');
        labrow.className = 'a2ui-chart-labs';
        labels.forEach(function (lb) {
          var s = document.createElement('span');
          s.textContent = String(lb);
          labrow.appendChild(s);
        });
        wrap.appendChild(labrow);
      }
      return wrap;
    }
    var bars = document.createElement('div');
    bars.className = 'a2ui-bars';
    values.forEach(function (v, i) {
      var col = document.createElement('div');
      col.className = 'a2ui-bar-col';
      var num = document.createElement('em');
      num.textContent = String(v);
      var bar = document.createElement('i');
      bar.style.height = Math.round((v / vmax) * 72) + 'px';
      var lab = document.createElement('span');
      lab.textContent = String(labels[i] != null ? labels[i] : i + 1);
      col.appendChild(num);
      col.appendChild(bar);
      col.appendChild(lab);
      bars.appendChild(col);
    });
    wrap.appendChild(bars);
    return wrap;
  }

  function renderNode(surface, id, depth) {
    if (depth > 40) return document.createTextNode('');
    var comp = surface.components[id];
    if (!comp) {
      var ph = document.createElement('span');
      ph.className = 'a2ui-placeholder';
      ph.textContent = '…';
      return ph;
    }
    var type = componentType(comp);
    var props = componentProps(comp);
    var dm = surface.dataModel;

    if (type === 'Text') {
      var el = document.createElement(props.variant === 'h1' || props.variant === 'h2' || props.variant === 'h3' ? 'h5' : 'p');
      el.className = 'a2ui-text a2ui-text-' + (props.variant || 'body');
      el.textContent = String(resolveDyn(props.text, dm));
      return el;
    }

    if (type === 'Button') {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'a2ui-btn' + (props.variant === 'primary' ? ' primary' : '');
      var labelChild = props.child || (Array.isArray(props.children) ? props.children[0] : null);
      if (labelChild && surface.components[labelChild]) {
        var lp = componentProps(surface.components[labelChild]);
        btn.textContent = String(resolveDyn(lp.text, dm) || '确定');
      } else {
        btn.textContent = String(resolveDyn(props.text || props.label, dm) || '确定');
      }
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var action = props.action || {};
        var event = action.event || action;
        var name = event.name || action.name || btn.textContent;
        var context = {};
        if (event.context && typeof event.context === 'object') {
          Object.keys(event.context).forEach(function (k) {
            context[k] = resolveDyn(event.context[k], dm);
          });
        }
        var payload = { name: String(name), context: context, surfaceId: surface.id, label: btn.textContent };
        if (typeof surface.onAction === 'function') surface.onAction(payload);
        else if (typeof global.afuHomeAsk === 'function') global.afuHomeAsk(payload.label || payload.name);
      });
      return btn;
    }

    if (type === 'Badge') {
      var badge = document.createElement('span');
      badge.className = 'a2ui-badge';
      badge.textContent = String(resolveDyn(props.text, dm));
      return badge;
    }

    if (type === 'Divider') {
      var hr = document.createElement('hr');
      hr.className = 'a2ui-divider';
      return hr;
    }

    if (type === 'Image') {
      var img = document.createElement('img');
      img.className = 'a2ui-img' + (props.variant === 'hero' ? ' hero' : '') + (props.variant === 'thumb' ? ' thumb' : '');
      img.alt = String(resolveDyn(props.alt || props.description, dm) || '');
      img.src = String(resolveDyn(props.url || props.src, dm) || '');
      return img;
    }

    if (type === 'ImageRow') {
      var strip = document.createElement('div');
      strip.className = 'a2ui-imgs';
      var urls = resolveDyn(props.urls || props.images, dm);
      if (!Array.isArray(urls)) urls = [];
      urls.forEach(function (u) {
        var im = document.createElement('img');
        im.className = 'a2ui-img thumb';
        im.src = String(u || '');
        im.alt = '';
        strip.appendChild(im);
      });
      return strip;
    }

    if (type === 'Stat') {
      var st = document.createElement('div');
      st.className = 'a2ui-stat';
      var sv = document.createElement('b');
      sv.textContent = String(resolveDyn(props.value, dm));
      var sl = document.createElement('span');
      sl.textContent = String(resolveDyn(props.label, dm) || '');
      st.appendChild(sv);
      st.appendChild(sl);
      var hint = resolveDyn(props.hint, dm);
      if (hint) {
        var sh = document.createElement('em');
        sh.textContent = String(hint);
        st.appendChild(sh);
      }
      return st;
    }

    if (type === 'Meter') {
      var meter = document.createElement('div');
      meter.className = 'a2ui-meter';
      var mv = Number(resolveDyn(props.value, dm)) || 0;
      var mm = Number(resolveDyn(props.max, dm)) || 100;
      var pct = Math.max(0, Math.min(100, Math.round((mv / (mm || 1)) * 100)));
      var mh = document.createElement('div');
      mh.className = 'a2ui-meter-h';
      var ml = document.createElement('span');
      ml.textContent = String(resolveDyn(props.label, dm) || '');
      var mn = document.createElement('b');
      mn.textContent = pct + '%';
      mh.appendChild(ml);
      mh.appendChild(mn);
      var track = document.createElement('div');
      track.className = 'a2ui-meter-track';
      var fill = document.createElement('i');
      fill.style.width = pct + '%';
      track.appendChild(fill);
      meter.appendChild(mh);
      meter.appendChild(track);
      return meter;
    }

    if (type === 'Chart') {
      return renderChart(props, dm);
    }

    if (type === 'Card' || type === 'Column' || type === 'Row' || type === 'List') {
      var box = document.createElement('div');
      box.className = 'a2ui-' + type.toLowerCase();
      if (type === 'Card') box.classList.add('a2ui-card');
      var kids = childIds(props);
      for (var i = 0; i < kids.length; i++) {
        box.appendChild(renderNode(surface, kids[i], depth + 1));
      }
      return box;
    }

    // Unknown → dump text if present
    var unk = document.createElement('div');
    unk.className = 'a2ui-unknown';
    if (props.text != null) unk.textContent = String(resolveDyn(props.text, dm));
    else unk.textContent = type || 'component';
    return unk;
  }

  function paint(surface) {
    if (!surface.host) return;
    surface.host.innerHTML = '';
    surface.host.classList.add('a2ui-surface');
    surface.host.setAttribute('data-a2ui-surface', surface.id);
    if (!surface.components.root) {
      var wait = document.createElement('div');
      wait.className = 'a2ui-waiting';
      wait.textContent = '界面加载中…';
      surface.host.appendChild(wait);
      return;
    }
    surface.host.appendChild(renderNode(surface, 'root', 0));
  }

  function applyEnvelope(msg, opts) {
    opts = opts || {};
    if (!msg || typeof msg !== 'object') return null;

    if (msg.createSurface) {
      var cs = msg.createSurface;
      var s = ensureSurface(cs.surfaceId);
      s.catalogId = cs.catalogId || s.catalogId;
      if (opts.host) s.host = opts.host;
      if (opts.onAction) s.onAction = opts.onAction;
      paint(s);
      return s;
    }

    if (msg.updateComponents) {
      var uc = msg.updateComponents;
      var s2 = ensureSurface(uc.surfaceId);
      if (opts.host) s2.host = opts.host;
      if (opts.onAction) s2.onAction = opts.onAction;
      var list = uc.components || [];
      for (var i = 0; i < list.length; i++) {
        var c = list[i];
        if (c && c.id) s2.components[c.id] = c;
      }
      paint(s2);
      return s2;
    }

    if (msg.updateDataModel) {
      var ud = msg.updateDataModel;
      var s3 = ensureSurface(ud.surfaceId);
      if (opts.host) s3.host = opts.host;
      if (opts.onAction) s3.onAction = opts.onAction;
      var path = ud.path == null ? '/' : ud.path;
      if (path === '/' || path === '') {
        s3.dataModel = ud.value && typeof ud.value === 'object' ? ud.value : {};
      } else if (Object.prototype.hasOwnProperty.call(ud, 'value')) {
        setByPointer(s3.dataModel, path, ud.value);
      } else {
        setByPointer(s3.dataModel, path);
      }
      paint(s3);
      return s3;
    }

    if (msg.deleteSurface) {
      var id = msg.deleteSurface.surfaceId;
      var s4 = surfaces[id];
      if (s4 && s4.host) s4.host.innerHTML = '';
      delete surfaces[id];
      return null;
    }

    return null;
  }

  function extractEnvelopes(text) {
    var out = [];
    var raw = String(text || '');
    if (!raw.trim()) return out;

    // ```a2ui ... ```
    var fence = /```\s*a2ui\s*\n([\s\S]*?)```/gi;
    var m;
    var blocks = [];
    while ((m = fence.exec(raw))) blocks.push(m[1]);
    var sources = blocks.length ? blocks : [raw];

    sources.forEach(function (src) {
      var lines = String(src).split(/\r?\n/);
      for (var i = 0; i < lines.length; i++) {
        var line = lines[i].trim();
        if (!line || line[0] !== '{') continue;
        try {
          var obj = JSON.parse(line);
          if (
            obj &&
            (obj.createSurface || obj.updateComponents || obj.updateDataModel || obj.deleteSurface)
          ) {
            out.push(obj);
          }
        } catch (e) { /* skip */ }
      }
      // Also try whole-block JSON array
      if (!out.length) {
        try {
          var arr = JSON.parse(src.trim());
          if (Array.isArray(arr)) {
            arr.forEach(function (o) {
              if (o && (o.createSurface || o.updateComponents || o.updateDataModel || o.deleteSurface)) {
                out.push(o);
              }
            });
          }
        } catch (e2) { /* skip */ }
      }
    });
    return out;
  }

  /** Incremental JSONL buffer parser for streaming text */
  function StreamParser() {
    this.buf = '';
    this.seen = [];
  }
  StreamParser.prototype.push = function (chunk) {
    this.buf += chunk == null ? '' : String(chunk);
    var added = [];
    // Prefer closed fences
    var fenceRe = /```\s*a2ui\s*\n([\s\S]*?)```/gi;
    var fm;
    var lastFenceEnd = 0;
    while ((fm = fenceRe.exec(this.buf))) {
      lastFenceEnd = fm.index + fm[0].length;
      var lines = fm[1].split(/\r?\n/);
      for (var i = 0; i < lines.length; i++) {
        var line = lines[i].trim();
        if (!line || line[0] !== '{') continue;
        try {
          var obj = JSON.parse(line);
          if (obj && (obj.createSurface || obj.updateComponents || obj.updateDataModel || obj.deleteSurface)) {
            var key = JSON.stringify(obj);
            if (this.seen.indexOf(key) < 0) {
              this.seen.push(key);
              added.push(obj);
            }
          }
        } catch (e) { /* incomplete line */ }
      }
    }
    // Also parse raw JSONL outside fence (complete lines only)
    var scan = lastFenceEnd ? this.buf.slice(lastFenceEnd) : this.buf;
    var parts = scan.split(/\r?\n/);
    // keep last incomplete line in buf conceptually — only parse complete lines from full buf
    var allLines = this.buf.split(/\r?\n/);
    for (var j = 0; j < allLines.length - 1; j++) {
      var ln = allLines[j].trim();
      if (!ln || ln[0] !== '{') continue;
      try {
        var o2 = JSON.parse(ln);
        if (o2 && (o2.createSurface || o2.updateComponents || o2.updateDataModel || o2.deleteSurface)) {
          var k2 = JSON.stringify(o2);
          if (this.seen.indexOf(k2) < 0) {
            this.seen.push(k2);
            added.push(o2);
          }
        }
      } catch (e3) { /* skip */ }
    }
    return added;
  };
  StreamParser.prototype.flush = function () {
    return extractEnvelopes(this.buf).filter(function (obj) {
      var key = JSON.stringify(obj);
      // StreamParser may have already seen some; return all from extract for final pass
      return true;
    });
  };

  function mount(host, envelopes, opts) {
    opts = opts || {};
    if (!host) return null;
    var last = null;
    (envelopes || []).forEach(function (env) {
      last = applyEnvelope(env, {
        host: host,
        onAction: opts.onAction
      });
    });
    return last;
  }


  function buildCardSurface(opts) {
    opts = opts || {};
    var sid = opts.surfaceId || ('elder_card_' + Date.now().toString(36));
    var title = opts.title || '小福';
    var subtitle = opts.subtitle || '';
    var badge = opts.badge || '';
    var image = opts.image || '';
    var images = Array.isArray(opts.images) ? opts.images.filter(Boolean) : [];
    var stats = Array.isArray(opts.stats) ? opts.stats : [];
    var chart = opts.chart || null;
    var meters = Array.isArray(opts.meters) ? opts.meters : [];
    var lines = Array.isArray(opts.lines) ? opts.lines.filter(Boolean) : [];
    if (!lines.length && opts.body) lines = [opts.body];
    var actions = Array.isArray(opts.actions) ? opts.actions : [];

    var colKids = ['head'];
    if (image) colKids.push('img');
    if (images.length) colKids.push('imgs');
    if (subtitle) colKids.push('sub');
    if (stats.length) colKids.push('stats');
    if (chart) colKids.push('chart');
    for (var mi = 0; mi < meters.length; mi++) colKids.push('meter' + mi);
    for (var i = 0; i < lines.length; i++) colKids.push('line' + i);
    if (actions.length) {
      colKids.push('div');
      colKids.push('row');
    }

    var comps = [
      { id: 'root', component: 'Card', child: 'col' },
      { id: 'col', component: 'Column', children: colKids },
      { id: 'head', component: 'Row', children: badge ? ['title', 'badge'] : ['title'] },
      { id: 'title', component: 'Text', text: title, variant: 'h2' }
    ];
    if (badge) comps.push({ id: 'badge', component: 'Badge', text: badge });
    if (image) comps.push({ id: 'img', component: 'Image', url: image, alt: title, variant: 'hero' });
    if (images.length) comps.push({ id: 'imgs', component: 'ImageRow', urls: images });
    if (subtitle) comps.push({ id: 'sub', component: 'Text', text: subtitle, variant: 'h3' });
    if (stats.length) {
      var statIds = [];
      stats.forEach(function (s, idx) {
        var id = 'stat' + idx;
        statIds.push(id);
        comps.push({
          id: id,
          component: 'Stat',
          label: s.label || '',
          value: s.value || '',
          hint: s.hint || ''
        });
      });
      comps.push({ id: 'stats', component: 'Row', children: statIds });
    }
    if (chart) {
      comps.push({
        id: 'chart',
        component: 'Chart',
        chartType: chart.type || chart.chartType || 'bar',
        values: chart.values || [],
        labels: chart.labels || [],
        caption: chart.caption || '',
        unit: chart.unit || '',
        max: chart.max
      });
    }
    meters.forEach(function (m, idx) {
      comps.push({
        id: 'meter' + idx,
        component: 'Meter',
        label: m.label || '',
        value: m.value,
        max: m.max || 100
      });
    });
    for (var j = 0; j < lines.length; j++) {
      comps.push({ id: 'line' + j, component: 'Text', text: String(lines[j]) });
    }
    if (actions.length) {
      comps.push({ id: 'div', component: 'Divider' });
      var actIds = [];
      actions.forEach(function (a, idx) {
        var id = 'b' + idx;
        var lab = 'b' + idx + '_lbl';
        var label = a.label || a.t || '打开';
        var ctx = {};
        if (a.fn) ctx.fn = a.fn;
        if (a.action === 'link' || a.href) {
          ctx.action = 'link';
          ctx.href = a.href;
        }
        if (a.q) ctx.q = a.q;
        if (!ctx.fn && !ctx.href && !ctx.q) ctx.q = label;
        actIds.push(id);
        comps.push({ id: lab, component: 'Text', text: label });
        comps.push({
          id: id,
          component: 'Button',
          child: lab,
          variant: idx === 0 || a.primary ? 'primary' : undefined,
          action: { event: { name: label, context: ctx } }
        });
      });
      comps.push({ id: 'row', component: 'Row', children: actIds });
    }
    return [
      { version: 'v0.9.1', createSurface: { surfaceId: sid, catalogId: CATALOG_ID } },
      { version: 'v0.9.1', updateComponents: { surfaceId: sid, components: comps } }
    ];
  }

  var CARD_PRESETS = {
    health_profile: {
      title: '林淑芬 · 健康档案',
      badge: '评分 82',
      image: './assets/elder-health-portrait-v1.png',
      subtitle: '68 岁 · 高血压 / 糖尿病前期',
      stats: [
        { label: '血压', value: '128/76', hint: '平稳' },
        { label: '血糖', value: '6.2', hint: '临界' },
        { label: '心率', value: '72', hint: '次/分' }
      ],
      chart: {
        type: 'bar',
        caption: '近 7 日空腹血糖',
        unit: 'mmol/L',
        values: [6.8, 7.4, 7.1, 8.2, 6.9, 7.6, 7.3],
        labels: ['一', '二', '三', '四', '五', '六', '日'],
        max: 10
      },
      meters: [{ label: '本周达标', value: 85, max: 100 }],
      lines: ['本周重点：稳定血糖。晚间起夜请先开灯，注意防跌倒。'],
      actions: [
        { label: '打开完整档案', fn: 'healthRecord', primary: true },
        { label: '解读今日血压', q: '我的血压怎么样？' }
      ]
    },
    health_plan: {
      title: '平稳降压计划',
      badge: '第 5 / 8 周',
      image: './assets/plan-blood-pressure-walk-v1.jpg',
      subtitle: '目标：血压稳定在 130/85 以下',
      stats: [
        { label: '进度', value: '67%', hint: '第5周' },
        { label: '打卡', value: '6天', hint: '连续' },
        { label: '达标', value: '85%', hint: '本周' }
      ],
      chart: {
        type: 'line',
        caption: '近 7 日收缩压',
        unit: 'mmHg',
        values: [132, 129, 128, 130, 126, 127, 128],
        labels: ['一', '二', '三', '四', '五', '六', '日'],
        max: 150
      },
      meters: [{ label: '8 周计划进度', value: 67, max: 100 }],
      lines: ['今日任务：测量血压、低盐午餐、晚饭后散步 20 分钟。'],
      actions: [
        { label: '查看方案', fn: 'planDetail', primary: true },
        { label: '今日任务怎么做', q: '平稳降压计划今天要做什么？' }
      ]
    },
    activity: {
      title: '太极晨练班',
      badge: '免费 · 可报名',
      image: './assets/family-dynamics/community-stretching.png',
      subtitle: '周六 07:00 · 社区长廊 · 约 800 米',
      stats: [
        { label: '已报', value: '18', hint: '/30人' },
        { label: '时长', value: '45', hint: '分钟' },
        { label: '距离', value: '800m', hint: '步行' }
      ],
      chart: {
        type: 'bar',
        caption: '近 4 场报名热度',
        values: [12, 18, 22, 18],
        labels: ['太极', '摄影', '编织', '讲座'],
        max: 30
      },
      meters: [{ label: '名额占用', value: 18, max: 30 }],
      lines: ['关节友好的慢节奏活动，结束后可免费测血压。晴天长廊下集合。'],
      actions: [
        { label: '帮我报名', q: '帮我报名太极晨练班', primary: true },
        { label: '去乐活看看', fn: 'lehuo' }
      ]
    },
    nostalgia: {
      title: '怀旧时光 · 老照片',
      badge: '可动起来',
      image: './assets/family-slides/1980-park.png',
      images: [
        './assets/family-slides/1992-bike.png',
        './assets/family-slides/2005-trip.png',
        './assets/family-slides/2020-together.png',
        './assets/family-slides/today-hug.png'
      ],
      subtitle: '1980 年 · 公园合影',
      stats: [
        { label: '相册', value: '28', hint: '张' },
        { label: '年代', value: '1980', hint: '最早' },
        { label: '家人', value: '5', hint: '位' }
      ],
      chart: {
        type: 'donut',
        caption: '回忆影像完成度',
        values: [62],
        labels: ['已动起来']
      },
      lines: ['这张老照片可以做成会微笑、眨眼的回忆影像，也能投屏到客厅电视。'],
      actions: [
        { label: '让照片动起来', fn: 'alive', primary: true },
        { label: '打开相册', fn: 'album' }
      ]
    },
    member: {
      title: '康养钻石会员',
      badge: '专属权益',
      image: './assets/quality-life-2.png',
      subtitle: '林淑芬 · 钻石会员',
      stats: [
        { label: '积分', value: '1280', hint: '可兑' },
        { label: '检测', value: '2次', hint: '本月余' },
        { label: '等级', value: '钻石', hint: '在籍' }
      ],
      chart: {
        type: 'bar',
        caption: '近 6 月积分变化',
        values: [820, 940, 1010, 1100, 1180, 1280],
        labels: ['4月', '5月', '6月', '7月', '8月', '9月'],
        max: 1400
      },
      meters: [{ label: '本月权益使用', value: 40, max: 100 }],
      lines: ['可兑营养膳食或理疗次卡；优先预约绿色通道仍然有效。'],
      actions: [
        { label: '查看权益', fn: 'vip', primary: true },
        { label: '积分怎么花', q: '会员积分可以兑换什么？' }
      ]
    }
  };

  var ELDER_CARD_KINDS = {
    health_profile: { aliases: ['health_profile', 'profile', 'health_record', '档案'], build: function () { return cardSurfaceForKind('health_profile'); } },
    health_plan: { aliases: ['health_plan', 'plan', '方案', '计划'], build: function () { return cardSurfaceForKind('health_plan'); } },
    activity: { aliases: ['activity', 'event', '活动', '报名'], build: function () { return cardSurfaceForKind('activity'); } },
    nostalgia: { aliases: ['nostalgia', 'memory', 'photos', '怀旧', '老照片', '回忆'], build: function () { return cardSurfaceForKind('nostalgia'); } },
    member: { aliases: ['member', 'vip', '会员', '钻石'], build: function () { return cardSurfaceForKind('member'); } }
  };

  function normalizeCardKind(kind) {
    var k = String(kind || '').trim().toLowerCase();
    if (!k) return '';
    if (CARD_PRESETS[k]) return k;
    var keys = Object.keys(ELDER_CARD_KINDS);
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      var aliases = (ELDER_CARD_KINDS[key] && ELDER_CARD_KINDS[key].aliases) || [];
      for (var j = 0; j < aliases.length; j++) {
        if (String(aliases[j]).toLowerCase() === k) return key;
      }
    }
    return '';
  }

  function cardSurfaceForKind(kind, override) {
    var key = normalizeCardKind(kind);
    if (!key || !CARD_PRESETS[key]) return [];
    var base = CARD_PRESETS[key];
    var merged = {};
    Object.keys(base).forEach(function (k) { merged[k] = base[k]; });
    if (override && typeof override === 'object') {
      Object.keys(override).forEach(function (k) {
        if (override[k] != null) merged[k] = override[k];
      });
    }
    merged.surfaceId = key + '_' + Date.now().toString(36);
    return buildCardSurface(merged);
  }

  function matchCardKindFromQuery(q) {
    var t = String(q || '');
    if (/会员|钻石|积分|权益/.test(t)) return 'member';
    if (/怀旧|老照片|回忆|相册|时光机|照片动/.test(t)) return 'nostalgia';
    if (/活动|报名|太极|讲座|邻里|社区班/.test(t)) return 'activity';
    if (/方案|计划|降压计划|今日任务|健康方案/.test(t)) return 'health_plan';
    if (/健康档案|档案|健康画像|我的档案|健康总览/.test(t)) return 'health_profile';
    return '';
  }


  function demoSurfaceForQuery(q) {
    var t = String(q || '');
    var cardKind = matchCardKindFromQuery(t);
    if (cardKind) return cardSurfaceForKind(cardKind);
    var sid = 'elder_demo_' + Date.now().toString(36);
    var title = '小福收到啦';
    var body = '关于「' + t.slice(0, 24) + '」，我记在心里了。您可以继续问血压、饮食或睡眠。';
    var btn1 = '我的血压怎么样？';
    var btn2 = '今天该吃什么？';
    if (/商品|推荐|血压计|血氧仪|买|下单/.test(t)) {
      return productCuiToA2UI({
        type: 'product',
        title: '居家测血压 · 推荐',
        items: [{
          id: 'bp_monitor',
          name: '智能血压计（臂式）',
          cover: './assets/cover-bp-monitor.png',
          price: '199',
          originPrice: '259',
          tag: '热销',
          subtitle: '大字屏 · 语音播报 · 可同步健康档案',
          actions: [
            { label: '查看详情', action: 'link', href: './detail.html?id=bp_monitor' },
            { label: '问问怎么用', q: '血压计怎么用才准？' }
          ]
        }]
      });
    }
    if (/血压|头晕|头昏/.test(t)) {
      return buildCardSurface({
        surfaceId: sid,
        title: '血压解读',
        badge: '达标 85%',
        image: './assets/health-hero-v1.png',
        stats: [
          { label: '今日', value: '128/76', hint: 'mmHg' },
          { label: '均值', value: '128', hint: '近7日' },
          { label: '心率', value: '72', hint: '次/分' }
        ],
        chart: { type: 'line', caption: '近 7 日收缩压', unit: 'mmHg', values: [132, 129, 128, 130, 126, 127, 128], labels: ['一','二','三','四','五','六','日'], max: 150 },
        lines: ['晨起略高属正常「晨峰」，起床前先坐 1 分钟再站立。'],
        actions: [{ label: '血糖稳不稳？', q: '血糖稳不稳？', primary: true }, { label: '昨晚睡得好吗？', q: '昨晚睡得好吗？' }]
      });
    }
    if (/血糖|糖化/.test(t)) {
      return buildCardSurface({
        surfaceId: sid,
        title: '血糖解读',
        badge: '临界关注',
        image: './assets/service-map/02-breakfast-nutrition.jpg',
        stats: [
          { label: '空腹', value: '6.2', hint: 'mmol/L' },
          { label: '糖化', value: '6.8%', hint: '估计' },
          { label: '步数', value: '3180', hint: '昨日' }
        ],
        chart: { type: 'bar', caption: '近 7 日空腹血糖', unit: 'mmol/L', values: [6.8, 7.4, 7.1, 8.2, 6.9, 7.6, 7.3], labels: ['一','二','三','四','五','六','日'], max: 10 },
        lines: ['建议主食换杂粮饭，饭后缓步走 20 分钟。'],
        actions: [{ label: '我的血压怎么样？', q: '我的血压怎么样？', primary: true }, { label: '今天该吃什么？', q: '今天该吃什么？' }]
      });
    }
    if (/吃|饭|食|营养|菜|餐/.test(t)) {
      return buildCardSurface({
        surfaceId: sid,
        title: '今日饮食建议',
        badge: '低盐低糖',
        image: './assets/product-low-sugar-nutrition.png',
        stats: [
          { label: '热量', value: '1680', hint: 'kcal' },
          { label: '钠', value: '2100', hint: 'mg' },
          { label: '蛋白', value: '52g', hint: '昨日' }
        ],
        chart: { type: 'bar', caption: '三大营养素占比', values: [50, 25, 25], labels: ['碳水', '蛋白', '脂肪'], max: 60 },
        lines: ['早餐燕麦牛奶+水煮蛋；午餐杂粮饭+清蒸鲈鱼；晚餐山药排骨汤。全天食盐不超过 5g。'],
        actions: [{ label: '我的血压怎么样？', q: '我的血压怎么样？', primary: true }, { label: '怎么睡得更好？', q: '怎么睡得更好？' }]
      });
    }
    if (/睡|失眠|睡着|梦/.test(t)) {
      return buildCardSurface({
        surfaceId: sid,
        title: '睡眠建议',
        badge: '效率 78%',
        image: './assets/service-map/06-evening-bedtime.jpg',
        stats: [
          { label: '时长', value: '5h48', hint: '昨夜' },
          { label: '深睡', value: '48分', hint: '偏少' },
          { label: '起夜', value: '2次', hint: '注意' }
        ],
        chart: { type: 'bar', caption: '睡眠阶段（分钟）', values: [48, 180, 90, 30], labels: ['深睡', '浅睡', 'REM', '清醒'], max: 200 },
        lines: ['今晚 22:30 前上床；睡前一小时少看手机；泡脚 15 分钟或做 4-7-8 呼吸。'],
        actions: [{ label: '今天该吃什么？', q: '今天该吃什么？', primary: true }, { label: '我的血压怎么样？', q: '我的血压怎么样？' }]
      });
    }
    return buildCardSurface({
      surfaceId: sid,
      title: title,
      image: './assets/digital-companion-v1.png',
      lines: [body],
      actions: [{ label: btn1, q: btn1, primary: true }, { label: btn2, q: btn2 }]
    });
  }

  function cuiToA2UI(conf) {
    var sid = 'elder_cui_' + (conf && conf.act ? conf.act : 'x') + '_' + Date.now().toString(36);
    var title = '小福';
    var body = '';
    var tmp = document.createElement('div');
    tmp.innerHTML = (conf && conf.html) || '';
    var h5 = tmp.querySelector('h5');
    if (h5) title = h5.textContent || title;
    var ps = tmp.querySelectorAll('p');
    body = Array.prototype.map.call(ps, function (p) { return p.textContent; }).join('\n') || tmp.textContent || '';
    var acts = (conf && conf.acts) || [];
    var comps = [
      { id: 'root', component: 'Card', child: 'col' },
      { id: 'col', component: 'Column', children: ['title', 'body'].concat(acts.length ? ['acts'] : []) },
      { id: 'title', component: 'Text', text: title, variant: 'h2' },
      { id: 'body', component: 'Text', text: body }
    ];
    if (acts.length) {
      var actIds = [];
      acts.forEach(function (a, i) {
        var id = 'act' + i;
        var lid = 'act' + i + '_lbl';
        actIds.push(id);
        comps.push({ id: lid, component: 'Text', text: a.t || a.label || '打开' });
        comps.push({
          id: id,
          component: 'Button',
          child: lid,
          variant: i === 0 ? 'primary' : undefined,
          action: {
            event: {
              name: a.t || a.label || a.fn,
              context: { fn: a.fn || '', q: a.t || '' }
            }
          }
        });
      });
      comps.push({ id: 'acts', component: 'Row', children: actIds });
    }
    return [
      { version: 'v0.9.1', createSurface: { surfaceId: sid, catalogId: CATALOG_ID } },
      { version: 'v0.9.1', updateComponents: { surfaceId: sid, components: comps } }
    ];
  }

  function extractCuiObjects(text) {
    var out = [];
    var raw = String(text || '');
    var fence = /```\s*cui\s*\n([\s\S]*?)```/gi;
    var m;
    var blocks = [];
    while ((m = fence.exec(raw))) blocks.push(m[1]);
    if (!blocks.length) {
      // bare JSON product/service blob
      var bare = raw.match(/\{[\s\S]*"type"\s*:\s*"(product|service|rank|health_profile|health_plan|activity|nostalgia|member|profile|plan|event|memory|vip)"[\s\S]*\}/);
      if (bare) blocks.push(bare[0]);
    }
    blocks.forEach(function (src) {
      var s = String(src || '').trim();
      if (!s) return;
      // tolerate trailing junk after first JSON value
      try {
        out.push(JSON.parse(s));
        return;
      } catch (e0) { /* fall through */ }
      var start = s.indexOf('{');
      if (start < 0) return;
      var depth = 0;
      for (var i = start; i < s.length; i++) {
        var ch = s[i];
        if (ch === '{') depth++;
        else if (ch === '}') {
          depth--;
          if (depth === 0) {
            try {
              out.push(JSON.parse(s.slice(start, i + 1)));
            } catch (e1) { /* skip */ }
            return;
          }
        }
      }
    });
    return out;
  }

  function productCuiToA2UI(cui) {
    var item = null;
    if (cui && Array.isArray(cui.items) && cui.items.length) item = cui.items[0];
    else if (cui && cui.name) item = cui;
    if (!item) return [];
    var title = (cui && cui.title) || '为你推荐';
    var name = item.name || '推荐商品';
    var price = item.price != null ? String(item.price) : '';
    var origin = item.originPrice != null ? String(item.originPrice) : '';
    var sub = item.subtitle || item.distance || '';
    var tag = item.tag || '';
    var cover = item.cover || './assets/cover-bp-monitor.png';
    var pid = item.id || 'bp_monitor';
    var detailHref = './detail.html?id=' + encodeURIComponent(pid);
    var acts = Array.isArray(item.actions) ? item.actions.slice() : [];
    if (!acts.length) {
      acts = [
        { label: '查看详情', action: 'link', href: detailHref, primary: true },
        { label: '问问怎么用', q: name + '怎么用才准？' }
      ];
    }
    return buildCardSurface({
      surfaceId: 'elder_product_' + pid + '_' + Date.now().toString(36),
      title: title,
      badge: tag || '热销',
      image: cover,
      subtitle: name,
      stats: [
        { label: '现价', value: price ? ('¥' + price) : '—', hint: origin ? ('原价¥' + origin) : '' },
        { label: '销量', value: String(item.sales || 428), hint: '件' },
        { label: '配送', value: item.distance || '包邮', hint: '仓储' }
      ],
      chart: {
        type: 'bar',
        caption: '近 4 周关注度',
        values: [36, 48, 62, 80],
        labels: ['W1', 'W2', 'W3', 'W4'],
        max: 100
      },
      lines: [sub || '大字屏 · 语音播报 · 可同步健康档案'],
      actions: acts
    });
  }

  /** Prefer native A2UI envelopes; fall back to converting ```cui product/service cards. */
  function envelopesFromModelText(text) {
    var envs = extractEnvelopes(text);
    if (envs.length) return envs;
    var cuis = extractCuiObjects(text);
    for (var i = 0; i < cuis.length; i++) {
      var c = cuis[i];
      if (!c) continue;
      var kind = normalizeCardKind(c.type || c.cardType || c.kind);
      if (kind) {
        var override = {
          title: c.title,
          badge: c.badge || c.tag,
          subtitle: c.subtitle || c.name,
          image: c.image || c.cover,
          lines: c.lines || (c.body ? [c.body] : (c.desc ? [c.desc] : undefined)),
          actions: c.actions
        };
        Object.keys(override).forEach(function (k) {
          if (override[k] == null) delete override[k];
        });
        var cardEnvs = cardSurfaceForKind(kind, override);
        if (cardEnvs.length) return cardEnvs;
      }
      if (c.type === 'product' || (c.items && c.items[0] && (c.items[0].price != null || c.items[0].cover))) {
        var p = productCuiToA2UI(c);
        if (p.length) return p;
      }
      if (c.type === 'service' || c.type === 'rank') {
        // lightweight: first item as card + follow-up buttons
        var it = (c.items && c.items[0]) || null;
        if (!it) continue;
        var conf = {
          act: c.type,
          html: '<h5>' + (c.title || '小福推荐') + '</h5><p>' + (it.name || '') + (it.subtitle ? ' · ' + it.subtitle : '') + '</p>',
          acts: (it.actions || []).map(function (a) {
            return { t: a.label || a.q || '继续', fn: '', label: a.label };
          })
        };
        // preserve q on buttons via product path when actions have q/href
        if (it.actions && it.actions.length) {
          return productCuiToA2UI({
            type: 'product',
            title: c.title || '小福推荐',
            items: [{
              id: it.id || c.type,
              name: it.name || '推荐',
              subtitle: (it.tags && it.tags.join(' · ')) || it.distance || it.rating || '',
              actions: it.actions
            }]
          });
        }
        return cuiToA2UI(conf);
      }
    }
    return [];
  }

  // Minimal styles injected once
  function ensureStyles() {
    if (document.getElementById('a2ui-renderer-css')) return;
    var st = document.createElement('style');
    st.id = 'a2ui-renderer-css';
    st.textContent =
      '.a2ui-surface{width:100%;text-align:left}' +
      '.a2ui-card{background:rgba(255,255,255,.96);border:1px solid #F0E4D1;border-radius:20px;padding:12px 12px 12px;box-shadow:0 6px 18px rgba(120,80,0,.07)}' +
      '.a2ui-column{display:flex;flex-direction:column;gap:8px}' +
      '.a2ui-row,.a2ui-list{display:flex;flex-wrap:wrap;gap:8px;align-items:center}' +
      '.a2ui-text{margin:0;font-size:14px;line-height:1.6;font-weight:650;color:#3D2B1F}' +
      '.a2ui-text-h1,.a2ui-text-h2,.a2ui-text-h3{font-size:17px;font-weight:950;color:#8A4708;line-height:1.3}' +
      '.a2ui-text-h3{font-size:14px;font-weight:800;color:#6B4A28}' +
      '.a2ui-btn{border:0;border-radius:999px;padding:10px 14px;font:900 13px inherit;cursor:pointer;background:#F3EDE0;color:#5A4F40}' +
      '.a2ui-btn.primary{background:linear-gradient(135deg,#FFC940,#FF9E42);color:#4A2B0E}' +
      '.a2ui-btn:active{transform:scale(.98)}' +
      '.a2ui-badge{display:inline-block;padding:3px 8px;border-radius:999px;background:#FFF3DC;color:#8A4708;font-size:11px;font-weight:800;margin-left:auto}' +
      '.a2ui-divider{border:0;border-top:1px solid #F0E4D1;margin:4px 0}' +
      '.a2ui-img{width:100%;max-height:132px;object-fit:cover;border-radius:14px;display:block;background:#FFF8EC}' +
      '.a2ui-img.hero{max-height:148px}' +
      '.a2ui-imgs{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}' +
      '.a2ui-img.thumb{width:100%;height:52px;max-height:52px;object-fit:cover;border-radius:10px}' +
      '.a2ui-stat{flex:1;min-width:72px;background:#FFF8EC;border-radius:12px;padding:8px 8px 7px;text-align:center}' +
      '.a2ui-stat b{display:block;font-size:16px;font-weight:950;color:#8A4708;line-height:1.2}' +
      '.a2ui-stat span{display:block;font-size:11px;font-weight:800;color:#8A7A66;margin-top:2px}' +
      '.a2ui-stat em{display:block;font-style:normal;font-size:10px;font-weight:700;color:#C07820;margin-top:1px}' +
      '.a2ui-meter{display:flex;flex-direction:column;gap:4px}' +
      '.a2ui-meter-h{display:flex;justify-content:space-between;font-size:12px;font-weight:800;color:#6B4A28}' +
      '.a2ui-meter-h b{color:#E8892A}' +
      '.a2ui-meter-track{height:8px;border-radius:99px;background:#F3EDE0;overflow:hidden}' +
      '.a2ui-meter-track i{display:block;height:100%;border-radius:99px;background:linear-gradient(90deg,#FFC940,#FF9E42)}' +
      '.a2ui-chart{background:#FFF8EC;border-radius:14px;padding:8px 8px 6px}' +
      '.a2ui-chart-cap{font-size:12px;font-weight:850;color:#8A4708;margin-bottom:6px}' +
      '.a2ui-bars{display:flex;align-items:flex-end;gap:6px;height:92px;padding:0 2px}' +
      '.a2ui-bar-col{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;gap:3px;min-width:0}' +
      '.a2ui-bar-col i{display:block;width:70%;min-height:6px;border-radius:6px 6px 3px 3px;background:linear-gradient(180deg,#FFC940,#E8892A)}' +
      '.a2ui-bar-col em{font-style:normal;font-size:10px;font-weight:900;color:#8A4708}' +
      '.a2ui-bar-col span{font-size:10px;font-weight:800;color:#A18B72;white-space:nowrap}' +
      '.a2ui-spark{width:100%;height:72px;display:block}' +
      '.a2ui-chart-labs{display:flex;justify-content:space-between;font-size:10px;font-weight:800;color:#A18B72;padding:0 4px}' +
      '.a2ui-donut{width:88px;height:88px;border-radius:50%;margin:4px auto;display:flex;align-items:center;justify-content:center}' +
      '.a2ui-donut-inner{width:56px;height:56px;border-radius:50%;background:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center}' +
      '.a2ui-donut-inner b{font-size:16px;color:#E8892A;line-height:1}' +
      '.a2ui-donut-inner small{font-size:9px;font-weight:800;color:#8A7A66}' +
      '.a2ui-waiting{color:#A99E8B;font-size:13px;font-weight:700}' +
      '.afu-hc-bubble .a2ui-surface{margin-top:2px}' +
      '.afu-hc-bubble.has-a2ui > :not(.a2ui-surface){display:none}' +
      '.afu-hc-bubble.has-a2ui .a2ui-surface{display:block}';
    document.head.appendChild(st);
  }

  ensureStyles();

  global.A2UI = {
    CATALOG_ID: CATALOG_ID,
    applyEnvelope: applyEnvelope,
    extractEnvelopes: extractEnvelopes,
    extractCuiObjects: extractCuiObjects,
    envelopesFromModelText: envelopesFromModelText,
    productCuiToA2UI: productCuiToA2UI,
    buildCardSurface: buildCardSurface,
    cardSurfaceForKind: cardSurfaceForKind,
    matchCardKindFromQuery: matchCardKindFromQuery,
    ELDER_CARD_KINDS: ELDER_CARD_KINDS,
    CARD_PRESETS: CARD_PRESETS,
    StreamParser: StreamParser,
    mount: mount,
    demoSurfaceForQuery: demoSurfaceForQuery,
    cuiToA2UI: cuiToA2UI,
    ensureStyles: ensureStyles,
    getSurface: function (id) { return surfaces[id] || null; }
  };
})(typeof window !== 'undefined' ? window : this);
