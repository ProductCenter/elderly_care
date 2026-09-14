(() => {
  const SEED = [
    { code: "1F", name: "护理一层", type: "护理楼层", rooms: 36, beds: 72, owner: "刘芳", phone: "138****1201", status: "on", updated: "2026-07-28 09:12", remark: "含接待大厅与评估室" },
    { code: "2F", name: "护理二层", type: "护理楼层", rooms: 39, beds: 78, owner: "陈静", phone: "139****2218", status: "on", updated: "2026-07-26 16:40", remark: "" },
    { code: "3F", name: "护理三层", type: "护理楼层", rooms: 40, beds: 80, owner: "赵敏", phone: "137****6652", status: "on", updated: "2026-07-25 11:05", remark: "半护理集中区" },
    { code: "4F", name: "护理四层", type: "护理楼层", rooms: 38, beds: 76, owner: "孙丽", phone: "136****9088", status: "on", updated: "2026-07-20 14:22", remark: "" },
    { code: "5F", name: "特护五层", type: "护理楼层", rooms: 37, beds: 74, owner: "周强", phone: "135****4410", status: "on", updated: "2026-07-18 10:30", remark: "特护 / 全护理" },
    { code: "B1", name: "后勤负一层", type: "行政后勤", rooms: 8, beds: 0, owner: "马超", phone: "133****7781", status: "on", updated: "2026-06-12 08:50", remark: "厨房仓储" },
    { code: "M1", name: "医疗配套层", type: "医疗配套", rooms: 6, beds: 0, owner: "李医生", phone: "132****3399", status: "on", updated: "2026-05-08 15:18", remark: "诊疗 / 康复" },
    { code: "A1", name: "活动一层", type: "公共活动", rooms: 4, beds: 0, owner: "王悦", phone: "131****5520", status: "off", updated: "2026-04-02 09:00", remark: "装修中暂停用" },
  ];
  let rows = AdminStore.load("org-floor", SEED);
  let editIndex = -1;

  function persist() { AdminStore.save("org-floor", rows); }

  function filtered() {
    const kw = (document.getElementById("qKeyword")?.value || "").trim();
    const type = document.getElementById("qType")?.value || "";
    const status = document.getElementById("qStatus")?.value || "";
    return rows.filter((r) => {
      if (kw && !(r.code.includes(kw) || r.name.includes(kw))) return false;
      if (type && r.type !== type) return false;
      if (status && r.status !== status) return false;
      return true;
    });
  }

  function renderStats(list) {
    document.getElementById("stFloors").textContent = list.length;
    document.getElementById("stRooms").innerHTML = `${list.reduce((s, r) => s + r.rooms, 0)}<em>间</em>`;
    document.getElementById("stBeds").innerHTML = `${list.reduce((s, r) => s + r.beds, 0)}<em>张</em>`;
    document.getElementById("stOn").textContent = list.filter((r) => r.status === "on").length;
  }

  function renderTable() {
    const list = filtered();
    renderStats(list);
    const body = document.getElementById("floorBody");
    document.getElementById("pagerInfo").textContent = `共 ${list.length} 条`;
    body.innerHTML = list
      .map((r, i) => {
        const idx = rows.indexOf(r);
        return `<tr>
          <td>${r.code}</td>
          <td>${r.name}</td>
          <td>${r.type}</td>
          <td>${r.rooms}</td>
          <td>${r.beds}</td>
          <td>${r.owner || "—"}</td>
          <td>${r.phone || "—"}</td>
          <td><span class="status ${r.status === "on" ? "status-on" : "status-off"}">${r.status === "on" ? "启用" : "停用"}</span></td>
          <td>${r.updated}</td>
          <td>
            <button type="button" class="link" data-edit="${idx}">编辑</button>
            <button type="button" class="link" data-toggle="${idx}">${r.status === "on" ? "停用" : "启用"}</button>
            <button type="button" class="link danger" data-del="${idx}">删除</button>
          </td>
        </tr>`;
      })
      .join("");
  }

  function fillForm(row) {
    document.getElementById("fCode").value = row?.code || "";
    document.getElementById("fName").value = row?.name || "";
    document.getElementById("fType").value = row?.type || "护理楼层";
    document.getElementById("fStatus").value = row?.status || "on";
    document.getElementById("fRooms").value = row?.rooms ?? 0;
    document.getElementById("fBeds").value = row?.beds ?? 0;
    document.getElementById("fOwner").value = row?.owner || "";
    document.getElementById("fPhone").value = row?.phone || "";
    document.getElementById("fRemark").value = row?.remark || "";
  }

  function openEdit(index) {
    editIndex = index;
    document.getElementById("drawerTitle").textContent = index < 0 ? "新增楼层" : "编辑楼层";
    fillForm(index < 0 ? null : rows[index]);
    AdminUI.openDrawer("floorDrawer");
  }

  function save() {
    const code = document.getElementById("fCode").value.trim();
    const name = document.getElementById("fName").value.trim();
    if (!code || !name) {
      AdminUI.toast("请填写楼层编号与名称", "error");
      return;
    }
    const next = {
      code,
      name,
      type: document.getElementById("fType").value,
      status: document.getElementById("fStatus").value,
      rooms: Number(document.getElementById("fRooms").value) || 0,
      beds: Number(document.getElementById("fBeds").value) || 0,
      owner: document.getElementById("fOwner").value.trim(),
      phone: document.getElementById("fPhone").value.trim(),
      remark: document.getElementById("fRemark").value.trim(),
      updated: new Date().toISOString().slice(0, 16).replace("T", " "),
    };
    if (editIndex < 0) {
      rows.unshift(next);
      AdminUI.toast("新增成功");
    } else {
      rows[editIndex] = next;
      AdminUI.toast("保存成功");
    }
    persist();
    AdminUI.closeDrawer("floorDrawer");
    renderTable();
  }

  AdminUI.onReady(() => {
    AdminUI.bindDrawer("floorDrawer");
    renderTable();
    document.getElementById("btnAddFloor")?.addEventListener("click", () => openEdit(-1));
    document.getElementById("btnSearch")?.addEventListener("click", renderTable);
    document.getElementById("btnReset")?.addEventListener("click", () => {
      document.getElementById("qKeyword").value = "";
      document.getElementById("qType").value = "";
      document.getElementById("qStatus").value = "";
      renderTable();
    });
    document.getElementById("btnSaveFloor")?.addEventListener("click", save);
    document.getElementById("floorBody")?.addEventListener("click", async (e) => {
      const edit = e.target.closest("[data-edit]");
      const toggle = e.target.closest("[data-toggle]");
      const del = e.target.closest("[data-del]");
      if (edit) openEdit(Number(edit.dataset.edit));
      if (toggle) {
        const i = Number(toggle.dataset.toggle);
        rows[i].status = rows[i].status === "on" ? "off" : "on";
        rows[i].updated = new Date().toISOString().slice(0, 16).replace("T", " ");
        persist();
        AdminUI.toast(rows[i].status === "on" ? "已启用" : "已停用");
        renderTable();
      }
      if (del) {
        const ok = await AdminUI.confirm("确定删除该楼层？", { title: "删除确认", okText: "删除" });
        if (!ok) return;
        rows.splice(Number(del.dataset.del), 1);
        persist();
        AdminUI.toast("已删除");
        renderTable();
      }
    });
  });
})();
