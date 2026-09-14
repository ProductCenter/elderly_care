(() => {
  const SEED = [
    {
      name: "张秀英",
      gender: "女",
      birth: "1942-03-18",
      idNo: "12010419420318****",
      floor: "3F",
      bed: "312-A",
      care: "半护理",
      checkin: "2025-11-02",
      contact: "张伟 138****6621",
      complete: true,
      nation: "汉族",
      marriage: "丧偶",
      edu: "初中",
      job: "工人",
      hukou: "天津市河东区",
      addr: "天津市河东区××路",
      blood: "A",
      allergy: "青霉素",
      chronic: "高血压",
      disability: "轻度失能",
      history: "2019 年髋部骨折术后",
      healthNote: "家属确认可正常进食软食",
      contract: "HT-2025-1102",
      meal: "软食 · 低盐",
      careNote: "夜间需巡视",
      religion: "",
      hobby: "戏曲",
      social: "",
      bank: "",
      remark: "",
      family: [
        { name: "张伟", relation: "儿子", phone: "138****6621", primary: true },
        { name: "张丽", relation: "女儿", phone: "139****2201", primary: false },
      ],
      changes: [
        { date: "2026-03-12", type: "床位变更", detail: "2F-208-B → 3F-312-A", by: "赵敏" },
        { date: "2026-01-08", type: "护理等级", detail: "自理 → 半护理", by: "李护士" },
      ],
    },
    {
      name: "李建国",
      gender: "男",
      birth: "1938-07-09",
      idNo: "12010219380709****",
      floor: "3F",
      bed: "312-B",
      care: "特护",
      checkin: "2024-06-18",
      contact: "李娜 137****9033",
      complete: true,
      nation: "汉族",
      marriage: "已婚",
      edu: "高中",
      job: "教师",
      hukou: "天津市和平区",
      addr: "天津市和平区××里",
      blood: "O",
      allergy: "无",
      chronic: "糖尿病、冠心病",
      disability: "重度失能",
      history: "冠脉支架术后",
      healthNote: "需按时监测血糖",
      contract: "HT-2024-0618",
      meal: "糖尿病餐",
      careNote: "翻身每 2 小时",
      religion: "",
      hobby: "书法",
      social: "",
      bank: "",
      remark: "",
      family: [{ name: "李娜", relation: "女儿", phone: "137****9033", primary: true }],
      changes: [{ date: "2025-09-01", type: "护理等级", detail: "全护理 → 特护", by: "周强" }],
    },
    {
      name: "陈桂兰",
      gender: "女",
      birth: "1948-11-22",
      idNo: "12010619481122****",
      floor: "2F",
      bed: "215-A",
      care: "自理",
      checkin: "2026-07-05",
      contact: "陈强 135****7788",
      complete: false,
      nation: "汉族",
      marriage: "丧偶",
      edu: "小学",
      job: "务农",
      hukou: "天津市津南区",
      addr: "",
      blood: "不详",
      allergy: "无",
      chronic: "",
      disability: "能力完好",
      history: "",
      healthNote: "",
      contract: "HT-2026-0705",
      meal: "普食",
      careNote: "",
      religion: "",
      hobby: "太极拳",
      social: "",
      bank: "",
      remark: "资料待补全",
      family: [{ name: "陈强", relation: "儿子", phone: "135****7788", primary: true }],
      changes: [],
    },
    {
      name: "王德福",
      gender: "男",
      birth: "1940-01-30",
      idNo: "12010519400130****",
      floor: "1F",
      bed: "108-B",
      care: "全护理",
      checkin: "2023-12-01",
      contact: "王敏 138****6621",
      complete: true,
      nation: "汉族",
      marriage: "丧偶",
      edu: "初中",
      job: "司机",
      hukou: "天津市河西区",
      addr: "天津市河西区××道",
      blood: "B",
      allergy: "无",
      chronic: "脑梗后遗症",
      disability: "中度失能",
      history: "2022 年脑梗",
      healthNote: "左侧肢体活动不利",
      contract: "HT-2023-1201",
      meal: "软食",
      careNote: "助行",
      religion: "",
      hobby: "",
      social: "",
      bank: "",
      remark: "",
      family: [{ name: "王敏", relation: "女儿", phone: "138****6621", primary: true }],
      changes: [],
    },
  ];

  let rows = AdminStore.load("org-elder", SEED);
  function persist() { AdminStore.save("org-elder", rows); }
  let editIndex = -1;
  let draftFamily = [];

  function ageOf(birth) {
    if (!birth) return "—";
    const y = new Date().getFullYear() - Number(birth.slice(0, 4));
    return y;
  }

  function filtered() {
    const kw = (document.getElementById("qKeyword")?.value || "").trim();
    const floor = document.getElementById("qFloor")?.value || "";
    const care = document.getElementById("qCare")?.value || "";
    return rows.filter((r) => {
      if (floor && r.floor !== floor) return false;
      if (care && r.care !== care) return false;
      if (kw && !(r.name.includes(kw) || r.idNo.includes(kw) || r.bed.includes(kw))) return false;
      return true;
    });
  }

  function renderStats(list) {
    document.getElementById("stIn").textContent = list.length;
    document.getElementById("stNew").textContent = list.filter((r) => (r.checkin || "").startsWith("2026-07")).length;
    document.getElementById("stCare").textContent = list.filter((r) => r.care === "特护" || r.care === "全护理").length;
    const full = list.length ? Math.round((list.filter((r) => r.complete).length / list.length) * 100) : 0;
    document.getElementById("stFull").innerHTML = `${full}<em>%</em>`;
  }

  function renderTable() {
    const list = filtered();
    renderStats(list);
    document.getElementById("pagerInfo").textContent = `共 ${list.length} 条`;
    document.getElementById("elderBody").innerHTML = list
      .map((r) => {
        const idx = rows.indexOf(r);
        return `<tr>
          <td>${r.name}</td>
          <td>${r.gender}</td>
          <td>${ageOf(r.birth)}</td>
          <td>${r.idNo}</td>
          <td>${r.floor} ${r.bed}</td>
          <td>${r.care}</td>
          <td>${r.checkin || "—"}</td>
          <td>${r.contact || "—"}</td>
          <td><span class="status ${r.complete ? "status-on" : "status-busy"}">${r.complete ? "完整" : "待补全"}</span></td>
          <td>
            <button type="button" class="link" data-edit="${idx}">档案</button>
            <button type="button" class="link" data-edit="${idx}">编辑</button>
            <button type="button" class="link danger" data-del="${idx}">删除</button>
          </td>
        </tr>`;
      })
      .join("");
  }

  function switchTab(tab) {
    document.querySelectorAll("#elderTabs button").forEach((b) => b.classList.toggle("active", b.dataset.tab === tab));
    document.querySelectorAll(".elder-panel").forEach((p) => {
      p.hidden = p.dataset.panel !== tab;
    });
  }

  function renderFamily() {
    const box = document.getElementById("familyList");
    box.innerHTML = draftFamily
      .map(
        (f, i) => `<div class="family-block">
          <div class="head"><span>家属 ${i + 1}${f.primary ? " · 紧急联系人" : ""}</span>
            <button type="button" class="link danger" data-del-family="${i}">删除</button></div>
          <div class="form-grid">
            <div class="form-field"><label>姓名</label><input class="ctrl" data-f="name" data-i="${i}" value="${f.name || ""}" /></div>
            <div class="form-field"><label>关系</label><input class="ctrl" data-f="relation" data-i="${i}" value="${f.relation || ""}" /></div>
            <div class="form-field"><label>电话</label><input class="ctrl" data-f="phone" data-i="${i}" value="${f.phone || ""}" /></div>
            <div class="form-field"><label>紧急联系人</label>
              <select class="ctrl" data-f="primary" data-i="${i}">
                <option value="1" ${f.primary ? "selected" : ""}>是</option>
                <option value="0" ${!f.primary ? "selected" : ""}>否</option>
              </select>
            </div>
          </div>
        </div>`
      )
      .join("") || `<p style="color:#8c8c8c;font-size:13px">暂无家属，请添加</p>`;
  }

  function renderChanges(list) {
    const box = document.getElementById("changeList");
    if (!list?.length) {
      box.innerHTML = `<p style="color:#8c8c8c;font-size:13px">暂无变更记录</p>`;
      return;
    }
    box.innerHTML = list
      .map(
        (c) => `<div class="change-block">
          <div class="head"><span>${c.type}</span><span style="font-weight:400;color:#8c8c8c">${c.date}</span></div>
          <div style="font-size:13px;color:#262626">${c.detail}</div>
          <div style="font-size:12px;color:#8c8c8c;margin-top:4px">操作人：${c.by || "—"}</div>
        </div>`
      )
      .join("");
  }

  function fillForm(r) {
    const set = (id, v) => {
      const el = document.getElementById(id);
      if (el) el.value = v ?? "";
    };
    set("eName", r?.name);
    set("eGender", r?.gender || "女");
    set("eBirth", r?.birth);
    set("eIdNo", r?.idNo);
    set("eNation", r?.nation || "汉族");
    set("eMarriage", r?.marriage || "已婚");
    set("eEdu", r?.edu);
    set("eJob", r?.job);
    set("eHukou", r?.hukou);
    set("eAddr", r?.addr);
    set("eBlood", r?.blood || "不详");
    set("eAllergy", r?.allergy);
    set("eChronic", r?.chronic);
    set("eDisability", r?.disability || "能力完好");
    set("eHistory", r?.history);
    set("eHealthNote", r?.healthNote);
    set("eFloor", r?.floor || "3F");
    set("eBed", r?.bed);
    set("eCare", r?.care || "自理");
    set("eCheckin", r?.checkin);
    set("eContract", r?.contract);
    set("eMeal", r?.meal);
    set("eCareNote", r?.careNote);
    set("eReligion", r?.religion);
    set("eHobby", r?.hobby);
    set("eSocial", r?.social);
    set("eBank", r?.bank);
    set("eRemark", r?.remark);

    draftFamily = (r?.family || []).map((f) => ({ ...f }));
    renderFamily();
    renderChanges(r?.changes || []);

    const name = r?.name || "新增长者";
    document.getElementById("eTitleName").textContent = name;
    document.getElementById("eAvatar").textContent = name.slice(0, 1);
    document.getElementById("eTitleSub").textContent = r
      ? `${r.floor || ""} ${r.bed || ""} · ${r.care || ""} · 入住 ${r.checkin || "—"}`
      : "完善各页签信息后保存";
  }

  function openEdit(index) {
    editIndex = index;
    document.getElementById("drawerTitle").textContent = index < 0 ? "新增长者" : "长者档案";
    fillForm(index < 0 ? null : rows[index]);
    switchTab("basic");
    AdminUI.openDrawer("elderDrawer");
  }

  function collectFamily() {
    document.querySelectorAll("#familyList [data-f]").forEach((el) => {
      const i = Number(el.dataset.i);
      const key = el.dataset.f;
      if (!draftFamily[i]) return;
      if (key === "primary") draftFamily[i].primary = el.value === "1";
      else draftFamily[i][key] = el.value.trim();
    });
    return draftFamily;
  }

  function save() {
    const name = document.getElementById("eName").value.trim();
    const idNo = document.getElementById("eIdNo").value.trim();
    const bed = document.getElementById("eBed").value.trim();
    if (!name || !idNo || !bed) {
      AdminUI.toast("请至少填写姓名、身份证号、房间床位", "error");
      switchTab("basic");
      return;
    }
    const family = collectFamily();
    const primary = family.find((f) => f.primary) || family[0];
    const next = {
      ...(editIndex >= 0 ? rows[editIndex] : { changes: [] }),
      name,
      gender: document.getElementById("eGender").value,
      birth: document.getElementById("eBirth").value,
      idNo,
      nation: document.getElementById("eNation").value.trim(),
      marriage: document.getElementById("eMarriage").value,
      edu: document.getElementById("eEdu").value.trim(),
      job: document.getElementById("eJob").value.trim(),
      hukou: document.getElementById("eHukou").value.trim(),
      addr: document.getElementById("eAddr").value.trim(),
      blood: document.getElementById("eBlood").value,
      allergy: document.getElementById("eAllergy").value.trim(),
      chronic: document.getElementById("eChronic").value.trim(),
      disability: document.getElementById("eDisability").value,
      history: document.getElementById("eHistory").value.trim(),
      healthNote: document.getElementById("eHealthNote").value.trim(),
      floor: document.getElementById("eFloor").value,
      bed,
      care: document.getElementById("eCare").value,
      checkin: document.getElementById("eCheckin").value,
      contract: document.getElementById("eContract").value.trim(),
      meal: document.getElementById("eMeal").value.trim(),
      careNote: document.getElementById("eCareNote").value.trim(),
      religion: document.getElementById("eReligion").value.trim(),
      hobby: document.getElementById("eHobby").value.trim(),
      social: document.getElementById("eSocial").value.trim(),
      bank: document.getElementById("eBank").value.trim(),
      remark: document.getElementById("eRemark").value.trim(),
      family,
      contact: primary ? `${primary.name} ${primary.phone || ""}`.trim() : "",
      complete: Boolean(name && idNo && bed && family.length),
    };
    if (editIndex < 0) {
      rows.unshift(next);
      AdminUI.toast("新增成功");
    } else {
      rows[editIndex] = next;
      AdminUI.toast("保存成功");
    }
    persist();
    AdminUI.closeDrawer("elderDrawer");
    renderTable();
  }

  AdminUI.onReady(() => {
    AdminUI.bindDrawer("elderDrawer");
    renderTable();

    document.getElementById("btnAdd")?.addEventListener("click", () => openEdit(-1));
    document.getElementById("btnSave")?.addEventListener("click", save);
    document.getElementById("btnSearch")?.addEventListener("click", renderTable);
    document.getElementById("btnReset")?.addEventListener("click", () => {
      document.getElementById("qKeyword").value = "";
      document.getElementById("qFloor").value = "";
      document.getElementById("qCare").value = "";
      renderTable();
    });

    document.getElementById("elderTabs")?.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-tab]");
      if (btn) switchTab(btn.dataset.tab);
    });

    document.getElementById("btnAddFamily")?.addEventListener("click", () => {
      collectFamily();
      draftFamily.push({ name: "", relation: "", phone: "", primary: draftFamily.length === 0 });
      renderFamily();
    });

    document.getElementById("familyList")?.addEventListener("click", (e) => {
      const del = e.target.closest("[data-del-family]");
      if (!del) return;
      collectFamily();
      draftFamily.splice(Number(del.dataset.delFamily), 1);
      renderFamily();
    });

    document.getElementById("elderBody")?.addEventListener("click", async (e) => {
      const edit = e.target.closest("[data-edit]");
      const del = e.target.closest("[data-del]");
      if (edit) openEdit(Number(edit.dataset.edit));
      if (del) {
        const ok = await AdminUI.confirm("确定删除该长者档案？", { title: "删除确认", okText: "删除" });
        if (!ok) return;
        rows.splice(Number(del.dataset.del), 1);
        persist();
        AdminUI.toast("已删除");
        renderTable();
      }
    });

    document.getElementById("eName")?.addEventListener("input", () => {
      const n = document.getElementById("eName").value.trim() || "新增长者";
      document.getElementById("eTitleName").textContent = n;
      document.getElementById("eAvatar").textContent = n.slice(0, 1);
    });

    document.getElementById("importExcel")?.addEventListener("change", (e) => {
      const file = e.target.files?.[0];
      e.target.value = "";
      if (!file) return;
      rows.unshift({
        name: "导入示例",
        gender: "女",
        birth: "1945-01-01",
        idNo: "12010019450101****",
        floor: "4F",
        bed: "401-A",
        care: "自理",
        checkin: new Date().toISOString().slice(0, 10),
        contact: "待补充",
        complete: false,
        nation: "汉族",
        marriage: "丧偶",
        edu: "",
        job: "",
        hukou: "",
        addr: "",
        blood: "不详",
        allergy: "无",
        chronic: "",
        disability: "能力完好",
        history: "",
        healthNote: "",
        contract: "",
        meal: "",
        careNote: "",
        religion: "",
        hobby: "",
        social: "",
        bank: "",
        remark: `来自文件：${file.name}`,
        family: [],
        changes: [],
      });
      renderTable();
      AdminUI.toast(`已导入演示数据（文件：${file.name}）`);
      persist();
    });
  });
})();
