(() => {
  const beds = { 张秀英: "3F 312-A", 李建国: "3F 312-B", 陈桂兰: "2F 215-A", 王德福: "1F 108-B" };
  const statusText = { out: "请假中", back: "已销假", late: "逾期未归" };
  const statusClass = { out: "status-busy", back: "status-on", late: "status-repair" };
  const SEED = [
    { elder: "陈桂兰", type: "探亲", out: "2026-07-28 09:00", backPlan: "2026-07-30 18:00", companion: "陈强", phone: "135****7788", status: "out", reason: "回家过生日" },
    { elder: "王德福", type: "就医", out: "2026-07-29 08:30", backPlan: "2026-07-29 17:00", companion: "王敏", phone: "138****6621", status: "late", reason: "复查" },
    { elder: "张秀英", type: "探亲", out: "2026-07-10 10:00", backPlan: "2026-07-12 16:00", companion: "张伟", phone: "138****6621", status: "back", reason: "" },
  ];
  let rows = AdminStore.load("org-leave", SEED);
  function persist() { AdminStore.save("org-leave", rows); }

  let editIndex = -1;
  function filtered() {
    const kw = qKeyword.value.trim();
    const st = qStatus.value;
    const type = qType.value;
    return rows.filter((r) => (!kw || r.elder.includes(kw)) && (!st || r.status === st) && (!type || r.type === type));
  }
  function render() {
    const list = filtered();
    stOut.textContent = list.filter((r) => r.status === "out").length;
    stToday.textContent = list.filter((r) => r.status === "out" && r.backPlan.startsWith("2026-07-30")).length;
    stMonth.textContent = list.length;
    stLate.textContent = list.filter((r) => r.status === "late").length;
    pagerInfo.textContent = `共 ${list.length} 条`;
    body.innerHTML = list
      .map((r) => {
        const i = rows.indexOf(r);
        const act =
          r.status === "out" || r.status === "late"
            ? `<button type="button" class="link" data-back="${i}">销假</button> <button type="button" class="link danger" data-del="${i}">删除</button>`
            : `<button type="button" class="link" data-edit="${i}">查看</button> <button type="button" class="link danger" data-del="${i}">删除</button>`;
        return `<tr><td>${r.elder}</td><td>${beds[r.elder] || "—"}</td><td>${r.type}</td><td>${r.out}</td><td>${r.backPlan}</td><td>${r.companion || "—"}</td>
          <td><span class="status ${statusClass[r.status]}">${statusText[r.status]}</span></td><td>${act}</td></tr>`;
      })
      .join("");
  }
  function openEdit(i) {
    editIndex = i;
    const r = i < 0 ? null : rows[i];
    drawerTitle.textContent = i < 0 ? "登记请假" : "请假详情";
    lElder.value = r?.elder || "张秀英";
    lType.value = r?.type || "探亲";
    lOut.value = r?.out?.replace(" ", "T") || "";
    lBack.value = r?.backPlan?.replace(" ", "T") || "";
    lCompanion.value = r?.companion || "";
    lPhone.value = r?.phone || "";
    lReason.value = r?.reason || "";
    AdminUI.openDrawer("leaveDrawer");
  }
  AdminUI.onReady(() => {
    AdminUI.bindDrawer("leaveDrawer");
    btnAdd.onclick = () => openEdit(-1);
    btnSave.onclick = () => {
      const next = {
        elder: lElder.value,
        type: lType.value,
        out: lOut.value.replace("T", " "),
        backPlan: lBack.value.replace("T", " "),
        companion: lCompanion.value.trim(),
        phone: lPhone.value.trim(),
        reason: lReason.value.trim(),
        status: "out",
      };
      if (!next.out || !next.backPlan) return AdminUI.toast("请填写离院与预计归院时间", "info");
      if (editIndex < 0) {
        rows.unshift(next);
        AdminUI.toast("新增成功");
      } else {
        rows[editIndex] = { ...rows[editIndex], ...next };
        AdminUI.toast("保存成功");
      }
      persist();
      AdminUI.closeDrawer("leaveDrawer");
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
      const back = e.target.closest("[data-back]");
      const edit = e.target.closest("[data-edit]");
      const del = e.target.closest("[data-del]");
      if (back) {
        rows[Number(back.dataset.back)].status = "back";
        persist();
        AdminUI.toast("已销假");
        render();
      }
      if (edit) openEdit(Number(edit.dataset.edit));
      if (del) {
        const ok = await AdminUI.confirm("确定删除该请假记录？", { title: "删除确认", okText: "删除" });
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
