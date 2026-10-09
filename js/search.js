(() => {
  const HISTORY_KEY = "kangyang-mall:search-history";
  const MAX_HISTORY = 10;

  const HOT = [
    { q: "AI舒压", tag: "热" },
    { q: "营养配餐", tag: "荐" },
    { q: "体检", tag: "" },
    { q: "足浴", tag: "" },
    { q: "颈椎按摩", tag: "" },
    { q: "包月订餐", tag: "新" },
    { q: "血压计", tag: "" },
    { q: "辅具租赁", tag: "" },
  ];

  const GUESS = ["到店理疗", "上门陪护", "社区配餐", "慢病检测", "适老辅具", "兴趣体验"];

  const $ = (id) => document.getElementById(id);
  const input = $("searchInput");
  const btnClear = $("btnClear");
  const discoverPanel = $("discoverPanel");
  const suggestPanel = $("suggestPanel");
  const resultPanel = $("resultPanel");
  const suggestList = $("suggestList");
  const resultList = $("resultList");
  const resultMeta = $("resultMeta");
  const resultEmpty = $("resultEmpty");

  let mode = "discover";
  let lastQuery = "";

  function esc(s) {
    return String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function goBack() {
    if (history.length > 1) history.back();
    else location.href = "./index.html";
  }

  function loadHistory() {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      const list = raw ? JSON.parse(raw) : [];
      return Array.isArray(list) ? list.map(String).filter(Boolean) : [];
    } catch {
      return [];
    }
  }

  function saveHistory(list) {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(list.slice(0, MAX_HISTORY)));
  }

  function pushHistory(q) {
    const key = String(q || "").trim();
    if (!key) return;
    saveHistory([key, ...loadHistory().filter((x) => x !== key)]);
    renderHistory();
  }

  function clearHistory() {
    localStorage.removeItem(HISTORY_KEY);
    renderHistory();
  }

  function allProducts() {
    return Object.values(window.MALL_PRODUCTS || {}).filter((p) => p && p.id);
  }

  function getAttr(p) {
    return (
      window.getProductAttr?.(p) || {
        key: "instore",
        short: "到店",
        label: "到店服务",
      }
    );
  }

  function matchScore(p, q) {
    const needle = q.toLowerCase();
    const attr = getAttr(p);
    const hay = [
      p.name,
      p.subtitle,
      p.desc,
      p.tag,
      attr.short,
      attr.label,
      ...(p.features || []),
      ...(p.badges || []),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    if (!needle) return 0;
    if ((p.name || "").toLowerCase().includes(needle)) return 3;
    if ((p.subtitle || "").toLowerCase().includes(needle)) return 2;
    if (hay.includes(needle)) return 1;
    return 0;
  }

  function searchProducts(q) {
    const key = String(q || "").trim();
    if (!key) return [];
    return allProducts()
      .map((p) => ({ p, score: matchScore(p, key) }))
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score || (b.p.sales || 0) - (a.p.sales || 0))
      .map((x) => x.p);
  }

  function highlight(text, q) {
    const raw = String(text || "");
    const key = String(q || "").trim();
    if (!key) return esc(raw);
    const i = raw.toLowerCase().indexOf(key.toLowerCase());
    if (i < 0) return esc(raw);
    return (
      esc(raw.slice(0, i)) +
      `<em>${esc(raw.slice(i, i + key.length))}</em>` +
      esc(raw.slice(i + key.length))
    );
  }

  function setMode(next) {
    mode = next;
    discoverPanel.hidden = next !== "discover";
    suggestPanel.hidden = next !== "suggest";
    resultPanel.hidden = next !== "result";
  }

  function syncClearBtn() {
    btnClear.hidden = !String(input.value || "").trim();
  }

  function renderHistory() {
    const list = loadHistory();
    const block = $("historyBlock");
    const box = $("historyChips");
    if (!list.length) {
      block.hidden = true;
      box.innerHTML = "";
      return;
    }
    block.hidden = false;
    box.innerHTML = list
      .map((q) => `<button type="button" class="chip" data-q="${esc(q)}">${esc(q)}</button>`)
      .join("");
  }

  function renderHot() {
    $("hotRank").innerHTML = HOT.map(
      (item, i) => `<li>
        <button type="button" class="hot-item" data-q="${esc(item.q)}">
          <span class="hot-no">${i + 1}</span>
          <span class="hot-text">${esc(item.q)}</span>
          ${item.tag ? `<span class="hot-tag">${esc(item.tag)}</span>` : ""}
        </button>
      </li>`
    ).join("");
  }

  function renderGuess() {
    $("guessChips").innerHTML = GUESS.map(
      (q) => `<button type="button" class="chip" data-q="${esc(q)}">${esc(q)}</button>`
    ).join("");
  }

  function renderSuggest(q) {
    const key = String(q || "").trim();
    if (!key) {
      setMode("discover");
      return;
    }
    const list = searchProducts(key).slice(0, 10);
    if (!list.length) {
      suggestList.innerHTML = `<li><button type="button" class="suggest-item" data-run="${esc(key)}">
        <svg viewBox="0 0 24 24"><path fill="currentColor" d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
        搜索“${esc(key)}”
      </button></li>`;
      setMode("suggest");
      return;
    }
    suggestList.innerHTML = list
      .map(
        (p) => `<li><button type="button" class="suggest-item" data-run="${esc(p.name)}">
        <svg viewBox="0 0 24 24"><path fill="currentColor" d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
        <span>${highlight(p.name, key)}</span>
      </button></li>`
      )
      .join("");
    setMode("suggest");
  }

  function renderResults(q) {
    const key = String(q || "").trim();
    lastQuery = key;
    if (!key) {
      setMode("discover");
      return;
    }
    pushHistory(key);
    const list = searchProducts(key);
    resultMeta.textContent = list.length ? `找到 ${list.length} 个结果` : "";
    resultEmpty.hidden = list.length > 0;
    resultList.innerHTML = list
      .map((p) => {
        const attr = getAttr(p);
        const price = Number(p.price || 0);
        const priceText = Number.isInteger(price) ? String(price) : price.toFixed(1);
        return `<button type="button" class="result-card" data-id="${esc(p.id)}">
          <img src="${esc(p.cover || "")}" alt="" />
          <div class="result-body">
            <h3 class="result-name">${highlight(p.name, key)}</h3>
            <p class="result-sub">${esc(p.subtitle || "")}</p>
            <div class="result-tags">
              <span class="result-tag">${esc(attr.short || attr.label || "")}</span>
              ${p.tag ? `<span class="result-tag">${esc(p.tag)}</span>` : ""}
            </div>
            <div class="result-foot">
              <span class="result-price"><em>¥</em>${esc(priceText)}</span>
              <span class="result-meta-side">${esc(p.distance || (p.sales ? `月售${p.sales}` : ""))}</span>
            </div>
          </div>
        </button>`;
      })
      .join("");
    setMode("result");
  }

  function runSearch(q) {
    const key = String(q || input.value || "").trim();
    input.value = key;
    syncClearBtn();
    renderResults(key);
    try {
      const url = new URL(location.href);
      if (key) url.searchParams.set("q", key);
      else url.searchParams.delete("q");
      history.replaceState(null, "", url);
    } catch {
      /* ignore */
    }
  }

  function onCancel() {
    const hasQuery = String(input.value || "").trim();
    if (mode !== "discover" || hasQuery) {
      input.value = "";
      syncClearBtn();
      setMode("discover");
      try {
        const url = new URL(location.href);
        url.searchParams.delete("q");
        history.replaceState(null, "", url);
      } catch {
        /* ignore */
      }
      input.focus();
      return;
    }
    goBack();
  }

  $("btnCancel")?.addEventListener("click", onCancel);
  $("btnClear")?.addEventListener("click", () => {
    input.value = "";
    syncClearBtn();
    setMode("discover");
    input.focus();
  });
  $("btnClearHistory")?.addEventListener("click", clearHistory);

  input?.addEventListener("input", () => {
    syncClearBtn();
    const v = input.value.trim();
    if (!v) {
      setMode("discover");
      return;
    }
    if (mode === "result" && v === lastQuery) return;
    renderSuggest(v);
  });

  input?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      runSearch(input.value);
    }
  });

  discoverPanel?.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-q]");
    if (!btn) return;
    runSearch(btn.dataset.q || "");
  });

  suggestList?.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-run]");
    if (!btn) return;
    runSearch(btn.dataset.run || "");
  });

  resultList?.addEventListener("click", (e) => {
    const card = e.target.closest("[data-id]");
    if (!card) return;
    location.href = `./detail.html?id=${encodeURIComponent(card.dataset.id || "")}`;
  });

  renderHot();
  renderGuess();
  renderHistory();
  syncClearBtn();

  /* 语音搜索（Web Speech API，不支持时降级提示） */
  let recognizing = false;
  let recognition = null;
  const btnVoice = $("btnVoice");

  function setVoiceUi(on) {
    recognizing = on;
    btnVoice?.classList.toggle("is-listening", on);
    btnVoice?.setAttribute("aria-pressed", on ? "true" : "false");
    if (input) input.placeholder = on ? "正在听，请说出服务名称…" : "搜索服务、商品、套餐";
  }

  function stopVoice() {
    try {
      recognition?.stop();
    } catch {
      /* ignore */
    }
    setVoiceUi(false);
  }

  function startVoice() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      alert("当前浏览器暂不支持语音识别，请改用常用服务入口或热门搜索");
      return;
    }
    if (recognizing) {
      stopVoice();
      return;
    }
    recognition = new SR();
    recognition.lang = "zh-CN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => setVoiceUi(true);
    recognition.onerror = () => {
      setVoiceUi(false);
    };
    recognition.onend = () => setVoiceUi(false);
    recognition.onresult = (ev) => {
      const text = ev.results?.[0]?.[0]?.transcript?.trim() || "";
      if (!text) return;
      if (input) input.value = text;
      syncClearBtn();
      runSearch(text);
    };
    try {
      recognition.start();
    } catch {
      setVoiceUi(false);
    }
  }

  btnVoice?.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    startVoice();
  });

  const initial = new URLSearchParams(location.search).get("q") || "";
  const wantVoice = new URLSearchParams(location.search).get("voice") === "1";
  if (initial) {
    input.value = initial;
    syncClearBtn();
    runSearch(initial);
  } else {
    setMode("discover");
    if (wantVoice) setTimeout(() => startVoice(), 280);
    else setTimeout(() => input?.focus(), 160);
  }
})();
