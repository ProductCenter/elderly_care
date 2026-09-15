/** 事找人 · 主动推送（演示数据） */
(function (global) {
  const PUSH_ITEMS = [
    {
      id: "push_sugar",
      reason: "体检报告空腹偏高",
      source: "报告解读",
      title: "给爸妈推一篇控糖科普 + 控糖套餐店",
      cta: { label: "问智伴", href: "./agent.html?q=" + encodeURIComponent("根据体检报告说说控糖要注意什么？") },
      alt: { label: "看科普", href: "./broadcast-detail.html?id=bc_policy_sugar" },
    },
    {
      id: "push_memory",
      reason: "朋友圈提到母亲记性",
      source: "朋友圈",
      title: "建议预约认知训练小组课，子女可旁听",
      cta: { label: "问智伴", href: "./agent.html?q=" + encodeURIComponent("爸妈的认知训练怎么安排的？") },
      alt: { label: "进店铺", href: "./shop.html?id=store_cy001" },
    },
    {
      id: "push_subsidy",
      reason: "高龄津贴材料将到期",
      source: "办事通",
      title: "提醒补交居住证明，避免补贴中断",
      cta: { label: "去办理", href: "./banshi.html?id=biz_gaoling" },
      alt: { label: "问智伴", href: "./agent.html?q=" + encodeURIComponent("高龄津贴怎么申请？") },
    },
    {
      id: "push_coop",
      reason: "周边康复机构有档期",
      source: "供需合作",
      title: "B端闲置床位可对接日托喘息",
      cta: { label: "看合作", href: "./banshi.html?tab=coop" },
      alt: { label: "看广播", href: "./broadcast-detail.html?id=bc_coop_bed" },
    },
  ];

  function renderStrip(root) {
    if (!root) return;
    root.innerHTML = PUSH_ITEMS.slice(0, 3)
      .map(
        (it) => `<article class="push-card" data-id="${it.id}">
        <p class="push-reason"><span>${it.source}</span>${it.reason}</p>
        <h3>${it.title}</h3>
        <div class="push-ctas">
          <a href="${it.cta.href}">${it.cta.label}</a>
          <a class="ghost" href="${it.alt.href}">${it.alt.label}</a>
        </div>
      </article>`
      )
      .join("");
  }

  global.MallPushFeed = { items: PUSH_ITEMS, renderStrip };
})(window);
