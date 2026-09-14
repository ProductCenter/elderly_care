(() => {
  const WEEKS = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];

  function greetByHour(h) {
    if (h < 5) return "夜深了";
    if (h < 11) return "早上好";
    if (h < 14) return "中午好";
    if (h < 18) return "下午好";
    return "晚上好";
  }

  function renderHeader() {
    const now = new Date();
    const pad = (v) => String(v).padStart(2, "0");
    const title = document.getElementById("greetTitle");
    const today = document.getElementById("todayLabel");
    const week = document.getElementById("weekLabel");
    if (title) title.textContent = `${greetByHour(now.getHours())}，管理员`;
    if (today) today.textContent = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    if (week) week.textContent = `${WEEKS[now.getDay()]} · 工作日视图`;
  }

  function renderTrend() {
    const box = document.getElementById("wbTrend");
    if (!box) return;
    const labels = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];
    const occ = [84, 85, 85.5, 86, 86.2, 86.4, 86.4];
    const care = [88, 90, 91, 89, 93, 92, 92];
    const visit = [18, 22, 16, 28, 25, 40, 32];

    const w = 560;
    const h = 200;
    const pad = { l: 36, r: 16, t: 16, b: 28 };
    const iw = w - pad.l - pad.r;
    const ih = h - pad.t - pad.b;
    const x0 = pad.l;
    const y1 = h - pad.b;

    const maxPct = 100;
    const maxVisit = 50;

    function xAt(i) {
      return x0 + (iw * i) / (labels.length - 1);
    }
    function yPct(v) {
      return y1 - (v / maxPct) * ih;
    }
    function yVisit(v) {
      return y1 - (v / maxVisit) * ih;
    }

    let grid = `<line x1="${x0}" y1="${y1}" x2="${w - pad.r}" y2="${y1}" stroke="#f0f0f0"/>`;
    for (let i = 0; i <= 4; i++) {
      const y = y1 - (ih * i) / 4;
      grid += `<line x1="${x0}" y1="${y}" x2="${w - pad.r}" y2="${y}" stroke="#f5f5f5"/>`;
      grid += `<text x="${x0 - 8}" y="${y + 3}" fill="#bfbfbf" font-size="10" text-anchor="end">${i * 25}</text>`;
    }
    labels.forEach((lab, i) => {
      grid += `<text x="${xAt(i)}" y="${h - 8}" fill="#8c8c8c" font-size="11" text-anchor="middle">${lab}</text>`;
    });

    // visit bars
    let bars = "";
    labels.forEach((_, i) => {
      const bw = 18;
      const bh = (visit[i] / maxVisit) * ih;
      const x = xAt(i) - bw / 2;
      const y = y1 - bh;
      bars += `<rect x="${x}" y="${y}" width="${bw}" height="${bh}" rx="3" fill="#ff7a45" opacity="0.22"><title>来访 ${visit[i]}</title></rect>`;
    });

    function linePath(data, yFn, color) {
      const d = data.map((v, i) => `${i ? "L" : "M"}${xAt(i)},${yFn(v)}`).join(" ");
      let dots = "";
      data.forEach((v, i) => {
        dots += `<circle cx="${xAt(i)}" cy="${yFn(v)}" r="3" fill="${color}"><title>${v}</title></circle>`;
      });
      return `<path d="${d}" fill="none" stroke="${color}" stroke-width="2.2"/>${dots}`;
    }

    box.innerHTML = `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid meet">${grid}${bars}${linePath(occ, yPct, "#1677ff")}${linePath(care, yPct, "#36cfc9")}</svg>`;
  }

  const todos = [
    { tag: "审批", cls: "tag-warn", title: "《养老机构服务合同》待会签", sub: "长者：李建国 · 发起人：王护士", time: "09:20" },
    { tag: "护理", cls: "tag-info", title: "3F-312 翻身护理未打卡", sub: "责任护理员：赵敏 · 计划 08:00", time: "08:15" },
    { tag: "预警", cls: "tag-danger", title: "药品托管库存低于阈值", sub: "阿司匹林肠溶片 · 剩余 6 盒", time: "昨天" },
    { tag: "变更", cls: "tag-info", title: "房间变更申请待复核", sub: "张秀英 2F-208 → 3F-315", time: "昨天" },
    { tag: "巡查", cls: "tag-ok", title: "昨日安全巡查报告待确认", sub: "公共区域 · 楼长已提交", time: "07:50" },
    { tag: "来访", cls: "tag-warn", title: "今日预约参观 4 组", sub: "最早 10:00 · 前台接待", time: "今天" },
  ];

  function renderTodos() {
    const list = document.getElementById("todoList");
    if (!list) return;
    list.innerHTML = todos
      .map(
        (t) => `<li>
          <span class="tag ${t.cls}">${t.tag}</span>
          <div>
            <div class="title">${t.title}</div>
            <span class="sub">${t.sub}</span>
          </div>
          <span class="time">${t.time}</span>
        </li>`
      )
      .join("");
  }

  function bind() {
    document.getElementById("btnRefreshTodo")?.addEventListener("click", () => {
      renderTodos();
      window.alert("待办已刷新（演示）");
    });

    document.querySelectorAll(".wb-quick a").forEach((a) => {
      a.addEventListener("click", (e) => {
        e.preventDefault();
        window.alert(`「${a.dataset.tip}」页面待按功能清单继续设计`);
      });
    });
  }

  AdminUI.onReady(() => {
    renderHeader();
    renderTrend();
    renderTodos();
    bind();
  });
})();
