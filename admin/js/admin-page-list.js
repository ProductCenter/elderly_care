/**
 * 通用列表页脚手架：增 / 删 / 改 / 查 + 分页 + 本地持久化
 * 用法：AdminPageList.mount({ ... })
 */
window.AdminPageList = {
  mount(cfg) {
    const {
      rows: seedRows = [],
      columns = [],
      stats = [],
      filters = [],
      formFields = [],
      drawerId = "listDrawer",
      getStatus,
      onSave,
      rowActions,
      replaceActions = false,
      enableView = true,
      enableEdit = true,
      enableDelete = true,
      pageSize = 10,
      storageKey,
      persist = true,
      deleteConfirm = "确定删除该条记录？",
    } = cfg;

    const storeName = storageKey || `list:${location.pathname}`;
    let data = persist ? AdminStore.load(storeName, seedRows) : seedRows.slice();
    let editIndex = -1;
    let viewMode = false;
    let page = 1;

    const $ = (id) => document.getElementById(id);

    function persistData() {
      if (persist) AdminStore.save(storeName, data);
    }

    function filtered() {
      return data.filter((r) =>
        filters.every((f) => {
          const el = $(f.id);
          const v = el ? (el.value || "").trim() : "";
          if (f.always) return f.match ? f.match(r, v) : true;
          if (!el) return true;
          if (!v) return true;
          if (f.match) return f.match(r, v);
          const field = f.field || f.id.replace(/^q/, "").replace(/^./, (c) => c.toLowerCase());
          return String(r[f.field || field] || "").includes(v);
        })
      );
    }

    function renderStats(list) {
      (stats || []).forEach((s) => {
        const el = $(s.id);
        if (!el) return;
        const val = typeof s.value === "function" ? s.value(list, data) : s.value;
        el.innerHTML = s.html ? val : String(val);
      });
    }

    function buildActions(r, i) {
      const extras = rowActions ? rowActions(r, i) || "" : "";
      if (replaceActions) return extras;

      const hasView = /data-view=/.test(extras);
      const hasEdit = /data-edit=/.test(extras);
      const hasDel = /data-del=/.test(extras);
      const parts = [];
      if (extras) parts.push(extras);
      if (enableView && !hasView) {
        parts.push(`<button type="button" class="link" data-view="${i}">查看</button>`);
      }
      if (enableEdit && !hasEdit) {
        parts.push(`<button type="button" class="link" data-edit="${i}">编辑</button>`);
      }
      if (enableDelete && !hasDel) {
        parts.push(`<button type="button" class="link danger" data-del="${i}">删除</button>`);
      }
      return parts.join(" ");
    }

    function renderPager(total) {
      const box = document.querySelector(".pager-btns");
      const info = $("pagerInfo");
      const pages = Math.max(1, Math.ceil(total / pageSize));
      if (page > pages) page = pages;
      if (info) info.textContent = `共 ${total} 条 · 第 ${page}/${pages} 页`;
      if (!box) return;
      const btns = [];
      btns.push(`<button type="button" data-page="prev" ${page <= 1 ? "disabled" : ""}>上一页</button>`);
      const start = Math.max(1, page - 2);
      const end = Math.min(pages, start + 4);
      for (let p = start; p <= end; p++) {
        btns.push(`<button type="button" data-page="${p}" class="${p === page ? "active" : ""}">${p}</button>`);
      }
      btns.push(`<button type="button" data-page="next" ${page >= pages ? "disabled" : ""}>下一页</button>`);
      box.innerHTML = btns.join("");
    }

    function render() {
      const list = filtered();
      renderStats(list);
      renderPager(list.length);
      const body = $("body");
      if (!body) return;

      if (!list.length) {
        const cols = columns.length + 1;
        body.innerHTML = `<tr class="empty-row"><td colspan="${cols}"><div class="empty-state">暂无数据，请调整筛选条件或点击「新增」</div></td></tr>`;
        return;
      }

      const start = (page - 1) * pageSize;
      const pageRows = list.slice(start, start + pageSize);
      body.innerHTML = pageRows
        .map((r) => {
          const i = data.indexOf(r);
          const tds = columns
            .map((c) => {
              if (c.status) {
                const st = getStatus ? getStatus(r) : { text: r[c.key], cls: "status-off" };
                return `<td><span class="status ${st.cls}">${st.text}</span></td>`;
              }
              const val = c.render ? c.render(r) : r[c.key];
              return `<td>${val == null || val === "" ? "—" : val}</td>`;
            })
            .join("");
          return `<tr>${tds}<td class="col-actions">${buildActions(r, i)}</td></tr>`;
        })
        .join("");
    }

    function setFormReadonly(ro) {
      formFields.forEach((f) => {
        const el = $(f.id);
        if (!el) return;
        el.disabled = !!ro;
      });
      const saveBtn = $("btnSave");
      if (saveBtn) saveBtn.hidden = !!ro;
      const footCancel = document.querySelector(`#${drawerId} .drawer-foot [data-close-drawer]`);
      if (footCancel) footCancel.textContent = ro ? "关闭" : "取消";
    }

    function fillForm(r) {
      formFields.forEach((f) => {
        const el = $(f.id);
        if (!el) return;
        const v = r ? r[f.key] : f.default;
        el.value = v == null ? (f.type === "number" ? f.default ?? 0 : "") : v;
      });
    }

    function openEdit(i, mode = "edit") {
      editIndex = i;
      viewMode = mode === "view";
      const title = $("drawerTitle");
      if (title) {
        title.textContent =
          mode === "view"
            ? cfg.viewTitle || "查看详情"
            : i < 0
              ? cfg.addTitle || "新增"
              : cfg.editTitle || "编辑";
      }
      fillForm(i < 0 ? null : data[i]);
      setFormReadonly(viewMode);
      AdminUI.openDrawer(drawerId);
    }

    function save() {
      if (viewMode) {
        AdminUI.closeDrawer(drawerId);
        return;
      }
      const next = {};
      for (const f of formFields) {
        const el = $(f.id);
        if (!el) continue;
        let v = el.value;
        if (f.required && !String(v).trim()) {
          AdminUI.toast(`请填写${f.label || f.key}`, "error");
          el.focus();
          return;
        }
        if (f.type === "number") v = Number(v) || 0;
        next[f.key] = typeof v === "string" ? v.trim() : v;
      }
      if (onSave) Object.assign(next, onSave(next, editIndex < 0 ? null : data[editIndex]) || {});
      if (editIndex < 0) {
        data.unshift(next);
        page = 1;
        AdminUI.toast("新增成功");
      } else {
        data[editIndex] = { ...data[editIndex], ...next };
        AdminUI.toast("保存成功");
      }
      persistData();
      AdminUI.closeDrawer(drawerId);
      setFormReadonly(false);
      render();
    }

    async function removeAt(i) {
      const ok = await AdminUI.confirm(deleteConfirm, {
        title: "删除确认",
        okText: "删除",
        danger: true,
      });
      if (!ok) return;
      data.splice(i, 1);
      persistData();
      AdminUI.toast("已删除");
      render();
    }

    function boot() {
      if (boot.done) return;
      boot.done = true;
      AdminUI.bindDrawer(drawerId);
      $("btnAdd")?.addEventListener("click", () => openEdit(-1, "edit"));
      $("btnSave")?.addEventListener("click", save);
      $("btnSearch")?.addEventListener("click", () => {
        page = 1;
        render();
      });
      $("btnReset")?.addEventListener("click", () => {
        filters.forEach((f) => {
          const el = $(f.id);
          if (el) el.value = "";
        });
        page = 1;
        render();
      });

      // 回车查询
      filters.forEach((f) => {
        $(f.id)?.addEventListener("keydown", (e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            page = 1;
            render();
          }
        });
      });

      document.querySelector(".pager-btns")?.addEventListener("click", (e) => {
        const btn = e.target.closest("[data-page]");
        if (!btn || btn.disabled) return;
        const v = btn.dataset.page;
        const list = filtered();
        const pages = Math.max(1, Math.ceil(list.length / pageSize));
        if (v === "prev") page = Math.max(1, page - 1);
        else if (v === "next") page = Math.min(pages, page + 1);
        else page = Number(v) || 1;
        render();
      });

      $("body")?.addEventListener("click", (e) => {
        const view = e.target.closest("[data-view]");
        const edit = e.target.closest("[data-edit]");
        const del = e.target.closest("[data-del]");
        const custom = e.target.closest("[data-act]");
        if (view) openEdit(Number(view.dataset.view), "view");
        if (edit) openEdit(Number(edit.dataset.edit), "edit");
        if (del) removeAt(Number(del.dataset.del));
        if (custom && cfg.onAction) {
          cfg.onAction(custom.dataset.act, Number(custom.dataset.i), data, () => {
            persistData();
            render();
          });
        }
      });

      // 关闭抽屉时恢复可编辑（含 Esc / 遮罩）
      document.addEventListener("admin:drawer-close", (e) => {
        if (e.detail?.id === drawerId) setFormReadonly(false);
      });

      render();
    }

    AdminUI.onReady(boot);

    return {
      get data() {
        return data;
      },
      set data(v) {
        data = v;
        persistData();
      },
      render,
      openEdit,
      persistData,
    };
  },
};
