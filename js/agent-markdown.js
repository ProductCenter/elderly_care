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

  function renderProfileCard(data) {
    const title = escapeHtml(data.title || "家庭档案");
    const subtitle = escapeHtml(data.subtitle || "");
    const people = (data.people || []).filter((p) => p && (p.name || p.role));
    const cards = people
      .map((p) => {
        const tags = (p.tags || [])
          .filter(Boolean)
          .map((t) => `<span class="cui-tag">${escapeHtml(t)}</span>`)
          .join("");
        const note = p.note ? `<p class="cui-profile-note">${escapeHtml(p.note)}</p>` : "";
        const meta = (p.meta || [])
          .filter(Boolean)
          .map((m) => `<span class="cui-meta-chip">${escapeHtml(m)}</span>`)
          .join("");
        return `
          <div class="cui-profile-person">
            <div class="cui-profile-who">
              <strong>${escapeHtml(p.name || "")}</strong>
              <em>${escapeHtml(p.role || "")}</em>
            </div>
            ${tags ? `<div class="cui-service-tags">${tags}</div>` : ""}
            ${meta ? `<div class="cui-meta-row">${meta}</div>` : ""}
            ${note}
          </div>`;
      })
      .join("");
    return `
      <div class="cui-block cui-profile">
        <div class="cui-title">${title}</div>
        ${subtitle ? `<p class="cui-profile-sub">${subtitle}</p>` : ""}
        <div class="cui-profile-list">${cards}</div>
        ${renderActions(data.actions)}
      </div>`;
  }

  function renderPillarsCard(data) {
    const title = escapeHtml(data.title || "");
    const items = (data.items || []).filter((it) => it && (it.name || it.title));
    const cards = items
      .map((it, idx) => {
        const n = String(idx + 1).padStart(2, "0");
        return `
          <div class="cui-pillar">
            <div class="cui-pillar-idx">${n}</div>
            <div class="cui-pillar-body">
              <div class="cui-pillar-name">${escapeHtml(it.name || it.title || "")}</div>
              ${it.kicker ? `<div class="cui-pillar-kicker">${escapeHtml(it.kicker)}</div>` : ""}
              ${it.desc ? `<p class="cui-pillar-desc">${escapeHtml(it.desc)}</p>` : ""}
            </div>
          </div>`;
      })
      .join("");
    return `
      <div class="cui-block cui-pillars">
        ${title ? `<div class="cui-title">${title}</div>` : ""}
        <div class="cui-pillar-list">${cards}</div>
        ${renderActions(data.actions)}
      </div>`;
  }

  function statusClass(status) {
    const s = String(status || "ok").toLowerCase();
    if (s === "bad" || s === "high" || s === "danger") return "is-bad";
    if (s === "warn" || s === "mid") return "is-warn";
    if (s === "na" || s === "off") return "is-na";
    return "is-ok";
  }

  function statusLabel(status) {
    const s = String(status || "ok").toLowerCase();
    if (s === "bad" || s === "high" || s === "danger") return "偏高";
    if (s === "warn" || s === "mid") return "关注";
    if (s === "na" || s === "off") return "—";
    return "正常";
  }

  function renderVitalsCard(data) {
    const title = escapeHtml(data.title || "体征");
    const subtitle = escapeHtml(data.subtitle || "");
    const people = (data.people || []).filter((p) => p && (p.name || p.items));
    const blocks = people
      .map((p) => {
        const cells = (p.items || [])
          .map((it) => {
            const st = statusClass(it.status);
            return `
              <div class="cui-vital ${st}">
                <span class="cui-vital-name">${escapeHtml(it.name || "")}</span>
                <strong>${escapeHtml(String(it.value ?? ""))}<em>${escapeHtml(it.unit || "")}</em></strong>
                <i>${escapeHtml(it.ref || statusLabel(it.status))}</i>
              </div>`;
          })
          .join("");
        return `
          <div class="cui-vital-person">
            <div class="cui-vital-who">
              <strong>${escapeHtml(p.name || "")}</strong>
              <em>${escapeHtml(p.role || "")}</em>
            </div>
            <div class="cui-vital-grid">${cells}</div>
          </div>`;
      })
      .join("");
    return `
      <div class="cui-block cui-vitals">
        <div class="cui-title">${title}</div>
        ${subtitle ? `<p class="cui-profile-sub">${subtitle}</p>` : ""}
        ${blocks}
        ${renderActions(data.actions)}
      </div>`;
  }

  function renderTrendCard(data) {
    const title = escapeHtml(data.title || "趋势");
    const subtitle = escapeHtml(data.subtitle || "");
    const series = (data.series || []).filter((s) => s && (s.points || []).length);
    const charts = series
      .map((s) => {
        const max = Number(s.max) || Math.max(...s.points.map((p) => Number(p.v) || 0), 1);
        const bars = s.points
          .map((p) => {
            const v = Number(p.v) || 0;
            const h = Math.max(8, Math.round((v / max) * 72));
            const flag = p.flag || (s.line && v > s.line ? "warn" : "");
            return `<div class="cui-bar ${flag ? "is-" + escapeHtml(flag) : ""}"><b style="height:${h}px"></b><span>${escapeHtml(String(p.d || ""))}</span><em>${escapeHtml(String(p.v ?? ""))}</em></div>`;
          })
          .join("");
        return `
          <div class="cui-trend-series">
            <div class="cui-trend-cap">${escapeHtml(s.name || "")}${s.unit ? ` · ${escapeHtml(s.unit)}` : ""}</div>
            <div class="cui-bars">${bars}</div>
          </div>`;
      })
      .join("");
    return `
      <div class="cui-block cui-trend">
        <div class="cui-title">${title}</div>
        ${subtitle ? `<p class="cui-profile-sub">${subtitle}</p>` : ""}
        ${charts}
        ${renderActions(data.actions)}
      </div>`;
  }

  function renderSleepCard(data) {
    const title = escapeHtml(data.title || "睡眠");
    const subtitle = escapeHtml(data.subtitle || "");
    const people = (data.people || []).filter((p) => p && p.name);
    const cards = people
      .map((p) => {
        const st = statusClass(p.status);
        const rows = (p.items || [])
          .map(
            (it) => `
            <div class="cui-sleep-row">
              <span>${escapeHtml(it.name || "")}</span>
              <strong>${escapeHtml(it.value || "")}</strong>
              ${it.tip ? `<em>${escapeHtml(it.tip)}</em>` : ""}
            </div>`
          )
          .join("");
        return `
          <div class="cui-sleep-person">
            <div class="cui-sleep-head">
              <strong>${escapeHtml(p.name || "")}</strong>
              <b class="${st}">${escapeHtml(String(p.score ?? "—"))}<i>分</i></b>
            </div>
            ${rows}
          </div>`;
      })
      .join("");
    return `
      <div class="cui-block cui-sleep">
        <div class="cui-title">${title}</div>
        ${subtitle ? `<p class="cui-profile-sub">${subtitle}</p>` : ""}
        <div class="cui-sleep-list">${cards}</div>
        ${renderActions(data.actions)}
      </div>`;
  }

  function renderTimelineCard(data) {
    const title = escapeHtml(data.title || "病程");
    const people = (data.people || []).filter((p) => p && (p.name || p.items));
    const cols = people
      .map((p) => {
        const items = (p.items || [])
          .map((it) => {
            const lv = it.level ? ` is-${escapeHtml(it.level)}` : "";
            return `
              <div class="cui-tl-item${lv}">
                <span class="cui-tl-date">${escapeHtml(it.date || "")}</span>
                <div>
                  <strong>${escapeHtml(it.name || "")}</strong>
                  ${it.tag ? `<em>${escapeHtml(it.tag)}</em>` : ""}
                  ${it.desc ? `<p>${escapeHtml(it.desc)}</p>` : ""}
                </div>
              </div>`;
          })
          .join("");
        return `
          <div class="cui-tl-col">
            <div class="cui-tl-who">${escapeHtml(p.name || "")}</div>
            ${items}
          </div>`;
      })
      .join("");
    return `
      <div class="cui-block cui-timeline">
        <div class="cui-title">${title}</div>
        <div class="cui-tl-grid">${cols}</div>
        ${renderActions(data.actions)}
      </div>`;
  }

  function renderNodesCard(data) {
    const title = escapeHtml(data.title || "业务节点");
    const subtitle = escapeHtml(data.subtitle || "");
    const items = (data.items || []).filter((it) => it && (it.name || it.title));
    const statusText = (s) => {
      const k = String(s || "wait").toLowerCase();
      if (k === "done") return "已完成";
      if (k === "doing") return "进行中";
      if (k === "warn") return "预警";
      return "待办";
    };
    const rows = items
      .map((it) => {
        const st = String(it.status || "wait").toLowerCase();
        const q = it.q || it.query || "";
        const inner = `
          <div class="cui-node-dot"></div>
          <div class="cui-node-body">
            <div class="cui-node-top">
              <strong>${escapeHtml(it.name || it.title || "")}</strong>
              <em class="is-${escapeHtml(st)}">${escapeHtml(it.when || statusText(st))}</em>
            </div>
            ${it.desc ? `<p>${escapeHtml(it.desc)}</p>` : ""}
          </div>`;
        if (q) {
          return `<button type="button" class="cui-node cui-btn" data-q="${safeAttr(q)}">${inner}</button>`;
        }
        return `<div class="cui-node">${inner}</div>`;
      })
      .join("");
    return `
      <div class="cui-block cui-nodes">
        <div class="cui-title">${title}</div>
        ${subtitle ? `<p class="cui-profile-sub">${subtitle}</p>` : ""}
        <div class="cui-node-list">${rows}</div>
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

  function renderNeedsCard(data) {
    const title = escapeHtml(data.title || "体征 → 需求解析");
    const subtitle = escapeHtml(data.subtitle || "");
    const items = (data.items || []).filter((it) => it && (it.need || it.name || it.title));
    if (!items.length) return `<p>${title}</p>`;
    const rows = items
      .map((it, idx) => {
        const st = statusClass(it.level || it.status || "warn");
        const lv = escapeHtml(it.levelLabel || statusLabel(it.level || it.status || "warn"));
        const pri = escapeHtml(it.priority || String(idx + 1));
        const who = escapeHtml(it.who || it.person || "");
        const signal = escapeHtml(it.signal || it.vital || "");
        const need = escapeHtml(it.need || it.name || it.title || "");
        const why = escapeHtml(it.why || it.desc || "");
        const actionQ = it.q || (it.actions && it.actions[0] && (it.actions[0].q || it.actions[0].query));
        const inner = `
          <div class="cui-need-pri">${pri}</div>
          <div class="cui-need-body">
            <div class="cui-need-top">
              ${who ? `<span class="cui-need-who">${who}</span>` : ""}
              <span class="cui-need-lv ${st}">${lv}</span>
            </div>
            ${signal ? `<div class="cui-need-signal">体征：${signal}</div>` : ""}
            <div class="cui-need-name">${need}</div>
            ${why ? `<p class="cui-need-why">${why}</p>` : ""}
          </div>`;
        if (actionQ) {
          return `<button type="button" class="cui-need cui-btn" data-q="${safeAttr(actionQ)}">${inner}</button>`;
        }
        return `<div class="cui-need">${inner}</div>`;
      })
      .join("");
    return `
      <div class="cui-block cui-needs">
        <div class="cui-title">${title}</div>
        ${subtitle ? `<p class="cui-profile-sub">${subtitle}</p>` : ""}
        <div class="cui-need-list">${rows}</div>
        ${renderActions(data.actions)}
      </div>`;
  }

  function renderMapCard(data) {
    const title = escapeHtml(data.title || "附近推荐");
    const place = data.place || data.poi || {};
    const name = escapeHtml(place.name || data.name || "");
    if (!name) return `<p>${title}</p>`;
    const badge = escapeHtml(place.badge || data.badge || "推荐");
    const distance = escapeHtml(place.distance || "");
    const walk = escapeHtml(place.walk || "");
    const address = escapeHtml(place.address || "");
    const hours = escapeHtml(place.hours || "");
    const remain = escapeHtml(place.remain || "");
    const rating = escapeHtml(String(place.rating || ""));
    const reason = escapeHtml(place.reason || data.reason || "");
    const tags = (place.tags || data.tags || [])
      .filter(Boolean)
      .map((t) => `<span class="cui-tag">${escapeHtml(t)}</span>`)
      .join("");
    const pin = data.pin || { x: 70, y: 38 };
    const from = data.from || { x: 22, y: 74 };
    const youLabel = escapeHtml((data.you && data.you.label) || "你");
    const px = Math.max(8, Math.min(92, Number(pin.x) || 70));
    const py = Math.max(12, Math.min(86, Number(pin.y) || 38));
    const fx = Math.max(8, Math.min(92, Number(from.x) || 22));
    const fy = Math.max(12, Math.min(86, Number(from.y) || 74));
    const metaBits = [distance, hours, remain].filter(Boolean).join(" · ");
    return `
      <div class="cui-block cui-map">
        <div class="cui-title">${title}</div>
        <div class="cui-map-stage" aria-hidden="true">
          <svg class="cui-map-svg" viewBox="0 0 200 118" preserveAspectRatio="none">
            <rect width="200" height="118" fill="#d8e4d0"/>
            <rect x="6" y="6" width="52" height="40" rx="3" fill="#c3b089"/>
            <rect x="64" y="8" width="28" height="22" rx="3" fill="#b79a72"/>
            <rect x="100" y="6" width="46" height="38" rx="3" fill="#c8b48c"/>
            <rect x="154" y="8" width="38" height="34" rx="3" fill="#b4946c"/>
            <rect x="6" y="70" width="48" height="40" rx="3" fill="#c0ad86"/>
            <rect x="102" y="72" width="40" height="38" rx="3" fill="#b89d76"/>
            <rect x="150" y="68" width="44" height="42" rx="3" fill="#cbb892"/>
            <circle cx="78" cy="90" r="20" fill="#8fbe7a"/>
            <circle cx="84" cy="86" r="8" fill="#7aaa68"/>
            <rect x="0" y="50" width="200" height="16" fill="#f4efe4"/>
            <rect x="76" y="0" width="16" height="118" fill="#f4efe4"/>
            <rect x="0" y="16" width="200" height="6" fill="#efe6d4"/>
            <rect x="0" y="96" width="200" height="6" fill="#efe6d4"/>
            <rect x="26" y="0" width="6" height="118" fill="#efe6d4"/>
            <rect x="152" y="0" width="6" height="118" fill="#efe6d4"/>
            <path d="M${fx} ${fy} C ${(fx + px) / 2} ${fy - 10}, ${(fx + px) / 2} ${py + 12}, ${px} ${py}" fill="none" stroke="#e36a12" stroke-width="2.6" stroke-dasharray="5 3" stroke-linecap="round"/>
          </svg>
          <span class="cui-map-you" style="left:${fx}%;top:${fy}%">${youLabel}</span>
          <span class="cui-map-pin" style="left:${px}%;top:${py}%">
            <i></i>
            <em>食堂</em>
          </span>
        </div>
        <div class="cui-map-place">
          <div class="cui-map-place-hd">
            <strong>${name}</strong>
            ${badge ? `<span class="cui-map-badge">${badge}</span>` : ""}
          </div>
          ${rating ? `<div class="cui-map-rate">★ ${rating}</div>` : ""}
          ${metaBits ? `<div class="cui-map-meta">${metaBits}</div>` : ""}
          ${address ? `<div class="cui-map-addr">${address}${walk ? ` · ${walk}` : ""}</div>` : ""}
          ${reason ? `<p class="cui-map-reason">${reason}</p>` : ""}
          ${tags ? `<div class="cui-service-tags">${tags}</div>` : ""}
        </div>
        ${renderActions(data.actions || place.actions || [], name)}
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
      case "map":
      case "poi":
      case "nearby":
        return renderMapCard(data);
      case "product":
      case "goods":
      case "mall":
        return renderProductCard(data);
      case "profile":
      case "family":
        return renderProfileCard(data);
      case "vitals":
      case "signs":
        return renderVitalsCard(data);
      case "trend":
      case "chart":
        return renderTrendCard(data);
      case "sleep":
        return renderSleepCard(data);
      case "timeline":
      case "course":
        return renderTimelineCard(data);
      case "nodes":
      case "journey":
        return renderNodesCard(data);
      case "pillars":
      case "value":
        return renderPillarsCard(data);
      case "needs":
      case "need":
      case "demand-parse":
        return renderNeedsCard(data);
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
