(() => {
  const statusText = { open: "报名中", doing: "进行中", done: "已结束" };
  const statusClass = { open: "status-idle", doing: "status-busy", done: "status-off" };
  const SEED = [
    { name: "七夕联欢会", type: "节日", time: "2026-08-05 14:00", place: "多功能厅", quota: 60, joined: 42, status: "open", desc: "红歌联唱" },
    { name: "太极拳晨练", type: "康体", time: "2026-07-31 07:30", place: "一楼花园", quota: 30, joined: 28, status: "doing", desc: "" },
    { name: "健康讲座：血压管理", type: "讲座", time: "2026-07-20 15:00", place: "3F 活动室", quota: 40, joined: 36, status: "done", desc: "" },
    { name: "书画兴趣班", type: "文娱", time: "2026-08-08 09:30", place: "书画室", quota: 20, joined: 12, status: "open", desc: "" },
  ];
  let rows = AdminStore.load("org-activity", SEED);
  function persist() { AdminStore.save("org-activity", rows); }

  let editIndex = -1;
  function filtered() {
    const kw = qKeyword.value.trim();
    const st = qStatus.value;
    const type = qType.value;
    return rows.filter((r) => (!kw || r.name.includes(kw)) && (!st || r.status === st) && (!type || r.type === type));
  }
  function render() {
    const list = filtered();
    stMonth.textContent = list.length;
    stOpen.textContent = list.filter((r) => r.status === "open").length;
    stDone.textContent = list.filter((r) => r.status === "done").length;
    stJoin.innerHTML = `${list.reduce((s, r) => s + r.joined, 0)}<em>人次</em>`;
    pagerInfo.textContent = `共 ${list.length} 条`;
    body.innerHTML = list
      .map((r) => {
        const i = rows.indexOf(r);
        return `<tr><td>${r.name}</td><td>${r.type}</td><td>${r.time}</td><td>${r.place}</td><td>${r.quota}</td><td>${r.joined}</td>
          <td><span class="status ${statusClass[r.status]}">${statusText[r.status]}</span></td>
          <td><button type="button" class="link" data-edit="${i}">编辑</button> <button type="button" class="link danger" data-del="${i}">删除</button></td></tr>`;
      })
      .join("");
  }
  function openEdit(i) {
    editIndex = i;
    const r = i < 0 ? null : rows[i];
    drawerTitle.textContent = i < 0 ? "发布活动" : "编辑活动";
    aName.value = r?.name || "";
    aType.value = r?.type || "文娱";
    aStart.value = r?.time?.replace(" ", "T") || "";
    aPlace.value = r?.place || "";
    aQuota.value = r?.quota ?? 40;
    aStatus.value = r?.status || "open";
    aDesc.value = r?.desc || "";
    AdminUI.openDrawer("actDrawer");
  }
  AdminUI.onReady(() => {
    AdminUI.bindDrawer("actDrawer");
    btnAdd.onclick = () => openEdit(-1);
    btnSave.onclick = () => {
      if (!aName.value.trim()) return AdminUI.toast("请填写活动名称", "info");
      const next = {
        name: aName.value.trim(),
        type: aType.value,
        time: aStart.value.replace("T", " "),
        place: aPlace.value.trim(),
        quota: Number(aQuota.value) || 0,
        joined: editIndex < 0 ? 0 : rows[editIndex].joined,
        status: aStatus.value,
        desc: aDesc.value.trim(),
      };
      if (editIndex < 0) {
        rows.unshift(next);
        AdminUI.toast("新增成功");
      } else {
        rows[editIndex] = next;
        AdminUI.toast("保存成功");
      }
      persist();
      AdminUI.closeDrawer("actDrawer");
      render();
    };
    btnSearch.onclick = render;
    btnReset.onclick = () => {
      qKeyword.value = "";
      qStatus.value = "";
      qType.value = "";
      render();
    };
    body.onclick = async (e) => {
      const el = e.target.closest("[data-edit]");
      const del = e.target.closest("[data-del]");
      if (el) openEdit(Number(el.dataset.edit));
      if (del) {
        const ok = await AdminUI.confirm("确定删除该活动？", { title: "删除确认", okText: "删除" });
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
