(() => {
  const toastEl = document.getElementById("toast");
  let toastTimer;
  const isDesigner = document.body?.dataset?.designer === "1";
  const HOME_CFG_KEY = "kangyang-admin:mall:home-config";

  function toast(message) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.hidden = false;
    requestAnimationFrame(() => toastEl.classList.add("show"));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastEl.classList.remove("show");
      setTimeout(() => {
        toastEl.hidden = true;
      }, 200);
    }, 1500);
  }

  function resolveAsset(src) {
    if (!src || typeof src !== "string") return src;
    if (src.startsWith("data:image/") || src.startsWith("blob:")) return src;
    const prefix = window.MALL_ASSET_PREFIX || "./assets/";
    const m = src.match(/(?:(?:\.\.\/)+|\.\/)?assets\/(.+)$/);
    if (m) return prefix.replace(/\/?$/, "/") + m[1];
    return src;
  }

  function loadHomeConfig() {
    try {
      return JSON.parse(localStorage.getItem(HOME_CFG_KEY) || "null");
    } catch {
      return null;
    }
  }

  function hexToRgbCsv(hex) {
    const m = String(hex || "").trim().match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i);
    if (!m) return null;
    let h = m[1];
    if (h.length === 3) h = h.split("").map((c) => c + c).join("");
    const n = parseInt(h, 16);
    return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
  }

  const PAGE_BG = "#f6eee2";

  function setPageBg() {
    const app = document.getElementById("app");
    if (!app) return;
    app.style.setProperty("--wx-bg", PAGE_BG);
    app.style.backgroundColor = PAGE_BG;
    app.style.setProperty("--wx-bg-rgb", "246, 238, 226");
  }

  const FALLBACK_BANNER_BG = ["#ffe0cc", "#c6ebd8", "#c9ddf7"];
  const DEFAULT_BANNER_LINKS = [
    { linkType: "activity", linkId: "act_massage_trial" },
    { linkType: "activity", linkId: "act_meal_month" },
    { linkType: "activity", linkId: "act_free_check" },
  ];
  const BG_BY_IMAGE = {
    "cover-ai-massage.png": "#ffe0cc",
    "cover-nutrition-meal.png": "#c6ebd8",
    "cover-health-check.png": "#c9ddf7",
    "cover-foot-spa.png": "#f5d9c8",
    "cover-neck-massage.png": "#e2d8f5",
    "cover-therapy-device.png": "#d5e4f5",
  };
  const WEAK_BGS = new Set([
    "#f7f7f7",
    "#faf8f5",
    "#f6f1ec",
    "#f0f6f3",
    "#eef2f8",
    "#f3f1f6",
    "#f5f2ef",
    "#f1f4f7",
    "#f2f7f4",
    "#f0f5fa",
    "#f5f3fa",
    "#ebebeb",
  ]);

  function resolveBannerBg(b, i, cfg) {
    const file = String(b?.image || "").split("/").pop();
    const guessed =
      (file && BG_BY_IMAGE[file]) || FALLBACK_BANNER_BG[i] || cfg?.pageBg || "#f7f7f7";
    if (b?.bg && !WEAK_BGS.has(String(b.bg).toLowerCase())) return b.bg;
    return guessed;
  }

  function escapeHtml(s) {
    return String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function upgradeLegacyBannerLink(b) {
    if (!b) return b;
    const file = String(b.image || "").split("/").pop();
    if (file === "cover-ai-massage.png" && b.linkType === "product" && b.linkId === "ai_massage") {
      return { ...b, linkType: "activity", linkId: "act_massage_trial" };
    }
    if (file === "cover-nutrition-meal.png" && b.linkType === "article" && b.linkId === "art_nutrition") {
      return { ...b, linkType: "activity", linkId: "act_meal_month" };
    }
    return b;
  }

  /** 上架 Banner；设计器内展示全部；前台若全下架则仍展示全部，避免无图 */
  function getActiveBanners(cfg) {
    const all = Array.isArray(cfg?.banners) ? cfg.banners.filter(Boolean).map(upgradeLegacyBannerLink) : [];
    if (!all.length) return [];
    if (isDesigner) return all;
    const on = all.filter((b) => (b.status || "上架") !== "下架");
    return on.length ? on : all;
  }

  function syncHeroSlides(cfg) {
    const track = document.getElementById("heroTrack");
    if (!track) return [];
    const list = getActiveBanners(cfg);
    if (!list.length) return [];
    const base = window.MALL_PAGE_BASE || "./";
    track.innerHTML = list
      .map((b, i) => {
        const bg = resolveBannerBg(b, i, cfg);
        const titleHtml = escapeHtml(b.title || "").replace(/\n/g, "<br />");
        const fallback = DEFAULT_BANNER_LINKS[i] || {};
        const linkType = b.linkType || fallback.linkType || "";
        const linkId = b.linkId || fallback.linkId || "";
        const href =
          window.resolveMallLinkHref?.(linkType, linkId, base) ||
          (linkType === "activity" && linkId
            ? `${base}activity.html?id=${encodeURIComponent(linkId)}`
            : "");
        const clickable = href ? " is-link" : "";
        return `<article class="hero-slide${i === 0 ? " is-active" : ""}${clickable}" data-index="${i}" data-bg="${escapeHtml(bg)}" data-link-type="${escapeHtml(linkType)}" data-link-id="${escapeHtml(linkId)}" data-href="${escapeHtml(href)}" role="${href ? "link" : "group"}" ${href ? `tabindex="0"` : ""}>
          <img class="hero-img" src="${escapeHtml(resolveAsset(b.image))}" alt="" draggable="false" />
          <div class="hero-shade"></div>
          <div class="hero-promo">
            <p class="hero-eyebrow">${escapeHtml(b.eyebrow || "")}</p>
            <h2 class="hero-title">${titleHtml}</h2>
            <p class="hero-sub">${escapeHtml(b.sub || "")}</p>
          </div>
        </article>`;
      })
      .join("");
    return list;
  }

  /** 后台「首页装修」配置 → 商城首页 */
  function applyHomeConfig(cfg) {
    if (!cfg) return;

    if (Array.isArray(cfg.banners)) {
      syncHeroSlides(cfg);
    }
    setPageBg();

    if (cfg.location) {
      const el = document.querySelector(".loc-name");
      if (el) el.textContent = cfg.location;
    }

    if (Array.isArray(cfg.kingkong) && Array.isArray(window.MALL_KINGKONG)) {
      cfg.kingkong.forEach((item, i) => {
        if (!window.MALL_KINGKONG[i] || !item) return;
        if (item.name != null) window.MALL_KINGKONG[i].name = item.name;
        if (item.fullName != null) window.MALL_KINGKONG[i].fullName = item.fullName;
      });
    }

    if (cfg.coupon) {
      const coupon = document.querySelector(".coupon-card");
      const c = cfg.coupon;
      if (coupon) {
        const t = coupon.querySelector(".coupon-title");
        const amt = coupon.querySelector(".coupon-amount");
        const label = coupon.querySelector(".coupon-info > span");
        const btn = coupon.querySelector(".claim-btn");
        if (t && c.title != null) t.textContent = c.title;
        if (amt && c.amount != null) amt.innerHTML = `<em>¥</em>${c.amount}`;
        if (label && c.label != null) label.textContent = c.label;
        if (btn && c.btn != null && btn.dataset.claimed !== "1") btn.textContent = c.btn;
      }
    }

    if (cfg.discount) {
      const disc = document.querySelector(".discount-card");
      const d = cfg.discount;
      if (disc) {
        const label = disc.querySelector(".discount-head span");
        const badge = disc.querySelector(".discount-head strong");
        const ban = disc.querySelector(".discount-banner");
        const img = disc.querySelector("img");
        if (label && d.label != null) label.textContent = d.label;
        if (badge && d.badge != null) badge.textContent = d.badge;
        if (ban && d.banner != null) ban.textContent = d.banner;
        if (img && d.image) img.src = resolveAsset(d.image);
      }
    }
  }

  function applyFeatureOverride(cfg) {
    const f = cfg?.feature;
    if (!f) return;
    const featureCard = document.querySelector(".feature-card");
    if (!featureCard) return;
    if (f.productId) featureCard.dataset.id = f.productId;
    const h2 = featureCard.querySelector("h2");
    const sub = featureCard.querySelector(".feature-sub");
    const list = featureCard.querySelector(".feature-list");
    const hot = featureCard.querySelector(".hot-tag");
    const img = featureCard.querySelector(".feature-img");
    const cta = featureCard.querySelector(".cta-buy");
    if (h2 && f.title != null) h2.textContent = f.title;
    if (sub && f.subtitle != null) sub.textContent = f.subtitle;
    if (list && f.features != null) {
      list.innerHTML = String(f.features)
        .split("\n")
        .filter(Boolean)
        .slice(0, 3)
        .map(
          (x) =>
            `<li>${String(x)
              .replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")}</li>`
        )
        .join("");
    }
    if (hot) {
      hot.hidden = !f.hot;
      if (f.hot != null) hot.textContent = f.hot;
    }
    if (img && f.image) {
      img.src = resolveAsset(f.image);
      if (f.title) img.alt = f.title;
    }
    if (cta && f.cta != null) cta.textContent = f.cta;
  }

  const timeEl = document.querySelector(".status-time");
  function tick() {
    if (!timeEl) return;
    const now = new Date();
    timeEl.textContent = `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes()
    ).padStart(2, "0")}`;
  }
  tick();
  setInterval(tick, 30_000);

  function goDetail(id) {
    if (!id || isDesigner) return;
    const base = window.MALL_PAGE_BASE || "./";
    location.href = `${base}detail.html?id=${encodeURIComponent(id)}`;
  }

  const OPS_TAGS = new Set(["最热", "热门", "热销", "新品", "公益"]);
  const SALES_MIN = 100;

  function distText(p) {
    const key = p.productAttr || p.serviceType || "";
    const feedKey = window.getProductFeedKey ? window.getProductFeedKey(p) : "";
    if (key === "goods" || feedKey === "mail") {
      if (p.freight === 0 || !p.distance || p.distance.includes("包邮")) return "包邮";
      if (p.distance.includes("运费")) return p.distance;
      return p.distance;
    }
    const d = (p.distance || "").replace(/^距你\s*/, "").trim();
    if (!d) return "";
    return `距你 ${d}`;
  }

  function sellPoint(p) {
    if (p.subtitle) return p.subtitle;
    if (p.features?.length) return p.features.slice(0, 2).join(" · ");
    return "";
  }

  function opsTag(p) {
    const t = (p.tag || "").trim();
    return OPS_TAGS.has(t) ? t : "";
  }

  function salesText(p) {
    const n = Number(p.sales) || 0;
    if (n < SALES_MIN) return "";
    return `月售${n}`;
  }

  function metaLine(p) {
    return [salesText(p), distText(p)].filter(Boolean).join(" · ");
  }

  function bindCard(card) {
    card.addEventListener("click", (e) => {
      if (e.target.closest("button")) return;
      goDetail(card.dataset.id);
    });
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        goDetail(card.dataset.id);
      }
    });
  }

  /* 金刚区：柔彩底 + 同色图标 */
  const KK_ICONS = {
    recommend:
      '<svg viewBox="0 0 48 48" fill="none"><path d="M24 9.5l3.4 8.6 9.2.8-7 6 2.1 9L24 28.8l-7.7 5.1 2.1-9-7-6 9.2-.8L24 9.5z" fill="currentColor"/><circle cx="37" cy="13" r="2" fill="currentColor" opacity=".45"/></svg>',
    care:
      '<svg viewBox="0 0 48 48" fill="none"><path d="M24 37.5S12.5 29 12.5 20.2A7 7 0 0 1 24 15.5a7 7 0 0 1 11.5 4.7C35.5 29 24 37.5 24 37.5z" fill="currentColor"/></svg>',
    rehab:
      '<svg viewBox="0 0 48 48" fill="none"><circle cx="24" cy="24" r="14.5" fill="currentColor" opacity=".14"/><path d="M13 24h5.5l3-7.5 4.8 15 2.8-7.5H35" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><circle cx="33.5" cy="15" r="4.5" fill="currentColor"/><path d="M33.5 13v4M31.5 15h4" stroke="#fff" stroke-width="1.7" stroke-linecap="round"/></svg>',
    monitor:
      '<svg viewBox="0 0 48 48" fill="none"><rect x="9" y="12" width="30" height="19" rx="4.5" fill="currentColor" opacity=".16"/><rect x="9" y="12" width="30" height="19" rx="4.5" stroke="currentColor" stroke-width="2.6"/><path d="M18 34.5h12M14 21.5h3.5l2.3-4.6 3.6 10.5 2.2-5.9H34" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    hospice:
      '<svg viewBox="0 0 48 48" fill="none"><path d="M24 11c4.6 3.2 7.8 7 7.8 11.2a7.8 7.8 0 1 1-15.6 0C16.2 18 19.4 14.2 24 11z" fill="currentColor"/><path d="M24 30v6.5M20 36.5h8" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/><circle cx="24" cy="18" r="2" fill="#fff" opacity=".9"/></svg>',
    lease:
      '<svg viewBox="0 0 48 48" fill="none"><path d="M13 17.5h22l-1.3 17A2.8 2.8 0 0 1 31 37.2H17a2.8 2.8 0 0 1-2.7-2.7L13 17.5z" fill="currentColor" opacity=".16"/><path d="M13 17.5h22l-1.3 17A2.8 2.8 0 0 1 31 37.2H17a2.8 2.8 0 0 1-2.7-2.7L13 17.5zM18 17.5v-2.5a6 6 0 0 1 12 0v2.5" stroke="currentColor" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"/><circle cx="19.5" cy="27" r="1.8" fill="currentColor"/><circle cx="28.5" cy="27" r="1.8" fill="currentColor"/></svg>',
    daycare:
      '<svg viewBox="0 0 48 48" fill="none"><path d="M10 22.5 24 12l14 10.5V34a3.2 3.2 0 0 1-3.2 3.2H13.2A3.2 3.2 0 0 1 10 34V22.5z" fill="currentColor" opacity=".16"/><path d="M10 22.5 24 12l14 10.5V34a3.2 3.2 0 0 1-3.2 3.2H13.2A3.2 3.2 0 0 1 10 34V22.5z" stroke="currentColor" stroke-width="2.6" stroke-linejoin="round"/><path d="M20.5 37.2V27h7v10.2" stroke="currentColor" stroke-width="2.6" stroke-linejoin="round"/></svg>',
    therapy:
      '<svg viewBox="0 0 48 48" fill="none"><path d="M24 10v6.5M19 13.2h10" stroke="currentColor" stroke-width="2.7" stroke-linecap="round"/><path d="M16.5 24c0-4.8 3.4-6.8 7.5-10.2 4.1 3.4 7.5 5.4 7.5 10.2a7.5 7.5 0 1 1-15 0z" fill="currentColor"/><path d="M20 35.5h8" stroke="currentColor" stroke-width="2.7" stroke-linecap="round"/><circle cx="24" cy="24" r="2.6" fill="#fff" opacity=".9"/></svg>',
    checkup:
      '<svg viewBox="0 0 48 48" fill="none"><rect x="14" y="9" width="20" height="30" rx="3.5" fill="currentColor" opacity=".16"/><rect x="14" y="9" width="20" height="30" rx="3.5" stroke="currentColor" stroke-width="2.5"/><rect x="19" y="6.5" width="10" height="5" rx="1.8" fill="currentColor"/><path d="M19.5 19h9M19.5 24.5h9M19.5 30h5.5" stroke="currentColor" stroke-width="2.3" stroke-linecap="round"/><circle cx="30" cy="30" r="1.8" fill="currentColor"/></svg>',
    brain:
      '<svg viewBox="0 0 48 48" fill="none"><path d="M20.5 11a6.2 6.2 0 0 0-5.6 9.4A5.2 5.2 0 0 0 17.2 29v4.5h6.3M27.5 11a6.2 6.2 0 0 1 5.6 9.4A5.2 5.2 0 0 1 30.8 29v4.5h-6.3" fill="currentColor" opacity=".14"/><path d="M20.5 11a6.2 6.2 0 0 0-5.6 9.4A5.2 5.2 0 0 0 17.2 29v4.5h6.3M27.5 11a6.2 6.2 0 0 1 5.6 9.4A5.2 5.2 0 0 1 30.8 29v4.5h-6.3M24 16v17.5" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/><circle cx="20" cy="20" r="1.6" fill="currentColor"/><circle cx="28" cy="22.5" r="1.6" fill="currentColor"/></svg>',
    school:
      '<svg viewBox="0 0 48 48" fill="none"><path d="M8 21.5 24 12l16 9.5-16 9.5L8 21.5z" fill="currentColor"/><path d="M15.5 26v7.2c0 1.7 3.8 4 8.5 4s8.5-2.3 8.5-4V26" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M40 22v7.5" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/><circle cx="24" cy="21.5" r="2" fill="#fff" opacity=".9"/></svg>',
    wheelchair:
      '<svg viewBox="0 0 48 48" fill="none"><circle cx="20.5" cy="31" r="8" fill="currentColor" opacity=".14"/><circle cx="20.5" cy="31" r="8" stroke="currentColor" stroke-width="2.6"/><circle cx="20.5" cy="13.5" r="3.5" fill="currentColor"/><path d="M20.5 17.2V24h9.2l4.8 8.8" stroke="currentColor" stroke-width="2.7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    device:
      '<svg viewBox="0 0 48 48" fill="none"><rect x="16" y="7" width="16" height="34" rx="4" fill="currentColor" opacity=".16"/><rect x="16" y="7" width="16" height="34" rx="4" stroke="currentColor" stroke-width="2.5"/><path d="M21 11.5h6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><circle cx="24" cy="33" r="2.4" fill="currentColor"/><path d="M20.5 20h2.2l1.2-2.5 1.9 5.8 1.2-3.3H28" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    supply:
      '<svg viewBox="0 0 48 48" fill="none"><path d="M12 17h24l-1.4 17.5A3 3 0 0 1 31.7 37.5H16.3A3 3 0 0 1 13.4 34.5L12 17z" fill="currentColor" opacity=".16"/><path d="M12 17h24l-1.4 17.5A3 3 0 0 1 31.7 37.5H16.3A3 3 0 0 1 13.4 34.5L12 17zM18.5 17v-2.2a5.5 5.5 0 0 1 11 0V17" stroke="currentColor" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"/><path d="M19 25.5h10M19 30h7" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
    food:
      '<svg viewBox="0 0 48 48" fill="none"><path d="M11 22h26v2.4A8.8 8.8 0 0 1 28.2 33h-8.4A8.8 8.8 0 0 1 11 24.4V22z" fill="currentColor" opacity=".16"/><path d="M11 22h26v2.4A8.8 8.8 0 0 1 28.2 33h-8.4A8.8 8.8 0 0 1 11 24.4V22zM17 22v-5.5A3.5 3.5 0 0 1 20.5 13h7A3.5 3.5 0 0 1 31 16.5V22" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/><path d="M18 27.5h12" stroke="currentColor" stroke-width="2.1" stroke-linecap="round"/><path d="M21.5 9.5c0 1.5-.9 2.2-.9 3.4M24 8.8c0 1.7-1 2.4-1 4M26.5 9.5c0 1.5-.9 2.2-.9 3.4" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" opacity=".7"/></svg>',
    safety:
      '<svg viewBox="0 0 48 48" fill="none"><path d="M24 8.5 36 13.5v9.5c0 7.8-5.3 12.5-12 14.4-6.7-1.9-12-6.6-12-14.4v-9.5L24 8.5z" fill="currentColor" opacity=".16"/><path d="M24 8.5 36 13.5v9.5c0 7.8-5.3 12.5-12 14.4-6.7-1.9-12-6.6-12-14.4v-9.5L24 8.5z" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/><path d="M19 23.5 22.3 26.7 29.2 18.8" stroke="currentColor" stroke-width="2.7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  };

  let filterState = { cat: "all", feed: "instore" };

  const FEED_KEYS = ["instore", "home", "goods", "mail"];

  function matchFeedCard(card) {
    const feed = filterState.feed;
    if (!feed || feed === "all") return true;
    return (card.dataset.feed || "") === feed;
  }

  function syncFeedTabs() {
    document.querySelectorAll("#feedFilter .feed-tab").forEach((tab) => {
      const on = tab.dataset.feed === filterState.feed;
      tab.classList.toggle("on", on);
      tab.setAttribute("aria-selected", on ? "true" : "false");
    });
  }

  function setFeed(feedKey) {
    if (!FEED_KEYS.includes(feedKey)) return;
    if (filterState.feed === feedKey) return;
    filterState.feed = feedKey;
    syncFeedTabs();
    applyFilter();
  }

  function renderCatalog() {
    const catalog = window.MALL_PRODUCTS || {};
    const getAttr =
      window.getProductAttr ||
      ((p) => ({
        short: "到店",
        key: "instore",
        mtTagClass: "tag-shop",
        tagClass: "svc-instore",
      }));

    const featured =
      Object.values(catalog).find((p) => p.featured) || catalog.ai_massage;
    const featureCard = document.querySelector(".feature-card");
    if (featureCard && featured) {
      const attr = getAttr(featured);
      const ops = opsTag(featured);
      featureCard.dataset.id = featured.id;
      featureCard.dataset.cat = featured.cat || "";
      featureCard.dataset.attr = attr.key;
      featureCard.dataset.service = attr.key;
      const svc = featureCard.querySelector(".svc-tag");
      if (svc) {
        svc.className = `svc-tag ${attr.tagClass}`;
        svc.textContent = attr.short;
      }
      const h2 = featureCard.querySelector("h2");
      if (h2) h2.textContent = featured.name;
      const hot = featureCard.querySelector(".hot-tag");
      if (hot) {
        hot.hidden = !ops;
        hot.textContent = ops;
      }
      const img = featureCard.querySelector(".feature-img");
      if (img) {
        img.src = resolveAsset(featured.cover);
        img.alt = featured.name;
      }
      const sub = featureCard.querySelector(".feature-sub");
      if (sub) sub.textContent = sellPoint(featured);
      const list = featureCard.querySelector(".feature-list");
      if (list) {
        list.innerHTML = (featured.features || [])
          .slice(0, 3)
          .map((f) => `<li>${f}</li>`)
          .join("");
      }
      const meta = featureCard.querySelector(".meta");
      if (meta) meta.textContent = metaLine(featured) || "精选推荐";
      bindCard(featureCard);
    }

    const grid = document.getElementById("goodsGrid");
    if (grid) {
      const items = Object.values(catalog).filter((p) => !p.featured);
      const cardHtml = (p) => {
        const attr = getAttr(p);
        const ops = opsTag(p);
        const point = sellPoint(p);
        const meta = metaLine(p);
        const feedKey = window.getProductFeedKey ? window.getProductFeedKey(p) : attr.key;
        const cornerClass = feedKey === "mail" ? "tag-mail" : attr.mtTagClass;
        const cornerText = feedKey === "mail" ? "邮寄" : attr.short;
        return `<article class="mt-card" data-cat="${p.cat || ""}" data-attr="${attr.key}" data-feed="${feedKey}" data-id="${p.id}" data-service="${attr.key}" role="link" tabindex="0">
            <div class="mt-pic">
              <img src="${resolveAsset(p.cover)}" alt="${p.name}" loading="lazy" />
              <span class="mt-corner ${cornerClass}">${cornerText}</span>
            </div>
            <div class="mt-body">
              <h3 class="mt-title">${p.name}</h3>
              ${point ? `<p class="mt-sub">${point}</p>` : ""}
              ${ops ? `<div class="mt-tags"><span class="mt-tag tag-hot">${ops}</span></div>` : ""}
              <div class="mt-foot">
                <span class="mt-meta">${meta}</span>
                <span class="mt-cta">去看看</span>
              </div>
            </div>
          </article>`;
      };

      const left = [];
      const right = [];
      items.forEach((p, i) => {
        (i % 2 === 0 ? left : right).push(cardHtml(p));
      });
      grid.innerHTML = `<div class="goods-col">${left.join("")}</div><div class="goods-col">${right.join("")}</div>`;
      grid.querySelectorAll(".mt-card[data-id]").forEach(bindCard);
    }
  }

  const KK_COLS = 5;
  const KK_ROWS = 2;
  const KK_PER_PAGE = KK_COLS * KK_ROWS;
  let kkPageIndex = 0;

  function getKingkongPageCount() {
    const list = window.MALL_KINGKONG || [];
    return Math.max(1, Math.ceil(list.length / KK_PER_PAGE));
  }

  function syncKingkongHeight() {
    const grid = document.getElementById("kingkongGrid");
    if (!grid) return;
    const page = grid.querySelector(".kk-page");
    if (!page) {
      grid.style.height = "";
      return;
    }
    const h = Math.ceil(page.getBoundingClientRect().height);
    if (h > 0) grid.style.height = `${h}px`;
  }

  function renderKingkongDots(activePage) {
    const dots = document.getElementById("kingkongDots");
    if (!dots) return;
    const pages = getKingkongPageCount();
    const current = Math.min(Math.max(activePage ?? kkPageIndex, 0), pages - 1);
    kkPageIndex = current;
    dots.hidden = pages <= 1;
    dots.innerHTML = Array.from({ length: pages }, (_, i) => {
      const on = i === current ? " active" : "";
      return `<button type="button" class="kk-dot${on}" data-page="${i}" role="tab" aria-selected="${i === current}" aria-label="第${i + 1}页"></button>`;
    }).join("");
  }

  function syncKingkongDotsFromScroll() {
    const grid = document.getElementById("kingkongGrid");
    if (!grid) return;
    const pageW = grid.clientWidth || 1;
    const page = Math.round(grid.scrollLeft / pageW);
    const pages = getKingkongPageCount();
    const next = Math.min(Math.max(page, 0), pages - 1);
    kkPageIndex = next;
    document.querySelectorAll("#kingkongDots .kk-dot").forEach((dot) => {
      const on = Number(dot.dataset.page) === next;
      dot.classList.toggle("active", on);
      dot.setAttribute("aria-selected", on ? "true" : "false");
    });
    syncKingkongHeight();
  }

  function goKingkongPage(page, smooth = true) {
    const grid = document.getElementById("kingkongGrid");
    if (!grid) return;
    const pages = getKingkongPageCount();
    const next = Math.min(Math.max(page, 0), pages - 1);
    kkPageIndex = next;
    grid.scrollTo({
      left: next * grid.clientWidth,
      behavior: smooth ? "smooth" : "auto",
    });
    renderKingkongDots(next);
    // 平滑滚动过程中持续适配；结束再校准一次
    syncKingkongHeight();
    if (smooth) {
      const onEnd = () => {
        syncKingkongHeight();
        grid.removeEventListener("scrollend", onEnd);
      };
      grid.addEventListener("scrollend", onEnd);
      setTimeout(syncKingkongHeight, 260);
    }
  }

  function renderKingkongItem(item) {
    const active =
      filterState.cat === item.id ||
      (item.id === "all" && filterState.cat === "all")
        ? " active"
        : "";
    const svg = KK_ICONS[item.icon] || KK_ICONS.care;
    const href = item.href ? ` data-href="${item.href}"` : "";
    return `<button type="button" class="kk-item i-${item.icon}${active}" data-id="${item.id}" data-group="${item.group}"${href} title="${item.fullName}">
      <span class="kk-icon" aria-hidden="true">${svg}</span>
      <span class="kk-name">${item.name}</span>
    </button>`;
  }

  function renderKingkong() {
    const grid = document.getElementById("kingkongGrid");
    const list = window.MALL_KINGKONG || [];
    if (!grid) return;
    const keepLeft = grid.scrollLeft;
    // 金刚区：一行横向翻页滚动，每页为一个 snap 目标
    const perPage = 5;
    const pages = Math.max(1, Math.ceil(list.length / perPage));
    const pageHtml = [];
    for (let p = 0; p < pages; p++) {
      const slice = list.slice(p * perPage, (p + 1) * perPage);
      pageHtml.push(
        `<div class="kk-page" data-page="${p}">${slice
          .map(renderKingkongItem)
          .join("")}</div>`
      );
    }
    grid.innerHTML = pageHtml.join("");
    grid.scrollLeft = keepLeft;
    renderKingkongDots(0);
    // 等布局完成后再量高，保证下方模块跟随
    requestAnimationFrame(() => {
      syncKingkongHeight();
    });
  }

  function applyFilter() {
    const { cat } = filterState;

    // 热门推荐（商品卡 / 券 / 折扣）固定展示，不受 Feed 筛选影响
    document.querySelectorAll(".hot-section .feature-card, .hot-section .right-stack").forEach((el) => {
      el.classList.remove("is-hidden");
    });

    // 仅筛选下方商品 Feed
    const grid = document.getElementById("goodsGrid");
    if (!grid) return;
    const cards = Array.from(grid.querySelectorAll(".mt-card"));
    if (!cards.length) return;
    cards.forEach((card) => {
      const cardCat = card.dataset.cat || "";
      const cardAttr = card.dataset.attr || card.dataset.service || "";
      const showCat = cat === "all" || cardCat === cat;
      const showFeed = matchFeedCard(card);
      card.classList.toggle("is-hidden", !(showCat && showFeed));
    });
    const visible = cards.filter((c) => !c.classList.contains("is-hidden"));
    let cols = grid.querySelectorAll(".goods-col");
    if (cols.length !== 2) {
      grid.innerHTML = `<div class="goods-col"></div><div class="goods-col"></div>`;
      cols = grid.querySelectorAll(".goods-col");
    }
    cols[0].innerHTML = "";
    cols[1].innerHTML = "";
    visible.forEach((card, i) => {
      cols[i % 2].appendChild(card);
    });
    const hidden = cards.filter((c) => c.classList.contains("is-hidden"));
    hidden.forEach((card) => cols[0].appendChild(card));
  }

  function setCat(catId) {
    const item = (window.MALL_KINGKONG || []).find((i) => i.id === catId);
    if (!item) return;
    if (item.href) {
      location.href = item.href;
      return;
    }
    if (catId === "all") {
      filterState.cat = "all";
      renderKingkong();
      applyFilter();
      toast(item.fullName);
      return;
    }
    if (filterState.cat === catId) {
      filterState.cat = "all";
      renderKingkong();
      applyFilter();
      return;
    }
    filterState.cat = item.id;
    renderKingkong();
    applyFilter();
    toast(item.fullName);
  }

  document.getElementById("kingkongGrid")?.addEventListener("click", (e) => {
    const item = e.target.closest(".kk-item[data-id]");
    if (!item) return;
    setCat(item.dataset.id);
  });

  document.getElementById("feedFilter")?.addEventListener("click", (e) => {
    const tab = e.target.closest(".feed-tab[data-feed]");
    if (!tab) return;
    setFeed(tab.dataset.feed);
  });

  document.getElementById("kingkongGrid")?.addEventListener(
    "scroll",
    () => {
      syncKingkongHeight();
    },
    { passive: true }
  );

  window.addEventListener(
    "resize",
    () => {
      syncKingkongHeight();
    },
    { passive: true }
  );

  document.getElementById("kingkongDots")?.addEventListener("click", (e) => {
    const dot = e.target.closest(".kk-dot[data-page]");
    if (!dot) return;
    goKingkongPage(Number(dot.dataset.page));
  });

  document.getElementById("navSearch")?.addEventListener("click", () => {
    location.href = "./search.html";
  });

  document.querySelector(".claim-btn")?.addEventListener("click", (e) => {
    e.stopPropagation();
    const btn = e.currentTarget;
    if (btn.dataset.claimed === "1") {
      toast("已领取");
      return;
    }
    btn.dataset.claimed = "1";
    btn.textContent = "已领取";
    btn.style.opacity = "0.6";
    toast("领取成功");
  });

  document.querySelector(".cta-buy")?.addEventListener("click", (e) => {
    e.stopPropagation();
    if (isDesigner) return;
    const id = document.querySelector(".feature-card")?.dataset.id || "ai_massage";
    const base = window.MALL_PAGE_BASE || "./";
    location.href = `${base}detail.html?id=${encodeURIComponent(id)}`;
  });

  document.querySelector(".discount-card")?.addEventListener("click", () => {
    toast("超低折扣活动");
  });


  /* —— 智伴换形象 —— */
  (function setupMallAvatar() {
    const api = window.AgentAvatar;
    if (!api) return;
    const mask = document.getElementById("mallAvatarMask");
    const sheet = document.getElementById("mallAvatarSheet");
    const open = () => {
      api.renderOptions("mallAvatarOptions");
      if (mask) mask.hidden = false;
      if (sheet) sheet.hidden = false;
    };
    const close = () => {
      if (mask) mask.hidden = true;
      if (sheet) sheet.hidden = true;
    };
    api.apply();
    document.getElementById("btnMallAvatarSwitch")?.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (typeof isDesigner !== "undefined" && isDesigner) return;
      open();
    });
    document.getElementById("mallAvatarClose")?.addEventListener("click", close);
    mask?.addEventListener("click", close);
    document.getElementById("mallAvatarOptions")?.addEventListener("click", (e) => {
      const btn = e.target.closest(".avatar-opt");
      if (!btn) return;
      const av = api.LIST.find((a) => a.id === btn.dataset.id);
      if (!av) return;
      api.apply(av);
      toast(`已切换为「${av.name}」`);
    });
  })();

  document.getElementById("agentMainEntry")?.addEventListener("click", () => {
    if (isDesigner) return;
    location.href = "./agent.html";
  });

  document.getElementById("agentCard")?.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-agent-act]");
    if (!btn || isDesigner) return;
    e.preventDefault();
    e.stopPropagation();
    const act = btn.dataset.agentAct;
    const goAgent = (action, q) => {
      const qs = new URLSearchParams();
      if (action) qs.set("action", action);
      if (q) qs.set("q", q);
      location.href = `./agent.html?${qs.toString()}`;
    };
    if (act === "package") {
      const feed = document.getElementById("feedFilter");
      feed?.querySelector('.feed-tab[data-feed="instore"]')?.click();
      document.getElementById("feedStickySentinel")?.scrollIntoView({ behavior: "smooth", block: "start" });
      toast("已为你推荐可订套餐与到店服务");
      return;
    }
    if (act === "canteen") {
      openSiteSheet();
      toast("选择济南供餐 / 服务门店");
      return;
    }
    if (act === "consult" || act === "open") {
      goAgent("", act === "consult" ? "健康咨询：控糖、血压和认知训练怎么看？" : "");
      return;
    }
    if (act === "face") return goAgent("face", "帮我做一次AI面诊示意");
    if (act === "tongue") return goAgent("tongue", "帮我做一次AI舌诊示意");
    if (act === "report") return goAgent("report", "我上传了体检报告，帮我解读");
    if (act === "camera") return goAgent("camera", "拍照识别体检报告");
  });

  // 事找人推送条
  if (window.MallPushFeed?.renderStrip) {
    window.MallPushFeed.renderStrip(document.getElementById("pushStripList"));
  }

  function syncLocName(site) {
    const el = document.getElementById("locName") || document.querySelector(".loc-name");
    if (!el || !site) return;
    const name = site.shortName || site.name || "选择站点";
    el.textContent = name;
    const agentSite = document.getElementById("agentSiteName");
    if (agentSite) agentSite.textContent = name;
  }

  function closeSiteSheet() {
    const mask = document.getElementById("siteMask");
    const sheet = document.getElementById("siteSheet");
    const btn = document.getElementById("btnSitePick");
    if (mask) {
      mask.hidden = true;
      mask.setAttribute("hidden", "");
    }
    if (sheet) {
      sheet.hidden = true;
      sheet.setAttribute("hidden", "");
    }
    btn?.setAttribute("aria-expanded", "false");
  }

  function openSiteSheet() {
    if (isDesigner) return;
    const api = window.MALL_SITES;
    if (!api) {
      toast("站点数据未加载");
      return;
    }
    const mask = document.getElementById("siteMask");
    const sheet = document.getElementById("siteSheet");
    const listEl = document.getElementById("siteList");
    const tipEl = document.getElementById("siteSheetTip");
    const btn = document.getElementById("btnSitePick");
    if (!sheet || !listEl) return;

    const pack = api.getSitePickerOptions();
    const current = api.resolveCurrentSite();
    if (tipEl) {
      tipEl.textContent =
        pack.mode === "bound"
          ? "默认展示长者绑定机构，也可切换其他站点"
          : "未绑定机构，已为你推荐距离最近的 6 个站点";
    }
    listEl.innerHTML = pack.list
      .map((s) => {
        const on = current && s.siteId === current.siteId;
        return `<button type="button" class="site-item${on ? " is-on" : ""}" data-site-id="${escapeHtml(s.siteId)}">
          <div class="site-item-main">
            <div class="site-item-name">
              <span>${escapeHtml(s.name)}</span>
              ${s.isBound ? `<span class="badge">已绑定</span>` : ""}
            </div>
            <div class="site-item-addr">${escapeHtml(s.address || "")}</div>
          </div>
          <div class="site-item-side">
            <span class="site-item-dist">${escapeHtml(s.distanceText || "")}</span>
            <i class="site-item-check" aria-hidden="true"></i>
          </div>
        </button>`;
      })
      .join("");

    if (mask) {
      mask.hidden = false;
      mask.removeAttribute("hidden");
    }
    sheet.hidden = false;
    sheet.removeAttribute("hidden");
    btn?.setAttribute("aria-expanded", "true");
  }

  function initSitePicker() {
    if (isDesigner) return;
    const api = window.MALL_SITES;
    if (!api) return;

    const current = api.resolveCurrentSite();
    if (current) {
      api.setSelectedSiteId(current.siteId);
      syncLocName(current);
      window.MALL_CURRENT_SITE = current;
    }

    document.getElementById("siteSheetClose")?.addEventListener("click", closeSiteSheet);
    document.getElementById("siteMask")?.addEventListener("click", closeSiteSheet);
    document.getElementById("siteList")?.addEventListener("click", (e) => {
      const item = e.target.closest("[data-site-id]");
      if (!item) return;
      const id = item.dataset.siteId || "";
      const site = api.findSite(id);
      if (!site) return;
      api.setSelectedSiteId(id);
      window.MALL_CURRENT_SITE = site;
      syncLocName(site);
      closeSiteSheet();
      toast(`已切换至${site.shortName || site.name}`);
    });
  }

  /* ---------- 广播站：金刚区与智伴卡片之间的一行轮播 ---------- */
  function initBroadcast() {
    const section = document.getElementById("broadcast");
    const track = document.getElementById("broadcastTrack");
    if (!track || !section) return;

    const items = window.MALL_BROADCASTS || [];
    if (!items.length) {
      section.hidden = true;
      return;
    }

    // 只保留一个 button，避免多个隐藏按钮干扰无障碍点击命中
    track.innerHTML = `<button type="button" class="broadcast-item is-current" data-index="0" aria-label="${items[0].title.replace(/"/g, "&quot;")}">
      <span class="broadcast-item-text">${items[0].title}</span>
    </button>`;
    section.dataset.broadcastCurrent = "0";

    let current = 0;
    const btn = track.querySelector(".broadcast-item");

    function update() {
      const it = items[current];
      btn.dataset.index = String(current);
      btn.setAttribute("aria-label", it.title);
      btn.querySelector(".broadcast-item-text").textContent = it.title;
      section.dataset.broadcastCurrent = String(current);
    }

    const timer = setInterval(() => {
      current = (current + 1) % items.length;
      update();
    }, 3500);

    const more = section.querySelector(".broadcast-more-wrap");
    more?.addEventListener("click", (e) => {
      e.stopPropagation();
      if (isDesigner) return;
      location.href = "./broadcast.html";
    });

    // 点击当前轮播条目进入对应详情
    section.addEventListener("click", () => {
      if (isDesigner) return;
      const it = items[current];
      if (it?.id) {
        location.href = `./broadcast-detail.html?id=${encodeURIComponent(it.id)}`;
        return;
      }
      location.href = "./broadcast.html";
    });

    // 清理（单页应用重入时避免多个 timer）
    window.addEventListener("beforeunload", () => clearInterval(timer));
  }

  document.getElementById("btnSitePick")?.addEventListener("click", () => {
    openSiteSheet();
  });

  document.querySelector(".capsule-more")?.addEventListener("click", () => {
    toast("更多菜单");
  });

  document.querySelector(".capsule-home")?.addEventListener("click", () => {
    toast("返回微信");
  });

  document.querySelector(".tabbar")?.addEventListener("click", (e) => {
    const tab = e.target.closest(".tab, .tab-item");
    if (!tab || tab.classList.contains("tab-agent") || tab.classList.contains("tab-mid")) return;
    if (isDesigner) {
      e.preventDefault();
      return;
    }
    if (tab.classList.contains("active")) return;
    const label = tab.querySelector("span")?.textContent?.trim() || "";
    const base = window.MALL_PAGE_BASE || "./";
    if (label === "我的") {
      e.preventDefault();
      location.href = `${base}mine.html`;
      return;
    }
    if (label === "首页") {
      e.preventDefault();
      location.href = `${base}home.html`;
      return;
    }
    if (label === "健康") {
      e.preventDefault();
      location.href = `${base}health-service/index.html`;
      return;
    }
    if (label === "商城") {
      e.preventDefault();
      location.href = `${base}index.html`;
      return;
    }
  });

  /* —— 通屏背景：自动轮播 + 手动滑动 —— */
  function initHeroStage() {
    const stage = document.getElementById("heroStage");
    const track = document.getElementById("heroTrack");
    const dotsWrap = document.getElementById("heroDots");
    const content = document.getElementById("mainContent");
    const swipeSurface =
      document.getElementById("heroSwipe") ||
      document.getElementById("heroGap") ||
      stage;
    if (!stage || !track || !dotsWrap) return null;

    const slides = () => Array.from(track.querySelectorAll(".hero-slide"));
    if (!slides().length) return null;

    let index = 0;
    let autoTimer;
    let drag = {
      active: false,
      axis: null,
      startX: 0,
      startY: 0,
      dx: 0,
      width: 0,
      pointerId: null,
      moved: false,
    };

    function renderDots() {
      const list = slides();
      dotsWrap.innerHTML = list
        .map(
          (_, i) =>
            `<button type="button" class="hero-dot${i === index ? " active" : ""}" data-dot="${i}" aria-label="第 ${i + 1} 张"></button>`
        )
        .join("");
    }

    function go(to, { animate = true } = {}) {
      const list = slides();
      if (!list.length) return;
      index = ((to % list.length) + list.length) % list.length;
      if (!animate) track.style.transition = "none";
      else track.style.transition = "";
      track.style.transform = `translate3d(${-index * 100}%, 0, 0)`;
      if (!animate) {
        void track.offsetWidth;
        track.style.transition = "";
      }
      list.forEach((slide, i) => {
        slide.classList.toggle("is-active", i === index);
      });
      dotsWrap.querySelectorAll(".hero-dot").forEach((dot, i) => {
        dot.classList.toggle("active", i === index);
      });
      setPageBg();
    }

    function pause() {
      clearInterval(autoTimer);
      autoTimer = null;
    }

    function resume(ms = 4800) {
      pause();
      if (isDesigner) return;
      if (slides().length < 2) return;
      autoTimer = setInterval(() => go(index + 1), ms);
    }

    function dragOffset(dx) {
      const w = drag.width || stage.clientWidth || 1;
      const list = slides();
      let x = dx;
      if ((index === 0 && x > 0) || (index === list.length - 1 && x < 0)) {
        x *= 0.35;
      }
      const pct = -index * 100 + (x / w) * 100;
      track.style.transform = `translate3d(${pct}%, 0, 0)`;
    }

    function openActiveSlide() {
      if (isDesigner) return;
      const slide = slides()[index];
      if (!slide) return;
      const fallback = DEFAULT_BANNER_LINKS[index] || {};
      const href =
        slide.dataset.href ||
        window.resolveMallLinkHref?.(
          slide.dataset.linkType || fallback.linkType,
          slide.dataset.linkId || fallback.linkId,
          window.MALL_PAGE_BASE || "./"
        );
      if (href) location.href = href;
    }

    function endDrag() {
      if (!drag.active) return;
      const wasHorizontal = drag.axis === "h";
      const wasTap = !drag.moved && Math.abs(drag.dx) <= 8;
      const dx = drag.dx;
      const w = drag.width || stage.clientWidth || 1;
      swipeSurface.classList.remove("is-dragging");
      drag.active = false;
      drag.axis = null;
      drag.pointerId = null;
      track.style.transition = "";
      if (!wasHorizontal) {
        go(index);
        resume();
        if (wasTap) openActiveSlide();
        return;
      }
      const threshold = Math.min(56, w * 0.18);
      if (dx <= -threshold) go(index + 1);
      else if (dx >= threshold) go(index - 1);
      else go(index);
      resume();
    }

    function onPointerDown(e) {
      if (isDesigner) return;
      if (e.target.closest(".hero-dot")) return;
      if (e.pointerType === "mouse" && e.button !== 0) return;
      const point = e.touches ? e.touches[0] : e;
      drag.active = true;
      drag.axis = null;
      drag.moved = false;
      drag.startX = point.clientX;
      drag.startY = point.clientY;
      drag.dx = 0;
      drag.width = stage.clientWidth || swipeSurface.clientWidth || 1;
      drag.pointerId = e.pointerId;
      pause();
      track.style.transition = "none";
      swipeSurface.classList.add("is-dragging");
      try {
        swipeSurface.setPointerCapture?.(e.pointerId);
      } catch (_) {}
    }

    function onPointerMove(e) {
      if (!drag.active) return;
      if (drag.pointerId != null && e.pointerId != null && e.pointerId !== drag.pointerId) return;
      const point = e.touches ? e.touches[0] : e;
      const dx = point.clientX - drag.startX;
      const dy = point.clientY - drag.startY;
      if (!drag.axis) {
        if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
        drag.moved = true;
        drag.axis = Math.abs(dx) > Math.abs(dy) ? "h" : "v";
        if (drag.axis === "v") {
          track.style.transition = "";
          go(index);
          drag.active = false;
          swipeSurface.classList.remove("is-dragging");
          resume();
          return;
        }
        if (slides().length < 2) {
          drag.active = false;
          swipeSurface.classList.remove("is-dragging");
          resume();
          return;
        }
      }
      if (drag.axis !== "h") return;
      drag.moved = true;
      if (e.cancelable) e.preventDefault();
      drag.dx = dx;
      dragOffset(dx);
    }

    function onPointerUp(e) {
      if (drag.pointerId != null && e.pointerId != null && e.pointerId !== drag.pointerId) return;
      endDrag();
    }

    // Pointer Events（含触控与鼠标）
    swipeSurface.addEventListener("pointerdown", onPointerDown);
    swipeSurface.addEventListener("pointermove", onPointerMove);
    swipeSurface.addEventListener("pointerup", onPointerUp);
    swipeSurface.addEventListener("pointercancel", onPointerUp);

    swipeSurface.addEventListener("click", (e) => {
      if (isDesigner) return;
      if (e.target.closest(".hero-dot")) return;
      if (drag.moved || Math.abs(drag.dx) > 8) return;
      openActiveSlide();
    });
    track.addEventListener("click", (e) => {
      if (isDesigner) return;
      if (e.target.closest(".hero-dot")) return;
      if (drag.moved || Math.abs(drag.dx) > 8) return;
      openActiveSlide();
    });
    track.addEventListener("keydown", (e) => {
      if (isDesigner) return;
      if (e.key !== "Enter" && e.key !== " ") return;
      const href = e.target.closest(".hero-slide")?.dataset?.href;
      if (!href) return;
      e.preventDefault();
      location.href = href;
    });

    dotsWrap.addEventListener("click", (e) => {
      const dot = e.target.closest("[data-dot]");
      if (!dot) return;
      pause();
      go(Number(dot.dataset.dot) || 0);
      resume();
    });

    renderDots();
    go(0);
    resume();

    if (content) {
      const app = document.getElementById("app");
      content.addEventListener(
        "scroll",
        () => {
          const y = content.scrollTop;
          // 与内容区同步上移，Banner 正常滚走（不再慢速视差滞留）
          stage.style.transform = `translate3d(0, ${-y}px, 0)`;
          app?.classList.toggle("is-scrolled", y > 48);
        },
        { passive: true }
      );
    }

    return {
      go,
      pause,
      resume,
      refresh() {
        const list = slides();
        if (!list.length) return;
        if (index >= list.length) index = 0;
        renderDots();
        go(index, { animate: false });
        resume();
      },
      getIndex: () => index,
      getCount: () => slides().length,
    };
  }

  let homeCfg = loadHomeConfig();
  applyHomeConfig(homeCfg);
  setPageBg();
  renderCatalog();
  applyFeatureOverride(homeCfg);
  renderKingkong();
  syncFeedTabs();
  applyFilter();
  const heroApi = initHeroStage();
  initFeedSticky();
  initSitePicker();
  initBroadcast();

  function initFeedSticky() {
    const filter = document.getElementById("feedFilter");
    const sentinel = document.getElementById("feedStickySentinel");
    const content = document.getElementById("mainContent");
    if (!filter || !sentinel || !content) return;

    const syncStuck = () => {
      const cr = content.getBoundingClientRect();
      const sr = sentinel.getBoundingClientRect();
      filter.classList.toggle("is-stuck", sr.bottom <= cr.top + 1);
    };

    content.addEventListener("scroll", syncStuck, { passive: true });
    syncStuck();
  }

  window.MALL_HOME = {
    renderCatalog,
    renderKingkong,
    applyFilter,
    applyHomeConfig,
    syncHeroSlides,
    resolveAsset,
    goHero(i) {
      heroApi?.go(i);
    },
    pauseHero() {
      heroApi?.pause();
    },
    getHeroIndex() {
      return heroApi?.getIndex?.() ?? 0;
    },
    refreshHero() {
      heroApi?.refresh?.();
    },
    reload() {
      const cfg = loadHomeConfig();
      homeCfg = cfg;
      applyHomeConfig(cfg);
      heroApi?.refresh?.();
      renderCatalog();
      applyFeatureOverride(cfg);
      renderKingkong();
      applyFilter();
    },
  };
})();
