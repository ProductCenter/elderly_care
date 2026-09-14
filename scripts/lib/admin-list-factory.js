/** Shared builder for gen-admin-list-pages.js data files */
function mkPage(cfg) {
  const statusKey = cfg.statusKey || "status";
  const statuses = cfg.statuses || ["启用", "停用", "草稿"];
  const keywordFields = cfg.keywordFields || ["name", "code"];
  const keywordExpr = keywordFields
    .map((k) => `String(r.${k}||"").includes(v)`)
    .join("||");
  const filters = cfg.filters || [
    { id: "qKeyword", label: "关键词", placeholder: "名称/编号", matchExpr: `!v||${keywordExpr}` },
    {
      id: "qStatus",
      label: "状态",
      type: "select",
      options: statuses,
      matchExpr: `!v||String(r.${statusKey})===v`,
    },
    ...(cfg.extraFilters || []),
  ];
  const formFields = cfg.formFields || [
    { id: "fName", key: "name", label: "名称", required: true },
    { id: "fCode", key: "code", label: "编号", required: true },
    {
      id: "fStatus",
      key: statusKey,
      label: "状态",
      type: "select",
      options: statuses,
    },
    { id: "fNote", key: "note", label: "备注", type: "textarea" },
  ];
  const stats = cfg.stats || [
    { id: "stOn", label: "启用", valueExpr: `(l)=>l.filter(r=>r.${statusKey}==="启用").length` },
    { id: "stOff", label: "停用", valueExpr: `(l)=>l.filter(r=>r.${statusKey}==="停用").length` },
    { id: "stDraft", label: "草稿", valueExpr: `(l)=>l.filter(r=>r.${statusKey}==="草稿").length` },
    { id: "stAll", label: "全部", valueExpr: "(l)=>l.length" },
  ];
  const getStatusExpr =
    cfg.getStatusExpr ||
    `r.${statusKey}==="启用"?{text:r.${statusKey},cls:"status-on"}:r.${statusKey}==="草稿"?{text:r.${statusKey},cls:"status-warn"}:{text:r.${statusKey},cls:"status-off"}`;
  return {
    file: cfg.file,
    sub: cfg.sub,
    title: cfg.title,
    desc: cfg.desc,
    addTitle: cfg.addTitle,
    columns: cfg.columns,
    filters,
    formFields,
    stats,
    getStatusExpr,
    rows: cfg.rows,
  };
}

module.exports = { mkPage };
