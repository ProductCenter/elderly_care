(() => {
  const statusText = { idle: "空闲", busy: "在住", book: "预订", repair: "维修" };
  const statusClass = { idle: "status-idle", busy: "status-busy", book: "status-book", repair: "status-repair" };

  const seedRooms = [
    ["301", "标准间", "双人间", 3600],
    ["302", "标准间", "双人间", 3600],
    ["305", "精品间", "单人间", 5200],
    ["308", "标准间", "双人间", 3600],
    ["312", "特护间", "双人间", 6800],
    ["315", "精品间", "双人间", 4800],
    ["318", "标准间", "三人间", 3200],
    ["320", "特护间", "单人间", 7600],
  ];

  let rows = []; // build seed
  seedRooms.forEach(([room, standard, type, fee]) => {
    const slots = type === "单人间" ? ["A"] : type === "三人间" ? ["A", "B", "C"] : ["A", "B"];
    slots.forEach((slot, i) => {
      const statuses = ["busy", "idle", "book", "busy", "repair", "idle", "busy", "idle"];
      const elders = ["张秀英", "", "（预订）王女士", "李建国", "", "", "陈桂兰", ""];
      const st = statuses[rows.length % statuses.length];
      rows.push({
        floor: "3F",
        room,
        slot,
        standard,
        type,
        fee,
        status: st,
        elder: st === "busy" ? elders[rows.length % elders.length] || "王大爷" : st === "book" ? "预订中" : "",
      });
    });
  });

  // light data for other floors
  ["1F", "2F", "4F", "5F"].forEach((fl) => {
    for (let n = 1; n <= 4; n++) {
      const room = `${fl[0]}${String(n).padStart(2, "0")}${n + 1}`;
      rows.push({
        floor: fl,
        room,
        slot: "A",
        standard: "标准间",
        type: "双人间",
        fee: 3600,
        status: n % 2 ? "busy" : "idle",
        elder: n % 2 ? `长者${fl}-${n}` : "",
      });
      rows.push({
        floor: fl,
        room,
        slot: "B",
        standard: "标准间",
        type: "双人间",
        fee: 3600,
        status: n % 3 ? "idle" : "busy",
        elder: n % 3 ? "" : `长者${fl}-${n}B`,
      });
    }
  });

  const SEED = rows.slice();
  rows = AdminStore.load("org-bed", SEED);
  function persist() { AdminStore.save("org-bed", rows); }
  let editIndex = -1;

  function filtered() {
    const floor = document.getElementById("qFloor")?.value || "";
    const kw = (document.getElementById("qKeyword")?.value || "").trim();
    const status = document.getElementById("qStatus")?.value || "";
    return rows.filter((r) => {
      if (floor && r.floor !== floor) return false;
      if (status && r.status !== status) return false;
      if (kw && !(r.room.includes(kw) || r.slot.includes(kw) || (r.elder || "").includes(kw))) return false;
      return true;
    });
  }

  function renderStats(list) {
    document.getElementById("stTotal").textContent = list.length;
    document.getElementById("stIdle").textContent = list.filter((r) => r.status === "idle").length;
    document.getElementById("stBusy").textContent = list.filter((r) => r.status === "busy").length;
    document.getElementById("stOther").textContent = list.filter((r) => r.status === "book" || r.status === "repair").length;
  }

  function renderTable() {
    const list = filtered();
    renderStats(list);
    document.getElementById("pagerInfo").textContent = `共 ${list.length} 条`;
    document.getElementById("bedBody").innerHTML = list
      .map((r) => {
        const idx = rows.indexOf(r);
        return `<tr>
          <td>${r.floor}</td>
          <td>${r.room}</td>
          <td>${r.slot}</td>
          <td>${r.standard}</td>
          <td>${r.type}</td>
          <td>${r.fee}</td>
          <td><span class="status ${statusClass[r.status]}">${statusText[r.status]}</span></td>
          <td>${r.elder || "—"}</td>
          <td><button type="button" class="link" data-edit="${idx}">编辑</button> <button type="button" class="link danger" data-del="${idx}">删除</button></td>
        </tr>`;
      })
      .join("");
  }

  function renderMap() {
    const floor = document.getElementById("mapFloor")?.value || "3F";
    const list = rows.filter((r) => r.floor === floor);
    renderStats(document.getElementById("qFloor")?.value ? filtered() : rows.filter((r) => !document.getElementById("qFloor")?.value || r.floor === document.getElementById("qFloor").value));
    const byRoom = {};
    list.forEach((r) => {
      byRoom[r.room] = byRoom[r.room] || [];
      byRoom[r.room].push(r);
    });
    document.getElementById("bedMap").innerHTML = Object.keys(byRoom)
      .sort()
      .map((room) => {
        const slots = byRoom[room]
          .map((r) => {
            const idx = rows.indexOf(r);
            return `<button type="button" class="bed-slot ${r.status}" data-edit="${idx}" title="${statusText[r.status]}${r.elder ? " · " + r.elder : ""}">${r.slot}</button>`;
          })
          .join("");
        return `<div class="bed-cell"><div class="room">${floor}-${room}</div><div class="bed-slots">${slots}</div></div>`;
      })
      .join("");
  }

  function openEdit(index) {
    editIndex = index;
    const r = index < 0 ? null : rows[index];
    document.getElementById("drawerTitle").textContent = index < 0 ? "新增床位" : "编辑床位";
    document.getElementById("bFloor").value = r?.floor || document.getElementById("mapFloor").value;
    document.getElementById("bRoom").value = r?.room || "";
    document.getElementById("bSlot").value = r?.slot || "";
    document.getElementById("bStandard").value = r?.standard || "标准间";
    document.getElementById("bType").value = r?.type || "双人间";
    document.getElementById("bFee").value = r?.fee ?? 3800;
    document.getElementById("bStatus").value = r?.status || "idle";
    document.getElementById("bElder").value = r?.elder || "";
    AdminUI.openDrawer("bedDrawer");
  }

  function save() {
    const room = document.getElementById("bRoom").value.trim();
    const slot = document.getElementById("bSlot").value.trim();
    if (!room || !slot) {
      AdminUI.toast("请填写房间号与床位号", "error");
      return;
    }
    const next = {
      floor: document.getElementById("bFloor").value,
      room,
      slot,
      standard: document.getElementById("bStandard").value,
      type: document.getElementById("bType").value,
      fee: Number(document.getElementById("bFee").value) || 0,
      status: document.getElementById("bStatus").value,
      elder: document.getElementById("bElder").value.trim(),
    };
    if (editIndex < 0) {
      rows.unshift(next);
      AdminUI.toast("新增成功");
    } else {
      rows[editIndex] = next;
      AdminUI.toast("保存成功");
    }
    persist();
    AdminUI.closeDrawer("bedDrawer");
    renderTable();
    renderMap();
  }

  AdminUI.onReady(() => {
    AdminUI.bindDrawer("bedDrawer");
    renderTable();
    renderMap();

    document.getElementById("btnAddBed")?.addEventListener("click", () => openEdit(-1));
    document.getElementById("btnSaveBed")?.addEventListener("click", save);
    document.getElementById("btnSearch")?.addEventListener("click", () => {
      renderTable();
      renderMap();
    });
    document.getElementById("btnReset")?.addEventListener("click", () => {
      document.getElementById("qFloor").value = "";
      document.getElementById("qKeyword").value = "";
      document.getElementById("qStatus").value = "";
      renderTable();
      renderMap();
    });
    document.getElementById("mapFloor")?.addEventListener("change", renderMap);

    document.getElementById("viewToggle")?.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-view]");
      if (!btn) return;
      document.querySelectorAll("#viewToggle button").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const map = btn.dataset.view === "map";
      document.getElementById("mapPanel").hidden = !map;
      document.getElementById("tablePanel").hidden = map;
    });

    document.getElementById("bedBody")?.addEventListener("click", async (e) => {
      const edit = e.target.closest("[data-edit]");
      const del = e.target.closest("[data-del]");
      if (edit) openEdit(Number(edit.dataset.edit));
      if (del) {
        const ok = await AdminUI.confirm("确定删除该床位？", { title: "删除确认", okText: "删除" });
        if (!ok) return;
        rows.splice(Number(del.dataset.del), 1);
        persist();
        AdminUI.toast("已删除");
        renderTable();
        renderMap();
      }
    });
    document.getElementById("bedMap")?.addEventListener("click", (e) => {
      const edit = e.target.closest("[data-edit]");
      if (edit) openEdit(Number(edit.dataset.edit));
    });
  });
})();
