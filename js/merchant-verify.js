(() => {
  const toastEl = document.getElementById("toast");
  let toastTimer;
  let currentPkgOrder = null;

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
    el.textContent = `${String(n.getHours()).padStart(2, "0")}:${String(n.getMinutes()).padStart(2, "0")}`;
  }
  syncTime();

  function showResult(ok, title, body) {
    const card = document.getElementById("resultCard");
    card.hidden = false;
    card.classList.toggle("ok", ok);
    card.classList.toggle("fail", !ok);
    document.getElementById("resultTitle").textContent = title;
    document.getElementById("resultBody").textContent = body;
  }

  function firstOpenTicket(order) {
    const tickets = VerifyCode.getTickets(order);
    return tickets.find((t) => t.status === "paid") || tickets[0] || null;
  }

  function setMode(mode) {
    document.querySelectorAll(".mode-tab").forEach((t) => {
      t.classList.toggle("active", t.dataset.mode === mode);
    });
    document.getElementById("panelTicket").hidden = mode !== "ticket";
    document.getElementById("panelPackage").hidden = mode !== "package";
  }

  document.querySelector(".mode-tabs")?.addEventListener("click", (e) => {
    const tab = e.target.closest("[data-mode]");
    if (tab) setMode(tab.dataset.mode);
  });

  function refreshList() {
    const list = document.getElementById("orderList");
    const orders = VerifyCode.listOrders().filter((o) => o.serviceType === "instore");
    if (!orders.length) {
      list.innerHTML = `<li class="empty">暂无到店订单，请先在下单页完成支付</li>`;
      return;
    }
    list.innerHTML = orders
      .slice(0, 8)
      .map((o) => {
        const tickets = VerifyCode.getTickets(o);
        const open = tickets.filter((t) => t.status === "paid").length;
        const ticket = firstOpenTicket(o);
        const codeLabel =
          tickets.length > 1
            ? `${ticket?.code || "无码"} · ${open}/${tickets.length} 待核销`
            : `${ticket?.code || "无核销码"} · ${o.statusText}`;
        return `<li class="order-row" data-order-id="${o.orderId}">
          <a class="order-main" href="./order-detail.html?orderId=${encodeURIComponent(o.orderId)}">
            <div class="oid">${codeLabel}</div>
            <div class="meta">${o.goodsName} · ${o.orderId}</div>
          </a>
          <div class="actions">
            <a href="./order-detail.html?orderId=${encodeURIComponent(o.orderId)}">查看详情</a>
            <a href="#" data-fill-token="${encodeURIComponent(ticket?.token || "")}" data-fill-code="${ticket?.code || ""}">填入核销</a>
          </div>
        </li>`;
      })
      .join("");
  }

  function refreshPkgList() {
    const list = document.getElementById("pkgOrderList");
    const orders = PackageEntitlement.listOrders().filter((o) => o.fulfillment === "package");
    if (!orders.length) {
      list.innerHTML = `<li class="empty">暂无套餐订单，可点「生成演示订单+码」</li>`;
      return;
    }
    list.innerHTML = orders
      .slice(0, 8)
      .map((o) => {
        const remain = PackageEntitlement.totalRemain(o);
        return `<li class="order-row">
          <div class="order-main">
            <div class="oid">${o.statusText || "套餐"} · 剩余 ${remain}</div>
            <div class="meta">${o.goodsName} · ${o.orderId}</div>
          </div>
          <div class="actions">
            <a href="#" data-pkg-load="${o.orderId}">载入核销</a>
          </div>
        </li>`;
      })
      .join("");
  }

  function renderPkgDetail(order, token) {
    currentPkgOrder = order;
    const card = document.getElementById("pkgDetailCard");
    card.hidden = false;
    document.getElementById("pkgName").textContent = order.goodsName || "服务套餐";
    const days = order.package?.serviceDays || "—";
    const remain = PackageEntitlement.totalRemain(order);
    const validTo = order.entitlement?.validTo
      ? new Date(order.entitlement.validTo).toLocaleDateString()
      : "—";
    document.getElementById("pkgMeta").textContent = `剩余 ${remain} 次 · ${days} 天套餐 · 有效至 ${validTo}`;
    if (token) document.getElementById("pkgTokenInput").value = token;

    const wd = PackageEntitlement.jsWeekday();
    const day = PackageEntitlement.todayKey();
    const list = document.getElementById("pkgItemList");
    list.innerHTML = (order.entitlement?.lines || [])
      .map((line) => {
        const rem = PackageEntitlement.remainOf(line);
        const usedToday = Number(line.dailyUsed?.[day] || 0);
        const weekdayOk = line.weekdays.map(String).includes(wd);
        const dayOk = usedToday < (line.timesPerDay || 1);
        const can = rem > 0 && weekdayOk && dayOk;
        const tip = !weekdayOk
          ? "今日不可服务"
          : rem <= 0
            ? "次数已用完"
            : !dayOk
              ? "今日已达上限"
              : `剩余 ${rem}/${line.totalQuota} · 今日 ${usedToday}/${line.timesPerDay}`;
        return `<li class="pkg-item ${can ? "" : "is-disabled"}">
          <label>
            <input type="checkbox" name="pkgItem" value="${line.itemId}" ${can ? "" : "disabled"} ${
              can && line.name.includes("午餐") ? "checked" : ""
            } />
            <span class="pkg-item-main">
              <strong>${line.name}</strong>
              <em>${tip}</em>
            </span>
          </label>
        </li>`;
      })
      .join("");
  }

  async function doRedeem({ token, codeNo }) {
    const storeId = document.getElementById("storeSelect").value;
    const operator = document.getElementById("operatorInput").value.trim() || "店员";
    const res = await VerifyCode.redeem({ token, codeNo, storeId, operator });
    if (res.ok) {
      toast(res.message || "核销成功");
      const tickets = VerifyCode.getTickets(res.order);
      const open = tickets.filter((t) => t.status === "paid").length;
      showResult(
        true,
        "核销成功",
        `订单：${res.order.orderId}\n核销码：${res.ticket?.code || "—"}\n状态：${res.order.statusText}\n剩余待核销：${open}/${tickets.length}\n核销人：${res.ticket?.verifiedBy || res.order.verifiedBy}\n时间：${new Date(res.ticket?.verifiedAt || res.order.verifiedAt).toLocaleString()}`
      );
    } else {
      toast(res.message);
      showResult(false, "核销失败", res.message);
    }
    refreshList();
  }

  document.getElementById("btnBack")?.addEventListener("click", () => {
    if (history.length > 1) history.back();
    else location.href = "./index.html";
  });

  document.getElementById("btnFillLatest")?.addEventListener("click", () => {
    const latest = VerifyCode.listOrders().find((o) => {
      if (o.serviceType !== "instore" || o.status !== "paid") return false;
      return VerifyCode.getTickets(o).some((t) => t.status === "paid");
    });
    if (!latest) {
      toast("没有可核销的已支付到店订单");
      return;
    }
    const ticket = firstOpenTicket(latest);
    document.getElementById("tokenInput").value = ticket?.token || "";
    document.getElementById("codeInput").value = ticket?.code || "";
    toast("已填入最近待核销码");
  });

  document.getElementById("btnScanRedeem")?.addEventListener("click", () => {
    const token = document.getElementById("tokenInput").value.trim();
    if (!token) {
      toast("请粘贴扫码内容");
      return;
    }
    if (token.startsWith("PK1.")) {
      setMode("package");
      document.getElementById("pkgTokenInput").value = token;
      document.getElementById("btnPkgParse").click();
      return;
    }
    doRedeem({ token });
  });

  document.getElementById("btnManualRedeem")?.addEventListener("click", () => {
    const codeNo = document.getElementById("codeInput").value.trim();
    if (!codeNo) {
      toast("请输入核销码编号");
      return;
    }
    doRedeem({ codeNo });
  });

  document.getElementById("orderList")?.addEventListener("click", (e) => {
    const a = e.target.closest("[data-fill-token]");
    if (!a) return;
    e.preventDefault();
    document.getElementById("tokenInput").value = decodeURIComponent(a.dataset.fillToken || "");
    document.getElementById("codeInput").value = a.dataset.fillCode || "";
    toast("已填入");
  });

  document.getElementById("btnPkgDemo")?.addEventListener("click", async () => {
    const order = await PackageEntitlement.ensureDemoOrder();
    const token = await PackageEntitlement.makePackageToken(order.orderId, order.storeId);
    document.getElementById("pkgTokenInput").value = token;
    renderPkgDetail(order, token);
    refreshPkgList();
    toast("已生成演示套餐订单与权益码");
  });

  document.getElementById("btnPkgParse")?.addEventListener("click", async () => {
    const token = document.getElementById("pkgTokenInput").value.trim();
    if (!token) {
      toast("请粘贴套餐权益码");
      return;
    }
    const parsed = await PackageEntitlement.parsePackageToken(token);
    if (!parsed.ok) {
      toast(parsed.reason);
      showResult(false, "解析失败", parsed.reason);
      return;
    }
    const order = PackageEntitlement.getOrder(parsed.payload.orderId);
    if (!order) {
      toast("订单不存在");
      return;
    }
    renderPkgDetail(order, token);
    toast("已解析套餐权益");
  });

  document.getElementById("btnPkgRedeem")?.addEventListener("click", async () => {
    if (!currentPkgOrder) {
      toast("请先解析权益码");
      return;
    }
    const itemIds = [...document.querySelectorAll('input[name="pkgItem"]:checked')].map((c) => c.value);
    if (!itemIds.length) {
      toast("请勾选要核销的项目");
      return;
    }
    const storeId = document.getElementById("storeSelect").value;
    const operator = document.getElementById("operatorInput").value.trim() || "店员";
    const token = document.getElementById("pkgTokenInput").value.trim();
    const res = await PackageEntitlement.redeem({
      token: token || undefined,
      orderId: currentPkgOrder.orderId,
      itemIds,
      storeId,
      operator,
    });
    if (res.ok) {
      toast(res.message);
      const names = (res.redeemed || []).map((r) => `${r.name}(余${r.remain})`).join("、");
      showResult(
        true,
        "套餐核销成功",
        `订单：${res.order.orderId}\n项目：${names}\n状态：${res.order.statusText}\n操作人：${operator}\n时间：${new Date().toLocaleString()}`
      );
      renderPkgDetail(res.order, token);
      refreshPkgList();
    } else {
      toast(res.message);
      showResult(false, "核销失败", res.message);
    }
  });

  document.getElementById("pkgOrderList")?.addEventListener("click", async (e) => {
    const a = e.target.closest("[data-pkg-load]");
    if (!a) return;
    e.preventDefault();
    const order = PackageEntitlement.getOrder(a.dataset.pkgLoad);
    if (!order) return;
    const token = await PackageEntitlement.makePackageToken(order.orderId, order.storeId);
    document.getElementById("pkgTokenInput").value = token;
    renderPkgDetail(order, token);
    toast("已载入");
  });

  const orderId = new URLSearchParams(location.search).get("orderId");
  if (orderId) {
    const o = VerifyCode.getOrder(orderId);
    if (o?.fulfillment === "package") {
      setMode("package");
      PackageEntitlement.makePackageToken(o.orderId, o.storeId).then((token) => {
        document.getElementById("pkgTokenInput").value = token;
        renderPkgDetail(o, token);
      });
    } else {
      const ticket = o ? firstOpenTicket(o) : null;
      if (ticket?.token) {
        document.getElementById("tokenInput").value = ticket.token;
        document.getElementById("codeInput").value = ticket.code || "";
      }
    }
  }

  refreshList();
  refreshPkgList();
})();
