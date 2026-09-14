(() => {
  const $ = (id) => document.getElementById(id);

  function goBack() {
    if (history.length > 1) history.back();
    else location.href = "./broadcast.html";
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

  async function copyShare() {
    const url = location.href;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        toast("链接已复制");
        return;
      }
    } catch (_) {}
    try {
      const input = document.createElement("input");
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      input.remove();
      toast("链接已复制");
    } catch (_) {
      toast("复制失败，请手动复制地址栏");
    }
  }

  $("btnBack")?.addEventListener("click", goBack);

  const id = new URLSearchParams(location.search).get("id") || "";
  const bc = window.getMallBroadcast?.(id);
  const root = $("root");
  const bar = $("bottomBar");

  if (!bc) {
    root.innerHTML = `<div class="empty-state">未找到广播消息，请从广播列表重新进入。</div>`;
    bar.innerHTML = `<button class="btn-primary" type="button" id="btnList">返回列表</button>`;
    $("btnList")?.addEventListener("click", () => {
      location.href = "./broadcast.html";
    });
    return;
  }

  document.title = `${bc.title} · 春风康养`;

  const paragraphs = (bc.paragraphs || [bc.summary])
    .map((p) => `<p>${esc(p)}</p>`)
    .join("");

  const when = window.formatBroadcastWhen?.(bc) || [bc.date, bc.time].filter(Boolean).join(" · ");
  const info = [
    when ? `<li>时间：${esc(when)}</li>` : "",
    bc.location ? `<li>地点：${esc(bc.location)}</li>` : "",
  ]
    .filter(Boolean)
    .join("");

  root.innerHTML = `
    <img class="broadcast-cover" src="${esc(bc.cover)}" alt="${esc(bc.title)}" />
    <section class="card">
      <span class="broadcast-badge">${esc(bc.badge || "广播")}</span>
      <h1 class="broadcast-title">${esc(bc.title)}</h1>
      <div class="broadcast-meta">
        ${when ? `<span>${esc(when)}</span>` : ""}
        ${bc.location ? `<span>${esc(bc.location)}</span>` : ""}
      </div>
    </section>
    <section class="card broadcast-body">${paragraphs}</section>
    ${info ? `<section class="card"><h3 class="sec-title">活动信息</h3><ul class="info-list">${info}</ul></section>` : ""}
  `;

  const relatedId = bc.relatedProductId || "";
  const relatedCta = bc.relatedCta || "查看相关服务";
  bar.innerHTML = `
    <button class="btn-ghost" type="button" id="btnShare">分享</button>
    ${
      relatedId
        ? `<a class="btn-primary" id="btnRelated" href="./detail.html?id=${encodeURIComponent(relatedId)}">${esc(relatedCta)}</a>`
        : `<button class="btn-primary" type="button" id="btnList">返回列表</button>`
    }
  `;

  $("btnShare")?.addEventListener("click", copyShare);
  $("btnList")?.addEventListener("click", () => {
    location.href = "./broadcast.html";
  });
})();
