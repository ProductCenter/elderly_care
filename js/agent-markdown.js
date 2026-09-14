/** Minimal Markdown → safe HTML for 康小护 chat bubbles.
 *  Supports a lightweight CUI DSL inside ```cui ... ``` code blocks.
 */
(function (global) {
  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function safeAttr(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/[\n\r]/g, " ");
  }

  function inlineMd(text) {
    let s = escapeHtml(text);
    s = s.replace(/`([^`]+)`/g, "<code>$1</code>");
    s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    s = s.replace(/__([^_]+)__/g, "<strong>$1</strong>");
    s = s.replace(/\*([^*\n]+)\*/g, "<em>$1</em>");
    s = s.replace(/_([^_\n]+)_/g, "<em>$1</em>");
    s = s.replace(
      /\[([^\]]+)\]\((https?:\/\/[^)\s]+|\/[^)\s]*|\.\/[^)\s]*)\)/g,
      '<a href="$2" class="md-link">$1</a>'
    );
    s = s.replace(
      /(^|[\s(])(https?:\/\/[^\s<]+)/g,
      '$1<a href="$2" class="md-link">$2</a>'
    );
    return s;
  }

  // --- CUI card renderers ---

  function renderActions(actions, contextText) {
    if (!Array.isArray(actions) || !actions.length) return "";
    return (
      '<div class="cui-actions">' +
      actions
        .map((a) => {
          const label = escapeHtml(a.label || a.text || "");
          if (!label) return "";
          // Explicit link action from LLM/CUI JSON
          if (a.action === "link" && a.href) {
            const href = safeAttr(String(a.href));
            return `<button type="button" class="cui-btn cui-btn--link" data-href="${href}" data-q="${safeAttr(a.q || "")}">${label}</button>`;
          }
          // Plain text question fallback (mapped to mall pages by agent.js)
          const q = a.q || a.query || "";
          return `<button type="button" class="cui-btn" data-q="${safeAttr(q)}" data-context="${safeAttr(contextText || "")}">${label}</button>`;
        })
        .join("") +
      "</div>"
    );
  }

  function renderServiceCard(data) {
    const title = escapeHtml(data.title || "推荐服务");
    const items = (data.items || []).filter((it) => it && (it.name || it.title));
    if (!items.length) return `<p>${title}</p>`;
    const cards = items
      .map((it) => {
        const name = escapeHtml(it.name || it.title || "");
        const tags = (it.tags || it.skills || [])
          .filter(Boolean)
          .map((t) => `<span class="cui-tag">${escapeHtml(t)}</span>`)
          .join("");
        const meta = [
          it.distance,
          it.rating ? `${it.rating}★` : "",
          it.orders ? `已服务 ${it.orders}单` : "",
        ]
          .filter(Boolean)
          .join(" ｜ ");
        const img = it.avatar || it.image || "";
        const avatar = img
          ? `<img src="${safeAttr(img)}" alt="" class="cui-avatar" loading="lazy" />`
          : '<span class="cui-avatar cui-avatar--text">' + name.charAt(0) + "</span>";
        return `
          <div class="cui-service-card">
            <div class="cui-service-head">
              ${avatar}
              <div class="cui-service-info">
                <div class="cui-service-name">${name}</div>
                ${tags ? `<div class="cui-service-tags">${tags}</div>` : ""}
              </div>
            </div>
            ${meta ? `<div class="cui-service-meta">${escapeHtml(meta)}</div>` : ""}
            ${renderActions(it.actions || it.buttons || [], name)}
          </div>`;
      })
      .join("");
    return `
      <div class="cui-block cui-service">
        <div class="cui-title">${title}</div>
        <div class="cui-service-list">${cards}</div>
        ${renderActions(data.actions)}
      </div>`;
  }

  function renderRankCard(data) {
    const title = escapeHtml(data.title || "榜单");
    const items = (data.items || []).filter((it) => it && (it.name || it.title));
    if (!items.length) return `<p>${title}</p>`;
    const rows = items
      .map((it, idx) => {
        const rank = idx + 1;
        const medal =
          rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `<span class="cui-rank-num">${rank}</span>`;
        const name = escapeHtml(it.name || it.title || "");
        const meta = [
          it.distance,
          it.rating ? `${it.rating}★` : "",
          it.stock ? `余量 ${it.stock}` : "",
          it.price ? `价格 ${it.price}` : "",
        ]
          .filter(Boolean)
          .join(" ｜ ");
        const desc = it.desc || it.description || "";
        return `
          <div class="cui-rank-item">
            <div class="cui-rank-medal">${medal}</div>
            <div class="cui-rank-body">
              <div class="cui-rank-name">${name}</div>
              ${meta ? `<div class="cui-rank-meta">${escapeHtml(meta)}</div>` : ""}
              ${desc ? `<div class="cui-rank-desc">${escapeHtml(desc)}</div>` : ""}
            </div>
          </div>`;
      })
      .join("");
    return `
      <div class="cui-block cui-rank">
        <div class="cui-title">${title}</div>
        <div class="cui-rank-list">${rows}</div>
        ${renderActions(data.actions)}
      </div>`;
  }

  function renderTableCard(data) {
    const title = escapeHtml(data.title || "");
    const headers = data.headers || [];
    const rows = data.rows || [];
    if (!rows.length) return title ? `<p>${title}</p>` : "";
    const th = headers
      .map((h) => `<th>${escapeHtml(h)}</th>`)
      .join("");
    const tr = rows
      .map((row) => {
        const cells = (Array.isArray(row) ? row : [row])
          .flat()
          .map((c) => `<td>${escapeHtml(String(c ?? ""))}</td>`)
          .join("");
        return `<tr>${cells}</tr>`;
      })
      .join("");
    const summary = data.summary || "";
    return `
      <div class="cui-block cui-table">
        ${title ? `<div class="cui-title">${title}</div>` : ""}
        <div class="cui-table-wrap">
          <table><thead><tr>${th}</tr></thead><tbody>${tr}</tbody></table>
        </div>
        ${summary ? `<div class="cui-summary">${escapeHtml(summary)}</div>` : ""}
        ${renderActions(data.actions)}
      </div>`;
  }

  function renderScheduleCard(data) {
    const title = escapeHtml(data.title || "日程安排");
    const items = (data.items || []).filter(Boolean);
    if (!items.length) return `<p>${title}</p>`;
    const rows = items
      .map((it) => {
        const day = escapeHtml(it.day || it.date || "");
        const time = escapeHtml(it.time || "");
        const name = escapeHtml(it.name || it.title || "");
        const meta = [
          it.location,
          it.people ? `👥 ${it.people}` : "",
        ]
          .filter(Boolean)
          .join(" ｜ ");
        return `
          <div class="cui-schedule-item">
            <div class="cui-schedule-when">
              <span class="cui-schedule-day">${day}</span>
              ${time ? `<span class="cui-schedule-time">${time}</span>` : ""}
            </div>
            <div class="cui-schedule-body">
              <div class="cui-schedule-name">${name}</div>
              ${meta ? `<div class="cui-schedule-meta">${escapeHtml(meta)}</div>` : ""}
            </div>
          </div>`;
      })
      .join("");
    return `
      <div class="cui-block cui-schedule">
        <div class="cui-title">${title}</div>
        <div class="cui-schedule-list">${rows}</div>
        ${renderActions(data.actions)}
      </div>`;
  }

  function renderInfoCard(data) {
    const title = escapeHtml(data.title || "");
    const lines = (data.lines || data.info || [])
      .filter(Boolean)
      .map((line) => `<div class="cui-info-line">${escapeHtml(String(line))}</div>`)
      .join("");
    return `
      <div class="cui-block cui-info">
        ${title ? `<div class="cui-title">${title}</div>` : ""}
        ${lines}
        ${renderActions(data.actions)}
      </div>`;
  }

  function renderProductCard(data) {
    const title = escapeHtml(data.title || "为你推荐");
    const items = (data.items || []).filter((it) => it && (it.name || it.title));
    if (!items.length) return `<p>${title}</p>`;

    const cards = items
      .map((it) => {
        const id = escapeHtml(it.id || "");
        const name = escapeHtml(it.name || it.title || "");
        const cover = safeAttr(it.cover || it.image || "");
        const tag = escapeHtml(it.tag || "");
        const price = escapeHtml(String(it.price ?? it.currentPrice ?? ""));
        const origin = escapeHtml(String(it.originPrice ?? ""));
        const sales = escapeHtml(String(it.sales ?? ""));
        const distance = escapeHtml(it.distance || "");
        const subtitle = escapeHtml(it.subtitle || it.sellPoint || it.desc || "");
        const attrKey = (it.productAttr || it.serviceType || "instore").toString();
        const attr = (typeof window !== "undefined" && window.getProductAttr)
          ? window.getProductAttr(attrKey)
          : null;
        const attrShort = attr?.short || (attrKey === "home" ? "到家" : attrKey === "goods" ? "实物" : attrKey === "package" ? "套餐" : "到店");
        const attrClass = attr?.mtTagClass || (attrKey === "home" ? "tag-home" : attrKey === "goods" ? "tag-goods" : attrKey === "package" ? "tag-package" : "tag-shop");
        const actions = it.actions || it.buttons || [];
        // default actions if none provided
        if (!actions.length && id) {
          actions.push(
            { label: "查看详情", action: "link", href: `./detail.html?id=${id}` },
            { label: "去下单", action: "link", href: `./order.html?goodsId=${id}` }
          );
        }
        const meta = [sales ? `月售${sales}` : "", distance]
          .filter(Boolean)
          .join(" · ");
        return `
          <article class="cui-product-card" data-id="${id}" role="link" tabindex="0">
            <div class="cui-product-pic">
              <img src="${cover}" alt="${name}" loading="lazy" />
              <span class="cui-product-corner ${attrClass}">${attrShort}</span>
              ${tag ? `<span class="cui-product-badge">${tag}</span>` : ""}
            </div>
            <div class="cui-product-body">
              <h3 class="cui-product-name">${name}</h3>
              ${subtitle ? `<p class="cui-product-sub">${subtitle}</p>` : ""}
              <div class="cui-product-foot">
                <div class="cui-product-price">
                  <span class="cui-product-unit">¥</span>${price}
                  ${origin ? `<span class="cui-product-origin">¥${origin}</span>` : ""}
                </div>
                ${meta ? `<span class="cui-product-meta">${meta}</span>` : ""}
              </div>
              ${renderActions(actions, name)}
            </div>
          </article>`;
      })
      .join("");
    return `
      <div class="cui-block cui-product">
        <div class="cui-title">${title}</div>
        <div class="cui-product-list">${cards}</div>
        ${renderActions(data.actions)}
      </div>`;
  }

  function renderCuiBlock(src) {
    let data;
    try {
      data = JSON.parse(src.trim());
    } catch {
      return `<pre><code>${escapeHtml(src)}</code></pre>`;
    }
    const type = data.type || data.kind || "info";
    switch (type) {
      case "service":
      case "staff":
      case "recommend":
        return renderServiceCard(data);
      case "rank":
      case "ranking":
      case "top":
        return renderRankCard(data);
      case "table":
      case "data":
      case "stats":
        return renderTableCard(data);
      case "schedule":
      case "calendar":
      case "itinerary":
        return renderScheduleCard(data);
      case "product":
      case "goods":
      case "mall":
        return renderProductCard(data);
      case "info":
      case "tip":
      default:
        return renderInfoCard(data);
    }
  }

  // --- main markdown renderer ---

  function hasOpenCuiBlock(raw) {
    const idx = raw.lastIndexOf("```cui");
    if (idx === -1) return false;
    const tail = raw.slice(idx);
    // a complete block must start with ```cui and end with a standalone ``` line
    return !/^```cui[\s\S]*?\n```\s*(\n|$)/m.test(tail);
  }

  const placeholderHtml =
    '<div class="cui-placeholder"><span class="cui-placeholder-dot"></span><span class="cui-placeholder-dot"></span><span class="cui-placeholder-dot"></span> 小护正在整理卡片</div>';

  function renderMarkdown(src) {
    let raw = String(src || "").replace(/\r\n/g, "\n");
    if (!raw.trim()) return "";

    // If the LLM is still streaming a ```cui block, render only the text before
    // the block and append a placeholder; the raw JSON is hidden from the user.
    let pendingPlaceholder = "";
    if (hasOpenCuiBlock(raw)) {
      const idx = raw.lastIndexOf("```cui");
      pendingPlaceholder = placeholderHtml;
      raw = raw.slice(0, idx).trimEnd();
    }

    // Extract ```cui ... ``` blocks first, replace with placeholders
    const cuiBlocks = [];
    const textWithoutCui = raw.replace(
      /^```cui\s*\n([\s\S]*?)\n```\s*(?=\n|$)/gm,
      (match, body) => {
        cuiBlocks.push(renderCuiBlock(body));
        return "\n\u0000CUI" + (cuiBlocks.length - 1) + "\u0000\n";
      }
    );

    const lines = textWithoutCui.split("\n");
    const out = [];
    let i = 0;
    let inCode = false;
    let codeBuf = [];
    let listType = null;
    let listItems = [];

    const flushList = () => {
      if (!listType) return;
      const tag = listType;
      out.push(
        `<${tag}>` +
          listItems.map((it) => `<li>${inlineMd(it)}</li>`).join("") +
          `</${tag}>`
      );
      listType = null;
      listItems = [];
    };

    const flushParagraph = () => {
      // placeholder handling inside inlineMd is tricky; do it after building paragraphs
    };

    while (i < lines.length) {
      const line = lines[i];

      if (line.includes("\u0000CUI")) {
        flushList();
        const idx = parseInt(line.replace(/.*\u0000CUI(\d+)\u0000.*/, "$1"), 10);
        out.push(cuiBlocks[idx] || "");
        i += 1;
        continue;
      }

      if (/^```/.test(line)) {
        if (inCode) {
          out.push(`<pre><code>${escapeHtml(codeBuf.join("\n"))}</code></pre>`);
          codeBuf = [];
          inCode = false;
        } else {
          flushList();
          inCode = true;
        }
        i += 1;
        continue;
      }

      if (inCode) {
        codeBuf.push(line);
        i += 1;
        continue;
      }

      if (/^\s*$/.test(line)) {
        flushList();
        i += 1;
        continue;
      }

      const h = /^(#{1,3})\s+(.+)$/.exec(line);
      if (h) {
        flushList();
        const level = h[1].length;
        out.push(`<h${level}>${inlineMd(h[2])}</h${level}>`);
        i += 1;
        continue;
      }

      const ul = /^[-*+]\s+(.+)$/.exec(line);
      if (ul) {
        if (listType && listType !== "ul") flushList();
        listType = "ul";
        listItems.push(ul[1]);
        i += 1;
        continue;
      }

      const ol = /^(\d+)\.\s+(.+)$/.exec(line);
      if (ol) {
        if (listType && listType !== "ol") flushList();
        listType = "ol";
        listItems.push(ol[2]);
        i += 1;
        continue;
      }

      const bq = /^>\s?(.*)$/.exec(line);
      if (bq) {
        flushList();
        out.push(`<blockquote>${inlineMd(bq[1])}</blockquote>`);
        i += 1;
        continue;
      }

      if (/^---+$/.test(line.trim())) {
        flushList();
        out.push("<hr />");
        i += 1;
        continue;
      }

      flushList();
      const paras = [line];
      while (i + 1 < lines.length) {
        const n = lines[i + 1];
        if (
          /^\s*$/.test(n) ||
          /^#{1,3}\s/.test(n) ||
          /^[-*+]\s+/.test(n) ||
          /^\d+\.\s+/.test(n) ||
          /^>\s?/.test(n) ||
          /^```/.test(n) ||
          /^---+$/.test(n.trim()) ||
          n.includes("\u0000CUI")
        ) {
          break;
        }
        paras.push(n);
        i += 1;
      }
      out.push(`<p>${paras.map(inlineMd).join("<br />")}</p>`);
      i += 1;
    }

    flushList();
    if (inCode) {
      out.push(`<pre><code>${escapeHtml(codeBuf.join("\n"))}</code></pre>`);
    }
    let html = out.join("");
    if (pendingPlaceholder) {
      html += pendingPlaceholder;
    }
    return html;
  }

  global.AgentMarkdown = { render: renderMarkdown, escapeHtml };
})(window);
