/**
 * 通用 Admin 列表页生成器
 * usage: node gen-admin-list-pages.js <data-file.js>
 * data: { dir, primary, hubHref?, pages: [...] }
 */
const fs = require("fs");
const path = require("path");

const dataPath = process.argv[2];
if (!dataPath) {
  console.error("usage: node gen-admin-list-pages.js <data-file>");
  process.exit(1);
}
const data = require(path.resolve(dataPath));
const root = path.join(__dirname, "../admin", data.dir);
fs.mkdirSync(root, { recursive: true });
const hubHref = data.hubHref || "./index.html";
const hubLabel = data.hubLabel || "模块总览";

function pageHtml(cfg) {
  const cols = cfg.columns.map((c) => `<th>${c.label}</th>`).join("");
  const filterItems = cfg.filters
    .map((f) => {
      if (f.type === "select") {
        const opts = [`<option value="">全部</option>`]
          .concat((f.options || []).map((o) => `<option value="${o}">${o}</option>`))
          .join("");
        return `<div class="filter-item"><label>${f.label}</label><select class="ctrl" id="${f.id}">${opts}</select></div>`;
      }
      return `<div class="filter-item"><label>${f.label}</label><input class="ctrl" id="${f.id}" placeholder="${f.placeholder || ""}"/></div>`;
    })
    .join("");
  const formFields = cfg.formFields
    .map((f) => {
      const req = f.required ? `<span class="req">*</span>` : "";
      if (f.type === "select") {
        const opts = (f.options || []).map((o) => `<option value="${o}">${o}</option>`).join("");
        return `<div class="form-field"><label>${f.label}${req}</label><select class="ctrl" id="${f.id}">${opts}</select></div>`;
      }
      if (f.type === "textarea") {
        return `<div class="form-field"><label>${f.label}${req}</label><textarea class="ctrl" id="${f.id}" rows="3" placeholder="${f.placeholder || ""}"></textarea></div>`;
      }
      const t = f.type || "text";
      return `<div class="form-field"><label>${f.label}${req}</label><input class="ctrl" id="${f.id}" type="${t}" ${
        f.type === "number" ? `value="${f.default ?? 0}"` : ""
      } placeholder="${f.placeholder || ""}"/></div>`;
    })
    .join("");
  const stats = (cfg.stats || [])
    .map((s) => `<div class="stat-card"><div class="k">${s.label}</div><div class="v" id="${s.id}">0</div></div>`)
    .join("");
  const filterJs = cfg.filters
    .map((f) => {
      if (f.matchExpr) return `{id:"${f.id}",match:(r,v)=>${f.matchExpr}}`;
      if (f.field) return `{id:"${f.id}",field:"${f.field}"}`;
      return `{id:"${f.id}",match:(r,v)=>!v||JSON.stringify(r).includes(v)}`;
    })
    .join(",");
  const statsJs = (cfg.stats || [])
    .map((s) => `{id:"${s.id}",html:false,value:${s.valueExpr}}`)
    .join(",");
  const colsJs = cfg.columns
    .map((c) => (c.status ? `{key:"${c.key}",status:true}` : `{key:"${c.key}"}`))
    .join(",");
  const formJs = cfg.formFields
    .map((f) => {
      const t =
        f.type === "number" ? "number" : f.type === "date" ? "date" : f.type === "select" ? "select" : "text";
      return `{id:"${f.id}",key:"${f.key}",type:"${t}",label:"${f.label}",required:${!!f.required}${
        f.default != null ? `,default:${JSON.stringify(f.default)}` : ""
      }}`;
    })
    .join(",");
  const getStatusJs = cfg.getStatusExpr
    ? `getStatus:(r)=>(${cfg.getStatusExpr})`
    : "getStatus:null";

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${cfg.title} · 天津康养运营平台</title>
<link rel="stylesheet" href="../css/admin-shell.css"/>
<link rel="stylesheet" href="../css/admin-list.css"/>
</head>
<body data-primary="${data.primary}" data-sub="${cfg.sub}" data-tab="${cfg.title}" data-asset-prefix="../../assets" data-index-href="../index.html">
<div id="admin-root"></div>
<template id="page-content">
<div class="page-head">
  <div>
    <h1 class="page-title">${cfg.title}</h1>
    <p class="page-desc">${cfg.desc}</p>
  </div>
  <div style="display:flex;gap:8px">
    <a class="btn btn-default" href="${hubHref}">${hubLabel}</a>
    <button type="button" class="btn btn-primary" id="btnAdd">+ ${cfg.addTitle || "新增"}</button>
  </div>
</div>
${stats ? `<div class="stat-row">${stats}</div>` : ""}
<div class="filter-card"><div class="filter-grid">${filterItems}<div class="filter-actions"><button type="button" class="btn btn-primary" id="btnSearch">查询</button><button type="button" class="btn btn-default" id="btnReset">重置</button></div></div></div>
<div class="list-card"><div class="table-wrap"><table class="data-table"><thead><tr>${cols}<th>操作</th></tr></thead><tbody id="body"></tbody></table></div>
<div class="pager"><span id="pagerInfo">共 0 条</span><div class="pager-btns"><button type="button" class="active">1</button></div></div></div>
<div class="drawer-mask" data-drawer-mask="listDrawer" data-close-drawer="listDrawer"></div>
<aside class="drawer" id="listDrawer">
  <div class="drawer-head"><h3 id="drawerTitle">${cfg.addTitle || "新增"}</h3><button type="button" class="drawer-close" data-close-drawer="listDrawer">×</button></div>
  <div class="drawer-body"><div class="form-grid">${formFields}</div></div>
  <div class="drawer-foot"><button type="button" class="btn btn-default" data-close-drawer="listDrawer">取消</button><button type="button" class="btn btn-primary" id="btnSave">保存</button></div>
</aside>
</template>
<script src="../js/admin-nav.js"></script>
<script src="../js/admin-shell.js"></script>
<script src="../js/admin-ui.js"></script>
<script src="../js/admin-page-list.js"></script>
<script>
AdminPageList.mount({
  addTitle: ${JSON.stringify(cfg.addTitle || "新增")},
  editTitle: ${JSON.stringify(cfg.editTitle || "编辑")},
  viewTitle: "查看详情",
  storageKey: ${JSON.stringify(data.primary + ":" + cfg.sub)},
  rows: ${JSON.stringify(cfg.rows)},
  columns: [${colsJs}],
  filters: [${filterJs}],
  formFields: [${formJs}],
  stats: [${statsJs}],
  ${getStatusJs}
});
</script>
</body>
</html>
`;
}

for (const cfg of data.pages) {
  const out = path.join(root, cfg.file);
  fs.writeFileSync(out, pageHtml(cfg), "utf8");
  console.log("wrote", data.dir + "/" + cfg.file);
}
console.log("done", data.pages.length, "->", data.dir);
