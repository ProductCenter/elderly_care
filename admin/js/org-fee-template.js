(() => {
  const SEED = [
    { name: "标准间-自理", floor: "全院", standard: "标准间", bed: 3600, care: 1200, meal: 1200, status: "on", note: "" },
    { name: "标准间-半护理", floor: "1F-4F", standard: "标准间", bed: 3600, care: 2200, meal: 1200, status: "on", note: "" },
    { name: "精品间-半护理", floor: "2F", standard: "精品间", bed: 4800, care: 2200, meal: 1200, status: "on", note: "" },
    { name: "特护间-特护", floor: "5F", standard: "特护间", bed: 6800, care: 4200, meal: 1400, status: "on", note: "含翻身护理" },
    { name: "旧版标准间", floor: "全院", standard: "标准间", bed: 3200, care: 1000, meal: 1000, status: "off", note: "已停用" },
  ];
  let rows = AdminStore.load("org-fee-template", SEED);
  function persist() { AdminStore.save("org-fee-template", rows); }

  let editIndex = -1;
  const sum = () => {
    const t = (Number(tBed.value) || 0) + (Number(tCare.value) || 0) + (Number(tMeal.value) || 0);
    tTotal.value = t;
    return t;
  };
  function filtered() {
    const kw = qKeyword.value.trim();
    const floor = qFloor.value;
    const status = qStatus.value;
    return rows.filter((r) => {
      if (kw && !r.name.includes(kw)) return false;
      if (floor && floor !== "全院" && r.floor !== floor && r.floor !== "全院" && r.floor !== "1F-4F") return false;
      if (floor === "全院" && r.floor !== "全院") return false;
      if (status && r.status !== status) return false;
      return true;
    });
  }
  function render() {
    const list = filtered();
    stTotal.textContent = list.length;
    stOn.textContent = list.filter((r) => r.status === "on").length;
    stFloors.textContent = new Set(list.map((r) => r.floor)).size;
    const max = Math.max(...list.map((r) => r.bed + r.care + r.meal), 0);
    stMax.innerHTML = `${max}<em>元</em>`;
    pagerInfo.textContent = `共 ${list.length} 条`;
    body.innerHTML = list
      .map((r) => {
        const i = rows.indexOf(r);
        const total = r.bed + r.care + r.meal;
        return `<tr>
          <td>${r.name}</td><td>${r.floor}</td><td>${r.standard}</td>
          <td>${r.bed}</td><td>${r.care}</td><td>${r.meal}</td><td><strong>${total}</strong></td>
          <td><span class="status ${r.status === "on" ? "status-on" : "status-off"}">${r.status === "on" ? "启用" : "停用"}</span></td>
          <td><button type="button" class="link" data-edit="${i}">编辑</button> <button type="button" class="link danger" data-del="${i}">删除</button></td>
        </tr>`;
      })
      .join("");
  }
  function openEdit(i) {
    editIndex = i;
    const r = i < 0 ? null : rows[i];
    drawerTitle.textContent = i < 0 ? "新增模板" : "编辑模板";
    tName.value = r?.name || "";
    tFloor.value = r?.floor === "1F-4F" ? "全院" : r?.floor || "全院";
    tStandard.value = r?.standard || "标准间";
    tStatus.value = r?.status || "on";
    tBed.value = r?.bed ?? 3600;
    tCare.value = r?.care ?? 2000;
    tMeal.value = r?.meal ?? 1200;
    tNote.value = r?.note || "";
    sum();
    AdminUI.openDrawer("tplDrawer");
  }
  function save() {
    if (!tName.value.trim()) return AdminUI.toast("请填写模板名称", "info");
    const next = {
      name: tName.value.trim(),
      floor: tFloor.value,
      standard: tStandard.value,
      status: tStatus.value,
      bed: Number(tBed.value) || 0,
      care: Number(tCare.value) || 0,
      meal: Number(tMeal.value) || 0,
      note: tNote.value.trim(),
    };
    if (editIndex < 0) {
      rows.unshift(next);
      AdminUI.toast("新增成功");
    } else {
      rows[editIndex] = next;
      AdminUI.toast("保存成功");
    }
    persist();
    AdminUI.closeDrawer("tplDrawer");
    render();
  }
  AdminUI.onReady(() => {
    AdminUI.bindDrawer("tplDrawer");
    ["tBed", "tCare", "tMeal"].forEach((id) => document.getElementById(id).addEventListener("input", sum));
    btnAdd.onclick = () => openEdit(-1);
    btnSave.onclick = save;
    btnSearch.onclick = render;
    btnReset.onclick = () => {
      qKeyword.value = "";
      qFloor.value = "";
      qStatus.value = "";
      render();
    };
    body.onclick = async (e) => {
      const el = e.target.closest("[data-edit]");
      const del = e.target.closest("[data-del]");
      if (el) openEdit(Number(el.dataset.edit));
      if (del) {
        const ok = await AdminUI.confirm("确定删除该收费模板？", { title: "删除确认", okText: "删除" });
        if (!ok) return;
        rows.splice(Number(del.dataset.del), 1);
        persist();
        AdminUI.toast("已删除");
        render();
      }
    };
    render();
  });
})();
