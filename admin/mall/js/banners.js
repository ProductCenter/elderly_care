(() => {
  const HOME_KEY = "kangyang-admin:mall:home-config";
  const ASSET = "../../assets";
  const PAGE_SIZE = 10;

  const PRESETS = [
    { label: "AI舒压", src: `${ASSET}/cover-ai-massage.png`, bg: "#ffe0cc" },
    { label: "营养餐", src: `${ASSET}/cover-nutrition-meal.png`, bg: "#c6ebd8" },
    { label: "体检", src: `${ASSET}/cover-health-check.png`, bg: "#c9ddf7" },
    { label: "足疗", src: `${ASSET}/cover-foot-spa.png`, bg: "#f5d9c8" },
    { label: "颈椎", src: `${ASSET}/cover-neck-massage.png`, bg: "#e2d8f5" },
    { label: "理疗仪", src: `${ASSET}/cover-therapy-device.png`, bg: "#d5e4f5" },
  ];

  const DEFAULT_BANNERS = [
    {
      image: "./assets/cover-ai-massage.png",
      eyebrow: "春风优选 · 到店理疗",
      title: "AI 舒压\n一键放松",
      sub: "智能理疗 · 限时体验",
      bg: "#ffe0cc",
      status: "上架",
      linkType: "activity",
      linkId: "act_massage_trial",
    },
    {
      image: "./assets/cover-nutrition-meal.png",
      eyebrow: "营养配餐 · 社区直达",
      title: "暖心简餐\n每日新鲜",
      sub: "低盐少油 · 适合长者",
      bg: "#c6ebd8",
      status: "上架",
      linkType: "activity",
      linkId: "act_meal_month",
    },
    {
      image: "./assets/cover-health-check.png",
      eyebrow: "健康守护 · 上门服务",
      title: "体检套餐\n安心守护",
      sub: "专业评估 · 报告解读",
      bg: "#c9ddf7",
      status: "上架",
      linkType: "activity",
      linkId: "act_free_check",
    },
  ];

  const $ = (id) => document.getElementById(id);
  let homeCfg = null;
  let rows = [];
  let editIndex = -1;
  let page = 1;
  let uploadMeta = null; // { w, h, size, name, ok }
  let uploadedDataUrl = "";

  const IMG_RULES = {
    maxBytes: 500 * 1024,
    minW: 750,
    minH: 520,
    recommendW: 750,
    recommendH: 560,
    types: ["image/jpeg", "image/png", "image/webp"],
    exts: [".jpg", ".jpeg", ".png", ".webp"],
  };

  function esc(s) {
    return String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function linkTypeLabel(type) {
    return (window.MALL_LINK_TYPES || []).find((t) => t.key === type)?.label || "";
  }

  function fillLinkOptions(type, selectedId) {
    const sel = $("fLinkId");
    if (!sel) return;
    const opts = type ? window.listMallLinkOptions?.(type) || [] : [];
    if (!type) {
      sel.innerHTML = `<option value="">请先选择类型</option>`;
      return;
    }
    if (!opts.length) {
      sel.innerHTML = `<option value="">暂无可选项</option>`;
      return;
    }
    const placeholder =
      type === "product"
        ? "请选择商品"
        : type === "article"
          ? "请选择文章"
          : type === "theme"
            ? "请选择主题活动"
            : "请选择活动落地页";
    sel.innerHTML =
      `<option value="">${placeholder}</option>` +
      opts
        .map(
          (o) =>
            `<option value="${esc(o.id)}" ${o.id === selectedId ? "selected" : ""}>${esc(o.label)}</option>`
        )
        .join("");
  }

  function storeSrc(src) {
    if (!src) return src;
    if (String(src).startsWith("data:image/")) return src;
    const m = String(src).match(/(?:(?:\.\.\/)+|\.\/)?assets\/(.+)$/);
    if (m) return `./assets/${m[1]}`;
    return src;
  }

  function previewSrc(src) {
    const stored = src || "";
    if (String(stored).startsWith("data:image/")) return stored;
    const normalized = storeSrc(stored) || "";
    const m = normalized.match(/^\.\/assets\/(.+)$/);
    if (m) return `${ASSET}/${m[1]}`;
    if (normalized.startsWith("../../assets/")) return normalized;
    return normalized || `${ASSET}/cover-ai-massage.png`;
  }

  function setUploadMsg(text, type) {
    const el = $("fUploadMsg");
    if (!el) return;
    el.textContent = text;
    el.classList.remove("is-ok", "is-err");
    if (type === "ok") el.classList.add("is-ok");
    if (type === "err") el.classList.add("is-err");
  }

  function updatePreview(src, metaText) {
    const img = $("fPreview");
    const meta = $("fPreviewMeta");
    const url = previewSrc(src);
    if (img) img.src = url;
    if (meta) meta.textContent = metaText || (src ? "当前图片" : "未选择图片");
    const clearBtn = $("btnClearUpload");
    if (clearBtn) clearBtn.hidden = !String(src || "").startsWith("data:image/");
  }

  function readImageSize(file) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        const w = img.naturalWidth || img.width;
        const h = img.naturalHeight || img.height;
        URL.revokeObjectURL(url);
        resolve({ w, h });
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("无法读取图片"));
      };
      img.src = url;
    });
  }

  function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error("读取文件失败"));
      reader.readAsDataURL(file);
    });
  }

  async function validateAndLoadFile(file) {
    if (!file) return null;
    const name = file.name || "image";
    const lower = name.toLowerCase();
    const extOk = IMG_RULES.exts.some((ext) => lower.endsWith(ext));
    const typeOk = !file.type || IMG_RULES.types.includes(file.type);
    if (!extOk && !typeOk) {
      setUploadMsg("格式不支持，请上传 JPG / PNG / WebP", "err");
      AdminUI.toast("图片格式不符合要求", "error");
      return null;
    }
    if (file.size > IMG_RULES.maxBytes) {
      const kb = Math.round(file.size / 1024);
      setUploadMsg(`文件过大（${kb}KB），请压缩至 500KB 以内`, "err");
      AdminUI.toast("图片超过 500KB", "error");
      return null;
    }

    let size;
    try {
      size = await readImageSize(file);
    } catch {
      setUploadMsg("无法读取图片尺寸，请更换文件后重试", "err");
      AdminUI.toast("无法读取图片尺寸", "error");
      return null;
    }

    if (size.w < IMG_RULES.minW || size.h < IMG_RULES.minH) {
      setUploadMsg(
        `尺寸不足：当前 ${size.w}×${size.h}，要求宽≥${IMG_RULES.minW} 且高≥${IMG_RULES.minH}（推荐 ${IMG_RULES.recommendW}×${IMG_RULES.recommendH}）`,
        "err"
      );
      AdminUI.toast(`尺寸不符合：需 ≥${IMG_RULES.minW}×${IMG_RULES.minH}`, "error");
      return null;
    }

    let dataUrl;
    try {
      dataUrl = await fileToDataUrl(file);
    } catch {
      setUploadMsg("读取文件失败，请重试", "err");
      AdminUI.toast("读取文件失败", "error");
      return null;
    }

    const exact =
      size.w === IMG_RULES.recommendW && size.h === IMG_RULES.recommendH;
    uploadMeta = { w: size.w, h: size.h, size: file.size, name, ok: true };
    uploadedDataUrl = dataUrl;
    if ($("fImage")) $("fImage").value = dataUrl;
    updatePreview(
      dataUrl,
      `${size.w}×${size.h} · ${Math.round(file.size / 1024)}KB · ${name}`
    );
    renderPresets("");
    if (exact) {
      setUploadMsg(`校验通过：${size.w}×${size.h}，符合推荐规格`, "ok");
      AdminUI.toast("图片上传成功");
    } else {
      setUploadMsg(
        `校验通过：${size.w}×${size.h}（推荐 ${IMG_RULES.recommendW}×${IMG_RULES.recommendH}，当前可用）`,
        "ok"
      );
      AdminUI.toast("图片上传成功（非推荐尺寸，已通过最小要求）");
    }
    return dataUrl;
  }

  function loadHome() {
    try {
      const raw = localStorage.getItem(HOME_KEY);
      if (!raw) return { banners: structuredClone(DEFAULT_BANNERS) };
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed.banners) || !parsed.banners.length) {
        parsed.banners = structuredClone(DEFAULT_BANNERS);
      }
      parsed.banners = parsed.banners.map((b) => ({
        ...b,
        image: storeSrc(b.image),
        status: b.status === "下架" ? "下架" : "上架",
        bg: b.bg || "#f7f7f7",
        linkType: b.linkType || "",
        linkId: b.linkId || "",
      }));
      return parsed;
    } catch {
      return { banners: structuredClone(DEFAULT_BANNERS) };
    }
  }

  function saveHome() {
    homeCfg = homeCfg || {};
    homeCfg.banners = rows.map((b) => ({
      image: storeSrc(b.image),
      eyebrow: b.eyebrow || "",
      title: b.title || "",
      sub: b.sub || "",
      bg: b.bg || "#f7f7f7",
      status: b.status === "下架" ? "下架" : "上架",
      linkType: b.linkType || "",
      linkId: b.linkId || "",
    }));
    try {
      localStorage.setItem(HOME_KEY, JSON.stringify(homeCfg));
    } catch (err) {
      AdminUI.toast("保存失败：图片过大或本地存储已满，请压缩后重试", "error");
      throw err;
    }
  }

  function filtered() {
    const kw = ($("qKeyword")?.value || "").trim();
    const st = $("qStatus")?.value || "";
    return rows.filter((r) => {
      if (st && (r.status || "上架") !== st) return false;
      if (!kw) return true;
      const blob = `${r.title || ""} ${r.eyebrow || ""} ${r.sub || ""}`;
      return blob.includes(kw);
    });
  }

  function renderStats() {
    const on = rows.filter((r) => (r.status || "上架") === "上架").length;
    const off = rows.length - on;
    if ($("stTotal")) $("stTotal").textContent = String(rows.length);
    if ($("stOn")) $("stOn").textContent = String(on);
    if ($("stOff")) $("stOff").textContent = String(off);
    if ($("stShow")) $("stShow").textContent = String(on || (rows.length ? 1 : 0));
  }

  function renderPager(total) {
    const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    if (page > pages) page = pages;
    if ($("pagerInfo")) $("pagerInfo").textContent = `共 ${total} 条`;
    const box = $("pagerBtns");
    if (!box) return;
    const btns = [];
    btns.push(
      `<button type="button" data-page="prev" ${page <= 1 ? "disabled" : ""}>上一页</button>`
    );
    for (let i = 1; i <= pages; i++) {
      btns.push(
        `<button type="button" data-page="${i}" class="${i === page ? "active" : ""}">${i}</button>`
      );
    }
    btns.push(
      `<button type="button" data-page="next" ${page >= pages ? "disabled" : ""}>下一页</button>`
    );
    box.innerHTML = btns.join("");
  }

  function statusHtml(r) {
    const on = (r.status || "上架") === "上架";
    return `<span class="status ${on ? "status-on" : "status-off"}">${on ? "上架" : "下架"}</span>`;
  }

  function render() {
    const list = filtered();
    renderStats();
    renderPager(list.length);
    const start = (page - 1) * PAGE_SIZE;
    const slice = list.slice(start, start + PAGE_SIZE);
    const body = $("body");
    if (!body) return;
    if (!slice.length) {
      body.innerHTML = `<tr><td colspan="7" style="text-align:center;color:#8c8c8c;padding:28px">暂无 Banner，请点击右上角新增</td></tr>`;
      return;
    }
    body.innerHTML = slice
      .map((r) => {
        const idx = rows.indexOf(r);
        const title = esc(r.title || "未命名").replace(/\n/g, "<br />");
        const typeLabel = linkTypeLabel(r.linkType) || "未设置";
        const targetLabel = r.linkType && r.linkId
          ? window.getMallLinkLabel?.(r.linkType, r.linkId) || r.linkId
          : "—";
        return `<tr data-idx="${idx}">
          <td>
            <div class="sort-btns">
              <button type="button" class="link" data-up="${idx}" title="上移" ${idx === 0 ? "disabled" : ""}>↑</button>
              <button type="button" class="link" data-down="${idx}" title="下移" ${idx >= rows.length - 1 ? "disabled" : ""}>↓</button>
            </div>
          </td>
          <td><img class="bn-thumb" src="${esc(previewSrc(r.image))}" alt="" /></td>
          <td>
            <div class="bn-title">${title}</div>
            <div class="bn-sub">${esc(r.eyebrow || "")}${r.sub ? " · " + esc(r.sub) : ""}</div>
          </td>
          <td>
            <div style="font-size:13px;font-weight:600;color:#1f1f1f">${esc(typeLabel)}</div>
            <div class="bn-sub">${esc(targetLabel)}</div>
          </td>
          <td><span class="bn-bg"><i style="background:${esc(r.bg || "#f7f7f7")}"></i>${esc(r.bg || "—")}</span></td>
          <td>${statusHtml(r)}</td>
          <td>
            <button type="button" class="link" data-edit="${idx}">编辑</button>
            <button type="button" class="link" data-toggle="${idx}">${(r.status || "上架") === "上架" ? "下架" : "上架"}</button>
            <button type="button" class="link danger" data-del="${idx}">删除</button>
          </td>
        </tr>`;
      })
      .join("");
  }

  function renderPresets(selectedSrc) {
    const grid = $("presetGrid");
    if (!grid) return;
    const cur = previewSrc(selectedSrc);
    grid.innerHTML = PRESETS.map(
      (p) => `<button type="button" class="bn-preset ${previewSrc(p.src) === cur ? "on" : ""}" data-src="${esc(p.src)}" data-bg="${esc(p.bg)}">
        <img src="${esc(p.src)}" alt="${esc(p.label)}" />
        <span>${esc(p.label)}</span>
      </button>`
    ).join("");
  }

  function fillForm(row) {
    uploadedDataUrl = String(row?.image || "").startsWith("data:image/") ? row.image : "";
    uploadMeta = null;
    $("fImage").value = storeSrc(row?.image) || "";
    $("fEyebrow").value = row?.eyebrow || "";
    $("fTitle").value = row?.title || "";
    $("fSub").value = row?.sub || "";
    const bg = row?.bg || "#ffe0cc";
    $("fBg").value = bg;
    if (/^#[0-9a-fA-F]{6}$/.test(bg)) $("fBgPicker").value = bg;
    $("fStatus").value = row?.status === "下架" ? "下架" : "上架";
    if ($("fUpload")) $("fUpload").value = "";
    $("fLinkType").value = row?.linkType || "";
    fillLinkOptions(row?.linkType || "", row?.linkId || "");
    updatePreview(row?.image, uploadedDataUrl ? "已上传图片" : "当前图片");
    setUploadMsg("请上传符合规格的图片，或使用下方快速换图");
    renderPresets(row?.image);
  }

  function openDrawer(title, row, index) {
    editIndex = index;
    $("drawerTitle").textContent = title;
    fillForm(row);
    AdminUI.openDrawer("listDrawer");
  }

  function readForm() {
    const image = ($("fImage").value || "").trim();
    const title = ($("fTitle").value || "").trim();
    if (!image) {
      AdminUI.toast("请上传图片或填写图片地址", "error");
      setUploadMsg("请先上传图片或填写图片地址", "err");
      return null;
    }
    if (!title) {
      AdminUI.toast("请填写主标题", "error");
      return null;
    }
    const linkType = ($("fLinkType").value || "").trim();
    const linkId = ($("fLinkId").value || "").trim();
    if (!linkType) {
      AdminUI.toast("请选择跳转类型", "error");
      return null;
    }
    if (!linkId) {
      const tip =
        linkType === "product"
          ? "请选择商品"
          : linkType === "article"
            ? "请选择文章"
            : "请选择活动落地页";
      AdminUI.toast(tip, "error");
      return null;
    }
    let bg = ($("fBg").value || "").trim() || "#f7f7f7";
    if (!/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(bg)) bg = "#f7f7f7";
    return {
      image: storeSrc(image),
      eyebrow: ($("fEyebrow").value || "").trim(),
      title,
      sub: ($("fSub").value || "").trim(),
      bg,
      status: $("fStatus").value === "下架" ? "下架" : "上架",
      linkType,
      linkId,
    };
  }

  function boot() {
    homeCfg = loadHome();
    rows = Array.isArray(homeCfg.banners) ? homeCfg.banners.slice() : structuredClone(DEFAULT_BANNERS);
    render();

    AdminUI.bindDrawer("listDrawer");

    $("btnAdd")?.addEventListener("click", () => {
      openDrawer("新增 Banner", {
        image: "./assets/cover-ai-massage.png",
        eyebrow: "",
        title: "",
        sub: "",
        bg: "#ffe0cc",
        status: "上架",
        linkType: "product",
        linkId: "",
      }, -1);
    });

    $("fLinkType")?.addEventListener("change", () => {
      fillLinkOptions($("fLinkType").value || "", "");
    });

    $("btnSearch")?.addEventListener("click", () => {
      page = 1;
      render();
    });
    $("btnReset")?.addEventListener("click", () => {
      if ($("qKeyword")) $("qKeyword").value = "";
      if ($("qStatus")) $("qStatus").value = "";
      page = 1;
      render();
    });
    $("qKeyword")?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        page = 1;
        render();
      }
    });

    $("pagerBtns")?.addEventListener("click", (e) => {
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

    $("body")?.addEventListener("click", async (e) => {
      const edit = e.target.closest("[data-edit]");
      const del = e.target.closest("[data-del]");
      const toggle = e.target.closest("[data-toggle]");
      const up = e.target.closest("[data-up]");
      const down = e.target.closest("[data-down]");

      if (edit) {
        const i = Number(edit.dataset.edit);
        openDrawer("编辑 Banner", rows[i], i);
        return;
      }
      if (toggle) {
        const i = Number(toggle.dataset.toggle);
        rows[i].status = (rows[i].status || "上架") === "上架" ? "下架" : "上架";
        saveHome();
        render();
        AdminUI.toast(rows[i].status === "上架" ? "已上架" : "已下架");
        return;
      }
      if (up) {
        const i = Number(up.dataset.up);
        if (i <= 0) return;
        [rows[i - 1], rows[i]] = [rows[i], rows[i - 1]];
        saveHome();
        render();
        return;
      }
      if (down) {
        const i = Number(down.dataset.down);
        if (i >= rows.length - 1) return;
        [rows[i], rows[i + 1]] = [rows[i + 1], rows[i]];
        saveHome();
        render();
        return;
      }
      if (del) {
        const i = Number(del.dataset.del);
        if (rows.length <= 1) {
          AdminUI.toast("至少保留 1 张 Banner", "error");
          return;
        }
        const ok = await AdminUI.confirm("确定删除该 Banner？删除后商城首页将同步更新。", {
          title: "删除确认",
          okText: "删除",
        });
        if (!ok) return;
        rows.splice(i, 1);
        saveHome();
        render();
        AdminUI.toast("已删除");
      }
    });

    $("presetGrid")?.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-src]");
      if (!btn) return;
      uploadedDataUrl = "";
      uploadMeta = null;
      if ($("fUpload")) $("fUpload").value = "";
      $("fImage").value = storeSrc(btn.dataset.src);
      if (btn.dataset.bg) {
        $("fBg").value = btn.dataset.bg;
        if (/^#[0-9a-fA-F]{6}$/.test(btn.dataset.bg)) $("fBgPicker").value = btn.dataset.bg;
      }
      updatePreview(btn.dataset.src, "快速换图");
      setUploadMsg("已选用预设图（预设图不校验尺寸）");
      renderPresets(btn.dataset.src);
    });

    $("fUpload")?.addEventListener("change", async (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      await validateAndLoadFile(file);
      // 允许重复选择同一文件
      e.target.value = "";
    });

    $("btnClearUpload")?.addEventListener("click", () => {
      uploadedDataUrl = "";
      uploadMeta = null;
      if ($("fUpload")) $("fUpload").value = "";
      $("fImage").value = "./assets/cover-ai-massage.png";
      updatePreview($("fImage").value, "已清除上传，已回落预设图");
      setUploadMsg("已清除上传图片");
      renderPresets($("fImage").value);
    });

    $("fImage")?.addEventListener("change", () => {
      const v = ($("fImage").value || "").trim();
      if (v.startsWith("data:image/")) {
        uploadedDataUrl = v;
        updatePreview(v, "已上传图片");
      } else {
        uploadedDataUrl = "";
        updatePreview(v, v ? "当前图片" : "未选择图片");
      }
    });

    $("fBgPicker")?.addEventListener("input", (e) => {
      $("fBg").value = e.target.value;
    });
    $("fBg")?.addEventListener("change", (e) => {
      const v = String(e.target.value || "").trim();
      if (/^#[0-9a-fA-F]{6}$/.test(v)) $("fBgPicker").value = v;
    });

    $("btnSave")?.addEventListener("click", () => {
      const row = readForm();
      if (!row) return;
      try {
        if (editIndex >= 0) {
          rows[editIndex] = row;
          saveHome();
          AdminUI.toast("保存成功");
        } else {
          rows.push(row);
          saveHome();
          AdminUI.toast("新增成功");
        }
      } catch {
        if (editIndex < 0) rows.pop();
        return;
      }
      AdminUI.closeDrawer("listDrawer");
      render();
    });
  }

  AdminUI.onReady(boot);
})();
