(() => {
  const ITEMS = [
    { id: "m1", user: "林凯（子女）", avatar: "./assets/moko-avatar.png", time: "昨天 20:18", text: "妈妈最近总说「钥匙放哪了」，想带她去试试认知训练小组课，有没有推荐？", cover: "./assets/cover-calligraphy.png", agentable: true, href: "./agent.html?q=" + encodeURIComponent("爸妈的认知训练怎么安排的？") },
    { id: "m2", user: "历下旗舰店", avatar: "./assets/cover-ai-massage.png", time: "今天 09:02", text: "本周日控糖讲座名额还剩 8 个，子女可陪同。科技金融大厦 2F。", cover: "./assets/cover-nutrition-meal.png", agentable: true, href: "./broadcast-detail.html?id=bc_lecture_sugar" },
    { id: "m3", user: "高新区合作机构", avatar: "./assets/cover-companion-care.png", time: "周一", text: "下午康复床位有空档，欢迎站点对接日托喘息（B-B）。", cover: "", agentable: false, href: "./banshi.html?tab=coop" },
  ];
  document.getElementById("momentList").innerHTML = ITEMS.map((it) => `<article class="moment" id="${it.id}">${it.agentable ? `<span class="moment-flag">可供智伴引用</span>` : ""}<div class="moment-hd"><img src="${it.avatar}" alt="" /><div><strong>${it.user}</strong><span>${it.time}</span></div></div><p>${it.text}</p>${it.cover ? `<img class="moment-cover" src="${it.cover}" alt="" />` : ""}<a href="${it.href}">${it.agentable ? "让智伴跟进" : "查看详情"}</a></article>`).join("");
  document.getElementById("btnBack")?.addEventListener("click", () => { if (history.length > 1) history.back(); else location.href = "./index.html"; });
  window.MallMoments = { items: ITEMS };
})();
