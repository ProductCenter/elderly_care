(() => {
  const params = new URLSearchParams(location.search);
  const initFilter = params.get("filter");
  let filter = ["all", "paid", "verified", "other"].includes(initFilter)
    ? initFilter
    : "all";

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

  function statusClass(status) {
    if (status === "verified") return "is-done";
    if (status === "paid") return "";
    return "is-muted";
  }

  function fmtDateTime(ts) {
    if (!ts) return "—";
    const d = new Date(ts);
    if (Number.isNaN(d.getTime())) return "—";
    const p = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
  }

  function fmtDate(ts) {
    if (!ts) return "—";
    const d = new Date(ts);
    if (Number.isNaN(d.getTime())) return "—";
    const p = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
  }

  function matchFilter(order) {
    if (filter === "all") return true;
    if (filter === "paid") return order.status === "paid";
    if (filter === "verified") return order.status === "verified";
    return !["paid", "verified"].includes(order.status);
  }

  function syncTabUI() {
    document.querySelectorAll(".tabs .tab").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.filter === filter);
    });
  }

  function render() {
    const listEl = document.getElementById("orderList");
    const emptyEl = document.getElementById("empty");
    const orders = VerifyCode.listOrders().filter(matchFilter);

    if (!orders.length) {
      listEl.innerHTML = "";
      emptyEl.hidden = false;
      return;
    }

    emptyEl.hidden = true;
    listEl.innerHTML = orders
      .map((o) => {
        const attr =
          (window.getProductAttr &&
            window.getProductAttr(o.productAttr || o.serviceType)) ||
          null;
        const typeLabel =
          attr?.label ||
          (o.serviceType === "instore"
            ? "到店服务"
            : o.serviceType === "goods"
              ? "实物商品"
              : "到家服务");
        const store =
          o.serviceType === "instore"
            ? o.storeName || "到店服务"
            : o.serviceType === "goods"
              ? "快递发货"
              : "到家服务";
        const createdAt = fmtDateTime(o.createdAt || o.paidAt);
        const ticketCount =
          o.serviceType === "instore"
            ? VerifyCode.getTickets(o).length || o.quantity || 1
            : o.quantity || 1;
        // 到店 / 到家均展示服务有效期
        const expireAt =
          o.expireAt ||
          (o.createdAt || o.paidAt
            ? (o.createdAt || o.paidAt) + 30 * 24 * 60 * 60 * 1000
            : null);
        const expireLabel = expireAt ? fmtDate(expireAt) : "—";
        const expired =
          Boolean(expireAt) &&
          o.status === "paid" &&
          Date.now() > expireAt;
        return `
          <li>
            <a class="order-item" href="./order-detail.html?orderId=${encodeURIComponent(o.orderId)}">
              <div class="item-hd">
                <span class="item-store">${store}</span>
                <span class="item-status ${statusClass(o.status)}">${o.statusText || o.status}</span>
              </div>
              <div class="item-body">
                <img src="${o.cover || "./assets/cover-therapy-device.png"}" alt="" />
                <div class="item-info">
                  <div class="item-name">${o.goodsName || "商品"}</div>
                  <div class="item-meta">${typeLabel} · 数量 ${ticketCount}</div>
                  <div class="item-times">
                    <div>下单时间 <span>${createdAt}</span></div>
                    <div class="${expired ? "is-expired" : ""}">有效期至 <span>${expireLabel}</span></div>
                  </div>
                  <div class="item-ft">
                    <span class="item-pay">实付 <em>¥ ${o.payAmount ?? "—"}</em></span>
                    <span class="item-arrow">查看详情 ›</span>
                  </div>
                </div>
              </div>
            </a>
          </li>`;
      })
      .join("");
  }

  document.querySelectorAll(".tabs .tab").forEach((btn) => {
    btn.addEventListener("click", () => {
      filter = btn.dataset.filter;
      syncTabUI();
      render();
    });
  });

  document.getElementById("btnBack")?.addEventListener("click", () => {
    location.href = "./mine.html";
  });

  document.querySelectorAll(".tabbar .tab-item").forEach((tab) => {
    tab.addEventListener("click", (e) => {
      if (tab.getAttribute("href") === "#health") {
        e.preventDefault();
      }
    });
  });

  syncTabUI();
  render();
})();
