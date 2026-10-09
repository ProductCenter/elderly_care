(() => {
  const ITEMS = [
    {
      id: "m1",
      user: "林凯（子女）",
      avatar: "./assets/cover-companion-care.png",
      time: "昨天 20:18",
      text: "妈妈最近总说「钥匙放哪了」，想带她去试试认知训练小组课，有没有推荐？",
      cover: "./assets/cover-calligraphy.png",
      agentable: true,
      articleId: "art_moments_memory",
      href: "./agent.html?q=" + encodeURIComponent("爸妈的认知训练怎么安排的？"),
    },
    {
      id: "m2",
      user: "历下旗舰店",
      avatar: "./assets/cover-ai-massage.png",
      time: "今天 09:02",
      text: "本周日控糖讲座名额还剩 8 个，子女可陪同。科技金融大厦 2F。",
      cover: "./assets/cover-nutrition-meal.png",
      agentable: true,
      articleId: "art_moments_lecture",
      href: "./agent.html?q=" + encodeURIComponent("控糖讲座怎么报名？"),
    },
    {
      id: "m3",
      user: "高新区合作机构",
      avatar: "./assets/cover-companion-care.png",
      time: "周一",
      text: "下午康复床位有空档，欢迎站点对接日托喘息（B-B）。",
      cover: "",
      agentable: false,
      articleId: "art_moments_neighbor",
      href: "./banshi.html?tab=coop",
    },
    {
      id: "m4",
      user: "赵敏（子女）",
      avatar: "./assets/cover-nutrition-meal.png",
      time: "今天 11:20",
      text: "给爸爸试了控糖包月订餐一周，口味能接受，餐后血糖也稳一点，分享一下体验～",
      cover: "./assets/cover-nutrition-meal.png",
      agentable: true,
      articleId: "art_moments_meal_day",
      href: "./agent.html?q=" + encodeURIComponent("控糖包月订餐适合爸妈吗？"),
    },
    {
      id: "m5",
      user: "陈可（子女）",
      avatar: "./assets/cover-sleep-breath.png",
      time: "昨天 08:40",
      text: "妈妈夜醒少了！我们做了夜灯、控午休和睡前拉伸三件事，详情写在全文里。",
      cover: "./assets/cover-sleep-breath.png",
      agentable: true,
      articleId: "art_moments_sleep_tip",
      href: "./agent.html?q=" + encodeURIComponent("长者夜间总醒怎么改善？"),
    },
    {
      id: "m6",
      user: "历下志愿队",
      avatar: "./assets/cover-health-check.png",
      time: "前天",
      text: "本周六陪诊志愿在科技金融大厦 1F 集结，需要推行轮椅的伙伴也可报名。",
      cover: "./assets/cover-companion-care.png",
      agentable: true,
      articleId: "art_moments_volunteer",
      href: "./agent.html?q=" + encodeURIComponent("陪诊志愿者怎么报名？"),
    },
    {
      id: "m7",
      user: "市中驿站",
      avatar: "./assets/cover-foot-spa.png",
      time: "周二 16:05",
      text: "足疗体验角开放日人不少，长者反馈腿轻松了。首次体验还有优惠名额。",
      cover: "./assets/cover-foot-spa.png",
      agentable: false,
      articleId: "art_moments_shop_open",
      href: "./detail.html?id=foot_spa",
    },
    {
      id: "m8",
      user: "王阿姨（长者）",
      avatar: "./assets/cover-calligraphy.png",
      time: "周三",
      text: "学堂书法课真有意思，认识了好几位新朋友。下节合唱也想去听听。",
      cover: "./assets/cover-calligraphy.png",
      agentable: true,
      articleId: "art_bc_new_course",
      href: "./xue.html",
    },
  ];

  document.getElementById("momentList").innerHTML = ITEMS.map((it) => {
    const artHref = it.articleId
      ? window.articleDetailHref?.(it.articleId, "moments") ||
        `./article.html?id=${encodeURIComponent(it.articleId)}&from=moments`
      : "";
    const links = [
      artHref ? `<a href="${artHref}">阅读全文</a>` : "",
      `<a href="${it.href}">${it.agentable ? "让智伴跟进" : "查看详情"}</a>`,
    ]
      .filter(Boolean)
      .join("");
    return `<article class="moment" id="${it.id}">${
      it.agentable ? `<span class="moment-flag">可供智伴引用</span>` : ""
    }<div class="moment-hd"><img src="${it.avatar}" alt="" /><div><strong>${it.user}</strong><span>${it.time}</span></div></div><p>${it.text}</p>${
      it.cover ? `<img class="moment-cover" src="${it.cover}" alt="" />` : ""
    }${links}</article>`;
  }).join("");

  document.getElementById("btnBack")?.addEventListener("click", () => {
    if (history.length > 1) history.back();
    else location.href = "./discover.html";
  });

  window.SectionArticles?.mountSectionBlock({ section: "moments", listId: "articleList" });
  window.MallMoments = { items: ITEMS };
})();
