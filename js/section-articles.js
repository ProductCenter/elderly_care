(() => {
  function esc(s) {
    return String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function renderArticleList(host, opts = {}) {
    const el = typeof host === "string" ? document.getElementById(host) : host;
    if (!el) return [];
    const section = opts.section || "";
    const from = opts.from || section;
    const limit = opts.limit || 0;
    let list = window.getMallArticlesBySection?.(section) || [];
    if (limit > 0) list = list.slice(0, limit);
    if (!list.length) {
      el.innerHTML = `<div class="sec-art-empty">${esc(opts.empty || "暂无相关文章")}</div>`;
      return [];
    }
    el.innerHTML = list
      .map((a) => {
        const href = window.articleDetailHref?.(a.id, from) || `./article.html?id=${encodeURIComponent(a.id)}`;
        const meta = [a.author, a.date, a.readMin ? `约 ${a.readMin} 分钟` : ""]
          .filter(Boolean)
          .join(" · ");
        const tags = (a.tags || [])
          .slice(0, 2)
          .map((t) => `<span class="sec-art-tag">${esc(t)}</span>`)
          .join("");
        return `<a class="sec-art-card" href="${esc(href)}">
          <img class="sec-art-cover" src="${esc(a.cover)}" alt="" loading="lazy" />
          <div class="sec-art-body">
            <strong class="sec-art-title">${esc(a.title)}</strong>
            <p class="sec-art-summary">${esc(a.summary || "")}</p>
            <div class="sec-art-meta">${esc(meta)}</div>
            ${tags ? `<div class="sec-art-tags">${tags}</div>` : ""}
          </div>
        </a>`;
      })
      .join("");
    return list;
  }

  function mountSectionBlock(opts = {}) {
    const section = opts.section;
    const listId = opts.listId || "articleList";
    const titleId = opts.titleId;
    const meta = (window.MALL_SECTION_META || {})[section] || {};
    if (titleId) {
      const titleEl = document.getElementById(titleId);
      if (titleEl && !titleEl.textContent.trim()) {
        titleEl.textContent = opts.title || `${meta.label || ""}相关文章`;
      }
    }
    return renderArticleList(listId, {
      section,
      from: opts.from || section,
      limit: opts.limit,
      empty: opts.empty,
    });
  }

  window.SectionArticles = { renderArticleList, mountSectionBlock, esc };
})();
