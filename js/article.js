(() => {
  const $ = (id) => document.getElementById(id);

  function goBack() {
    if (history.length > 1) history.back();
    else location.href = "./index.html";
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

  const id = new URLSearchParams(location.search).get("id") || "";
  const art = window.getMallArticle?.(id);
  const root = $("root");
  const bar = $("bottomBar");

  if (!art) {
    root.innerHTML = `<div class="empty-state">未找到文章，请从 Banner 或运营位重新进入。</div>`;
    bar.innerHTML = `<button class="btn-primary" type="button" id="btnHome">返回商城</button>`;
    $("btnHome")?.addEventListener("click", () => {
      location.href = "./index.html";
    });
    return;
  }

  document.title = `${art.title} · 春风康养`;

  const tags = (art.tags || [])
    .map((t) => `<span class="tag">${esc(t)}</span>`)
    .join("");
  const paras = (art.paragraphs || [art.summary])
    .map((p) => `<p>${esc(p)}</p>`)
    .join("");
  const tips = (art.tips || [])
    .map((t) => `<li>${esc(t)}</li>`)
    .join("");

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
  `;

  const productId = art.relatedProductId || "";
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
    location.href = "./index.html";
  });
})();
