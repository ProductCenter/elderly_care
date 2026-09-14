(() => {
  const beds = { 张秀英: "3F 312-A", 李建国: "3F 312-B", 陈桂兰: "2F 215-A", 王德福: "1F 108-B" };
  const statusText = { draft: "草稿", approve: "待审批", exec: "待执行", done: "已完成", reject: "已驳回" };
  const statusClass = { draft: "status-off", approve: "status-busy", exec: "status-idle", done: "status-done", reject: "status-repair" };

  const SEED = [
    { no: "RC20260728001", elder: "张秀英", from: "2F 208-B", to: "3F 312-A", reason: "护理等级调整", applicant: "赵敏", time: "2026-03-10 09:20", status: "done" },
    { no: "RC20260729002", elder: "陈桂兰", from: "2F 215-A", to: "2F 220-A", reason: "家属申请", applicant: "陈静", time: "2026-07-29 11:05", status: "approve" },
    { no: "RC20260729003", elder: "王德福", from: "1F 108-B", to: "1F 106-A", reason: "床位优化", applicant: "刘芳", time: "2026-07-29 14:40", status: "exec" },
    { no: "RC20260720004", elder: "李建国", from: "4F 410-A", to: "3F 312-B", reason: "护理等级调整", applicant: "周强", time: "2026-07-20 16:12", status: "reject" },
    { no: "RC20260730005", elder: "张秀英", from: "3F 312-A", to: "3F 315-A", reason: "其他", applicant: "赵敏", time: "2026-07-30 08:50", status: "draft" },
  ];
  let rows = AdminStore.load("org-room-change", SEED);
  function persist() { AdminStore.save("org-room-change", rows); }

  let editIndex = -1;
  let saveAs = "approve";

  function filtered() {
    const kw = (document.getElementById("qKeyword")?.value || "").trim();
    const status = document.getElementById("qStatus")?.value || "";
    const reason = document.getElementById("qReason")?.value || "";
    return rows.filter((r) => {
      if (kw && !r.elder.includes(kw)) return false;
      if (status && r.status !== status) return false;
      if (reason && r.reason !== reason) return false;
      return true;
    });
  }

  function render() {
    const list = filtered();
    document.getElementById("stDoing").textContent = list.filter((r) => r.status === "approve" || r.status === "exec").length;
    document.getElementById("stAppr").textContent = list.filter((r) => r.status === "approve").length;
    document.getElementById("stDone").textContent = list.filter((r) => r.status === "done").length;
    document.getElementById("stReject").textContent = list.filter((r) => r.status === "reject").length;
    document.getElementById("pagerInfo").textContent = `共 ${list.length} 条`;
    document.getElementById("body").innerHTML = list
      .map((r) => {
        const i = rows.indexOf(r);
        const actions =
          (r.status === "draft"
            ? `<button type="button" class="link" data-edit="${i}">继续编辑</button>`
            : r.status === "approve"
              ? `<button type="button" class="link" data-view="${i}">查看</button>`
              : r.status === "exec"
                ? `<button type="button" class="link" data-exec="${i}">确认执行</button>`
                : `<button type="button" class="link" data-view="${i}">查看</button>`) +
          ` <button type="button" class="link danger" data-del="${i}">删除</button>`;
        return `<tr>
          <td>${r.no}</td><td>${r.elder}</td><td>${r.from}</td><td>${r.to}</td><td>${r.reason}</td>
          <td>${r.applicant}</td><td>${r.time}</td>
          <td><span class="status ${statusClass[r.status]}">${statusText[r.status]}</span></td>
          <td>${actions}</td>
        </tr>`;
      })
      .join("");
  }

  function syncFrom() {
    const elder = document.getElementById("rElder").value;
    document.getElementById("rFrom").value = beds[elder] || "";
  }

  function openEdit(i) {
    editIndex = i;
    const r = i < 0 ? null : rows[i];
    document.getElementById("drawerTitle").textContent = i < 0 ? "发起房间变更" : "房间变更详情";
    document.getElementById("rElder").value = r?.elder || "张秀英";
    syncFrom();
    if (r?.from) document.getElementById("rFrom").value = r.from;
    const to = (r?.to || "").split(" ");
    document.getElementById("rToFloor").value = to[0] || "3F";
    document.getElementById("rToBed").value = to[1] || "";
    document.getElementById("rReason").value = r?.reason || "护理等级调整";
    document.getElementById("rPlan").value = "";
    document.getElementById("rNote").value = "";
    AdminUI.openDrawer("rcDrawer");
  }

  function save(status) {
    const elder = document.getElementById("rElder").value;
    const toBed = document.getElementById("rToBed").value.trim();
    if (!toBed) {
      AdminUI.toast("请填写目标床位", "error");
      return;
    }
    const to = `${document.getElementById("rToFloor").value} ${toBed}`;
    const next = {
      no: editIndex >= 0 ? rows[editIndex].no : `RC${new Date().toISOString().slice(0, 10).replace(/-/g, "")}${String(rows.length + 1).padStart(3, "0")}`,
      elder,
      from: document.getElementById("rFrom").value,
      to,
      reason: document.getElementById("rReason").value,
      applicant: "管理员",
      time: new Date().toISOString().slice(0, 16).replace("T", " "),
      status,
    };
    if (editIndex < 0) rows.unshift(next);
    else rows[editIndex] = { ...rows[editIndex], ...next };
    persist();
    AdminUI.closeDrawer("rcDrawer");
    render();
    AdminUI.toast(status === "draft" ? "已存为草稿" : "已提交审批");
  }

  AdminUI.onReady(() => {
    AdminUI.bindDrawer("rcDrawer");
    render();
    document.getElementById("rElder")?.addEventListener("change", syncFrom);
    document.getElementById("btnAdd")?.addEventListener("click", () => openEdit(-1));
    document.getElementById("btnDraft")?.addEventListener("click", () => save("draft"));
    document.getElementById("btnSubmit")?.addEventListener("click", () => save("approve"));
    document.getElementById("btnSearch")?.addEventListener("click", render);
    document.getElementById("btnReset")?.addEventListener("click", () => {
      document.getElementById("qKeyword").value = "";
      document.getElementById("qStatus").value = "";
      document.getElementById("qReason").value = "";
      render();
    });
    document.getElementById("body")?.addEventListener("click", async (e) => {
      const edit = e.target.closest("[data-edit],[data-view]");
      const exec = e.target.closest("[data-exec]");
      const del = e.target.closest("[data-del]");
      if (edit) openEdit(Number(edit.dataset.edit || edit.dataset.view));
      if (exec) {
        const i = Number(exec.dataset.exec);
        rows[i].status = "done";
        persist();
        render();
        AdminUI.toast("已确认换床执行");
      }
      if (del) {
        const ok = await AdminUI.confirm("确定删除该变更单？", { title: "删除确认", okText: "删除" });
        if (!ok) return;
        rows.splice(Number(del.dataset.del), 1);
        persist();
        AdminUI.toast("已删除");
        render();
      }
    });
  });
})();
