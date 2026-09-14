(() => {
  const elderBed = { 张秀英: "3F 312-A", 李建国: "3F 312-B", 陈桂兰: "2F 215-A", 王德福: "1F 108-B" };
  const SEED = [
    { name: "张伟", relation: "子女", phone: "138****6621", elder: "张秀英", primary: true, visit: true, date: "2025-11-02", remark: "" },
    { name: "张丽", relation: "子女", phone: "139****2201", elder: "张秀英", primary: false, visit: true, date: "2025-11-02", remark: "" },
    { name: "李娜", relation: "子女", phone: "137****9033", elder: "李建国", primary: true, visit: true, date: "2024-06-18", remark: "主要决策人" },
    { name: "陈强", relation: "子女", phone: "135****7788", elder: "陈桂兰", primary: true, visit: true, date: "2026-07-05", remark: "" },
    { name: "王敏", relation: "子女", phone: "138****6621", elder: "王德福", primary: true, visit: true, date: "2023-12-01", remark: "" },
    { name: "王强", relation: "亲属", phone: "132****1190", elder: "王德福", primary: false, visit: false, date: "2026-07-12", remark: "临时探访需审批" },
  ];
  let rows = AdminStore.load("org-family", SEED);
  function persist() { AdminStore.save("org-family", rows); }

  let editIndex = -1;

  function filtered() {
    const kw = (document.getElementById("qKeyword")?.value || "").trim();
    const relation = document.getElementById("qRelation")?.value || "";
    const primary = document.getElementById("qPrimary")?.value || "";
    return rows.filter((r) => {
      if (relation && r.relation !== relation) return false;
      if (primary === "1" && !r.primary) return false;
      if (primary === "0" && r.primary) return false;
      if (kw && !(r.name.includes(kw) || r.elder.includes(kw) || r.phone.includes(kw))) return false;
      return true;
    });
  }

  function render() {
    const list = filtered();
    document.getElementById("stTotal").textContent = list.length;
    document.getElementById("stPrimary").textContent = list.filter((r) => r.primary).length;
    document.getElementById("stVisit").textContent = list.filter((r) => r.visit).length;
    document.getElementById("stNew").textContent = list.filter((r) => (r.date || "").startsWith("2026-07")).length;
    document.getElementById("pagerInfo").textContent = `共 ${list.length} 条`;
    document.getElementById("body").innerHTML = list
      .map((r) => {
        const i = rows.indexOf(r);
        return `<tr>
          <td>${r.name}</td><td>${r.relation}</td><td>${r.phone}</td><td>${r.elder}</td>
          <td>${elderBed[r.elder] || "—"}</td>
          <td><span class="status ${r.primary ? "status-on" : "status-off"}">${r.primary ? "是" : "否"}</span></td>
          <td><span class="status ${r.visit ? "status-idle" : "status-repair"}">${r.visit ? "允许" : "禁止"}</span></td>
          <td>${r.date}</td>
          <td><button type="button" class="link" data-edit="${i}">编辑</button> <button type="button" class="link danger" data-del="${i}">删除</button></td>
        </tr>`;
      })
      .join("");
  }

  function openEdit(i) {
    editIndex = i;
    const r = i < 0 ? null : rows[i];
    document.getElementById("drawerTitle").textContent = i < 0 ? "新增家属" : "编辑家属";
    document.getElementById("fName").value = r?.name || "";
    document.getElementById("fRelation").value = r?.relation || "子女";
    document.getElementById("fPhone").value = r?.phone || "";
    document.getElementById("fElder").value = r?.elder || "张秀英";
    document.getElementById("fPrimary").value = r?.primary === false ? "0" : "1";
    document.getElementById("fVisit").value = r?.visit === false ? "0" : "1";
    document.getElementById("fRemark").value = r?.remark || "";
    AdminUI.openDrawer("familyDrawer");
  }

  function save() {
    const name = document.getElementById("fName").value.trim();
    const phone = document.getElementById("fPhone").value.trim();
    if (!name || !phone) {
      AdminUI.toast("请填写家属姓名与电话", "error");
      return;
    }
    const next = {
      name,
      phone,
      relation: document.getElementById("fRelation").value,
      elder: document.getElementById("fElder").value,
      primary: document.getElementById("fPrimary").value === "1",
      visit: document.getElementById("fVisit").value === "1",
      remark: document.getElementById("fRemark").value.trim(),
      date: editIndex < 0 ? new Date().toISOString().slice(0, 10) : rows[editIndex].date,
    };
    if (editIndex < 0) {
      rows.unshift(next);
      AdminUI.toast("新增成功");
    } else {
      rows[editIndex] = next;
      AdminUI.toast("保存成功");
    }
    persist();
    AdminUI.closeDrawer("familyDrawer");
    render();
  }

  AdminUI.onReady(() => {
    AdminUI.bindDrawer("familyDrawer");
    render();
    document.getElementById("btnAdd")?.addEventListener("click", () => openEdit(-1));
    document.getElementById("btnSave")?.addEventListener("click", save);
    document.getElementById("btnSearch")?.addEventListener("click", render);
    document.getElementById("btnReset")?.addEventListener("click", () => {
      document.getElementById("qKeyword").value = "";
      document.getElementById("qRelation").value = "";
      document.getElementById("qPrimary").value = "";
      render();
    });
    document.getElementById("body")?.addEventListener("click", async (e) => {
      const edit = e.target.closest("[data-edit]");
      const del = e.target.closest("[data-del]");
      if (edit) openEdit(Number(edit.dataset.edit));
      if (del) {
        const ok = await AdminUI.confirm("确定删除该家属记录？", { title: "删除确认", okText: "删除" });
        if (!ok) return;
        rows.splice(Number(del.dataset.del), 1);
        persist();
        AdminUI.toast("已删除");
        render();
      }
    });
  });
})();
