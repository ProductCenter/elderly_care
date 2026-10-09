(() => {
  const toastEl = document.getElementById("toast");
  let toastTimer;
  let order = null;
  let tickets = [];
  let activeIndex = 0;

  // 默认门店坐标（科技金融大厦）；旧订单无坐标时回退
  const DEFAULT_STORE = {
    name: "春风康养 · 历下旗舰店",
    address: "山东省济南市历下区姚家街道科技金融大厦",
    phone: "010-64001234",
    lat: 39.9245,
    lng: 116.4345,
  };

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

  function syncTime() {
    const el = document.querySelector(".status-time");
    if (!el) return;
    const n = new Date();
    el.textContent = `${String(n.getHours()).padStart(2, "0")}:${String(
      n.getMinutes()
    ).padStart(2, "0")}`;
  }
  syncTime();
  setInterval(syncTime, 30_000);

  function fmt(ts) {
    if (!ts) return "—";
    const d = new Date(ts);
    const p = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
  }

  function currentTicket() {
    return tickets[activeIndex] || null;
  }

  function getStoreGeo(o) {
    const lat = Number(o.storeLat);
    const lng = Number(o.storeLng);
    return {
      name: o.storeName || DEFAULT_STORE.name,
      address: o.storeAddress || DEFAULT_STORE.address,
      phone: o.storePhone || DEFAULT_STORE.phone,
      lat: Number.isFinite(lat) && lat !== 0 ? lat : DEFAULT_STORE.lat,
      lng: Number.isFinite(lng) && lng !== 0 ? lng : DEFAULT_STORE.lng,
    };
  }

  function buildOsmEmbed(lat, lng) {
    const d = 0.008;
    const minLon = lng - d;
    const minLat = lat - d * 0.7;
    const maxLon = lng + d;
    const maxLat = lat + d * 0.7;
    return `https://www.openstreetmap.org/export/embed.html?bbox=${minLon}%2C${minLat}%2C${maxLon}%2C${maxLat}&layer=mapnik&marker=${lat}%2C${lng}`;
  }

  function buildOsmBrowse(lat, lng) {
    return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=17/${lat}/${lng}`;
  }

  function openNavSheet() {
    if (!order || order.serviceType !== "instore") return;
    const store = getStoreGeo(order);
    document.getElementById("navSheetAddr").textContent = store.address;
    document.getElementById("navSheet").hidden = false;
  }

  function closeNavSheet() {
    document.getElementById("navSheet").hidden = true;
  }

  function openMapApp(type) {
    const store = getStoreGeo(order);
    const { lat, lng, name, address } = store;
    const encName = encodeURIComponent(name);
    const encAddr = encodeURIComponent(address);

    let url = "";
    if (type === "amap") {
      url = `https://uri.amap.com/marker?position=${lng},${lat}&name=${encName}&coordinate=gaode&callnative=1`;
    } else if (type === "baidu") {
      url = `https://api.map.baidu.com/marker?location=${lat},${lng}&title=${encName}&content=${encAddr}&output=html&coord_type=gcj02`;
    } else if (type === "qq") {
      url = `https://apis.map.qq.com/uri/v1/marker?marker=coord:${lat},${lng};title:${encName};addr:${encAddr}&referer=kangyang`;
    } else if (type === "apple") {
      url = `https://maps.apple.com/?ll=${lat},${lng}&q=${encName}&address=${encAddr}`;
    } else if (type === "copy") {
      const text = `${name}\n${address}`;
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(text).then(
          () => toast("地址已复制"),
          () => toast("复制失败")
        );
      } else {
        toast(text);
      }
      closeNavSheet();
      return;
    }

    if (url) {
      window.open(url, "_blank");
      closeNavSheet();
    }
  }

  function renderMap(o) {
    const mapCard = document.getElementById("mapCard");
    const isInstore = o.serviceType === "instore";
    mapCard.hidden = !isInstore;
    if (!isInstore) return;

    const store = getStoreGeo(o);
    document.getElementById("mapStoreName").textContent = store.name;
    document.getElementById("mapStoreAddr").textContent = store.address;

    const phoneEl = document.getElementById("mapStorePhone");
    if (store.phone) {
      phoneEl.hidden = false;
      phoneEl.textContent = `电话 ${store.phone}`;
      phoneEl.href = `tel:${store.phone.replace(/-/g, "")}`;
    } else {
      phoneEl.hidden = true;
    }

    const frame = document.getElementById("mapFrame");
    const src = buildOsmEmbed(store.lat, store.lng);
    if (frame.dataset.src !== src) {
      frame.dataset.src = src;
      frame.src = src;
    }
  }

  function renderHomeExtras(o) {
    const isHome = o.serviceType === "home";
    const isGoods = o.serviceType === "goods";

    const woCard = document.getElementById("workOrderCard");
    woCard.hidden = !isHome;
    if (isHome) {
      let wo = o.workOrder;
      if (!wo) {
        wo = {
          workOrderId: `WO${o.orderId || Date.now()}`,
          status: "pending_assign",
          statusText: "待派工",
          staffName: null,
          staffPhone: null,
          createdAt: o.paidAt || o.createdAt,
        };
        o.workOrder = wo;
        VerifyCode.upsertOrder(o);
      }
      document.getElementById("woStatus").textContent = wo.statusText || "待派工";
      document.getElementById("woId").textContent = wo.workOrderId || "—";
      document.getElementById("woStaff").textContent = wo.staffName || "待指派";
      document.getElementById("woPhone").textContent = wo.staffPhone || "—";
      document.getElementById("woCreated").textContent = fmt(wo.createdAt);
      const woTitle = woCard.querySelector("h3");
      if (woTitle) woTitle.textContent = o.fulfillment === "rental" ? "安装工单" : "服务工单";
    }

    // 物流明细：仅实物商品展示（到家服务不展示）
    const logCard = document.getElementById("logisticsCard");
    logCard.hidden = !isGoods;
    if (isGoods) {
      VerifyCode.ensureGoodsTimeline(o);
      let log = o.logistics;
      if (!log) {
        log = {
          company: "顺丰速运",
          trackingNo: `SF${String(o.orderId || Date.now()).slice(-10)}`,
          statusText: "待发货",
          traces: [
            {
              time: o.paidAt || o.createdAt || Date.now(),
              text: "订单已支付，等待仓库拣货发货",
            },
          ],
        };
        o.logistics = log;
        VerifyCode.upsertOrder(o);
      }
      document.getElementById("logStatus").textContent = log.statusText || "—";
      document.getElementById("logCompany").textContent = log.company || "—";
      document.getElementById("logTracking").textContent = log.trackingNo || "—";
      document.getElementById("logTraces").innerHTML = (log.traces || [])
        .map(
          (t) => `<li>
            <div class="log-time">${fmt(t.time)}</div>
            <div class="log-text">${t.text}</div>
          </li>`
        )
        .join("");
      const trackLink = document.getElementById("linkLogisticsTrack");
      if (trackLink) {
        const qs = new URLSearchParams({
          orderId: o.orderId || "",
          trackingNo: log.trackingNo || "",
        });
        trackLink.href = `./logistics-track.html?${qs.toString()}`;
      }
    }

    const addrCard = document.getElementById("addressInfoCard");
    addrCard.hidden = !(isHome || isGoods);
    if (isHome || isGoods) {
      const name = o.receiverName || "安辉";
      const phone = o.receiverPhone || "158****3897";
      const detail =
        o.detailAddress ||
        "山东省济南市历下区姚家街道科技金融大厦";
      document.getElementById("homeAddrUser").textContent = `${name} ${phone}`;
      document.getElementById("homeAddrDetail").textContent = detail;
      const addrTitle = addrCard.querySelector("h3");
      if (addrTitle) {
        addrTitle.textContent = o.fulfillment === "rental"
          ? "安装地址"
          : isGoods
            ? "收货地址"
            : "上门地址";
      }
    }
  }

  function renderHomeTimeline(o) {
    const card = document.getElementById("timelineCard");
    const list = document.getElementById("homeTimeline");
    const nextBtn = document.getElementById("btnHomeNext");
    const titleEl = document.getElementById("timelineTitle");
    const isHome = o.serviceType === "home";
    const isGoods = o.serviceType === "goods";
    card.hidden = !(isHome || isGoods);
    if (!(isHome || isGoods)) return;

    const refunded = o.status === "refunded";
    let steps;
    let step;
    let canAdvance;
    let nextMeta;

    if (isGoods) {
      if (titleEl) titleEl.textContent = "物流履约";
      VerifyCode.ensureGoodsTimeline(o);
      steps = VerifyCode.getGoodsTimelineSteps(o);
      step = o.goodsStep || 0;
      canAdvance = !refunded && step < 3;
      nextMeta = VerifyCode.GOODS_STEP_META[step + 1];
      nextBtn.textContent =
        step === 2
          ? "确认收货"
          : nextMeta
            ? `模拟：进入「${nextMeta.title}」`
            : "模拟推进进度";
    } else {
      if (titleEl) titleEl.textContent = "服务进度";
      VerifyCode.ensureHomeTimeline(o);
      steps = VerifyCode.getHomeTimelineSteps(o);
      step = o.homeStep || 0;
      canAdvance = !refunded && step < 3;
      nextMeta = VerifyCode.HOME_STEP_META[step + 1];
      nextBtn.textContent = nextMeta
        ? `模拟：进入「${nextMeta.title}」`
        : "模拟推进进度";
      if (o.fulfillment === "rental" && titleEl) titleEl.textContent = "租赁进度";
    }

    list.innerHTML = steps
      .map((s) => {
        let stateClass = "";
        if (s.done) stateClass += " is-done";
        if (s.current) stateClass += " is-current";
        const timeText = s.at
          ? fmt(s.at)
          : s.current
            ? "进行中"
            : s.done
              ? ""
              : "未开始";
        const desc = s.done || s.current ? s.desc : "尚未开始";
        return `<li class="timeline-item${stateClass}">
          <div class="timeline-rail"><i class="timeline-dot"></i></div>
          <div class="timeline-body">
            <div class="timeline-title">${s.title}</div>
            <div class="timeline-desc">${desc}</div>
            <div class="timeline-time">${timeText}</div>
          </div>
        </li>`;
      })
      .join("");

    nextBtn.hidden = !canAdvance;
  }

  async function renderPackageCard(o) {
    const remain = PackageEntitlement.totalRemain(o);
    const badge = document.getElementById("pkgRemainBadge");
    if (badge) badge.textContent = `剩余 ${remain}`;
    const list = document.getElementById("pkgRemainList");
    if (list) {
      list.innerHTML = (o.entitlement?.lines || [])
        .map(
          (l) =>
            `<li><span>${l.name}</span><strong>${PackageEntitlement.remainOf(l)}/${l.totalQuota}</strong></li>`
        )
        .join("");
    }
    const link = document.getElementById("linkPkgMerchant");
    if (link) link.href = `./merchant-verify.html?orderId=${encodeURIComponent(o.orderId)}`;

    const token = await PackageEntitlement.makePackageToken(o.orderId, o.storeId);
    const canvas = document.getElementById("pkgQrCanvas");
    if (!canvas || typeof qrcode !== "function") return;
    const qr = qrcode(0, "M");
    qr.addData(token);
    qr.make();
    const size = 200;
    const cell = size / qr.getModuleCount();
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = "#111";
    for (let r = 0; r < qr.getModuleCount(); r++) {
      for (let c = 0; c < qr.getModuleCount(); c++) {
        if (qr.isDark(r, c)) ctx.fillRect(c * cell, r * cell, cell, cell);
      }
    }
  }

  async function drawQr() {
    const ticket = currentTicket();
    if (!ticket?.token) return;
    const qrCanvas = document.getElementById("qrCanvas");
    qrCanvas.hidden = false;
    await VerifyCode.renderQr(qrCanvas, ticket.token, 200);
  }

  function renderTicketUI() {
    const ticket = currentTicket();
    const total = tickets.length;
    const pager = document.getElementById("verifyPager");
    const dots = document.getElementById("verifyDots");
    const countEl = document.getElementById("verifyCount");
    const usedEl = document.getElementById("qrUsed");
    const tipEl = document.getElementById("verifyTip");

    if (!ticket || !total) return;

    const multi = total > 1;
    pager.hidden = !multi;
    dots.hidden = !multi;
    countEl.hidden = !multi;
    if (multi) {
      countEl.textContent = `共 ${total} 份`;
      document.getElementById("pagerIdx").textContent = `${activeIndex + 1} / ${total}`;
      document.getElementById("btnPrevCode").disabled = activeIndex <= 0;
      document.getElementById("btnNextCode").disabled = activeIndex >= total - 1;
      dots.innerHTML = tickets
        .map(
          (t, i) =>
            `<button type="button" class="dot ${i === activeIndex ? "active" : ""} ${t.status === "verified" ? "used" : ""}" data-idx="${i}" aria-label="第${i + 1}张"></button>`
        )
        .join("");
    }

    const used = ticket.status === "verified";
    usedEl.hidden = !used;
    document.getElementById("qrWrap").classList.toggle("is-used", used);
    document.getElementById("codeNo").textContent = ticket.code;
    tipEl.textContent = used
      ? `第 ${activeIndex + 1} 份已核销`
      : multi
        ? `请出示第 ${activeIndex + 1} 份核销码（左右切换）`
        : "请到店后向工作人员出示此核销码";

    drawQr().catch((e) => toast(e.message || "核销码渲染失败"));
  }

  function pickDefaultIndex() {
    const open = tickets.findIndex((t) => t.status === "paid");
    activeIndex = open >= 0 ? open : 0;
  }

  function renderRental(o) {
    const card = document.getElementById("rentalCard");
    if (!card) return;
    const show = o.fulfillment === "rental";
    card.hidden = !show;
    if (!show) return;
    const rent = o.rental || {};
    const set = (id, text) => {
      const el = document.getElementById(id);
      if (el) el.textContent = text || "—";
    };
    set("rentDevice", rent.device || o.goodsName);
    set("rentTerm", rent.term);
    set("rentFee", rent.fee);
    set("rentInstall", rent.install);
    set("rentReturn", rent.returnAt);
    const badge = document.getElementById("rentStatus");
    if (badge) badge.textContent = o.statusText || "租赁中";
  }

  function render(o) {
    order = o;
    tickets = VerifyCode.getTickets(o).slice(0, VerifyCode.MAX_VERIFY_CODES);
    if (o.serviceType === "instore" && tickets.length) {
      o.quantity = tickets.length;
    }
    pickDefaultIndex();

    const canShowVerify =
      o.serviceType === "instore" &&
      tickets.length > 0 &&
      (o.status === "paid" || o.status === "verified");

    document.getElementById("statusText").textContent = o.statusText || o.status;
    const sub = document.getElementById("statusSub");
    const verifiedN = tickets.filter((t) => t.status === "verified").length;
    const pendingN = tickets.filter((t) => t.status === "paid").length;
    // 到店：仍有待核销份数时，一律按待核销展示，不出现「已完成」
    const instorePending =
      o.serviceType === "instore" &&
      tickets.length > 0 &&
      pendingN > 0 &&
      o.status !== "refunded" &&
      o.status !== "expired";
    const instoreAllDone =
      o.serviceType === "instore" &&
      tickets.length > 0 &&
      pendingN === 0 &&
      verifiedN === tickets.length;

    if (instorePending) {
      document.getElementById("statusText").textContent =
        verifiedN > 0
          ? `待核销 ${pendingN}/${tickets.length}`
          : tickets.length > 1
            ? `待核销 ${tickets.length} 份`
            : "已支付/待核销";
      sub.textContent =
        tickets.length > 1
          ? `请到店出示核销码（${pendingN}/${tickets.length} 待核销）`
          : "请到店出示核销码完成服务";
    } else if (o.fulfillment === "rental") {
      document.getElementById("statusText").textContent = o.statusText || "已完成";
      const rent = o.rental || {};
      sub.textContent = rent.term
        ? `租期 ${rent.term}。${rent.install || "设备已安装"}`
        : "辅具已安装，可按月续租或到期回收";
    } else if (o.serviceType === "home") {
      const step = o.homeStep ?? 0;
      if (o.status === "refunded") {
        sub.textContent = "订单已退款";
      } else if (step >= 3) {
        sub.textContent = "上门服务已完成，交易成功";
      } else if (step === 2) {
        sub.textContent = "服务人员已确认，即将完成服务";
      } else if (step === 1) {
        sub.textContent = "已指派服务人员，请保持电话畅通";
      } else {
        sub.textContent = "订单已支付，等待平台指派服务";
      }
    } else if (o.serviceType === "goods") {
      const step = o.goodsStep ?? 0;
      if (o.status === "refunded") {
        sub.textContent = o.fulfillment === "mail" ? "邮寄订单已退款，款项原路返回" : "订单已退款";
      } else if (step >= 3) {
        sub.textContent = "已确认收货，交易成功";
      } else if (step === 2) {
        sub.textContent = "包裹运输中，请注意查收";
      } else if (step === 1) {
        sub.textContent = "商家已发货，可查看物流轨迹";
      } else {
        sub.textContent = "订单已支付，等待商家发货";
      }
    } else if (o.fulfillment === "package" || o.serviceType === "package") {
      const remain = window.PackageEntitlement
        ? PackageEntitlement.totalRemain(o)
        : 0;
      const total = (o.entitlement?.lines || []).reduce((s, l) => s + (l.totalQuota || 0), 0);
      document.getElementById("statusText").textContent = o.statusText || `权益待核销 ${remain}/${total}`;
      sub.textContent =
        remain > 0
          ? `请到站出示套餐权益码（剩余 ${remain} 次）`
          : "套餐权益已用完";
    } else if (instoreAllDone || o.status === "verified") {
      document.getElementById("statusText").textContent =
        tickets.length > 1
          ? `已核销 ${verifiedN}/${tickets.length}`
          : "已核销";
      sub.textContent =
        tickets.length > 1
          ? `全部核销完成（${tickets.length}/${tickets.length}）`
          : "服务已核销，核销码已使用";
    } else if (o.status === "paid") {
      sub.textContent =
        tickets.length > 1
          ? `请到店出示核销码（${tickets.length - verifiedN}/${tickets.length} 待核销）`
          : "请到店出示核销码完成服务";
    } else if (o.status === "refunded") {
      sub.textContent = "订单已退款，核销码已失效";
    } else if (o.status === "expired") {
      sub.textContent = "订单已过期，核销码已失效";
    } else {
      sub.textContent = "";
    }

    const verifyCard = document.getElementById("verifyCard");
    verifyCard.hidden = !canShowVerify;
    verifyCard.style.opacity = o.status === "verified" ? "0.7" : "1";

    if (canShowVerify) renderTicketUI();

    const packageCard = document.getElementById("packageCard");
    const isPackage = o.fulfillment === "package" || o.serviceType === "package";
    if (packageCard) {
      packageCard.hidden = !isPackage || !o.entitlement;
      if (isPackage && o.entitlement && window.PackageEntitlement) {
        renderPackageCard(o);
      }
    }

    const qtyShow =
      o.serviceType === "instore" && tickets.length
        ? tickets.length
        : o.quantity || 1;
    document.getElementById("goodsCover").src = o.cover || "./assets/therapy-device.png";
    document.getElementById("goodsName").textContent = o.goodsName || "";
    document.getElementById("goodsSku").textContent = o.sku
      ? `规格 ${o.sku} · 数量 ${qtyShow}`
      : `数量 ${qtyShow}`;
    document.getElementById("payAmount").textContent = `¥ ${o.payAmount ?? "—"}`;
    document.getElementById("orderId").textContent = o.orderId;
    document.getElementById("serviceType").textContent =
      o.fulfillment === "rental"
        ? "辅具租赁"
        : o.fulfillment === "mail"
          ? "邮寄到家"
          : (window.getProductAttr &&
              window.getProductAttr(o.productAttr || o.serviceType).label) ||
            (o.serviceType === "instore"
              ? "到店服务"
              : o.serviceType === "goods"
                ? "实物商品"
                : o.serviceType === "package"
                  ? "服务套餐"
                  : "到家服务");
    document.getElementById("storeName").textContent = o.storeName || "—";
    document.getElementById("appointTime").textContent = o.appointmentTime || "—";
    const appointLabel = document.querySelector("#appointRow span");
    if (appointLabel) appointLabel.textContent = o.fulfillment === "rental" ? "安装时间" : "预约时间";
    document.getElementById("storeRow").hidden =
      o.serviceType !== "instore" && o.serviceType !== "package" && o.fulfillment !== "package";
    document.getElementById("appointRow").hidden =
      o.serviceType === "goods" || o.serviceType === "package" || o.fulfillment === "package";

    renderMap(o);
    renderHomeTimeline(o);
    renderHomeExtras(o);
    renderRental(o);

    const verifiedRow = document.getElementById("verifiedRow");
    const operatorRow = document.getElementById("operatorRow");
    if (o.serviceType === "instore" && verifiedN > 0) {
      verifiedRow.hidden = false;
      operatorRow.hidden = false;
      const last = [...tickets].reverse().find((t) => t.status === "verified");
      document.getElementById("verifiedAt").textContent = fmt(last?.verifiedAt || o.verifiedAt);
      document.getElementById("verifiedBy").textContent =
        tickets.length > 1
          ? `${last?.verifiedBy || o.verifiedBy || "—"}（已核销 ${verifiedN}/${tickets.length}）`
          : last?.verifiedBy || o.verifiedBy || "—";
    } else {
      verifiedRow.hidden = true;
      operatorRow.hidden = true;
    }

    document.getElementById("linkMerchant").href =
      `./merchant-verify.html?orderId=${encodeURIComponent(o.orderId)}`;
    document.getElementById("linkMerchant").hidden = o.serviceType !== "instore";
    const aftersaleLink = document.getElementById("linkAftersale");
    if (aftersaleLink) {
      aftersaleLink.href = `./aftersale-apply.html?orderId=${encodeURIComponent(o.orderId)}`;
    }
  }

  function at(iso) {
    const n = Date.parse(iso);
    return Number.isNaN(n) ? Date.now() : n;
  }

  async function ensureDemoOrder(orderId) {
    const existing = VerifyCode.getOrder(orderId);
    if (existing && existing.demoKind) {
      if (
        orderId === "KY-DEMO-HOME" &&
        existing.cover &&
        existing.cover.indexOf("image-1e56f3c7") >= 0
      ) {
        existing.cover = "./assets/cover-neck-massage.png";
        return VerifyCode.upsertOrder(existing);
      }
      return existing;
    }
    const store = {
      storeId: "store_cy001",
      storeName: "春风康养 · 历下旗舰店",
      storeAddress: "山东省济南市历下区姚家街道科技金融大厦",
      storeLat: 36.6666,
      storeLng: 117.1205,
    };
    const homeAddr = {
      receiverName: "林秀珍",
      receiverPhone: "158****3897",
      detailAddress: "山东省济南市历下区姚家街道科技金融大厦 2 单元 801",
    };
    if (orderId === "KY-DEMO-INSTORE") {
      const o = await VerifyCode.createPaidOrder({
        orderId,
        serviceType: "instore",
        goodsId: "ai_massage",
        goodsName: "AI舒压理疗服务",
        sku: "AI-01",
        quantity: 1,
        payAmount: 15,
        cover: "./assets/cover-ai-massage.png",
        appointmentTime: "2026-09-18 10:00",
        expireAt: at("2026-10-13T16:00:00+08:00"),
        ...store,
      });
      o.demoKind = "instore";
      o.createdAt = at("2026-09-13T09:20:00+08:00");
      o.paidAt = o.createdAt;
      return VerifyCode.upsertOrder(o);
    }
    if (orderId === "KY-DEMO-HOME") {
      const created = at("2026-09-12T11:00:00+08:00");
      const assigned = at("2026-09-12T15:30:00+08:00");
      const o = await VerifyCode.createPaidOrder({
        orderId,
        serviceType: "home",
        goodsId: "neck_massage",
        goodsName: "颈椎按摩服务",
        sku: "NK-03",
        quantity: 1,
        payAmount: 39,
        cover: "./assets/cover-neck-massage.png",
        appointmentTime: "2026-09-16 14:00",
        ...homeAddr,
      });
      o.demoKind = "home";
      o.homeStep = 1;
      o.status = "assigned";
      o.statusText = "已派工";
      o.createdAt = created;
      o.paidAt = created;
      o.homeTimeline = { orderedAt: created, assignedAt: assigned, confirmedAt: null, completedAt: null };
      o.workOrder = {
        workOrderId: "WO20260912001",
        status: "assigned",
        statusText: "已派工",
        staffName: "王康复师",
        staffPhone: "138****6688",
        createdAt: created,
        assignedAt: assigned,
      };
      return VerifyCode.upsertOrder(o);
    }
    if (orderId === "KY-DEMO-RENT") {
      const created = at("2026-09-02T10:00:00+08:00");
      const assigned = at("2026-09-02T16:00:00+08:00");
      const confirmed = at("2026-09-03T09:40:00+08:00");
      const done = at("2026-09-03T11:00:00+08:00");
      const o = await VerifyCode.createPaidOrder({
        orderId,
        serviceType: "home",
        goodsId: "bed_rental_home",
        goodsName: "护理床租赁月付",
        sku: "BR-L01",
        quantity: 1,
        payAmount: 128,
        cover: "./assets/cover-wellness-kit.png",
        appointmentTime: "2026-09-03 09:30",
        receiverName: "林建国",
        receiverPhone: homeAddr.receiverPhone,
        detailAddress: homeAddr.detailAddress,
      });
      o.demoKind = "rental";
      o.fulfillment = "rental";
      o.homeStep = 3;
      o.status = "completed";
      o.statusText = "已完成";
      o.createdAt = created;
      o.paidAt = created;
      o.completedAt = done;
      o.homeTimeline = { orderedAt: created, assignedAt: assigned, confirmedAt: confirmed, completedAt: done };
      o.workOrder = {
        workOrderId: "WO20260902008",
        status: "completed",
        statusText: "已安装",
        staffName: "安装组 · 赵师傅",
        staffPhone: "138****6688",
        createdAt: created,
        assignedAt: assigned,
        completedAt: done,
      };
      o.rental = {
        device: "多功能护理床",
        term: "2026-09-03 至 2026-10-02",
        fee: "¥128 / 月",
        install: "2026-09-03 已上门安装",
        returnAt: "2026-10-02 前可续租或回收",
      };
      return VerifyCode.upsertOrder(o);
    }
    if (orderId === "KY-DEMO-MAIL") {
      const created = at("2026-08-28T08:40:00+08:00");
      const shipped = at("2026-08-28T18:20:00+08:00");
      const refunded = at("2026-08-29T09:10:00+08:00");
      const o = await VerifyCode.createPaidOrder({
        orderId,
        serviceType: "goods",
        goodsId: "herbal_tea",
        goodsName: "药食同源养生茶",
        sku: "GD-HT01",
        quantity: 1,
        payAmount: 58,
        cover: "./assets/cover-nutrition-meal.png",
        freight: 0,
        shipFrom: "廊坊仓",
        ...homeAddr,
      });
      o.demoKind = "mail";
      o.fulfillment = "mail";
      o.goodsStep = 1;
      o.status = "refunded";
      o.statusText = "已退款";
      o.createdAt = created;
      o.paidAt = created;
      o.goodsTimeline = { orderedAt: created, shippedAt: shipped, deliveringAt: null, receivedAt: null };
      o.logistics = {
        company: "顺丰速运",
        trackingNo: "SF2026082801",
        statusText: "已退款",
        traces: [
          { time: refunded, text: "退款已原路返回" },
          { time: shipped, text: "廊坊仓已发出，运单 SF2026082801" },
          { time: created, text: "订单已支付，等待仓库拣货发货" },
        ],
      };
      return VerifyCode.upsertOrder(o);
    }
    return null;
  }

  const pageParams = new URLSearchParams(location.search);
  const orderId = pageParams.get("orderId");
  const backToV10 = pageParams.get("from") === "v10";
  if (!orderId) {
    toast("缺少订单号");
    setTimeout(() => {
      location.href = backToV10 ? "./app-v10.html#orders" : "./index.html";
    }, 800);
  } else {
    (async () => {
      let o = await ensureDemoOrder(orderId);
      if (!o) o = VerifyCode.getOrder(orderId);
      if (!o) {
        toast("订单不存在");
        setTimeout(() => {
          location.href = backToV10 ? "./app-v10.html#orders" : "./index.html";
        }, 800);
        return;
      }
      try {
        o = await VerifyCode.ensureVerifyTickets(o);
      } catch (e) {
        console.warn("补齐核销码失败", e);
      }
      if (o.serviceType === "instore" && typeof VerifyCode.syncTicketMirror === "function") {
        o = VerifyCode.syncTicketMirror(o);
        VerifyCode.upsertOrder(o);
      }
      if (o.serviceType === "instore") {
        let dirty = false;
        if (!o.storeAddress) {
          o.storeAddress = DEFAULT_STORE.address;
          dirty = true;
        }
        if (!o.storeLat || !o.storeLng) {
          o.storeLat = DEFAULT_STORE.lat;
          o.storeLng = DEFAULT_STORE.lng;
          dirty = true;
        }
        if (!o.storePhone) {
          o.storePhone = DEFAULT_STORE.phone;
          dirty = true;
        }
        if (dirty) VerifyCode.upsertOrder(o);
      }
      render(o);
    })();
  }

  document.getElementById("btnBack")?.addEventListener("click", () => {
    if (backToV10) {
      location.href = "./app-v10.html#orders";
      return;
    }
    if (history.length > 1) history.back();
    else location.href = "./index.html";
  });

  document.getElementById("btnPrevCode")?.addEventListener("click", () => {
    if (activeIndex <= 0) return;
    activeIndex -= 1;
    renderTicketUI();
  });

  document.getElementById("btnNextCode")?.addEventListener("click", () => {
    if (activeIndex >= tickets.length - 1) return;
    activeIndex += 1;
    renderTicketUI();
  });

  document.getElementById("verifyDots")?.addEventListener("click", (e) => {
    const btn = e.target.closest(".dot[data-idx]");
    if (!btn) return;
    activeIndex = Number(btn.dataset.idx) || 0;
    renderTicketUI();
  });

  const stage = document.getElementById("verifyStage");
  let touchX = 0;
  stage?.addEventListener(
    "touchstart",
    (e) => {
      touchX = e.changedTouches[0].clientX;
    },
    { passive: true }
  );
  stage?.addEventListener(
    "touchend",
    (e) => {
      const dx = e.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) < 40) return;
      if (dx < 0 && activeIndex < tickets.length - 1) {
        activeIndex += 1;
        renderTicketUI();
      } else if (dx > 0 && activeIndex > 0) {
        activeIndex -= 1;
        renderTicketUI();
      }
    },
    { passive: true }
  );

  const lightbox = document.getElementById("lightbox");
  document.getElementById("btnRefreshPkg")?.addEventListener("click", async () => {
    if (!order || !window.PackageEntitlement) return;
    if (order.fulfillment !== "package" && order.serviceType !== "package") return;
    await renderPackageCard(order);
    toast("权益码已刷新");
  });

  document.getElementById("btnZoom")?.addEventListener("click", async () => {
    const ticket = currentTicket();
    if (!ticket) return;
    lightbox.hidden = false;
    document.getElementById("lbCodeNo").textContent =
      tickets.length > 1
        ? `${ticket.code}（${activeIndex + 1}/${tickets.length}）`
        : ticket.code;
    const lbQr = document.getElementById("lbQr");
    if (ticket.token) {
      await VerifyCode.renderQr(lbQr, ticket.token, 280);
    }
  });

  document.getElementById("lbClose")?.addEventListener("click", () => {
    lightbox.hidden = true;
  });
  lightbox?.addEventListener("click", (e) => {
    if (e.target === lightbox) lightbox.hidden = true;
  });

  document.getElementById("btnRefund")?.addEventListener("click", () => {
    if (!order) return;
    const res = VerifyCode.refundOrder(order.orderId);
    if (!res.ok) {
      toast(res.message);
      return;
    }
    toast(
      order.serviceType === "instore" ? "已退款，核销码已失效" : "已退款"
    );
    render(res.order);
  });

  document.getElementById("btnHomeNext")?.addEventListener("click", () => {
    if (!order) return;
    const res =
      order.serviceType === "goods"
        ? VerifyCode.advanceGoodsStep(order.orderId)
        : VerifyCode.advanceHomeStep(order.orderId);
    if (!res.ok) {
      toast(res.message);
      return;
    }
    toast(res.message || "进度已更新");
    render(res.order);
  });

  document.getElementById("btnNavigate")?.addEventListener("click", openNavSheet);
  document.getElementById("btnNavigate2")?.addEventListener("click", openNavSheet);
  document.getElementById("btnOpenMap")?.addEventListener("click", () => {
    if (!order) return;
    const store = getStoreGeo(order);
    window.open(buildOsmBrowse(store.lat, store.lng), "_blank");
  });
  document.getElementById("navSheetMask")?.addEventListener("click", closeNavSheet);
  document.getElementById("navSheetCancel")?.addEventListener("click", closeNavSheet);
  document.getElementById("navSheet")?.addEventListener("click", (e) => {
    const item = e.target.closest(".nav-sheet-item[data-map]");
    if (!item) return;
    openMapApp(item.dataset.map);
  });
})();
