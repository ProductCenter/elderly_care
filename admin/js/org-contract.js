(() => {
  const statusText = { draft: "草稿", signing: "待签署", active: "履行中", expired: "已到期", terminated: "已终止" };
  const statusClass = {
    draft: "status-off",
    signing: "status-busy",
    active: "status-on",
    expired: "status-repair",
    terminated: "status-off",
  };
  const elderMeta = {
    张秀英: { idNo: "12010419420318****", agent: "张伟", phone: "138****6621", bed: "3F 312-A", care: "半护理" },
    李建国: { idNo: "12010219380709****", agent: "李娜", phone: "137****9033", bed: "3F 312-B", care: "特护" },
    陈桂兰: { idNo: "12010619481122****", agent: "陈强", phone: "135****7788", bed: "2F 215-A", care: "自理" },
    王德福: { idNo: "12010519400130****", agent: "王敏", phone: "138****6621", bed: "1F 108-B", care: "全护理" },
  };

  const SEED = [
    { no: "HT-2025-1102", elder: "张秀英", agent: "张伟", bed: "3F 312-A", care: "半护理", fee: 7200, start: "2025-11-02", end: "2026-11-01", status: "active" },
    { no: "HT-2024-0618", elder: "李建国", agent: "李娜", bed: "3F 312-B", care: "特护", fee: 9800, start: "2024-06-18", end: "2027-06-17", status: "active" },
    { no: "HT-2026-0705", elder: "陈桂兰", agent: "陈强", bed: "2F 215-A", care: "自理", fee: 5600, start: "2026-07-05", end: "2027-07-04", status: "signing" },
    { no: "HT-2023-1201", elder: "王德福", agent: "王敏", bed: "1F 108-B", care: "全护理", fee: 8600, start: "2023-12-01", end: "2026-08-15", status: "active" },
    { no: "HT-DRAFT-001", elder: "张秀英", agent: "张伟", bed: "3F 315-A", care: "半护理", fee: 7400, start: "", end: "", status: "draft" },
  ];
  let rows = AdminStore.load("org-contract", SEED);
  function persist() { AdminStore.save("org-contract", rows); }


  let editIndex = -1;
  let step = 1;
  const secs = ["secParties", "secService", "secFee", "secPreview"];

  function sumFee() {
    const bed = Number(document.getElementById("cFeeBed").value) || 0;
    const care = Number(document.getElementById("cFeeCare").value) || 0;
    const meal = Number(document.getElementById("cFeeMeal").value) || 0;
    document.getElementById("cFeeTotal").value = bed + care + meal;
  }

  function filtered() {
    const kw = (document.getElementById("qKeyword")?.value || "").trim();
    const status = document.getElementById("qStatus")?.value || "";
    const care = document.getElementById("qCare")?.value || "";
    return rows.filter((r) => {
      if (status && r.status !== status) return false;
      if (care && r.care !== care) return false;
      if (kw && !(r.no.includes(kw) || r.elder.includes(kw))) return false;
      return true;
    });
  }

  function render() {
    const list = filtered();
    document.getElementById("stTotal").textContent = list.length;
    document.getElementById("stActive").textContent = list.filter((r) => r.status === "active").length;
    document.getElementById("stExpire").textContent = list.filter((r) => r.end && r.end <= "2026-08-30" && r.status === "active").length;
    document.getElementById("stDraft").textContent = list.filter((r) => r.status === "draft" || r.status === "signing").length;
    document.getElementById("pagerInfo").textContent = `共 ${list.length} 条`;
    document.getElementById("body").innerHTML = list
      .map((r) => {
        const i = rows.indexOf(r);
        return `<tr>
          <td>${r.no}</td>
          <td>${r.elder}</td>
          <td>${r.agent}</td>
          <td>${r.bed}</td>
          <td>${r.care}</td>
          <td>${r.fee}</td>
          <td>${r.start || "—"} ~ ${r.end || "—"}</td>
          <td><span class="status ${statusClass[r.status]}">${statusText[r.status]}</span></td>
          <td>
            <button type="button" class="link" data-edit="${i}">编辑</button>
            <button type="button" class="link" data-preview="${i}">预览</button>
            <button type="button" class="link danger" data-del="${i}">删除</button>
          </td>
        </tr>`;
      })
      .join("");
  }

  function fillElder() {
    const m = elderMeta[document.getElementById("cElder").value];
    if (!m) return;
    document.getElementById("cIdNo").value = m.idNo;
    document.getElementById("cAgent").value = m.agent;
    document.getElementById("cAgentPhone").value = m.phone;
    document.getElementById("cBed").value = m.bed;
    document.getElementById("cCare").value = m.care;
  }

  function showStep(n) {
    step = n;
    secs.forEach((id, idx) => {
      document.getElementById(id).hidden = idx !== n - 1;
    });
    document.querySelectorAll(".step-bar .step").forEach((el, idx) => {
      el.classList.toggle("active", idx === n - 1);
      el.classList.toggle("done", idx < n - 1);
    });
    document.getElementById("btnPrev").hidden = n === 1;
    document.getElementById("btnNext").hidden = n === 4;
    document.getElementById("btnSave").hidden = n !== 4;
    if (n === 3) sumFee();
    if (n === 4) renderPreview();
  }

  function blank(v) {
    return `<span class="blank">${v || "　　"}</span>`;
  }

  function renderPreview() {
    sumFee();
    const elder = document.getElementById("cElder").value;
    const agent = document.getElementById("cAgent").value;
    const bed = document.getElementById("cBed").value;
    const care = document.getElementById("cCare").value;
    const start = document.getElementById("cStart").value;
    const end = document.getElementById("cEnd").value;
    const total = document.getElementById("cFeeTotal").value;
    const org = document.getElementById("cOrg").value;
    const special = document.getElementById("cSpecial").value;
    document.getElementById("previewBox").innerHTML = `
      <h4>养老机构服务合同（2024）· 制式预览</h4>
      <p>甲方（养老机构）：${blank(org)}</p>
      <p>乙方（服务对象）：${blank(elder)}，身份证号：${blank(document.getElementById("cIdNo").value)}</p>
      <p>监护人/代理人：${blank(agent)}，电话：${blank(document.getElementById("cAgentPhone").value)}，关系：${blank(document.getElementById("cRelation").value)}</p>
      <p>服务床位：${blank(bed)}；护理等级：${blank(care)}</p>
      <p>服务期限：自 ${blank(start)} 起至 ${blank(end)} 止。</p>
      <p>月费用合计：人民币 ${blank(total)} 元（含床位费、护理费、餐费），缴费周期：${blank(document.getElementById("cPayCycle").value)}；押金 ${blank(document.getElementById("cDeposit").value)} 元。</p>
      <p>服务项目：${blank(document.getElementById("cService").value || "住宿、餐饮、生活照料、基础护理")}</p>
      <p>特别约定：${blank(special || "无")}</p>
      <p style="margin-top:12px;color:#8c8c8c">说明：以上字段对应制式合同空白处，保存后可导出 PDF / 提交审批。</p>
    `;
  }

  function openEdit(i, jumpPreview) {
    editIndex = i;
    const r = i < 0 ? null : rows[i];
    document.getElementById("drawerTitle").textContent = i < 0 ? "新建合同" : "编辑合同";
    document.getElementById("cNo").value = r?.no || "";
    document.getElementById("cStatus").value = r?.status === "active" || r?.status === "signing" || r?.status === "draft" ? r.status : "draft";
    document.getElementById("cElder").value = r?.elder || "张秀英";
    fillElder();
    if (r) {
      document.getElementById("cAgent").value = r.agent;
      document.getElementById("cBed").value = r.bed;
      document.getElementById("cCare").value = r.care;
      document.getElementById("cStart").value = r.start || "";
      document.getElementById("cEnd").value = r.end || "";
      document.getElementById("cFeeTotal").value = r.fee || 0;
    }
    document.getElementById("cService").value = "住宿、餐饮、生活照料、康复护理";
    document.getElementById("cSpecial").value = "";
    AdminUI.openDrawer("ctDrawer");
    showStep(jumpPreview ? 4 : 1);
    if (jumpPreview) renderPreview();
  }

  function save() {
    const elder = document.getElementById("cElder").value;
    const agent = document.getElementById("cAgent").value.trim();
    const bed = document.getElementById("cBed").value.trim();
    if (!agent || !bed) {
      AdminUI.toast("请完善代理人与床位信息", "error");
      showStep(1);
      return;
    }
    sumFee();
    const next = {
      no: document.getElementById("cNo").value.trim() || `HT-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${String(rows.length + 1).padStart(3, "0")}`,
      elder,
      agent,
      bed,
      care: document.getElementById("cCare").value,
      fee: Number(document.getElementById("cFeeTotal").value) || 0,
      start: document.getElementById("cStart").value,
      end: document.getElementById("cEnd").value,
      status: document.getElementById("cStatus").value,
    };
    if (editIndex < 0) {
      rows.unshift(next);
      AdminUI.toast("新增成功");
    } else {
      rows[editIndex] = next;
      AdminUI.toast("合同已保存");
    }
    persist();
    AdminUI.closeDrawer("ctDrawer");
    render();
  }

  AdminUI.onReady(() => {
    AdminUI.bindDrawer("ctDrawer");
    render();
    document.getElementById("cElder")?.addEventListener("change", fillElder);
    ["cFeeBed", "cFeeCare", "cFeeMeal"].forEach((id) => document.getElementById(id)?.addEventListener("input", sumFee));
    document.getElementById("btnAdd")?.addEventListener("click", () => openEdit(-1));
    document.getElementById("btnTemplate")?.addEventListener("click", () => {
      openEdit(-1, true);
      document.getElementById("drawerTitle").textContent = "制式合同模板预览";
    });
    document.getElementById("btnPrev")?.addEventListener("click", () => showStep(Math.max(1, step - 1)));
    document.getElementById("btnNext")?.addEventListener("click", () => showStep(Math.min(4, step + 1)));
    document.getElementById("btnSave")?.addEventListener("click", save);
    document.getElementById("btnSearch")?.addEventListener("click", render);
    document.getElementById("btnReset")?.addEventListener("click", () => {
      document.getElementById("qKeyword").value = "";
      document.getElementById("qStatus").value = "";
      document.getElementById("qCare").value = "";
      render();
    });
    document.getElementById("body")?.addEventListener("click", async (e) => {
      const edit = e.target.closest("[data-edit]");
      const preview = e.target.closest("[data-preview]");
      const del = e.target.closest("[data-del]");
      if (edit) openEdit(Number(edit.dataset.edit));
      if (preview) openEdit(Number(preview.dataset.preview), true);
      if (del) {
        const ok = await AdminUI.confirm("确定删除该合同？", { title: "删除确认", okText: "删除" });
        if (!ok) return;
        rows.splice(Number(del.dataset.del), 1);
        persist();
        AdminUI.toast("已删除");
        render();
      }
    });
  });
})();
