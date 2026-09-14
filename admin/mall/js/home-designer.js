(() => {
  const STORE_KEY = "kangyang-admin:mall:home-config";
  const ASSET = "../../assets";

  const LAYERS = [
    { id: "banner", label: "顶部 Banner", desc: "预览轮播帧；内容请到 Banner 管理维护", ico: "01" },
    { id: "kingkong", label: "金刚区", desc: "分类入口（真实数据）", ico: "02" },
    { id: "feature", label: "主推服务卡", desc: "左侧大卡推荐位", ico: "03" },
    { id: "coupon", label: "服务券", desc: "右侧优惠券卡", ico: "04" },
    { id: "discount", label: "折扣卡", desc: "超低折扣模块", ico: "05" },
    { id: "goods", label: "商品双列", desc: "瀑布流商品卡", ico: "06" },
  ];

  const DEFAULT_PAGE_BG = "#f7f7f7";
  const PAGE_BG_PRESETS = [
    { label: "浅灰", color: "#f7f7f7" },
    { label: "暖杏", color: "#ffe0cc" },
    { label: "薄荷绿", color: "#c6ebd8" },
    { label: "天空蓝", color: "#c9ddf7" },
    { label: "淡紫", color: "#e2d8f5" },
    { label: "蜜桃", color: "#ffc9b8" },
  ];

  /** 换图时给一帧匹配的默认背景色（偏饱和，便于看出联动） */
  const BG_BY_IMAGE = {
    "cover-ai-massage.png": "#ffe0cc",
    "cover-nutrition-meal.png": "#c6ebd8",
    "cover-health-check.png": "#c9ddf7",
    "cover-foot-spa.png": "#f5d9c8",
    "cover-neck-massage.png": "#e2d8f5",
    "cover-therapy-device.png": "#d5e4f5",
  };

  const DEFAULT_BANNERS = [
    {
      image: `${ASSET}/cover-ai-massage.png`,
      eyebrow: "春风优选 · 到店理疗",
      title: "AI 舒压\n一键放松",
      sub: "智能理疗 · 限时体验",
      bg: "#ffe0cc",
      status: "上架",
      linkType: "activity",
      linkId: "act_massage_trial",
    },
    {
      image: `${ASSET}/cover-nutrition-meal.png`,
      eyebrow: "营养配餐 · 社区直达",
      title: "暖心简餐\n每日新鲜",
      sub: "低盐少油 · 适合长者",
      bg: "#c6ebd8",
      status: "上架",
      linkType: "activity",
      linkId: "act_meal_month",
    },
    {
      image: `${ASSET}/cover-health-check.png`,
      eyebrow: "健康守护 · 上门服务",
      title: "体检套餐\n安心守护",
      sub: "专业评估 · 报告解读",
      bg: "#c9ddf7",
      status: "上架",
      linkType: "activity",
      linkId: "act_free_check",
    },
  ];

  function defaultConfig() {
    const kk = (window.MALL_KINGKONG || []).map((item) => ({
      id: item.id,
      name: item.name,
      fullName: item.fullName || item.name,
      icon: item.icon,
      group: item.group,
    }));
    const featured =
      Object.values(window.MALL_PRODUCTS || {}).find((p) => p.featured) ||
      window.MALL_PRODUCTS?.ai_massage;
    return {
      location: "春风社区中心站",
      pageBg: DEFAULT_PAGE_BG,
      banners: structuredClone(DEFAULT_BANNERS),
      kingkong: kk,
      feature: featured
        ? {
            productId: featured.id,
            title: featured.name,
            subtitle: featured.subtitle || "",
            features: (featured.features || []).join("\n"),
            hot: featured.tag || "最热",
            image: featured.cover?.replace("./assets/", `${ASSET}/`) || `${ASSET}/cover-ai-massage.png`,
            cta: "去看看",
          }
        : {
            productId: "ai_massage",
            title: "AI舒压理疗服务",
            subtitle: "45 分钟 · 智能分区舒缓",
            features: "身律动按摩\n压递推按摩\n脊足底加热",
            hot: "最热",
            image: `${ASSET}/cover-ai-massage.png`,
            cta: "去看看",
          },
      coupon: {
        title: "您有服务券限时可领",
        amount: "5",
        label: "服务满减券",
        btn: "立即领取",
      },
      discount: {
        label: "超低折扣",
        badge: "9.9折",
        banner: "一个月服务免费领",
        image: `${ASSET}/discount-lifestyle.png`,
      },
    };
  }

  let config = loadConfig();
  let active = null;
  let bannerIndex = 0;
  let toastTimer;

  const $ = (id) => document.getElementById(id);
  const phone = $("app");
  const inspBody = $("inspBody");
  const inspTitle = $("inspTitle");
  const inspDesc = $("inspDesc");
  const toastEl = $("hdToast");

  const GEAR_SVG =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M19.14 12.94c.04-.31.06-.63.06-.94s-.02-.63-.06-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.49.49 0 0 0-.59-.22l-2.39.96a7.2 7.2 0 0 0-1.62-.94l-.36-2.54a.48.48 0 0 0-.48-.41h-3.84a.48.48 0 0 0-.48.41l-.36 2.54c-.59.24-1.13.55-1.62.94l-2.39-.96a.49.49 0 0 0-.59.22L2.77 8.87a.48.48 0 0 0 .12.61l2.03 1.58c-.04.31-.07.63-.07.94s.03.63.07.94L2.89 14.52a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.3.59.22l2.39-.96c.5.39 1.04.7 1.62.94l.36 2.54c.05.22.25.41.48.41h3.84c.23 0 .43-.19.48-.41l.36-2.54c.59-.24 1.13-.55 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32a.49.49 0 0 0-.12-.61l-2.03-1.58zM12 15.6A3.6 3.6 0 1 1 12 8.4a3.6 3.6 0 0 1 0 7.2z"/></svg>';

  const SET_TARGETS = [
    { edit: "banner", label: "编辑", mount: "phone", cls: "hd-set-banner" },
    { edit: "kingkong", selector: ".kingkong", label: "编辑" },
    { edit: "feature", selector: ".feature-card", label: "编辑" },
    { edit: "coupon", selector: ".coupon-card", label: "编辑" },
    { edit: "discount", selector: ".discount-card", label: "编辑" },
    { edit: "goods", selector: "#goodsGrid", label: "编辑" },
  ];

  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.hidden = false;
    requestAnimationFrame(() => toastEl.classList.add("show"));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastEl.classList.remove("show");
      setTimeout(() => {
        toastEl.hidden = true;
      }, 200);
    }, 1600);
  }

  function flashSync(label) {
    const el = $("hdSyncHint");
    if (!el) return;
    el.innerHTML = `<i></i>${label || "本机已同步"}`;
  }

  function renderLayerNav() {
    const nav = $("hdLayerNav");
    if (!nav) return;
    nav.innerHTML = LAYERS.map(
      (layer) => `<button type="button" class="hd-layer${active === layer.id ? " on" : ""}" data-layer="${layer.id}">
        <span class="hd-layer-ico">${layer.ico}</span>
        <span class="hd-layer-copy">
          <strong>${esc(layer.label)}</strong>
          <span>${esc(layer.desc)}</span>
        </span>
        <span class="hd-layer-arrow" aria-hidden="true">›</span>
      </button>`
    ).join("");
  }

  function emptyInspectorHtml() {
    return `<div class="hd-empty">
      <strong>选择一个模块开始编辑</strong>
      <span>点击左侧结构，或预览机上的「编辑」按钮</span>
    </div>`;
  }

  function deepMerge(base, patch) {
    if (!patch || typeof patch !== "object") return base;
    const out = Array.isArray(base) ? [...base] : { ...base };
    Object.keys(patch).forEach((k) => {
      const v = patch[k];
      if (v && typeof v === "object" && !Array.isArray(v) && base[k] && typeof base[k] === "object") {
        out[k] = deepMerge(base[k], v);
      } else if (v !== undefined) {
        out[k] = v;
      }
    });
    return out;
  }

  function loadConfig() {
    const base = defaultConfig();
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (!raw) return base;
      const parsed = JSON.parse(raw);
      // 兼容旧版简化配置
      if (parsed.banner && !parsed.banners) {
        parsed.banners = [parsed.banner, ...structuredClone(DEFAULT_BANNERS).slice(1)];
        delete parsed.banner;
      }
      delete parsed.goods;
      const merged = deepMerge(base, parsed);
      // 旧配置：全局 pageBg / 缺 bg / 过浅旧色 → 补齐可辨认的联动背景色
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
      const fallbackBg = merged.pageBg || DEFAULT_PAGE_BG;
      (merged.banners || []).forEach((b, i) => {
        const file = String(b.image || "").split("/").pop();
        const guessed = BG_BY_IMAGE[file] || DEFAULT_BANNERS[i]?.bg || fallbackBg;
        if (!b.bg || WEAK_BGS.has(String(b.bg).toLowerCase())) {
          b.bg = guessed;
        }
      });
      return merged;
    } catch {
      return base;
    }
  }

  function esc(s) {
    return String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function titleToHtml(title) {
    return esc(title).replace(/\n/g, "<br />");
  }

  function resolveSrc(src) {
    if (!src) return src;
    if (String(src).startsWith("data:image/") || String(src).startsWith("blob:")) return src;
    const m = String(src).match(/(?:(?:\.\.\/)+|\.\/)?assets\/(.+)$/);
    if (m) return `${ASSET}/${m[1]}`;
    return src;
  }

  /** 持久化统一为 ./assets/…，商城与设计器各自 resolve；dataURL 原样保存 */
  function storeSrc(src) {
    if (!src) return src;
    if (String(src).startsWith("data:image/")) return src;
    const m = String(src).match(/(?:(?:\.\.\/)+|\.\/)?assets\/(.+)$/);
    if (m) return `./assets/${m[1]}`;
    return src;
  }

  function normalizeConfigForStore(cfg) {
    const out = structuredClone(cfg);
    (out.banners || []).forEach((b) => {
      if (b.image) b.image = storeSrc(b.image);
      if (b.status !== "下架") b.status = "上架";
    });
    if (out.feature?.image) out.feature.image = storeSrc(out.feature.image);
    if (out.discount?.image) out.discount.image = storeSrc(out.discount.image);
    return out;
  }

  function saveConfig(silent) {
    localStorage.setItem(STORE_KEY, JSON.stringify(normalizeConfigForStore(config)));
    flashSync("本机已同步");
    if (!silent) toast("已保存，商城首页将同步此配置");
  }

  function bannerBgAt(i) {
    const b = config.banners?.[i];
    return (b && b.bg) || config.pageBg || DEFAULT_PAGE_BG;
  }

  function guessBgForImage(src) {
    const file = String(src || "").split("/").pop();
    return BG_BY_IMAGE[file] || DEFAULT_PAGE_BG;
  }

  function applyBannerSlide(i, b) {
    const slide = document.querySelector(`#heroTrack .hero-slide[data-index="${i}"]`);
    if (!slide || !b) return;
    if (b.bg) slide.dataset.bg = b.bg;
    else delete slide.dataset.bg;
    const img = slide.querySelector(".hero-img");
    const eye = slide.querySelector(".hero-eyebrow");
    const title = slide.querySelector(".hero-title");
    const sub = slide.querySelector(".hero-sub");
    if (img && b.image) {
      // 直接写 src，保证每次修改都触发刷新
      img.src = resolveSrc(b.image);
    }
    if (eye) eye.textContent = b.eyebrow || "";
    if (title) title.innerHTML = titleToHtml(b.title || "");
    if (sub) sub.textContent = b.sub || "";
  }

  function applyPageBg(color) {
    const bg = color || DEFAULT_PAGE_BG;
    phone?.style?.setProperty("--wx-bg", bg);
    phone?.style?.setProperty("--wx-bg-rgb", hexToRgbCsv(bg));
    if (phone) phone.style.backgroundColor = bg;
  }

  function hexToRgbCsv(hex) {
    const m = String(hex || "").trim().match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i);
    if (!m) return "247, 247, 247";
    let h = m[1];
    if (h.length === 3) h = h.split("").map((c) => c + c).join("");
    const n = parseInt(h, 16);
    return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
  }

  /** 把配置应用到真实商城 DOM（与 mall.js 共用结构） */
  function applyToPreview() {
    const loc = document.querySelector(".loc-name");
    if (loc) loc.textContent = config.location || "";

    // 与 Banner 管理共用配置：重建轮播帧
    if (window.MALL_HOME?.syncHeroSlides) {
      window.MALL_HOME.syncHeroSlides(config);
      window.MALL_HOME.refreshHero?.();
    } else {
      (config.banners || []).forEach((b, i) => applyBannerSlide(i, b));
    }

    // 设计器内：预览切到当前编辑的 Banner 帧并暂停轮播；背景跟随当前帧
    window.MALL_HOME?.pauseHero?.();
    if (active === "banner") {
      window.MALL_HOME?.goHero?.(bannerIndex);
      applyPageBg(bannerBgAt(bannerIndex));
    } else {
      const idx = window.MALL_HOME?.getHeroIndex?.() ?? 0;
      applyPageBg(bannerBgAt(idx));
    }

    // 金刚区：写回 MALL_KINGKONG 后重渲染
    if (Array.isArray(config.kingkong) && Array.isArray(window.MALL_KINGKONG)) {
      config.kingkong.forEach((item, i) => {
        if (!window.MALL_KINGKONG[i] || !item) return;
        if (item.name != null) window.MALL_KINGKONG[i].name = item.name;
        if (item.fullName != null) window.MALL_KINGKONG[i].fullName = item.fullName;
      });
      window.MALL_HOME?.renderKingkong?.();
    }

    const f = config.feature || {};
    const featureCard = document.querySelector(".feature-card");
    if (featureCard) {
      if (f.productId) featureCard.dataset.id = f.productId;
      const h2 = featureCard.querySelector("h2");
      const sub = featureCard.querySelector(".feature-sub");
      const list = featureCard.querySelector(".feature-list");
      const hot = featureCard.querySelector(".hot-tag");
      const img = featureCard.querySelector(".feature-img");
      const cta = featureCard.querySelector(".cta-buy");
      if (h2) h2.textContent = f.title || "";
      if (sub) sub.textContent = f.subtitle || "";
      if (list) {
        list.innerHTML = String(f.features || "")
          .split("\n")
          .filter(Boolean)
          .slice(0, 3)
          .map((x) => `<li>${esc(x)}</li>`)
          .join("");
      }
      if (hot) {
        hot.hidden = !f.hot;
        hot.textContent = f.hot || "";
      }
      if (img && f.image) {
        img.src = resolveSrc(f.image);
        img.alt = f.title || "";
      }
      if (cta) cta.textContent = f.cta || "去看看";
    }

    const c = config.coupon || {};
    const coupon = document.querySelector(".coupon-card");
    if (coupon) {
      const t = coupon.querySelector(".coupon-title");
      const amt = coupon.querySelector(".coupon-amount");
      const label = coupon.querySelector(".coupon-info > span");
      const btn = coupon.querySelector(".claim-btn");
      if (t) t.textContent = c.title || "";
      if (amt) amt.innerHTML = `<em>¥</em>${esc(c.amount || "0")}`;
      if (label) label.textContent = c.label || "";
      if (btn && btn.dataset.claimed !== "1") btn.textContent = c.btn || "立即领取";
    }

    const d = config.discount || {};
    const disc = document.querySelector(".discount-card");
    if (disc) {
      const label = disc.querySelector(".discount-head span");
      const badge = disc.querySelector(".discount-head strong");
      const ban = disc.querySelector(".discount-banner");
      const img = disc.querySelector("img");
      if (label) label.textContent = d.label || "";
      if (badge) badge.textContent = d.badge || "";
      if (ban) ban.textContent = d.banner || "";
      if (img && d.image) img.src = resolveSrc(d.image);
    }

    highlightActive();
    mountSettingsButtons();
  }

  function mountSettingsButtons() {
    // phone 级按钮先清掉再挂，避免重复 / 旧位置残留
    phone.querySelectorAll(".hd-set-btn.hd-set-banner, .hd-set-btn.hd-set-pagebg").forEach((el) => el.remove());
    phone.classList.remove("hd-pagebg-on");
    document.getElementById("heroStage")?.classList.remove("hd-set-host");

    SET_TARGETS.forEach(({ edit, selector, label, mount, cls }) => {
      const host = mount === "phone" ? phone : phone.querySelector(selector);
      if (!host) return;
      if (mount !== "phone") {
        host.classList.add("hd-set-host", "hd-hot");
        if (!host.dataset.edit) host.dataset.edit = edit;
      }
      if (host.querySelector(`:scope > .hd-set-btn[data-edit="${edit}"]`)) return;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = cls ? `hd-set-btn ${cls}` : "hd-set-btn";
      btn.dataset.edit = edit;
      btn.setAttribute("aria-label", `编辑${LAYERS.find((l) => l.id === edit)?.label || ""}`);
      btn.innerHTML = `${GEAR_SVG}<span>${label}</span>`;
      host.appendChild(btn);
    });

    // Banner 高亮宿主仍用 heroStage；页面背景仅通过按钮进入
    const stage = document.getElementById("heroStage");
    if (stage) {
      stage.classList.add("hd-hot");
      stage.dataset.edit = "banner";
    }
  }

  function highlightActive() {
    phone.querySelectorAll(".hd-hot").forEach((el) => {
      el.classList.toggle("is-active", el.dataset.edit === active);
    });
    phone.querySelectorAll(".hd-set-btn").forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.edit === active);
    });
    document.querySelectorAll("#hdLayerNav .hd-layer").forEach((btn) => {
      btn.classList.toggle("on", btn.dataset.layer === active);
    });
  }

  function field(key, label, value, type = "text") {
    if (type === "textarea") {
      return `<div class="hd-field"><label>${label}</label><textarea data-key="${key}">${esc(value)}</textarea></div>`;
    }
    return `<div class="hd-field"><label>${label}</label><input data-key="${key}" type="${type}" value="${esc(value)}" /></div>`;
  }

  function bindObjectForm(obj, onChange) {
    inspBody.querySelectorAll("[data-key]").forEach((el) => {
      el.addEventListener("input", () => {
        obj[el.dataset.key] = el.value;
        onChange?.();
        applyToPreview();
      });
    });
  }

  function renderInspector() {
    const meta = LAYERS.find((l) => l.id === active);
    if (!meta) {
      inspTitle.textContent = "属性配置";
      inspDesc.textContent = "从左侧结构或预览机选择模块";
      inspBody.innerHTML = emptyInspectorHtml();
      return;
    }
    inspTitle.textContent = meta.label;
    inspDesc.textContent = meta.desc;

    if (active === "banner") {
      window.MALL_HOME?.pauseHero?.();
      window.MALL_HOME?.goHero?.(bannerIndex);
      applyPageBg(bannerBgAt(bannerIndex));
      const slides = config.banners || [];
      if (!Array.isArray(config.banners) || !config.banners.length) {
        config.banners = structuredClone(DEFAULT_BANNERS);
      }
      const b = config.banners[bannerIndex] || config.banners[0];
      const bg = b.bg || bannerBgAt(bannerIndex) || DEFAULT_PAGE_BG;
      const typeLabel =
        (window.MALL_LINK_TYPES || []).find((t) => t.key === b.linkType)?.label || "未设置";
      const targetLabel =
        b.linkType && b.linkId
          ? window.getMallLinkLabel?.(b.linkType, b.linkId) || b.linkId
          : "—";
      const status = b.status || "上架";
      inspBody.innerHTML = `<div class="hd-form">
        <div class="hd-field"><label>预览帧（仅切换预览，不改内容）</label>
          <select id="bannerSelect">${slides
            .map((_, i) => `<option value="${i}" ${i === bannerIndex ? "selected" : ""}>第 ${i + 1} 帧</option>`)
            .join("")}</select>
        </div>
        <div class="hd-live-preview">
          <img id="bannerLiveImg" src="${esc(resolveSrc(b.image))}" alt="当前 Banner" />
          <div class="hd-live-copy">
            <p class="eye">${esc(b.eyebrow || "")}</p>
            <strong>${titleToHtml(b.title || "")}</strong>
            <p class="sub">${esc(b.sub || "")}</p>
          </div>
        </div>
        <div class="hd-readonly-meta">
          <div><span>状态</span><strong>${esc(status)}</strong></div>
          <div><span>联动背景</span><strong><i class="hd-bg-dot" style="background:${esc(bg)}"></i>${esc(bg)}</strong></div>
          <div><span>跳转</span><strong>${esc(typeLabel)} · ${esc(targetLabel)}</strong></div>
        </div>
        <p class="hd-note">图片、文案、背景色、跳转与上下架请到 <a href="./banners.html">Banner 管理</a> 维护，保存后会同步到本页预览。</p>
        <a class="btn btn-primary hd-banner-goto" href="./banners.html">去 Banner 管理</a>
      </div>`;

      $("bannerSelect")?.addEventListener("change", (e) => {
        bannerIndex = Number(e.target.value) || 0;
        window.MALL_HOME?.goHero?.(bannerIndex);
        applyPageBg(bannerBgAt(bannerIndex));
        renderInspector();
        highlightActive();
      });
      return;
    }

    if (active === "feature") {
      const f = config.feature;
      inspBody.innerHTML = `<div class="hd-form">
        ${field("productId", "关联商品 ID", f.productId)}
        ${field("title", "标题", f.title)}
        ${field("subtitle", "卖点", f.subtitle)}
        ${field("features", "卖点列表（每行一项）", f.features, "textarea")}
        ${field("hot", "运营角标", f.hot)}
        ${field("cta", "按钮文案", f.cta)}
        ${field("image", "图片地址", f.image)}
        <p class="hd-note">主推卡默认取商品库 featured 商品；此处修改会覆盖首页展示文案。</p>
      </div>`;
      bindObjectForm(f);
      return;
    }

    if (active === "coupon") {
      const c = config.coupon;
      inspBody.innerHTML = `<div class="hd-form">
        ${field("title", "标题", c.title)}
        ${field("amount", "面额", c.amount)}
        ${field("label", "券说明", c.label)}
        ${field("btn", "按钮文案", c.btn)}
      </div>`;
      bindObjectForm(c);
      return;
    }

    if (active === "discount") {
      const d = config.discount;
      inspBody.innerHTML = `<div class="hd-form">
        ${field("label", "左侧文案", d.label)}
        ${field("badge", "折扣角标", d.badge)}
        ${field("banner", "底部条", d.banner)}
        ${field("image", "图片地址", d.image)}
      </div>`;
      bindObjectForm(d);
      return;
    }

    if (active === "kingkong") {
      inspBody.innerHTML = `<div class="hd-form">
        <p class="hd-note">与线上一致：16 个入口、每页 10 个、两页指示点。可改显示名称。</p>
        <div class="hd-list-editor" id="kkEditor"></div>
      </div>`;
      const box = $("kkEditor");
      box.innerHTML = (config.kingkong || [])
        .map(
          (item, i) => `<div class="hd-list-row" style="grid-template-columns:1fr">
          <div style="display:grid;gap:6px">
            <input data-kk="${i}" data-field="name" value="${esc(item.name)}" placeholder="短名" />
            <input data-kk="${i}" data-field="fullName" value="${esc(item.fullName || "")}" placeholder="全称（点击 toast）" />
          </div>
        </div>`
        )
        .join("");
      box.querySelectorAll("[data-kk]").forEach((el) => {
        el.addEventListener("input", () => {
          const i = Number(el.dataset.kk);
          config.kingkong[i][el.dataset.field] = el.value;
          applyToPreview();
        });
      });
      return;
    }

    if (active === "goods") {
      const n = document.querySelectorAll("#goodsGrid .mt-card").length;
      inspBody.innerHTML = `<div class="hd-form">
        <p class="hd-note">商品双列由商品库 <code>MALL_PRODUCTS</code> 渲染（当前 ${n} 张卡），与线上首页一致。<br/>请到「商品管理」维护商品；本页仅展示真实瀑布流效果。</p>
        <a class="hd-btn hd-btn-primary" href="./products.html" style="justify-content:center">去商品管理</a>
      </div>`;
    }
  }

  function select(id) {
    active = id;
    if (id === "banner") {
      window.MALL_HOME?.pauseHero?.();
      window.MALL_HOME?.goHero?.(bannerIndex);
      applyPageBg(bannerBgAt(bannerIndex));
    }
    renderInspector();
    highlightActive();
  }

  $("hdLayerNav")?.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-layer]");
    if (!btn) return;
    select(btn.dataset.layer);
  });

  phone.addEventListener(
    "click",
    (e) => {
      const btn = e.target.closest(".hd-set-btn");
      if (btn) {
        e.preventDefault();
        e.stopPropagation();
        select(btn.dataset.edit);
        return;
      }
      // 点区域本体也可打开（排除普通交互控件）
      const hit = e.target.closest("[data-edit]");
      if (!hit || e.target.closest("button:not(.hd-set-btn), a, .kk-item")) return;
      e.preventDefault();
      e.stopPropagation();
      select(hit.dataset.edit);
    },
    true
  );

  $("btnSave")?.addEventListener("click", saveConfig);
  $("btnReset")?.addEventListener("click", () => {
    if (!confirm("确定恢复默认首页配置？")) return;
    localStorage.removeItem(STORE_KEY);
    config = defaultConfig();
    active = null;
    applyToPreview();
    renderInspector();
    highlightActive();
    toast("已恢复默认");
  });

  // mall.js 先跑完；再挂设计器
  renderLayerNav();
  mountSettingsButtons();
  applyToPreview();
  // 旧配置补齐 bg 后立刻落盘，保证商城首页也能读到联动色
  saveConfig(true);
  renderInspector();
})();
