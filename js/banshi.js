(() => {
  const DATA = {
    gov: [
      {
        id: "biz_gaoling",
        title: "高龄津贴申领 / 年检",
        desc: "济南市历下区户籍示意。需身份与居住证明，材料将到期可在此补交。",
        meta: ["进度：待补材料", "截止：9/30"],
        href: "./article.html?id=art_banshi_gaoling&from=banshi",
      },
      {
        id: "biz_home_care",
        title: "居家养老服务补贴",
        desc: "可覆盖助浴、助洁等基础服务；演示对接办事通入口。",
        meta: ["政务入口", "历下区"],
        href: "./article.html?id=art_banshi_home_care&from=banshi",
      },
      {
        id: "biz_aging_home",
        title: "适老化改造申请",
        desc: "卫生间扶手、防滑等改造工单入口（演示）。",
        meta: ["待评估", "科技金融大厦周边"],
        href: "./article.html?id=art_banshi_aging&from=banshi",
      },
      {
        id: "biz_disability",
        title: "残疾人两项补贴衔接",
        desc: "生活补贴、护理补贴与居家养老服务如何按规则衔接（演示）。",
        meta: ["残联/民政", "材料核验"],
        href: "./article.html?id=art_banshi_disability&from=banshi",
      },
      {
        id: "biz_meal_aid",
        title: "老年助餐补贴核销",
        desc: "食堂核销、包月订餐抵扣与站点共配说明。",
        meta: ["助餐", "可核销"],
        href: "./article.html?id=art_banshi_meal_aid&from=banshi",
      },
      {
        id: "biz_safety_list",
        title: "居家安全改造清单咨询",
        desc: "防滑、照明、呼叫设备优先级评估（联动学堂文章）。",
        meta: ["安全", "咨询"],
        href: "./article.html?id=art_safety&from=banshi",
      },
    ],
    coop: [
      {
        id: "coop_bed",
        title: "闲置床位档期 · 康复机构",
        desc: "高新区康复机构工作日下午空余床位，可对接日托喘息（B-B）。",
        meta: ["闲置资产", "济南高新区"],
        href: "./article.html?id=art_moments_neighbor&from=banshi",
      },
      {
        id: "coop_meal",
        title: "配餐商寻求站点合作",
        desc: "控糖软食产能可周供 800 份，寻找历下/市中食堂共配。",
        meta: ["B-B 合作", "供餐"],
        href: "./article.html?id=art_banshi_coop&from=banshi",
      },
      {
        id: "coop_device",
        title: "监测设备档期共享",
        desc: "血压/血糖仪租赁闲置机可跨店调拨（演示）。",
        meta: ["闲置资产", "设备"],
        href: "./article.html?id=art_banshi_device_share&from=banshi",
      },
      {
        id: "coop_guide",
        title: "合作供需发布指南",
        desc: "如何发布闲置床位、产能与档期，审核要点一览。",
        meta: ["指南", "B-B"],
        href: "./article.html?id=art_banshi_coop&from=banshi",
      },
      {
        id: "coop_broadcast",
        title: "广播站扩散合作信息",
        desc: "紧急档期可通过广播站「合作」分类同步扩散。",
        meta: ["联动广播站", "扩散"],
        href: "./broadcast.html",
      },
    ],
    talent: [
      {
        id: "talent_nurse",
        title: "招聘：上门护理员（济南）",
        desc: "持证优先，负责助浴与基础护理，驻点历下旗舰可调度。",
        meta: ["招聘", "急"],
        href: "./article.html?id=art_banshi_nurse_hire&from=banshi",
      },
      {
        id: "talent_train",
        title: "培训：认知照护非药物干预入门",
        desc: "2 日工作坊，面向驿站员工与合作机构。",
        meta: ["培训报名", "历下"],
        href: "./article.html?id=art_bc_finger_exercise&from=banshi",
      },
      {
        id: "talent_onboard",
        title: "护理员上岗与安全须知",
        desc: "隐私、急救入门与工单确认单签署规范。",
        meta: ["上岗", "规范"],
        href: "./article.html?id=art_banshi_nurse_hire&from=banshi",
      },
      {
        id: "talent_psych",
        title: "培训：空巢情绪疏导话术",
        desc: "社工向课程，学习倾听与求助信号识别。",
        meta: ["培训", "心理"],
        href: "./article.html?id=art_xue_emotion&from=banshi",
      },
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
    list.innerHTML = (DATA[t] || [])
      .map(
        (it) =>
          `<article class="biz-card" id="${it.id}"><h3>${it.title}</h3><p>${it.desc}</p><div class="biz-meta">${it.meta
            .map((m) => `<span>${m}</span>`)
            .join("")}</div><a href="${it.href}">阅读指南全文</a></article>`
      )
      .join("");
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
    else location.href = "./discover.html";
  });
  render(tab);
  window.SectionArticles?.mountSectionBlock({ section: "banshi", listId: "articleList" });
})();
