(() => {
  const AGENT_NAME = "康小护";
  // 商城与智伴统一端口：页面与 /api 同源
  const API_BASE = "";

  const familyQs = window.AgentFamilyDemo?.QUESTIONS || [];
  const healthBatch = familyQs.filter((q) => q.cat === "health");
  const bizBatch = familyQs.filter((q) => q.cat === "biz");
  const familyBatch = familyQs.filter((q) => q.cat === "family");
  const QUESTION_FLAT = [
    ...(healthBatch.length
      ? healthBatch
      : [
          { q: "打开爸妈的健康档案", cat: "health", icon: "📋", color: "#5a8fc7" },
          { q: "我这一周血压控制得怎么样？", cat: "health", icon: "🩺", color: "#5a8fc7" },
          { q: "睡眠监测报告出来后怎么看？", cat: "health", icon: "😴", color: "#5a8fc7" },
        ]),
    ...(bizBatch.length
      ? bizBatch
      : [
          { q: "林家这周有哪些关键业务节点？", cat: "biz", icon: "📌", color: "#6b8f71" },
          { q: "爸妈的能力评估结果是什么？", cat: "biz", icon: "📝", color: "#6b8f71" },
          { q: "本周护理计划和任务执行得怎么样？", cat: "biz", icon: "🗓️", color: "#6b8f71" },
        ]),
    ...(familyBatch.length
      ? familyBatch
      : [
          { q: "帮我看看爸妈现在最需要什么照护？", cat: "family", icon: "👨‍👩‍👧", color: "#e36a12" },
          { q: "针对爸妈这种情况，平台要准备哪些供给？", cat: "family", icon: "🧺", color: "#e36a12" },
          { q: "怎么把爸妈的需求和供给对上？", cat: "family", icon: "🔗", color: "#e36a12" },
        ]),
    { q: "帮我推荐附近合适的上门照护服务", cat: "care", icon: "🏠", color: "#7b9e6c" },
    { q: "预约下周的上门助浴", cat: "care", icon: "🛁", color: "#7b9e6c" },
    { q: "居家照护和到店理疗怎么选？", cat: "care", icon: "🆚", color: "#7b9e6c" },
    { q: "帮我寻找附近美食", cat: "canteen", icon: "🍜", color: "#f08a2a" },
    { q: "周末有没有适合长者的兴趣活动？", cat: "activity", icon: "🎨", color: "#c979d8" },
    { q: "帮我安排下周的社区活动", cat: "activity", icon: "📅", color: "#c979d8" },
  ];
  const PAGE_SIZE = 3;
  const QUESTION_POOL = [];
  for (let i = 0; i < QUESTION_FLAT.length; i += PAGE_SIZE) {
    QUESTION_POOL.push(QUESTION_FLAT.slice(i, i + PAGE_SIZE));
  }

  let toastTimer = 0;
  let questionIndex = 0;
  let busy = false;
  let history = [];

  const $ = (id) => document.getElementById(id);
  const app = $("app");

  function toast(msg) {
    const el = $("toast");
    if (!el) return;
    el.textContent = msg;
    el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      el.hidden = true;
    }, 2200);
  }

  function pad(n) {
    return String(n).padStart(2, "0");
  }

  function greetByHour(h) {
    if (h >= 5 && h < 11) return "早上好";
    if (h >= 11 && h < 13) return "中午好";
    if (h >= 13 && h < 18) return "下午好";
    return "晚上好";
  }

  function subByHour(h) {
    return "无设备也能用报告、面诊示意和朋友圈关心爸妈 👇";
  }

  function syncClock() {
    const now = new Date();
    const timeEl = $("statusTime");
    if (timeEl) timeEl.textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
    const lead = $("heroGreetLead");
    if (lead) lead.textContent = greetByHour(now.getHours());
    const sub = $("heroSub");
    if (sub) sub.textContent = subByHour(now.getHours());
  }

  function renderQuestions(batch) {
    const list = $("guessList");
    if (!list) return;
    list.innerHTML = batch
      .map(
        (it) => {
          const q = typeof it === "string" ? it : it.q;
          const icon = typeof it === "string" ? "✨" : it.icon || "✨";
          const color = typeof it === "string" ? "var(--orange)" : it.color || "var(--orange)";
          const cat = typeof it === "string" ? "" : it.cat || "";
          return `
      <button type="button" class="guess-item" role="listitem" data-q="${q.replace(/"/g, "&quot;")}" data-cat="${cat}" style="--guess-accent: ${color}">
        <span class="guess-icon" aria-hidden="true">${icon}</span>
        <span class="guess-text">${q}</span>
      </button>`;
        }
      )
      .join("");
  }

  function enterChat() {
    app?.classList.add("is-chatting");
    $("chatPane").hidden = false;
  }

  function resetChat() {
    if (busy) return;
    history = [];
    app?.classList.remove("is-chatting");
    $("chatPane").hidden = true;
    $("chatStream").innerHTML = "";
    $("pageBody")?.scrollTo({ top: 0, behavior: "smooth" });
    const input = $("textInput");
    if (input) input.value = "";
    showVoice();
  }

  function showVoice() {
    $("voiceBar").hidden = false;
    $("textBar").hidden = true;
  }

  function showText() {
    $("voiceBar").hidden = true;
    $("textBar").hidden = false;
    setTimeout(() => $("textInput")?.focus(), 50);
  }

  function unlockInput() {
    busy = false;
    $("btnSend").disabled = false;
    $("btnHold").disabled = false;
    $("textInput")?.removeAttribute("disabled");
  }

  function lockInput() {
    busy = true;
    $("btnSend").disabled = true;
    $("btnHold").disabled = true;
    $("textInput")?.setAttribute("disabled", "disabled");
  }

  function scrollChat() {
    const body = $("pageBody");
    if (body) body.scrollTop = body.scrollHeight;
  }

  /** CUI 调出时，把对应问题滚到可视区顶部，方便对照解读 */
  function scrollToQuestion(userRow) {
    const body = $("pageBody");
    if (!body || !userRow) {
      scrollChat();
      return;
    }
    document.querySelectorAll("#chatStream .msg.is-user.is-focus").forEach((el) => {
      el.classList.remove("is-focus");
    });
    userRow.classList.add("is-focus");
    const apply = () => {
      const bodyRect = body.getBoundingClientRect();
      const rowRect = userRow.getBoundingClientRect();
      const nextTop = body.scrollTop + (rowRect.top - bodyRect.top) - 10;
      body.scrollTo({ top: Math.max(0, nextTop), behavior: "smooth" });
    };
    requestAnimationFrame(() => requestAnimationFrame(apply));
    clearTimeout(scrollToQuestion._timer);
    scrollToQuestion._timer = setTimeout(() => userRow.classList.remove("is-focus"), 1600);
  }

  function scrollAfterAnswer(userRow, bubble) {
    const hasCui = !!(bubble && bubble.querySelector && bubble.querySelector(".cui-block"));
    if (hasCui && userRow) scrollToQuestion(userRow);
    else scrollChat();
  }

  function renderAnswer(el, markdown) {
    if (!el) return;
    el.classList.add("md-body");
    const md = window.AgentMarkdown;
    if (md && typeof md.render === "function") {
      el.innerHTML = md.render(markdown || "");
    } else {
      el.textContent = markdown || "";
    }
  }

  function clearFollowups() {
    document.querySelectorAll("#chatStream .followups").forEach((el) => el.remove());
  }

  function appendFollowups(row, items) {
    if (!row || !items?.length) return;
    const col = row.querySelector(".msg-col") || row;
    col.querySelector(".followups")?.remove();
    const box = document.createElement("div");
    box.className = "followups";
    box.innerHTML =
      `<p class="followups-hd">根据刚才的档案，你可以继续问</p>` +
      items
        .slice(0, 3)
        .map((it) => {
          const text = typeof it === "string" ? it : it.q;
          const icon = typeof it === "string" ? "✨" : it.icon || "✨";
          const color = typeof it === "string" ? "var(--orange)" : it.color || "var(--orange)";
          const cat = typeof it === "string" ? "" : it.cat || "";
          return `<button type="button" class="followup-item" data-q="${text.replace(/"/g, "&quot;")}" data-cat="${cat}" style="--guess-accent: ${color}">
            <span class="guess-icon" aria-hidden="true">${icon}</span>
            <span class="guess-text">${text}</span>
          </button>`;
        })
        .join("");
    col.appendChild(box);
  }

  function appendUser(text, imageUrl) {
    const stream = $("chatStream");
    const row = document.createElement("div");
    row.className = "msg is-user";
    const bubble = document.createElement("div");
    bubble.className = "msg-bubble" + (imageUrl ? " has-media" : "");
    if (imageUrl) {
      const img = document.createElement("img");
      img.className = "msg-media";
      img.src = imageUrl;
      img.alt = "上传图片";
      bubble.appendChild(img);
      const cap = document.createElement("div");
      cap.className = "msg-media-cap";
      cap.textContent = text;
      bubble.appendChild(cap);
    } else {
      bubble.textContent = text;
    }
    row.appendChild(bubble);
    stream.appendChild(row);
    scrollChat();
    return row;
  }

  function appendAssistantShell() {
    const stream = $("chatStream");
    const row = document.createElement("div");
    row.className = "msg is-bot is-loading";
    row.innerHTML = `
      <div class="msg-col">
        <details class="think-box" hidden open>
          <summary class="think-summary">
            <span class="think-label">思考中</span>
            <span class="think-hint">展开查看</span>
          </summary>
          <div class="think-body"></div>
        </details>
        <div class="msg-bubble is-empty">
          <span class="msg-typing"><i></i><i></i><i></i></span>
        </div>
      </div>`;
    stream.appendChild(row);
    scrollChat();
    return {
      row,
      thinkBox: row.querySelector(".think-box"),
      thinkLabel: row.querySelector(".think-label"),
      thinkBody: row.querySelector(".think-body"),
      bubble: row.querySelector(".msg-bubble"),
    };
  }

  async function checkLlmStatus() {
    const banner = $("llmBanner");
    const text = $("llmBannerText");
    try {
      const res = await fetch(`${API_BASE}/api/llm/status`, { cache: "no-store" });
      if (!res.ok) throw new Error("status " + res.status);
      const data = await res.json();
      if (!data.configured) {
        banner.hidden = false;
        text.textContent = "演示模式：未配置大模型密钥（仍可对话）";
      } else {
        banner.hidden = true;
        text.textContent = `已连接 ${data.model || "大模型"}`;
      }
      return data;
    } catch {
      banner.hidden = false;
      text.textContent = "大模型服务未就绪：请用 scripts/llm_server.py 启动本站（商城与智伴同端口）";
      return { configured: false, offline: true };
    }
  }

  async function streamChat(userText, ui) {
    const context = history
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => ({ role: m.role, content: String(m.content || "").trim() }))
      .filter((m) => m.content);
    const familyCtx = window.AgentFamilyDemo?.SYSTEM_CONTEXT;
    const messages = (familyCtx
      ? [{ role: "system", content: familyCtx }]
      : []
    ).concat(context, [{ role: "user", content: userText }]);

    const abort = new AbortController();
    const id = setTimeout(() => abort.abort(), 70000);
    let res;
    try {
      res = await fetch(`${API_BASE}/api/chat`, {
        method: "POST",
        signal: abort.signal,
        headers: { "Content-Type": "application/json", Accept: "text/event-stream" },
        body: JSON.stringify({ messages, stream: true }),
      });
    } finally {
      clearTimeout(id);
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.detail || `请求失败 ${res.status}`);
    }

    const ctype = res.headers.get("content-type") || "";
    if (!ctype.includes("text/event-stream")) {
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || "请求失败");
      if (data.reasoning) {
        ui.thinkBox.hidden = false;
        ui.thinkBody.textContent = data.reasoning;
        ui.thinkLabel.textContent = "已思考";
        ui.thinkBox.open = false;
      }
      ui.bubble.classList.remove("is-empty");
      renderAnswer(ui.bubble, data.content || "");
      return { content: data.content || "", reasoning: data.reasoning || "" };
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let content = "";
    let reasoning = "";
    let answerStarted = false;
    let gotEvent = false;
    let finished = false;

    const ensureAnswer = () => {
      if (!answerStarted) {
        answerStarted = true;
        ui.bubble.classList.remove("is-empty");
        ui.bubble.innerHTML = "";
        if (reasoning) {
          ui.thinkLabel.textContent = "已思考";
        }
      }
    };

    try {
      while (true) {
        let chunk;
        try {
          chunk = await reader.read();
        } catch (err) {
          if (content || reasoning) break;
          throw new Error("读取响应失败：" + (err.message || err));
        }
        if (chunk.done || finished) break;
        gotEvent = true;
        buffer += decoder.decode(chunk.value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() || "";
        for (const part of parts) {
          const line = part
            .split("\n")
            .map((l) => l.trim())
            .find((l) => l.startsWith("data:"));
          if (!line) continue;
          const raw = line.slice(5).trim();
          if (!raw || raw === "[DONE]") continue;
          let ev;
          try {
            ev = JSON.parse(raw);
          } catch {
            continue;
          }
          if (ev.type === "reasoning" && ev.delta) {
            reasoning += ev.delta;
            ui.thinkBox.hidden = false;
            ui.thinkBox.open = true;
            ui.thinkLabel.textContent = "思考中";
            ui.thinkBody.textContent = reasoning;
            scrollChat();
          } else if (ev.type === "content" && ev.delta) {
            ensureAnswer();
            content += ev.delta;
            renderAnswer(ui.bubble, content);
            scrollChat();
          } else if (ev.type === "done") {
            finished = true;
            content = ev.content || content;
            reasoning = ev.reasoning || reasoning;
            if (reasoning) {
              ui.thinkBox.hidden = false;
              ui.thinkBody.textContent = reasoning;
              ui.thinkLabel.textContent = "已思考";
              ui.thinkBox.open = !content;
            }
            if (content) {
              ensureAnswer();
              renderAnswer(ui.bubble, content);
            } else if (!reasoning) {
              ensureAnswer();
              ui.bubble.textContent = "（没有收到内容）";
            }
          } else if (ev.type === "error") {
            finished = true;
            if (content || reasoning) break;
            throw new Error(ev.error || ev.detail || "流式错误");
          }
        }
      }
    } finally {
      // close reader and force abort the underlying fetch to release the
      // HTTP connection immediately; this prevents the next click from being
      // queued waiting for the previous keep-alive connection to drain.
      try {
        await reader.cancel();
      } catch {}
      try {
        abort.abort();
      } catch {}
    }

    if (!content && !reasoning && !gotEvent) {
      throw new Error("没有收到模型响应，请稍后再试");
    }
    if (!answerStarted && content) ensureAnswer();
    if (reasoning && content) {
      ui.thinkLabel.textContent = "已思考";
      ui.thinkBox.open = false;
    }
    return { content, reasoning };
  }


  const CAPTURE_MODES = {
    face: {
      title: "AI 面诊 · 拍照上传",
      desc: "请正对光线，拍清面部（演示流程，不替代诊疗）",
      submitText: "帮我做一次AI面诊示意",
      demoSrc: "./assets/home/home-tab-avatar-v2.png",
    },
    tongue: {
      title: "AI 舌诊 · 拍照上传",
      desc: "自然伸出舌头，拍清舌面与舌苔（演示）",
      submitText: "帮我做一次AI舌诊示意",
      demoSrc: "./assets/cover-nutrition-meal.png",
    },
    report: {
      title: "体检报告 · 上传",
      desc: "上传报告关键页照片或相册扫描件（演示解析）",
      submitText: "我上传了体检报告，帮我解读",
      demoSrc: "./assets/cover-health-check.png",
    },
    camera: {
      title: "拍照识别 · 体检报告",
      desc: "现场拍照或从相册选择报告页，识别后生成轻档案",
      submitText: "拍照识别体检报告",
      demoSrc: "./assets/cover-bp-monitor.png",
    },
  };

  let captureMode = null;
  let captureDataUrl = null;

  function isCaptureIntent(text) {
    const t = (text || "").trim();
    if (/面诊/.test(t)) return "face";
    if (/舌诊/.test(t)) return "tongue";
    if (/拍照识别|打开相机|拍一下报告|拍照.*报告/.test(t)) return "camera";
    if (/体检报告|上传报告|报告解读/.test(t) && !/睡眠监测报告/.test(t)) return "report";
    return null;
  }

  function setCaptureStep(step) {
    const items = $("captureSteps")?.querySelectorAll("li") || [];
    items.forEach((li, i) => li.classList.toggle("on", i === step));
  }

  function closeCaptureSheet() {
    $("captureMask").hidden = true;
    $("captureSheet").hidden = true;
    captureMode = null;
    captureDataUrl = null;
    const cam = $("captureFileCamera");
    const alb = $("captureFileAlbum");
    if (cam) cam.value = "";
    if (alb) alb.value = "";
  }

  function showCaptureEmpty() {
    captureDataUrl = null;
    $("captureEmpty").hidden = false;
    $("capturePreview").hidden = true;
    $("capturePreview").removeAttribute("src");
    $("captureActions").hidden = false;
    $("captureConfirm").hidden = true;
    setCaptureStep(0);
  }

  function showCapturePreview(dataUrl) {
    captureDataUrl = dataUrl;
    $("captureEmpty").hidden = true;
    const img = $("capturePreview");
    img.hidden = false;
    img.src = dataUrl;
    $("captureActions").hidden = true;
    $("captureConfirm").hidden = false;
    setCaptureStep(1);
  }

  function openCaptureSheet(mode) {
    const cfg = CAPTURE_MODES[mode];
    if (!cfg) return;
    if (busy) {
      toast("小护还在回答，请稍等…");
      return;
    }
    captureMode = mode;
    $("captureTitle").textContent = cfg.title;
    $("captureDesc").textContent = cfg.desc;
    showCaptureEmpty();
    $("captureMask").hidden = false;
    $("captureSheet").hidden = false;
  }

  function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error("读取图片失败"));
      reader.readAsDataURL(file);
    });
  }

  async function onCaptureFile(file) {
    if (!file) return;
    if (!/^image\//.test(file.type || "")) {
      toast("请选择图片文件");
      return;
    }
    try {
      const url = await readFileAsDataUrl(file);
      showCapturePreview(url);
    } catch (err) {
      toast(err.message || "读取失败");
    }
  }

  async function submitCapture() {
    const mode = captureMode;
    const cfg = CAPTURE_MODES[mode];
    const imageUrl = captureDataUrl;
    if (!cfg || !imageUrl) {
      toast("请先拍照或选择图片");
      return;
    }
    setCaptureStep(2);
    closeCaptureSheet();
    await sendMessage(cfg.submitText, { imageUrl, skipCaptureGate: true });
  }

  $("captureClose")?.addEventListener("click", closeCaptureSheet);
  $("captureMask")?.addEventListener("click", closeCaptureSheet);
  $("btnCaptureCamera")?.addEventListener("click", () => $("captureFileCamera")?.click());
  $("btnCaptureAlbum")?.addEventListener("click", () => $("captureFileAlbum")?.click());
  $("btnCaptureDemo")?.addEventListener("click", () => {
    const cfg = CAPTURE_MODES[captureMode];
    if (!cfg) return;
    showCapturePreview(cfg.demoSrc);
  });
  $("btnCaptureRetake")?.addEventListener("click", showCaptureEmpty);
  $("btnCaptureSubmit")?.addEventListener("click", () => {
    submitCapture();
  });
  $("captureFileCamera")?.addEventListener("change", (e) => {
    const file = e.target.files && e.target.files[0];
    onCaptureFile(file);
  });
  $("captureFileAlbum")?.addEventListener("change", (e) => {
    const file = e.target.files && e.target.files[0];
    onCaptureFile(file);
  });

  async function sendMessage(text, opts) {
    const content = (text || "").trim();
    const options = opts || {};
    console.log("[send] content=", content, "busy=", busy);
    if (!content || busy) {
      if (busy) toast("小护还在回答，请稍等…");
      return;
    }
    // 面诊/舌诊/报告/拍照：先走拍照上传，再解读
    if (!options.skipCaptureGate) {
      const mode = isCaptureIntent(content) || (CAPTURE_MODES[options.captureMode] && options.captureMode);
      if (mode && CAPTURE_MODES[mode]) {
        openCaptureSheet(mode);
        return;
      }
    }
    enterChat();
    showText();
    lockInput();
    console.log("[send] locked busy=", busy);

    clearFollowups();
    const userRow = appendUser(content, options.imageUrl || "");
    history.push({
      role: "user",
      content: options.imageUrl ? `[图片] ${content}` : content,
    });
    const ui = appendAssistantShell();

    const canned =
      window.AgentFamilyDemo &&
      (typeof window.AgentFamilyDemo.matchReply === "function"
        ? window.AgentFamilyDemo.matchReply(content)
        : (() => {
            const raw = window.AgentFamilyDemo.match(content);
            return raw ? { content: raw, followups: [] } : null;
          })());
    if (canned) {
      try {
        await new Promise((r) => setTimeout(r, 240));
        ui.row.classList.remove("is-loading");
        ui.bubble.classList.remove("is-empty");
        renderAnswer(ui.bubble, canned.content);
        history.push({ role: "assistant", content: canned.content });
        appendFollowups(ui.row, canned.followups);
        scrollAfterAnswer(userRow, ui.bubble);
      } finally {
        const input = $("textInput");
        if (input) input.value = "";
        unlockInput();
        if (input && document.activeElement === input) input.focus();
      }
      return;
    }

    try {
      const result = await streamChat(content, ui);
      ui.row.classList.remove("is-loading");
      if (!result.content && result.reasoning) {
        ui.bubble.classList.remove("is-empty");
        ui.bubble.classList.remove("md-body");
        ui.bubble.textContent = "（思考完成，但未返回正文）";
      }
      history.push({ role: "assistant", content: result.content || "" });
      scrollAfterAnswer(userRow, ui.bubble);
    } catch (err) {
      ui.row.classList.remove("is-loading");
      ui.bubble.classList.remove("is-empty");
      ui.bubble.classList.remove("md-body");
      ui.bubble.textContent = `小护暂时连不上大模型：${err.message}`;
      scrollChat();
    } finally {
      const input = $("textInput");
      if (input) input.value = "";
      console.log("[send] finally unlock busy=", busy);
      unlockInput();
      console.log("[send] unlocked busy=", busy);
      if (input && document.activeElement === input) {
        input.focus();
      }
    }
  }

  function trySendFromInput() {
    const input = $("textInput");
    const val = input?.value || "";
    if (input) input.value = "";
    sendMessage(val);
  }

  $("btnSend")?.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    trySendFromInput();
  });

  // 猜你想问 / 快捷问题：本页对话，禁止任何默认跳转
  $("guessList")?.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    const btn = e.target.closest(".guess-item");
    if (!btn) return;
    const q = btn.dataset.q || btn.textContent.trim();
    console.log("[guess] click q=", q, "busy=", busy);
    const mode = isCaptureIntent(q);
    if (mode) {
      toast("请拍照或上传图片…");
      openCaptureSheet(mode);
      return;
    }
    toast(busy ? "小护还在回答，请稍等…" : "正在问小护…");
    sendMessage(q);
  });

  $("quickRow")?.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    const btn = e.target.closest("[data-act]");
    if (!btn) return;
    const act = btn.dataset.act;
    if (act === "face" || act === "tongue" || act === "report" || act === "camera") {
      toast("请拍照或上传图片…");
      openCaptureSheet(act);
      return;
    }
    if (act === "family") {
      sendMessage("帮我看看爸妈现在最需要什么照护？");
      return;
    }
    if (act === "canteen" || act === "food") {
      sendMessage("帮我寻找附近美食");
      return;
    }
    if (act === "care") {
      sendMessage("帮我推荐附近合适的上门照护服务");
      return;
    }
    if (act === "health") {
      sendMessage("打开爸妈的健康档案");
      return;
    }
    if (act === "activity") {
      sendMessage("帮我安排下周的社区活动");
      return;
    }
    toast(`${AGENT_NAME}：更多能力陆续开放`);
  });

  // 回答里的链接 / CUI 卡片按钮：不新开页，继续在本页对话
  $("chatStream")?.addEventListener("click", (e) => {
    const a = e.target.closest("a.md-link");
    if (a) {
      e.preventDefault();
      e.stopPropagation();
      const href = a.getAttribute("href") || "";
      if (/^https?:\/\//i.test(href)) {
        toast("演示环境请在本页继续提问，不跳转外链");
        sendMessage(`请继续说明：${a.textContent.trim() || href}`);
        return;
      }
      sendMessage(`我想了解：${a.textContent.trim() || href}`);
      return;
    }
    const follow = e.target.closest(".followup-item");
    if (follow) {
      e.preventDefault();
      e.stopPropagation();
      const q = follow.dataset.q || follow.textContent.trim();
      if (q) sendMessage(q);
      return;
    }
    const btn = e.target.closest(".cui-btn");
    if (btn) {
      e.preventDefault();
      e.stopPropagation();
      const href = btn.dataset.href?.trim();
      if (href) {
        if (/^https?:\/\//i.test(href)) {
          toast("演示环境请在本页继续提问，不跳转外链");
          sendMessage(`请继续说明：${btn.textContent.trim() || href}`);
          return;
        }
        location.href = href;
        return;
      }
      const q = btn.dataset.q || btn.textContent.trim();
      if (q) sendMessage(q);
      return;
    }
    // Click on product card body (not action buttons) -> go to detail
    const productCard = e.target.closest(".cui-product-card");
    if (productCard) {
      e.preventDefault();
      e.stopPropagation();
      const id = productCard.dataset.id;
      if (id) location.href = `./detail.html?id=${encodeURIComponent(id)}`;
      return;
    }
  });

  // Fallback mapping: common CUI button texts => mall pages
  const CUI_LINK_MAP = {
    "去核销": "./orders.html",
    "查看详情": null,
    "立即预约": null,
    "去核销 top1": "./orders.html",
    "去核销 TOP1": "./orders.html",
    "查看本周菜单": "./index.html",
    "约上午": "./orders.html",
    "约下午": "./orders.html",
    "一键报名": "./mine.html",
    "提醒我出发": "./mine.html",
    "生成控盐计划": "./mine.html",
    "查看详细分析": "./mine.html",
    "查看改善建议": "./mine.html",
    "生成完整 7 天": "./mine.html",
    "替换我不吃的菜": null,
    "帮我选合适的": null,
  };

  const CUI_PRODUCT_HINTS = [
    { ids: ["ai_massage"], keywords: ["理疗", "舒压", "按摩"] },
    { ids: ["foot_spa"], keywords: ["足浴", "泡脚"] },
    { ids: ["health_check"], keywords: ["健康检测", "体检", "血压", "血糖"] },
    { ids: ["package_meal_month"], keywords: ["食堂", "套餐", "订餐", "控糖套餐"] },
    { ids: ["calligraphy"], keywords: ["书法", "兴趣"] },
    { ids: ["ar_sports"], keywords: ["运动", "AR", "降脂"] },
    { ids: ["neck_massage"], keywords: ["颈椎"] },
    { ids: ["nutrition_meal"], keywords: ["营养配餐", "轻食"] },
    { ids: ["companion_care"], keywords: ["陪诊", "陪护", "护理员"] },
    { ids: ["home_clean"], keywords: ["保洁", "清洁"] },
    { ids: ["bp_monitor"], keywords: ["血压计"] },
    { ids: ["pulse_oximeter"], keywords: ["血氧仪"] },
    { ids: ["wellness_kit"], keywords: ["礼包"] },
  ];

  function inferProductIds(text) {
    const t = (text || "").toLowerCase();
    const ids = new Set();
    for (const hint of CUI_PRODUCT_HINTS) {
      if (hint.keywords.some((k) => t.includes(k))) {
        hint.ids.forEach((id) => ids.add(id));
      }
    }
    return Array.from(ids);
  }

  function resolveCuiButtonAction(label, context) {
    const key = (label || "").trim();
    if (CUI_LINK_MAP[key]) return { type: "link", href: CUI_LINK_MAP[key] };
    if (/^查看.*详情$|^去看看$|^立即预约$|^去预约$/.test(key)) {
      const ids = inferProductIds(context + " " + key);
      if (ids.length === 1) {
        return { type: "link", href: `./detail.html?id=${encodeURIComponent(ids[0])}` };
      }
    }
    if (/^立即预约$|^去下单$|^去买$|^购买$/.test(key)) {
      const ids = inferProductIds(context + " " + key);
      if (ids.length === 1) {
        return { type: "link", href: `./order.html?goodsId=${encodeURIComponent(ids[0])}` };
      }
    }
    return null;
  }

  $("btnBack")?.addEventListener("click", () => {
    if (app?.classList.contains("is-chatting")) {
      resetChat();
      return;
    }
    if (window.history.length > 1) window.history.back();
    else location.href = "./index.html";
  });

  $("btnRefresh")?.addEventListener("click", (e) => {
    e.preventDefault();
    questionIndex = (questionIndex + 1) % QUESTION_POOL.length;
    renderQuestions(QUESTION_POOL[questionIndex]);
    toast("已换一批问题");
  });

  const hold = $("btnHold");
  hold?.addEventListener("pointerdown", (e) => {
    if (busy) return;
    e.preventDefault();
    hold.classList.add("is-holding");
    hold.textContent = "松开发送";
  });
  const endHold = (e) => {
    if (!hold || !hold.classList.contains("is-holding")) return;
    hold.classList.remove("is-holding");
    hold.textContent = "按住说话";
    if (e) e.preventDefault();
    sendMessage("用语音问一下：附近有什么适合长者的到店服务？");
  };
  hold?.addEventListener("pointerup", endHold);
  hold?.addEventListener("pointercancel", endHold);
  hold?.addEventListener("pointerleave", endHold);

  $("btnKeyboard")?.addEventListener("click", showText);
  $("btnToVoice")?.addEventListener("click", showVoice);
  $("btnMenu")?.addEventListener("click", resetChat);

  $("textBar")?.addEventListener("submit", (e) => {
    e.preventDefault();
    e.stopPropagation();
    trySendFromInput();
  });

  $("textInput")?.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey && !e.isComposing) {
      e.preventDefault();
      e.stopPropagation();
      trySendFromInput();
    }
  });

  // 确保点输入框时不被其它事件截断
  $("textInput")?.addEventListener("focus", () => {
    if (busy) return;
    $("btnSend").disabled = false;
  });

  $("btnLlmHint")?.addEventListener("click", () => {
    toast("复制 llm.env.example → llm.env，填入 API Key，再运行 python3 scripts/llm_server.py");
  });


  function applyAvatar(av) {
    if (window.AgentAvatar) window.AgentAvatar.apply(av);
  }

  function openAvatarSheet() {
    window.AgentAvatar?.renderOptions("avatarOptions");
    const mask = $("avatarMask");
    const sheet = $("avatarSheet");
    if (mask) mask.hidden = false;
    if (sheet) sheet.hidden = false;
  }
  function closeAvatarSheet() {
    const mask = $("avatarMask");
    const sheet = $("avatarSheet");
    if (mask) mask.hidden = true;
    if (sheet) sheet.hidden = true;
  }
  $("btnAvatarSwitch")?.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    openAvatarSheet();
  });
  $("btnAvatarClose")?.addEventListener("click", closeAvatarSheet);
  $("avatarMask")?.addEventListener("click", closeAvatarSheet);
  $("avatarOptions")?.addEventListener("click", (e) => {
    const btn = e.target.closest(".avatar-opt");
    if (!btn || !window.AgentAvatar) return;
    const av = window.AgentAvatar.LIST.find((a) => a.id === btn.dataset.id);
    if (av) {
      applyAvatar(av);
      toast(`已切换为「${av.name}」`);
    }
  });

  applyAvatar();
  syncClock();
  renderQuestions(QUESTION_POOL[0]);
  checkLlmStatus();
  setInterval(syncClock, 30_000);

  // 支持从首页卡片「猜你想问」/采集按钮带入问题开始对话
  try {
    const params = new URLSearchParams(location.search);
    const action = params.get("action")?.trim();
    let initialQ = params.get("q")?.trim() || "";
    const actionQ = {
      face: "帮我做一次AI面诊示意",
      tongue: "帮我做一次AI舌诊示意",
      report: "我上传了体检报告，帮我解读",
      camera: "拍照识别体检报告",
    };
    if (!initialQ && action && actionQ[action]) initialQ = actionQ[action];
    if (action && CAPTURE_MODES[action]) {
      history.replaceState({}, "", location.pathname + location.hash);
      setTimeout(() => openCaptureSheet(action), 160);
    } else if (initialQ) {
      history.replaceState({}, "", location.pathname + location.hash);
      setTimeout(() => sendMessage(initialQ), 120);
    }
  } catch {}
})();
