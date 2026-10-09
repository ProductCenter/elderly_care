(() => {
  const $ = (id) => document.getElementById(id);

  const params = new URLSearchParams(location.search);
  const from = params.get("from") || "";
  const sectionMeta = (window.MALL_SECTION_META || {})[from] || null;

  function goBack() {
    if (history.length > 1) {
      history.back();
      return;
    }
    if (sectionMeta?.listHref) {
      location.href = sectionMeta.listHref;
      return;
    }
    location.href = "./index.html";
  }

  function toast(msg) {
    const el = $("toast");
    if (!el) return;
    el.textContent = msg;
    el.hidden = false;
    clearTimeout(toast._t);
    toast._t = setTimeout(() => {
      el.hidden = true;
    }, 1800);
  }

  function esc(s) {
    return String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  $("btnBack")?.addEventListener("click", goBack);

  const id = params.get("id") || "";
  const art = window.getMallArticle?.(id);
  const root = $("root");
  const bar = $("bottomBar");

  if (!art) {
    root.innerHTML = `<div class="empty-state">未找到文章，请从列表重新进入。</div>`;
    bar.innerHTML = `<button class="btn-primary" type="button" id="btnHome">返回</button>`;
    $("btnHome")?.addEventListener("click", goBack);
    return;
  }

  document.title = `${art.title} · 春风康养`;
  if (sectionMeta?.label) {
    const navTitle = document.querySelector(".nav-title");
    if (navTitle) navTitle.textContent = `${sectionMeta.label}文章`;
  }

  const tags = (art.tags || [])
    .map((t) => `<span class="tag">${esc(t)}</span>`)
    .join("");
  const paras = (art.paragraphs || [art.summary])
    .map((p) => `<p>${esc(p)}</p>`)
    .join("");
  const tips = (art.tips || [])
    .map((t) => `<li>${esc(t)}</li>`)
    .join("");

  const relatedSection = from || (art.sections && art.sections[0]) || "";
  const related = (window.getMallArticlesBySection?.(relatedSection) || [])
    .filter((a) => a.id !== art.id)
    .slice(0, 3);
  const relatedHtml = related.length
    ? `<section class="related-arts">
        <h3>相关文章</h3>
        ${related
          .map((a) => {
            const href = window.articleDetailHref?.(a.id, relatedSection) || `./article.html?id=${encodeURIComponent(a.id)}`;
            return `<a class="related-art-link" href="${esc(href)}">
              <img src="${esc(a.cover)}" alt="" />
              <div>
                <strong>${esc(a.title)}</strong>
                <span>${esc(a.summary || "")}</span>
              </div>
            </a>`;
          })
          .join("")}
      </section>`
    : "";

  root.innerHTML = `
    <img class="article-cover" src="${esc(art.cover)}" alt="" />
    <section class="card">
      <h1 class="article-title">${esc(art.title)}</h1>
      <div class="article-meta">
        <span>${esc(art.author || "春风康养")}</span>
        <span>${esc(art.date || "")}</span>
        <span>约 ${esc(art.readMin || 5)} 分钟</span>
      </div>
      ${tags ? `<div class="tag-row">${tags}</div>` : ""}
    </section>
    <section class="card article-body">${paras}</section>
    ${
      tips
        ? `<section class="card"><h3 class="sec-title">实用提示</h3><ul class="tip-list">${tips}</ul></section>`
        : ""
    }
    ${relatedHtml}
  `;

  const productId = art.relatedProductId || "";
  const agentQ = art.relatedAgentQ || "";
  const cta = art.relatedCta || "查看相关服务";
  bar.innerHTML = `
    <button class="btn-ghost" type="button" id="btnShare">分享</button>
    <button class="btn-primary" type="button" id="btnRelated">${esc(cta)}</button>
  `;

  $("btnShare")?.addEventListener("click", () => toast("已复制分享链接（示意）"));
  $("btnRelated")?.addEventListener("click", () => {
    if (productId) {
      location.href = `./detail.html?id=${encodeURIComponent(productId)}`;
      return;
    }
    if (agentQ) {
      location.href = `./agent.html?q=${encodeURIComponent(agentQ)}`;
      return;
    }
    if (cta.includes("办事通")) {
      location.href = "./banshi.html";
      return;
    }
    if (cta.includes("合作")) {
      location.href = "./banshi.html?tab=coop";
      return;
    }
    goBack();
  });
})();
