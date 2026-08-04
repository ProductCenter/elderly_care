(() => {
  const toastEl = document.getElementById("toast");
  let toastTimer;

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
    if (!id) return;
    location.href = `./detail.html?id=${encodeURIComponent(id)}`;
  }

  const OPS_TAGS = new Set(["最热", "热门", "热销", "新品", "公益"]);
  const SALES_MIN = 100;

  function distText(p) {
    const key = p.productAttr || p.serviceType || "";
    if (key === "goods") {
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

  let filterState = { cat: "all" };

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
        img.src = featured.cover;
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
        return `<article class="mt-card" data-cat="${p.cat || ""}" data-attr="${attr.key}" data-id="${p.id}" data-service="${attr.key}" role="link" tabindex="0">
            <div class="mt-pic">
              <img src="${p.cover}" alt="${p.name}" loading="lazy" />
              <span class="mt-corner ${attr.mtTagClass}">${attr.short}</span>
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
    const pages = grid.querySelectorAll(".kk-page");
    if (!pages.length) {
      grid.style.height = "";
      return;
    }
    const pageW = grid.clientWidth || 1;
    const idx = Math.min(
      Math.max(Math.round(grid.scrollLeft / pageW), 0),
      pages.length - 1
    );
    const page = pages[idx];
    // 子页自身高度不受容器裁剪影响，直接按行数实测
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
    return `<button type="button" class="kk-item i-${item.icon}${active}" data-id="${item.id}" data-group="${item.group}" title="${item.fullName}">
      <span class="kk-icon" aria-hidden="true">${svg}</span>
      <span class="kk-name">${item.name}</span>
    </button>`;
  }

  function renderKingkong() {
    const grid = document.getElementById("kingkongGrid");
    const list = window.MALL_KINGKONG || [];
    if (!grid) return;
    const keepLeft = grid.scrollLeft;
    const pages = getKingkongPageCount();
    const pageHtml = [];
    for (let p = 0; p < pages; p++) {
      const slice = list.slice(p * KK_PER_PAGE, (p + 1) * KK_PER_PAGE);
      const rows = Math.max(1, Math.ceil(slice.length / KK_COLS));
      pageHtml.push(
        `<div class="kk-page" data-page="${p}" data-rows="${rows}" style="--kk-rows:${rows}">${slice
          .map(renderKingkongItem)
          .join("")}</div>`
      );
    }
    grid.innerHTML = pageHtml.join("");
    grid.scrollLeft = keepLeft;
    renderKingkongDots(kkPageIndex);
    // 等布局完成后再量高，保证下方模块跟随
    requestAnimationFrame(() => {
      syncKingkongHeight();
      syncKingkongDotsFromScroll();
    });
  }

  function applyFilter() {
    const { cat } = filterState;
    document.querySelectorAll(".feature-card").forEach((card) => {
      const cardCat = card.dataset.cat || "";
      const show = cat === "all" || cardCat === cat;
      card.classList.toggle("is-hidden", !show);
    });

    const rightStack = document.querySelector(".right-stack");
    if (rightStack) {
      rightStack.classList.toggle("is-hidden", cat !== "all");
    }

    // 瀑布流：筛选后按可见卡片重新左右交错排布
    const grid = document.getElementById("goodsGrid");
    if (!grid) return;
    const cards = Array.from(grid.querySelectorAll(".mt-card"));
    if (!cards.length) return;
    cards.forEach((card) => {
      const cardCat = card.dataset.cat || "";
      const show = cat === "all" || cardCat === cat;
      card.classList.toggle("is-hidden", !show);
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
    // 隐藏的卡片挂到末尾容器外隐藏，避免占位
    const hidden = cards.filter((c) => c.classList.contains("is-hidden"));
    hidden.forEach((card) => cols[0].appendChild(card));
  }

  function setCat(catId) {
    const item = (window.MALL_KINGKONG || []).find((i) => i.id === catId);
    if (!item) return;
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

  document.getElementById("kingkongGrid")?.addEventListener(
    "scroll",
    () => {
      syncKingkongDotsFromScroll();
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
    toast("搜索服务 / 商品");
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
    const id = document.querySelector(".feature-card")?.dataset.id || "ai_massage";
    location.href = `./detail.html?id=${encodeURIComponent(id)}`;
  });

  document.querySelector(".discount-card")?.addEventListener("click", () => {
    toast("超低折扣活动");
  });

  document.querySelector(".location-btn")?.addEventListener("click", () => {
    toast("选择服务站点");
  });

  document.querySelector(".capsule-more")?.addEventListener("click", () => {
    toast("更多菜单");
  });

  document.querySelector(".capsule-home")?.addEventListener("click", () => {
    toast("返回微信");
  });

  document.querySelectorAll(".tabbar > .tab").forEach((tab) => {
    tab.addEventListener("click", (e) => {
      if (tab.classList.contains("active")) return;
      const label = tab.querySelector("span")?.textContent || "";
      if (label === "我的") {
        e.preventDefault();
        location.href = "./mine.html";
        return;
      }
      if (label === "首页") {
        e.preventDefault();
        location.href = "./index.html";
        return;
      }
      if (label === "健康") {
        e.preventDefault();
        location.href = "./sleep-todo.html";
        return;
      }
      e.preventDefault();
      toast(`${label}开发中`);
    });
  });

  /* —— 通屏背景：自动轮播（无跟手/视差/点击切换） —— */
  function initHeroStage() {
    const stage = document.getElementById("heroStage");
    const track = document.getElementById("heroTrack");
    const dotsWrap = document.getElementById("heroDots");
    const content = document.getElementById("mainContent");
    if (!stage || !track || !dotsWrap) return;

    const slides = Array.from(track.querySelectorAll(".hero-slide"));
    if (!slides.length) return;

    let index = 0;
    let autoTimer;

    function renderDots() {
      dotsWrap.innerHTML = slides
        .map(
          (_, i) =>
            `<span class="hero-dot${i === index ? " active" : ""}" aria-hidden="true"></span>`
        )
        .join("");
    }

    function go(to) {
      index = ((to % slides.length) + slides.length) % slides.length;
      track.style.transform = `translate3d(${-index * 100}%, 0, 0)`;
      slides.forEach((slide, i) => {
        slide.classList.toggle("is-active", i === index);
      });
      dotsWrap.querySelectorAll(".hero-dot").forEach((dot, i) => {
        dot.classList.toggle("active", i === index);
      });
    }

    renderDots();
    go(0);
    autoTimer = setInterval(() => go(index + 1), 4800);

    if (content) {
      const app = document.getElementById("app");
      content.addEventListener(
        "scroll",
        () => {
          const y = content.scrollTop;
          stage.style.transform = `translate3d(0, ${-Math.min(y, 220) * 0.35}px, 0)`;
          app?.classList.toggle("is-scrolled", y > 48);
        },
        { passive: true }
      );
    }

    return () => clearInterval(autoTimer);
  }

  renderCatalog();
  renderKingkong();
  applyFilter();
  initHeroStage();
})();
