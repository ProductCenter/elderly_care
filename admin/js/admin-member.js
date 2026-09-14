(() => {
  const PAGE_SIZE = 10;
  let page = 1;
  let editId = null;
  let booted = false;

  const $ = (id) => document.getElementById(id);

  function filtered() {
    const kw = ($("qKeyword")?.value || "").trim();
    const level = $("qLevel")?.value || "";
    const status = $("qStatus")?.value || "";
    return MemberStore.listMembers().filter((m) => {
      if (kw && !(m.name.includes(kw) || String(m.phone).includes(kw) || String(m.id).includes(kw))) {
        return false;
      }
      if (level && m.levelId !== level) return false;
      if (status && m.status !== status) return false;
      return true;
    });
  }

  function renderStats() {
    const s = MemberStore.stats();
    if ($("stTotal")) $("stTotal").textContent = String(s.total);
    if ($("stActive")) $("stActive").textContent = String(s.active);
    if ($("stGoldPlus")) $("stGoldPlus").textContent = String(s.gold + s.diamond);
    if ($("stPoints")) $("stPoints").textContent = String(s.pointsSum);
  }

  function renderPager(total) {
    const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    if (page > pages) page = pages;
    if ($("pagerInfo")) $("pagerInfo").textContent = `共 ${total} 条 · 第 ${page}/${pages} 页`;
    const box = document.querySelector(".pager-btns");
    if (!box) return;
    const btns = [];
    btns.push(`<button type="button" data-page="prev" ${page <= 1 ? "disabled" : ""}>上一页</button>`);
    for (let p = Math.max(1, page - 2); p <= Math.min(pages, page + 2); p++) {
      btns.push(`<button type="button" data-page="${p}" class="${p === page ? "active" : ""}">${p}</button>`);
    }
    btns.push(`<button type="button" data-page="next" ${page >= pages ? "disabled" : ""}>下一页</button>`);
    box.innerHTML = btns.join("");
  }

  function render() {
    const list = filtered();
    renderStats();
    renderPager(list.length);
    const start = (page - 1) * PAGE_SIZE;
    const rows = list.slice(start, start + PAGE_SIZE);
    const body = $("body");
    if (!body) return;
    body.innerHTML = rows.length
      ? rows
          .map(
            (m) => `<tr>
              <td>${m.id}</td>
              <td>${m.name}</td>
              <td>${m.phone}</td>
              <td><span style="color:${m.levelColor || "#1677ff"}">${m.levelName}</span></td>
              <td>${m.growth}</td>
              <td>${m.points}</td>
              <td>${m.station || "—"}</td>
              <td>${m.status === "active" ? "有效" : "停用"}</td>
              <td>
                <button type="button" class="link" data-edit="${m.id}">编辑</button>
                <button type="button" class="link" data-toggle="${m.id}">${
              m.status === "active" ? "停用" : "启用"
            }</button>
              </td>
            </tr>`
          )
          .join("")
      : `<tr><td colspan="9"><div class="empty-state"><p>暂无会员</p></div></td></tr>`;
  }

  function fillForm(m) {
    $("fName").value = m?.name || "";
    $("fPhone").value = m?.phone || "";
    $("fStation").value = m?.station || "春风社区中心站 · 朝阳门店";
    $("fGrowth").value = m?.growth ?? 0;
    $("fPoints").value = m?.points ?? 0;
    $("fStatus").value = m?.status || "active";
    $("fAdjust").value = 0;
    $("fAdjustReason").value = "";
    const showAdj = Boolean(m);
    $("adjustWrap").hidden = !showAdj;
    $("adjustReasonWrap").hidden = !showAdj;
  }

  function boot() {
    if (booted || !$("body")) return;
    booted = true;
    AdminUI.bindDrawer("memberDrawer");
    render();

    $("btnSearch")?.addEventListener("click", () => {
      page = 1;
      render();
    });
    $("btnReset")?.addEventListener("click", () => {
      ["qKeyword", "qLevel", "qStatus"].forEach((id) => {
        if ($(id)) $(id).value = "";
      });
      page = 1;
      render();
    });

    document.querySelector(".pager-btns")?.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-page]");
      if (!btn || btn.disabled) return;
      const v = btn.dataset.page;
      const total = filtered().length;
      const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
      if (v === "prev") page = Math.max(1, page - 1);
      else if (v === "next") page = Math.min(pages, page + 1);
      else page = Number(v) || 1;
      render();
    });

    $("btnAdd")?.addEventListener("click", () => {
      editId = null;
      fillForm(null);
      $("drawerTitle").textContent = "新增会员";
      AdminUI.openDrawer("memberDrawer");
    });

    $("body")?.addEventListener("click", (e) => {
      const editBtn = e.target.closest("[data-edit]");
      const toggleBtn = e.target.closest("[data-toggle]");
      if (editBtn) {
        editId = editBtn.dataset.edit;
        fillForm(MemberStore.getMember(editId));
        $("drawerTitle").textContent = "编辑会员";
        AdminUI.openDrawer("memberDrawer");
      }
      if (toggleBtn) {
        const id = toggleBtn.dataset.toggle;
        const m = MemberStore.getMember(id);
        if (!m) return;
        MemberStore.upsertMember({
          ...m,
          status: m.status === "active" ? "disabled" : "active",
        });
        AdminUI.toast(m.status === "active" ? "已停用" : "已启用");
        render();
      }
    });

    $("btnSave")?.addEventListener("click", () => {
      const name = ($("fName").value || "").trim();
      const phone = ($("fPhone").value || "").trim();
      if (!name) return AdminUI.toast("请填写姓名");
      if (!/^1\d{10}$/.test(phone)) return AdminUI.toast("手机号格式不正确");

      const existing = editId ? MemberStore.getMember(editId) : null;
      const saved = MemberStore.upsertMember({
        id: editId || undefined,
        name,
        phone,
        station: $("fStation").value.trim(),
        growth: Number($("fGrowth").value) || 0,
        points: Number($("fPoints").value) || 0,
        status: $("fStatus").value || "active",
        source: existing?.source || "admin",
        createdAt: existing?.createdAt,
        lastOrderAt: existing?.lastOrderAt ?? null,
      });

      const adj = Number($("fAdjust").value) || 0;
      if (editId && adj) {
        MemberStore.adjustPoints(saved.id, adj, $("fAdjustReason").value.trim() || "后台积分调整", {
          channel: "admin",
        });
      }

      AdminUI.closeDrawer("memberDrawer");
      AdminUI.toast("已保存");
      render();
    });
  }

  AdminUI.onReady(boot);
})();
