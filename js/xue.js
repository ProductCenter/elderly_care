(() => {
  window.SectionArticles?.mountSectionBlock({ section: "xue", listId: "articleList" });

  const host = document.getElementById("xueBroadcasts");
  if (host) {
    const bcs = (window.MALL_BROADCASTS || []).filter((b) =>
      /科普|视频|讲座|政策/.test(b.badge || "")
    );
    host.innerHTML = bcs.length
      ? bcs
          .map((b) => {
            const href = `./broadcast-detail.html?id=${encodeURIComponent(b.id)}`;
            return `<a class="xue-bc-card" href="${href}"><img src="${b.cover}" alt="" /><div><strong>${b.title}</strong><p>${b.summary || ""}</p></div></a>`;
          })
          .join("")
      : `<div class="sec-art-empty">暂无相关广播</div>`;
  }

  document.getElementById("btnBack")?.addEventListener("click", () => {
    if (history.length > 1) history.back();
    else location.href = "./discover.html";
  });
})();
