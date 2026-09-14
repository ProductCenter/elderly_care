(() => {
  const form = document.getElementById("productForm");
  if (!form) return;

  const stores = {};
  let specSeq = 1;
  let activeSpecId = null;

  const specTableBody = document.getElementById("specTableBody");
  const multiSpecPanel = document.getElementById("multiSpecPanel");
  const btnAddSpec = document.getElementById("btnAddSpec");
  const specAttrList = document.getElementById("specAttrList");
  const serviceSpecLabel = document.getElementById("serviceSpecLabel");

  function renderPreviews(key) {
    const list = form.querySelector(`[data-preview="${key}"]`);
    const uploader = form.querySelector(`[data-upload="${key}"]`);
    if (!list || !uploader) return;

    list.innerHTML = "";
    (stores[key] || []).forEach((item, index) => {
      const el = document.createElement("div");
      el.className = "preview-item";
      if (item.kind === "video") {
        el.innerHTML = `<video src="${item.url}" muted></video><button type="button" class="remove" aria-label="删除">×</button>`;
      } else {
        el.innerHTML = `<img src="${item.url}" alt="" /><button type="button" class="remove" aria-label="删除">×</button>`;
      }
      el.querySelector(".remove").addEventListener("click", () => {
        URL.revokeObjectURL(item.url);
        stores[key].splice(index, 1);
        renderPreviews(key);
      });
      list.appendChild(el);
    });

    const max = Number(uploader.dataset.max || 1);
    uploader.hidden = (stores[key] || []).length >= max;
  }

  form.querySelectorAll("[data-upload]").forEach((uploader) => {
    const input = uploader.querySelector('input[type="file"]');
    const key = uploader.dataset.upload;
    const max = Number(uploader.dataset.max || 1);
    stores[key] = stores[key] || [];

    input.addEventListener("change", () => {
      Array.from(input.files || []).forEach((file) => {
        const isVideo = file.type.startsWith("video/");
        const isImage = file.type.startsWith("image/");
        if (!isVideo && !isImage) return;
        const limitMb = isVideo ? 30 : key === "detail" ? 10 : 5;
        if (file.size > limitMb * 1024 * 1024) {
          window.alert(isVideo ? `视频不能超过 ${limitMb}M` : `单张图片不能超过 ${limitMb}M`);
          return;
        }
        if (stores[key].length >= max) return;
        stores[key].push({
          file,
          url: URL.createObjectURL(file),
          kind: isVideo ? "video" : "image",
        });
      });
      input.value = "";
      renderPreviews(key);
    });
  });

  document.querySelectorAll(".nav-primary .nav-item").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".nav-primary .nav-item").forEach((el) => el.classList.remove("active"));
      btn.classList.add("active");
    });
  });

  document.querySelectorAll(".tabs .tab").forEach((tab) => {
    tab.addEventListener("click", (e) => {
      if (e.target.classList.contains("tab-x")) return;
      document.querySelectorAll(".tabs .tab").forEach((el) => el.classList.remove("active"));
      tab.classList.add("active");
    });
  });

  function ensureEmpty(tbody, colspan) {
    if (!tbody.querySelector("tr")) {
      tbody.innerHTML = `<tr class="empty-row"><td colspan="${colspan}"><div class="empty-state"><div class="empty-ico"></div><p>暂无数据</p></div></td></tr>`;
    }
  }

  function isMultiSpec() {
    return form.querySelector('input[name="specType"]:checked')?.value === "multi";
  }

  function getSpecRows() {
    return [...specTableBody.querySelectorAll("tr.sku-row")];
  }

  function syncServiceSpecLabel() {
    if (!serviceSpecLabel) return;
    const names = getSpecRows()
      .map((row, i) => {
        const name = row.querySelector('input[name="specName"]')?.value?.trim();
        return `规格${i + 1}：${name || "--"}`;
      })
      .join("；");
    serviceSpecLabel.textContent = names || "规格1：--";
  }

  function updateSpecDeleteButtons() {
    const rows = getSpecRows();
    const multi = isMultiSpec();
    rows.forEach((row) => {
      const btn = row.querySelector(".row-del");
      if (!btn) return;
      const canDelete = multi && rows.length > 1;
      btn.disabled = !canDelete;
      btn.classList.toggle("is-disabled", !canDelete);
    });
  }

  function setActiveSpec(id) {
    activeSpecId = id;
    specTableBody.querySelectorAll("tr.sku-row").forEach((row) => {
      row.classList.toggle("is-active", row.dataset.specId === id);
    });
    specTableBody.querySelectorAll("tr.spec-extra-row").forEach((row) => {
      row.hidden = row.dataset.specId !== id;
    });
  }

  function createSpecRow(data = {}) {
    const id = `spec-${specSeq++}`;
    const name = data.name ?? (isMultiSpec() ? "" : "默认规格");
    const main = document.createElement("tr");
    main.className = "sku-row";
    main.dataset.specId = id;
    main.innerHTML = `
      <td>
        <button type="button" class="spec-expand-btn" title="展开扩展属性">▾</button>
      </td>
      <td>
        <label class="upload-card upload-card-sm">
          <input type="file" accept="image/*" hidden />
          <span class="plus">+</span><span>上传</span>
        </label>
      </td>
      <td><input class="cell-input" name="specName" placeholder="请输入规格名称" value="${name}" /></td>
      <td><input class="cell-input" name="stock" placeholder="请输入..." value="${data.stock ?? ""}" /></td>
      <td><input class="cell-input" name="costPrice" placeholder="请输入..." value="${data.costPrice ?? ""}" /></td>
      <td><input class="cell-input" name="originPrice" placeholder="请输入..." value="${data.originPrice ?? ""}" /></td>
      <td><input class="cell-input" name="salePrice" placeholder="请输入..." value="${data.salePrice ?? ""}" /></td>
      <td><button type="button" class="link-btn row-del">删除</button></td>
    `;

    const extra = document.createElement("tr");
    extra.className = "spec-extra-row";
    extra.dataset.specId = id;
    extra.hidden = true;
    extra.innerHTML = `
      <td colspan="8">
        <div class="fusion-block field-new spec-extra-panel">
          <div class="fusion-block-head">
            <h3 class="fusion-title">规格服务扩展属性 <span class="new-badge">融合新增</span></h3>
            <p class="hint">本规格独立维护扩展指标</p>
          </div>
          <div class="spec-indicator-wrap">
            <div class="fusion-block-head">
              <h3 class="fusion-title">规格扩展指标 <span class="new-badge">融合新增</span></h3>
              <button type="button" class="btn-primary-sm btn-add-indicator">添加指标</button>
            </div>
            <table class="data-table indicator-table">
              <thead><tr><th class="th-new">指标名称</th><th class="th-new">指标值</th><th style="width:72px">操作</th></tr></thead>
              <tbody>
                <tr class="empty-row"><td colspan="3"><div class="empty-state"><div class="empty-ico"></div><p>暂无数据</p></div></td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </td>
    `;

    main.querySelector(".spec-expand-btn").addEventListener("click", () => {
      const open = !extra.hidden && activeSpecId === id;
      if (open) {
        extra.hidden = true;
        main.classList.remove("is-active");
        activeSpecId = null;
      } else {
        setActiveSpec(id);
        extra.hidden = false;
      }
    });

    main.querySelector('input[name="specName"]').addEventListener("input", syncServiceSpecLabel);

    main.querySelector(".row-del").addEventListener("click", () => {
      if (!isMultiSpec() || getSpecRows().length <= 1) return;
      main.remove();
      extra.remove();
      updateSpecDeleteButtons();
      syncServiceSpecLabel();
      if (activeSpecId === id) {
        const first = getSpecRows()[0];
        if (first) setActiveSpec(first.dataset.specId);
      }
    });

    const upload = main.querySelector('input[type="file"]');
    upload.addEventListener("change", () => {
      const file = upload.files?.[0];
      if (!file || !file.type.startsWith("image/")) return;
      const url = URL.createObjectURL(file);
      const cell = upload.closest("td");
      cell.innerHTML = `<div class="preview-item preview-item-sm is-filled"><img src="${url}" alt="" /></div>`;
    });

    extra.querySelector(".btn-add-indicator").addEventListener("click", () => {
      const tbody = extra.querySelector(".indicator-table tbody");
      tbody.querySelector(".empty-row")?.remove();
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><input class="cell-input" style="border-color:#ffd591;background:#fffefb" placeholder="指标名称" /></td>
        <td><input class="cell-input" style="border-color:#ffd591;background:#fffefb" placeholder="指标值" /></td>
        <td><button type="button" class="link-btn">删除</button></td>
      `;
      tr.querySelector(".link-btn").addEventListener("click", () => {
        tr.remove();
        ensureEmpty(tbody, 3);
      });
      tbody.appendChild(tr);
    });

    specTableBody.appendChild(main);
    specTableBody.appendChild(extra);
    updateSpecDeleteButtons();
    syncServiceSpecLabel();
    return id;
  }

  function resetSpecsToSingle() {
    specTableBody.innerHTML = "";
    specSeq = 1;
    createSpecRow({ name: "默认规格" });
    activeSpecId = null;
    specTableBody.querySelectorAll("tr.spec-extra-row").forEach((row) => {
      row.hidden = true;
    });
    specTableBody.querySelectorAll("tr.sku-row").forEach((row) => row.classList.remove("is-active"));
  }

  function applySpecMode() {
    const multi = isMultiSpec();
    if (multiSpecPanel) multiSpecPanel.hidden = !multi;
    if (btnAddSpec) btnAddSpec.hidden = !multi;

    if (!multi) {
      // collapse to one row
      const rows = getSpecRows();
      if (rows.length === 0) {
        resetSpecsToSingle();
      } else if (rows.length > 1) {
        rows.slice(1).forEach((row) => {
          const id = row.dataset.specId;
          row.remove();
          specTableBody.querySelector(`tr.spec-extra-row[data-spec-id="${id}"]`)?.remove();
        });
        const nameInput = getSpecRows()[0]?.querySelector('input[name="specName"]');
        if (nameInput && !nameInput.value.trim()) nameInput.value = "默认规格";
      }
    }
    updateSpecDeleteButtons();
    syncServiceSpecLabel();
  }

  form.querySelectorAll('input[name="specType"]').forEach((radio) => {
    radio.addEventListener("change", applySpecMode);
  });

  btnAddSpec?.addEventListener("click", () => {
    if (!isMultiSpec()) return;
    const id = createSpecRow({ name: "" });
    setActiveSpec(id);
    specTableBody.querySelector(`tr.spec-extra-row[data-spec-id="${id}"]`).hidden = false;
  });

  function addSpecAttrRow(name = "", values = "") {
    const row = document.createElement("div");
    row.className = "spec-attr-row";
    row.innerHTML = `
      <input class="text-input" name="attrName" placeholder="属性名，如：套餐" value="${name}" />
      <input class="text-input" name="attrValues" placeholder="属性值，逗号分隔，如：标准套餐,加强套餐" value="${values}" />
      <button type="button" class="link-btn attr-del">删除</button>
    `;
    row.querySelector(".attr-del").addEventListener("click", () => row.remove());
    specAttrList.appendChild(row);
  }

  document.getElementById("btnAddSpecAttr")?.addEventListener("click", () => addSpecAttrRow());

  function cartesian(arrays) {
    return arrays.reduce((acc, cur) => acc.flatMap((a) => cur.map((b) => [...a, b])), [[]]);
  }

  document.getElementById("btnGenerateSpecs")?.addEventListener("click", () => {
    if (!isMultiSpec()) return;
    const attrs = [...specAttrList.querySelectorAll(".spec-attr-row")]
      .map((row) => ({
        name: row.querySelector('[name="attrName"]')?.value.trim(),
        values: (row.querySelector('[name="attrValues"]')?.value || "")
          .split(/[,，]/)
          .map((v) => v.trim())
          .filter(Boolean),
      }))
      .filter((a) => a.name && a.values.length);

    if (!attrs.length) {
      window.alert("请先添加规格属性及取值");
      return;
    }

    const combos = cartesian(attrs.map((a) => a.values));
    specTableBody.innerHTML = "";
    specSeq = 1;
    combos.forEach((parts) => {
      createSpecRow({ name: parts.join(" / ") });
    });
    const firstId = getSpecRows()[0]?.dataset.specId;
    if (firstId) setActiveSpec(firstId);
  });

  // init one single-spec row
  resetSpecsToSingle();
  applySpecMode();
  addSpecAttrRow("套餐", "标准套餐,加强套餐");

  const serviceDetailSection = document.getElementById("serviceDetailSection");
  const packageSection = document.getElementById("packageSection");
  const packagePricingSection = document.getElementById("packagePricingSection");
  const packageTypeHint = document.getElementById("packageTypeHint");
  const serviceShapeRow = document.getElementById("serviceShapeRow");
  const serviceItemBody = document.getElementById("serviceItemBody");
  const serviceItemsHint = document.getElementById("serviceItemsHint");
  const WEEK_OPTS = [
    ["1", "周一"],
    ["2", "周二"],
    ["3", "周三"],
    ["4", "周四"],
    ["5", "周五"],
    ["6", "周六"],
    ["0", "周日"],
  ];

  const SERVICE_TYPE_OPTS = [
    ["care", "照护服务"],
    ["home", "居家服务"],
    ["org", "机构服务"],
    ["community", "社区服务"],
    ["medical", "医疗健康"],
    ["life", "生活支持"],
    ["assess", "适老化评估"],
    ["renovate", "适老化改造"],
    ["accept", "适老化验收"],
    ["alert", "预警上门服务"],
    ["other", "其他"],
  ];

  const SERVICE_CATALOG_SEED = [
    { id: "FW100001", name: "起居照顾", type: "照护服务", content: "起居照顾", price: "" },
    { id: "FW100002", name: "安全陪伴", type: "照护服务", content: "安全陪伴", price: "" },
    { id: "FW100003", name: "个人基础卫生", type: "照护服务", content: "个人基础卫生", price: "" },
    { id: "FW100004", name: "专业干预", type: "照护服务", content: "专业干预", price: "" },
    { id: "FW100005", name: "压疮预防", type: "照护服务", content: "压疮预防", price: "" },
    { id: "FW100018", name: "健康指导", type: "医疗健康", content: "健康指导", price: "" },
    { id: "FW100017", name: "慢病管理", type: "医疗健康", content: "慢病管理", price: "" },
    { id: "FW100016", name: "康复保健", type: "医疗健康", content: "康复保健", price: "" },
    { id: "FW100015", name: "中医理疗", type: "医疗健康", content: "中医理疗", price: "" },
    { id: "FW100014", name: "家庭医生", type: "医疗健康", content: "家庭医生", price: "" },
    { id: "FW100013", name: "代购取药", type: "生活支持", content: "代购取药", price: "" },
    { id: "FW100012", name: "待办服务", type: "生活支持", content: "待办服务", price: "" },
    { id: "FW100011", name: "助浴助洁", type: "生活支持", content: "助浴助洁", price: "" },
    { id: "FW100010", name: "上门维修", type: "生活支持", content: "上门维修", price: "" },
  ];

  function escHtml(s) {
    return String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function loadServiceCatalog() {
    let stored = [];
    try {
      const raw = localStorage.getItem("kangyang-admin:mall:service-items");
      if (raw) stored = JSON.parse(raw) || [];
    } catch (_) {
      stored = [];
    }
    const map = new Map();
    SERVICE_CATALOG_SEED.forEach((r) => map.set(r.id, { ...r }));
    (Array.isArray(stored) ? stored : []).forEach((r) => {
      if (!r?.id) return;
      map.set(r.id, {
        id: r.id,
        name: r.name || "",
        type: r.type || "",
        content: r.content || r.name || "",
        price: r.price ?? "",
        unit: r.unit || "",
        duration: r.duration || "",
      });
    });
    return [...map.values()].sort((a, b) => String(a.id).localeCompare(String(b.id)));
  }

  function resolveServiceTypeValue(typeLabel) {
    if (!typeLabel) return "";
    const hit = SERVICE_TYPE_OPTS.find(([v, label]) => v === typeLabel || label === typeLabel);
    return hit ? hit[0] : "other";
  }

  function getAddedServiceIds() {
    return new Set(
      [...(serviceItemBody?.querySelectorAll(".svc-item-row") || [])]
        .map((tr) => tr.dataset.sourceId || "")
        .filter(Boolean)
    );
  }

  function weekChecksHtml(selected = ["1", "2", "3", "4", "5", "6"]) {
    return WEEK_OPTS.map(
      ([v, label]) =>
        `<label class="week-chip"><input type="checkbox" name="weekdays" value="${v}" ${
          selected.includes(v) ? "checked" : ""
        }/><span>${label}</span></label>`
    ).join("");
  }

  function serviceTypeOptionsHtml(selected = "") {
    const opts = SERVICE_TYPE_OPTS.map(
      ([v, label]) =>
        `<option value="${v}" ${selected === v || selected === label ? "selected" : ""}>${label}</option>`
    ).join("");
    return `<option value="">请选择服务类型</option>${opts}`;
  }

  function createServiceItemRow(data = {}) {
    if (!serviceItemBody) return;
    serviceItemBody.querySelector(".empty-row")?.remove();
    const tr = document.createElement("tr");
    tr.className = "svc-item-row";
    if (data.sourceId || data.id) tr.dataset.sourceId = data.sourceId || data.id;
    const typeVal = resolveServiceTypeValue(data.serviceType || data.category || data.type || "");
    tr.innerHTML = `
      <td>
        <label class="upload-card upload-card-sm pkg-thumb">
          <input type="file" accept="image/*" hidden />
          <span class="plus">+</span>
        </label>
      </td>
      <td><input class="cell-input" name="itemName" placeholder="服务名称" value="${escHtml(data.name || "")}" /></td>
      <td>
        <select class="cell-input cell-fusion" name="itemServiceType" aria-label="服务类型">
          ${serviceTypeOptionsHtml(typeVal || data.serviceType || data.category || "")}
        </select>
      </td>
      <td><input class="cell-input cell-fusion" name="itemTimes" type="number" min="1" value="${data.timesPerDay ?? 1}" /></td>
      <td><input class="cell-input" name="itemPrice" type="number" min="0" step="0.01" value="${data.guidePrice ?? data.price ?? ""}" placeholder="指导价格" /></td>
      <td>
        <div class="week-chip-row" title="每周可服务日期">${weekChecksHtml(data.weekdays)}</div>
      </td>
      <td><input class="cell-input cell-fusion" name="itemDesc" placeholder="服务说明" value="${escHtml(data.description || data.content || "")}" /></td>
      <td><button type="button" class="link-btn svc-item-del">删除</button></td>
    `;
    tr.querySelector(".svc-item-del").addEventListener("click", () => {
      tr.remove();
      if (!serviceItemBody.querySelector(".svc-item-row")) ensureEmpty(serviceItemBody, 8);
      recalcPackageTotal();
    });
    tr.querySelectorAll('input[name="itemTimes"], input[name="itemPrice"]').forEach((el) => {
      el.addEventListener("input", recalcPackageTotal);
    });
    const file = tr.querySelector('input[type="file"]');
    file?.addEventListener("change", () => {
      const f = file.files?.[0];
      if (!f || !f.type.startsWith("image/")) return;
      const url = URL.createObjectURL(f);
      const cell = file.closest("td");
      cell.innerHTML = `<div class="preview-item preview-item-sm is-filled"><img src="${url}" alt="" /></div>`;
    });
    serviceItemBody.appendChild(tr);
    recalcPackageTotal();
  }

  function recalcPackageTotal() {
    const days = Number(document.getElementById("pkgServiceDays")?.value) || 0;
    let sum = 0;
    serviceItemBody?.querySelectorAll(".svc-item-row").forEach((tr) => {
      const times = Number(tr.querySelector('[name="itemTimes"]')?.value) || 0;
      const price = Number(tr.querySelector('[name="itemPrice"]')?.value) || 0;
      sum += times * price * (days || 1);
    });
    const el = document.getElementById("pkgGuideTotal");
    if (el) el.value = String(Math.round(sum * 100) / 100);
  }

  function collectServiceItems() {
    const provider =
      document.getElementById("pkgProviderName")?.value.trim() || "";
    return [...(serviceItemBody?.querySelectorAll(".svc-item-row") || [])].map((tr, i) => {
      const weekdays = [...tr.querySelectorAll('input[name="weekdays"]:checked')].map((c) => c.value);
      return {
        id: tr.dataset.sourceId || `item_${i + 1}`,
        name: tr.querySelector('[name="itemName"]')?.value.trim() || "",
        provider,
        mode: "station",
        verifyMode: "count",
        serviceType: tr.querySelector('[name="itemServiceType"]')?.value || "",
        category: (() => {
          const sel = tr.querySelector('[name="itemServiceType"]');
          if (!sel?.value) return "";
          return sel.selectedOptions?.[0]?.textContent || "";
        })(),
        timesPerDay: Number(tr.querySelector('[name="itemTimes"]')?.value) || 1,
        guidePrice: Number(tr.querySelector('[name="itemPrice"]')?.value) || 0,
        weekdays,
        description: tr.querySelector('[name="itemDesc"]')?.value.trim() || "",
      };
    });
  }

  /* —— 选择服务项目弹窗 —— */
  const svcPicker = document.getElementById("svcPicker");
  const svcPickerMask = document.getElementById("svcPickerMask");
  const svcPickerBody = document.getElementById("svcPickerBody");
  const svcPickerType = document.getElementById("svcPickerType");
  const svcPickerName = document.getElementById("svcPickerName");
  const svcPickerCheckAll = document.getElementById("svcPickerCheckAll");
  let svcPickerCatalog = [];
  let svcPickerFiltered = [];

  function fillPickerTypeOptions(list) {
    if (!svcPickerType) return;
    const types = [...new Set(list.map((r) => r.type).filter(Boolean))];
    const current = svcPickerType.value;
    svcPickerType.innerHTML =
      `<option value="">请选择服务类型</option>` +
      types.map((t) => `<option value="${t}">${t}</option>`).join("");
    if (types.includes(current)) svcPickerType.value = current;
  }

  function renderPickerRows(list) {
    if (!svcPickerBody) return;
    svcPickerFiltered = list;
    const added = getAddedServiceIds();
    if (!list.length) {
      svcPickerBody.innerHTML = `<tr><td class="empty-cell" colspan="6">暂无匹配的服务项目</td></tr>`;
      if (svcPickerCheckAll) {
        svcPickerCheckAll.checked = false;
        svcPickerCheckAll.indeterminate = false;
      }
      return;
    }
    svcPickerBody.innerHTML = list
      .map((r) => {
        const disabled = added.has(r.id);
        const priceText =
          r.price === "" || r.price == null
            ? ""
            : r.unit
              ? `${r.price}/${r.unit}`
              : String(r.price);
        return `<tr class="${disabled ? "is-disabled" : ""}" data-id="${escHtml(r.id)}">
          <td><input type="checkbox" class="svc-pick-check" value="${escHtml(r.id)}" ${disabled ? "disabled" : ""} /></td>
          <td>${escHtml(r.id)}</td>
          <td>${escHtml(r.name || "—")}</td>
          <td>${escHtml(r.type || "—")}</td>
          <td>${escHtml(r.content || "—")}</td>
          <td>${escHtml(priceText)}</td>
        </tr>`;
      })
      .join("");
    syncPickerCheckAll();
  }

  function filterPickerList() {
    const type = (svcPickerType?.value || "").trim();
    const name = (svcPickerName?.value || "").trim();
    return svcPickerCatalog.filter((r) => {
      if (type && r.type !== type) return false;
      if (name && !String(r.name || "").includes(name)) return false;
      return true;
    });
  }

  function syncPickerCheckAll() {
    if (!svcPickerCheckAll || !svcPickerBody) return;
    const boxes = [...svcPickerBody.querySelectorAll(".svc-pick-check:not(:disabled)")];
    const checked = boxes.filter((b) => b.checked);
    svcPickerCheckAll.checked = boxes.length > 0 && checked.length === boxes.length;
    svcPickerCheckAll.indeterminate = checked.length > 0 && checked.length < boxes.length;
  }

  function openServicePicker() {
    svcPickerCatalog = loadServiceCatalog();
    fillPickerTypeOptions(svcPickerCatalog);
    if (svcPickerType) svcPickerType.value = "";
    if (svcPickerName) svcPickerName.value = "";
    renderPickerRows(svcPickerCatalog);
    if (svcPickerMask) {
      svcPickerMask.hidden = false;
      svcPickerMask.style.cssText =
        "position:fixed;inset:0;z-index:2000;background:rgba(0,0,0,.45);";
    }
    if (svcPicker) {
      svcPicker.hidden = false;
      svcPicker.style.cssText =
        "position:fixed;z-index:2001;left:50%;top:50%;transform:translate(-50%,-50%);width:min(920px,calc(100vw - 48px));max-height:calc(100vh - 64px);display:flex;flex-direction:column;background:#fff;border-radius:8px;box-shadow:0 8px 28px rgba(0,0,0,.18);overflow:hidden;";
    }
    document.body.style.overflow = "hidden";
  }

  function closeServicePicker() {
    if (svcPicker) {
      svcPicker.hidden = true;
      svcPicker.removeAttribute("style");
    }
    if (svcPickerMask) {
      svcPickerMask.hidden = true;
      svcPickerMask.removeAttribute("style");
    }
    document.body.style.overflow = "";
  }

  function confirmServicePicker() {
    const selectedIds = [...(svcPickerBody?.querySelectorAll(".svc-pick-check:checked") || [])].map(
      (el) => el.value
    );
    if (!selectedIds.length) {
      window.alert("请先选择服务项目");
      return;
    }
    const added = getAddedServiceIds();
    let count = 0;
    selectedIds.forEach((id) => {
      if (added.has(id)) return;
      const item = svcPickerCatalog.find((r) => r.id === id);
      if (!item) return;
      createServiceItemRow({
        sourceId: item.id,
        name: item.name,
        serviceType: item.type,
        guidePrice: item.price === "" || item.price == null ? "" : Number(item.price) || item.price,
        description: item.content || item.name,
      });
      count += 1;
    });
    closeServicePicker();
    if (count) {
      /* selected rows already added */
    }
  }

  svcPickerBody?.addEventListener("click", (e) => {
    const tr = e.target.closest("tr[data-id]");
    if (!tr || tr.classList.contains("is-disabled")) return;
    if (e.target.closest("input[type='checkbox']")) {
      tr.classList.toggle("is-selected", e.target.checked);
      syncPickerCheckAll();
      return;
    }
    const box = tr.querySelector(".svc-pick-check");
    if (!box || box.disabled) return;
    box.checked = !box.checked;
    tr.classList.toggle("is-selected", box.checked);
    syncPickerCheckAll();
  });

  svcPickerCheckAll?.addEventListener("change", () => {
    const on = !!svcPickerCheckAll.checked;
    svcPickerBody?.querySelectorAll(".svc-pick-check:not(:disabled)").forEach((box) => {
      box.checked = on;
      box.closest("tr")?.classList.toggle("is-selected", on);
    });
    syncPickerCheckAll();
  });

  document.getElementById("svcPickerSearch")?.addEventListener("click", () => {
    renderPickerRows(filterPickerList());
  });
  document.getElementById("svcPickerReset")?.addEventListener("click", () => {
    if (svcPickerType) svcPickerType.value = "";
    if (svcPickerName) svcPickerName.value = "";
    renderPickerRows(svcPickerCatalog);
  });
  document.getElementById("svcPickerConfirm")?.addEventListener("click", confirmServicePicker);
  document.getElementById("svcPickerCancel")?.addEventListener("click", closeServicePicker);
  document.getElementById("svcPickerClose")?.addEventListener("click", closeServicePicker);
  svcPickerMask?.addEventListener("click", closeServicePicker);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && svcPicker && !svcPicker.hidden) closeServicePicker();
  });
  svcPickerName?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      renderPickerRows(filterPickerList());
    }
  });

  function collectPackagePayload() {
    return {
      productType: "service",
      serviceShape: "package",
      fulfillment: "package",
      name: document.getElementById("productName")?.value.trim() || "",
      providerName: document.getElementById("pkgProviderName")?.value.trim() || "",
      providerType: document.getElementById("pkgProviderType")?.value || "org",
      serviceDays: Number(document.getElementById("pkgServiceDays")?.value) || 0,
      guideTotalPrice: Number(document.getElementById("pkgGuideTotal")?.value) || 0,
      salePrice: Number(document.getElementById("pkgSalePrice")?.value) || 0,
      intro: document.getElementById("pkgIntro")?.value.trim() || "",
      storeId: document.getElementById("storeSelect")?.value || "store_cy001",
      items: collectServiceItems(),
    };
  }

  function seedPackageDemo() {
    if (!serviceItemBody || serviceItemBody.querySelector(".svc-item-row")) return;
    const nameInput = document.getElementById("productName");
    if (nameInput && !nameInput.value.trim()) nameInput.value = "包月订餐-2餐1饮料";
    const demo = [
      { sourceId: "FW_DEMO_LUNCH", name: "午餐正餐", serviceType: "community", guidePrice: 15, description: "Single lunch meal supply." },
      { sourceId: "FW_DEMO_DRINK_L", name: "午餐饮品", serviceType: "community", guidePrice: 5, description: "Single lunch drink supply." },
      { sourceId: "FW_DEMO_DINNER", name: "晚餐正餐", serviceType: "community", guidePrice: 15, description: "Single dinner meal supply." },
      { sourceId: "FW_DEMO_DRINK_D", name: "晚餐饮品", serviceType: "community", guidePrice: 5, description: "Single dinner drink supply." },
    ];
    demo.forEach((d) => createServiceItemRow(d));
  }

  function isPackageShape() {
    return form.querySelector('input[name="serviceShape"]:checked')?.value === "package";
  }

  document.getElementById("btnAddServiceItem")?.addEventListener("click", openServicePicker);
  document.getElementById("pkgServiceDays")?.addEventListener("input", recalcPackageTotal);

  function applyProductType() {
    const type = form.querySelector('input[name="productType"]:checked')?.value;
    const isService = type === "service";
    const isPackage = isService && isPackageShape();
    const isPhysical = type === "physical";
    if (serviceShapeRow) serviceShapeRow.hidden = !isService;
    if (packageTypeHint) packageTypeHint.hidden = !isPackage;
    if (packageSection) packageSection.hidden = !isPackage;
    if (packagePricingSection) packagePricingSection.hidden = !isPackage;
    if (serviceDetailSection) serviceDetailSection.hidden = !isService;
    const serviceDaysItem = document.getElementById("serviceDays")?.closest(".form-item");
    if (serviceDaysItem) serviceDaysItem.hidden = isPackage;
    if (serviceSpecLabel) serviceSpecLabel.hidden = isPackage;
    if (serviceItemsHint) {
      serviceItemsHint.textContent = isPackage
        ? "套餐权益：支付后按「次数/天 × 服务天数」生成可核销配额（与标准服务明细统一）"
        : "标准服务：与套餐权益共用服务项目表；次数/天即单次履约次数";
    }
    if (isPackage) seedPackageDemo();
    else recalcPackageTotal();
  }

  form.querySelectorAll('input[name="productType"]').forEach((radio) => {
    radio.addEventListener("change", applyProductType);
  });
  form.querySelectorAll('input[name="serviceShape"]').forEach((radio) => {
    radio.addEventListener("change", applyProductType);
  });
  applyProductType();

  const csPhoneRow = document.getElementById("csPhoneRow");
  form.querySelectorAll('input[name="csEnable"]').forEach((radio) => {
    radio.addEventListener("change", () => {
      if (!csPhoneRow) return;
      csPhoneRow.hidden = form.querySelector('input[name="csEnable"]:checked')?.value !== "yes";
    });
  });

  document.getElementById("btnPublish")?.addEventListener("click", () => {
    const type = form.querySelector('input[name="productType"]:checked')?.value;
    if (type === "service" && isPackageShape()) {
      const payload = collectPackagePayload();
      if (!payload.name) {
        window.alert("请填写商品名称");
        return;
      }
      if (!payload.serviceDays || !payload.items.length) {
        window.alert("请填写服务天数并至少添加一个服务项目");
        return;
      }
      // 统一演示门店 ID，与 C 端 / 商家核销对齐
      if (payload.storeId === "jinsheng" || payload.storeId === "chaoyang") {
        payload.storeId = "store_cy001";
      }
      payload.goodsId = "package_meal_month";
      payload.shelfStatus = "on";
      payload.publishedAt = Date.now();
      try {
        localStorage.setItem("kangyang_package_draft_v1", JSON.stringify(payload));
      } catch (_) {}
      const goMall = window.confirm(
        `套餐权益已上架（演示）\n商品：${payload.name}\n项目总价 ${payload.guideTotalPrice} 元\n套餐价 ${payload.salePrice} 元\n共 ${payload.items.length} 个服务项目\n\n是否前往商城商品页下单？`
      );
      if (goMall) {
        location.href = "./detail.html?id=package_meal_month&from=admin";
      } else {
        location.href = "./package-demo.html";
      }
      return;
    }
    window.alert("已保存（演示）");
  });

  // 用例入口：?shape=package 直接进入套餐权益形态；?type=physical|service 预选商品类型
  const params = new URLSearchParams(location.search);
  const typeParam = params.get("type");
  if (typeParam === "physical" || typeParam === "goods") {
    const physicalRadio = form.querySelector('input[name="productType"][value="physical"]');
    if (physicalRadio) {
      physicalRadio.checked = true;
      applyProductType();
    }
  } else if (typeParam === "service") {
    const serviceRadio = form.querySelector('input[name="productType"][value="service"]');
    if (serviceRadio) {
      serviceRadio.checked = true;
      applyProductType();
    }
  }
  const shapeParam = params.get("shape");
  if (shapeParam === "package") {
    const pkgRadio = form.querySelector('input[name="serviceShape"][value="package"]');
    if (pkgRadio) {
      pkgRadio.checked = true;
      applyProductType();
    }
  }
})();
