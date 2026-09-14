(() => {
  const $ = (id) => document.getElementById(id);

  function goBack() {
    if (history.length > 1) history.back();
    else location.href = "./index.html";
  }

  function esc(s) {
    return String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  $("btnBack")?.addEventListener("click", goBack);

  const all = window.getMallBroadcastsSorted?.() || window.MALL_BROADCASTS || [];
  const badges = window.MALL_BROADCAST_BADGES || [];
  const root = $("root");
  if (!root) return;

  let filter = "";

  function metaLine(b) {
    const when = window.formatBroadcastWhen?.(b) || b.date || "";
    return [when, b.location].filter(Boolean).join(" · ");
  }

  function render() {
    const list = filter ? all.filter((b) => b.badge === filter) : all;
    const tabs = ["", ...badges]
      .map((key) => {
        const label = key || "全部";
        const on = (filter || "") === key ? " on" : "";
        return `<button type="button" class="broadcast-filter__tab${on}" data-badge="${esc(key)}" role="tab" aria-selected="${on ? "true" : "false"}">${esc(label)}</button>`;
      })
      .join("");

    if (!all.length) {
      root.innerHTML = `<div class="empty-state">暂无广播消息，稍后再来看看吧。</div>`;
      return;
    }

    const cards = list.length
      ? `<div class="broadcast-list">${list
          .map((b) => {
            const href = `./broadcast-detail.html?id=${encodeURIComponent(b.id)}`;
            const when = metaLine(b);
            return `
    <a class="broadcast-card" href="${esc(href)}">
      <img class="broadcast-card__cover" src="${esc(b.cover)}" alt="${esc(b.title)}" />
      <div class="broadcast-card__body">
        <h2 class="broadcast-card__title">${esc(b.title)}<span class="broadcast-card__badge">${esc(b.badge || "广播")}</span></h2>
        <p class="broadcast-card__summary">${esc(b.summary)}</p>
        <p class="broadcast-card__meta">${esc(when)}</p>
      </div>
    </a>`;
          })
          .join("")}</div>`
      : `<div class="empty-state">这个分类暂时没有广播。</div>`;

    root.innerHTML = `<div class="broadcast-filter" role="tablist" aria-label="广播分类">${tabs}</div>${cards}`;

    root.querySelectorAll(".broadcast-filter__tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        filter = tab.dataset.badge || "";
        render();
      });
    });
  }

  render();
})();
