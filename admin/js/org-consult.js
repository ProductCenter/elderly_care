(() => {
  const statusText = { new: "新登记", follow: "跟进中", done: "已转化", lost: "已流失" };
  const statusClass = { new: "status-idle", follow: "status-follow", done: "status-done", lost: "status-off" };

  const SEED = [
    { date: "2026-07-29", name: "王敏", phone: "138****6621", relation: "子女", elder: "王德福", intent: "入住咨询", host: "刘芳", status: "follow", next: "2026-08-02", remark: "希望靠窗南向" },
    { date: "2026-07-28", name: "李娜", phone: "139****1180", relation: "子女", elder: "李秀兰", intent: "参观体验", host: "陈静", status: "new", next: "2026-07-31", remark: "" },
    { date: "2026-07-27", name: "张伟", phone: "137****9033", relation: "本人", elder: "张伟", intent: "政策咨询", host: "王悦", status: "follow", next: "2026-08-05", remark: "询问补贴政策" },
    { date: "2026-07-25", name: "赵丽", phone: "136****4412", relation: "子女", elder: "赵国强", intent: "入住咨询", host: "刘芳", status: "done", next: "", remark: "已办理试住" },
    { date: "2026-07-22", name: "陈强", phone: "135****7788", relation: "亲属", elder: "陈桂花", intent: "参观体验", host: "孙丽", status: "lost", next: "", remark: "选择其他机构" },
    { date: "2026-07-18", name: "周婷", phone: "133****2291", relation: "子女", elder: "周明", intent: "入住咨询", host: "赵敏", status: "follow", next: "2026-07-30", remark: "特护需求" },
    { date: "2026-07-12", name: "吴磊", phone: "132****5560", relation: "子女", elder: "吴秀英", intent: "其他", host: "王悦", status: "new", next: "2026-08-01", remark: "短期托养" },
    { date: "2026-07-08", name: "郑雪", phone: "131****8802", relation: "配偶", elder: "郑建国", intent: "入住咨询", host: "刘芳", status: "done", next: "", remark: "已签约 3F-312" },
  ];
  let rows = AdminStore.load("org-consult", SEED);
  function persist() { AdminStore.save("org-consult", rows); }


  let editIndex = -1;

  function filtered() {
    const kw = (document.getElementById("qKeyword")?.value || "").trim();
    const intent = document.getElementById("qIntent")?.value || "";
    const status = document.getElementById("qStatus")?.value || "";
    return rows.filter((r) => {
      if (kw && !(r.name.includes(kw) || r.phone.includes(kw))) return false;
      if (intent && r.intent !== intent) return false;
      if (status && r.status !== status) return false;
      return true;
    });
  }

  function renderStats(list) {
    document.getElementById("stMonth").innerHTML = `${list.length}<em>人次</em>`;
    document.getElementById("stIntent").textContent = list.filter((r) => r.intent === "入住咨询").length;
    document.getElementById("stFollow").textContent = list.filter((r) => r.status === "follow" || r.status === "new").length;
    document.getElementById("stDone").textContent = list.filter((r) => r.status === "done").length;
  }

  function renderChart() {
    const box = document.getElementById("consultChart");
    if (!box) return;
    const labels = ["8", "9", "10", "11", "12", "1", "2", "3", "4", "5", "6", "7"].map((m) => `${m}月`);
    const data = [36, 42, 38, 51, 47, 55, 49, 60, 58, 62, 54, 68];
    const w = 720;
    const h = 170;
    const pad = { l: 32, r: 12, t: 12, b: 24 };
    const iw = w - pad.l - pad.r;
    const ih = h - pad.t - pad.b;
    const max = Math.max(...data) * 1.2;
    const barW = iw / data.length;
    let svg = `<svg viewBox="0 0 ${w} ${h}" width="100%" height="100%" preserveAspectRatio="none">`;
    data.forEach((v, i) => {
      const bh = (v / max) * ih;
      const x = pad.l + barW * i + barW * 0.2;
      const y = pad.t + ih - bh;
      svg += `<rect x="${x}" y="${y}" width="${barW * 0.6}" height="${bh}" rx="3" fill="#1677ff" opacity="0.85"><title>${labels[i]}: ${v}</title></rect>`;
      svg += `<text x="${x + barW * 0.3}" y="${h - 6}" fill="#8c8c8c" font-size="10" text-anchor="middle">${labels[i]}</text>`;
    });
    svg += "</svg>";
    box.innerHTML = svg;
  }

  function renderTable() {
    const list = filtered();
    renderStats(list);
    document.getElementById("pagerInfo").textContent = `共 ${list.length} 条`;
    document.getElementById("consultBody").innerHTML = list
      .map((r) => {
        const idx = rows.indexOf(r);
        return `<tr>
          <td>${r.date}</td>
          <td>${r.name}</td>
          <td>${r.phone}</td>
          <td>${r.relation}</td>
          <td>${r.elder || "—"}</td>
          <td>${r.intent}</td>
          <td>${r.host || "—"}</td>
          <td><span class="status ${statusClass[r.status]}">${statusText[r.status]}</span></td>
          <td>${r.next || "—"}</td>
          <td>
            <button type="button" class="link" data-edit="${idx}">编辑</button>
            <button type="button" class="link" data-follow="${idx}">跟进</button>
            <button type="button" class="link danger" data-del="${idx}">删除</button>
          </td>
        </tr>`;
      })
      .join("");
  }

  function openEdit(index) {
    editIndex = index;
    const r = index < 0 ? null : rows[index];
    document.getElementById("drawerTitle").textContent = index < 0 ? "登记来访" : "编辑来访";
    document.getElementById("cDate").value = r?.date || new Date().toISOString().slice(0, 10);
    document.getElementById("cName").value = r?.name || "";
    document.getElementById("cPhone").value = r?.phone || "";
    document.getElementById("cRelation").value = r?.relation || "子女";
    document.getElementById("cElder").value = r?.elder || "";
    document.getElementById("cIntent").value = r?.intent || "入住咨询";
    document.getElementById("cHost").value = r?.host || "";
    document.getElementById("cStatus").value = r?.status || "new";
    document.getElementById("cNext").value = r?.next || "";
    document.getElementById("cRemark").value = r?.remark || "";
    AdminUI.openDrawer("consultDrawer");
  }

  function save() {
    const name = document.getElementById("cName").value.trim();
    const phone = document.getElementById("cPhone").value.trim();
    const date = document.getElementById("cDate").value;
    if (!name || !phone || !date) {
      AdminUI.toast("请填写来访日期、访客姓名与电话", "error");
      return;
    }
    const next = {
      date,
      name,
      phone,
      relation: document.getElementById("cRelation").value,
      elder: document.getElementById("cElder").value.trim(),
      intent: document.getElementById("cIntent").value,
      host: document.getElementById("cHost").value.trim(),
      status: document.getElementById("cStatus").value,
      next: document.getElementById("cNext").value,
      remark: document.getElementById("cRemark").value.trim(),
    };
    if (editIndex < 0) {
      rows.unshift(next);
      AdminUI.toast("新增成功");
    } else {
      rows[editIndex] = next;
      AdminUI.toast("保存成功");
    }
    persist();
    AdminUI.closeDrawer("consultDrawer");
    renderTable();
  }

  AdminUI.onReady(() => {
    AdminUI.bindDrawer("consultDrawer");
    renderChart();
    renderTable();
    document.getElementById("btnAdd")?.addEventListener("click", () => openEdit(-1));
    document.getElementById("btnSave")?.addEventListener("click", save);
    document.getElementById("btnSearch")?.addEventListener("click", renderTable);
    document.getElementById("btnReset")?.addEventListener("click", () => {
      document.getElementById("qKeyword").value = "";
      document.getElementById("qIntent").value = "";
      document.getElementById("qStatus").value = "";
      renderTable();
    });
    document.getElementById("btnExport")?.addEventListener("click", () => AdminUI.toast("已导出咨询统计（演示）", "info"));
    document.getElementById("consultBody")?.addEventListener("click", async (e) => {
      const edit = e.target.closest("[data-edit]");
      const follow = e.target.closest("[data-follow]");
      const del = e.target.closest("[data-del]");
      if (edit) openEdit(Number(edit.dataset.edit));
      if (follow) {
        const i = Number(follow.dataset.follow);
        rows[i].status = rows[i].status === "done" ? "done" : "follow";
        persist();
        openEdit(i);
      }
      if (del) {
        const ok = await AdminUI.confirm("确定删除该来访记录？", { title: "删除确认", okText: "删除" });
        if (!ok) return;
        rows.splice(Number(del.dataset.del), 1);
        persist();
        AdminUI.toast("已删除");
        renderTable();
      }
    });
  });
})();
