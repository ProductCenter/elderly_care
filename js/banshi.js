(() => {
  const DATA = {
    gov: [
      { id: "biz_gaoling", title: "高龄津贴申领 / 年检", desc: "济南市历下区户籍示意。需身份与居住证明，材料将到期可在此补交。", meta: ["进度：待补材料", "截止：9/30"], href: "./agent.html?q=" + encodeURIComponent("高龄津贴怎么申请？") },
      { id: "biz_home_care", title: "居家养老服务补贴", desc: "可覆盖助浴、助洁等基础服务；演示对接办事通入口。", meta: ["政务入口", "历下区"], href: "./agent.html?q=" + encodeURIComponent("居家养老服务补贴怎么申？") },
      { id: "biz_aging_home", title: "适老化改造申请", desc: "卫生间扶手、防滑等改造工单入口（演示）。", meta: ["待评估", "科技金融大厦周边"], href: "./agent.html?q=" + encodeURIComponent("家里适老化改造怎么申请？") },
    ],
    coop: [
      { id: "coop_bed", title: "闲置床位档期 · 康复机构", desc: "高新区康复机构工作日下午空余床位，可对接日托喘息（B-B）。", meta: ["闲置资产", "济南高新区"], href: "./broadcast-detail.html?id=bc_coop_bed" },
      { id: "coop_meal", title: "配餐商寻求站点合作", desc: "控糖软食产能可周供 800 份，寻找历下/市中食堂共配。", meta: ["B-B 合作", "供餐"], href: "./broadcast.html" },
      { id: "coop_device", title: "监测设备档期共享", desc: "血压/血糖仪租赁闲置机可跨店调拨（演示）。", meta: ["闲置资产", "设备"], href: "./shop.html?id=store_cy001" },
    ],
    talent: [
      { id: "talent_nurse", title: "招聘：上门护理员（济南）", desc: "持证优先，负责助浴与基础护理，驻点历下旗舰可调度。", meta: ["招聘", "急"], href: "./moments.html" },
      { id: "talent_train", title: "培训：认知照护非药物干预入门", desc: "2 日工作坊，面向驿站员工与合作机构。", meta: ["培训报名", "历下"], href: "./broadcast-detail.html?id=bc_video_cog" },
    ],
  };
  const list = document.getElementById("bizList");
  const tabs = document.getElementById("bizTabs");
  const params = new URLSearchParams(location.search);
  let tab = params.get("tab") || "gov";
  if (!DATA[tab]) tab = "gov";
  function render(t) {
    tab = t;
    tabs.querySelectorAll("button").forEach((b) => b.classList.toggle("on", b.dataset.tab === t));
    list.innerHTML = (DATA[t] || []).map((it) => `<article class="biz-card" id="${it.id}"><h3>${it.title}</h3><p>${it.desc}</p><div class="biz-meta">${it.meta.map((m) => `<span>${m}</span>`).join("")}</div><a href="${it.href}">查看详情 / 问智伴</a></article>`).join("");
    const focus = params.get("id");
    if (focus) document.getElementById(focus)?.scrollIntoView({ behavior: "smooth", block: "center" });
  }
  tabs?.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-tab]");
    if (!btn) return;
    history.replaceState(null, "", `?tab=${btn.dataset.tab}`);
    render(btn.dataset.tab);
  });
  document.getElementById("btnBack")?.addEventListener("click", () => {
    if (history.length > 1) history.back();
    else location.href = "./index.html";
  });
  render(tab);
})();
