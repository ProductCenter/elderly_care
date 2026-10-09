/**
 * 智伴 · 转人工客服（演示）
 * 提供意图识别、排队接通、人工气泡回复与结束会话能力。
 */
(function (global) {
  "use strict";

  var AGENT_NAME = "小雅";
  var AGENT_TITLE = "人工客服 · " + AGENT_NAME;

  var HANDOFF_RE =
    /转人工|人工客服|找人工|找客服|联系客服|真人客服|人工服务|请转人工|需要人工|要人工|客服帮忙|在线客服|有人协助|协助下单/;
  var END_RE =
    /结束人工|退出人工|返回智伴|结束客服|结束会话|回到智伴|不用人工|取消人工|挂断客服/;

  var state = {
    active: false,
    connecting: false,
    sessionId: "",
    timers: [],
  };

  function clearTimers() {
    state.timers.forEach(function (t) {
      try {
        clearTimeout(t);
      } catch (e) {}
    });
    state.timers = [];
  }

  function later(ms, fn) {
    var id = setTimeout(fn, ms);
    state.timers.push(id);
    return id;
  }

  function wait(ms) {
    return new Promise(function (resolve) {
      later(ms, resolve);
    });
  }

  function isHandoffIntent(text) {
    return HANDOFF_RE.test(String(text || "").trim());
  }

  function isEndIntent(text) {
    return END_RE.test(String(text || "").trim());
  }

  function isActive() {
    return !!state.active;
  }

  function isConnecting() {
    return !!state.connecting;
  }

  function agentLabel() {
    return AGENT_TITLE;
  }

  function agentShort() {
    return AGENT_NAME;
  }

  function sessionId() {
    return state.sessionId || "";
  }

  function pickReply(userText) {
    var t = String(userText || "").trim();
    if (/下单|购买|买|订单|支付|付款/.test(t)) {
      return (
        "您好，我是人工客服" +
        AGENT_NAME +
        "。关于下单：您可以在「乐活」里选好商品后点立即购买；若页面卡住，把商品名称和遇到的步骤发我，我帮您一步步核对。\n\n" +
        "也可以直接告诉我您想买什么，我帮您查库存与配送范围。"
      );
    }
    if (/退款|退货|售后|取消订单|换货/.test(t)) {
      return (
        "收到，售后这边我来跟进。请补充：订单号（或下单手机号后四位）、商品名称，以及希望退款还是换货。\n\n" +
        "提交后我会在工作台为您建单，一般 1 个工作日内有处理进度。"
      );
    }
    if (/配送|物流|快递|多久到|送到/.test(t)) {
      return (
        "配送说明：同城服务按预约时段上门；商城实物一般 1–3 个工作日送达（偏远地区可能更久）。\n\n" +
        "把订单号发我，我帮您查当前物流节点。"
      );
    }
    if (/预约|上门|照护|助浴|康复/.test(t)) {
      return (
        "可以帮您预约上门服务。请告诉我：服务对象（本人/父母）、大致地址、希望的时间段，以及需要的服务类型（如助浴、康复、陪诊）。\n\n" +
        "确认后我会为您匹配就近服务商。"
      );
    }
    if (/投诉|不满|差评|态度/.test(t)) {
      return (
        "非常抱歉给您带来不好的体验。请简单描述发生时间和具体情况，我这边立刻升级处理，并在今日内给您反馈结果。"
      );
    }
    if (/谢谢|感谢|好的|嗯嗯|收到/.test(t)) {
      return (
        "不客气～还有问题随时说。若暂时不需要人工，可以说「结束人工」返回智伴继续聊健康与陪伴。"
      );
    }
    if (/你好|您好|在吗|有人吗/.test(t)) {
      return (
        "您好，我是人工客服" +
        AGENT_NAME +
        "，一直在线。请问今天需要帮忙处理订单、售后，还是预约上门服务呢？"
      );
    }
    return (
      "已收到您的消息：「" +
      (t.length > 40 ? t.slice(0, 40) + "…" : t) +
      "」。\n\n" +
      "我是人工客服" +
      AGENT_NAME +
      "，正在为您核实。您也可以补充订单号或具体诉求，我会尽快给您明确答复。\n\n" +
      "（演示环境：此为模拟人工坐席回复）"
    );
  }

  function notify(adapters) {
    if (adapters && typeof adapters.onModeChange === "function") {
      try {
        adapters.onModeChange(state.active, {
          agentName: AGENT_NAME,
          label: AGENT_TITLE,
          sessionId: state.sessionId,
        });
      } catch (e) {}
    }
  }

  function reset(adapters) {
    clearTimers();
    state.active = false;
    state.connecting = false;
    state.sessionId = "";
    notify(adapters || null);
  }

  /**
   * adapters:
   *   appendSystem(text)
   *   appendHuman(text)
   *   scroll()
   *   onModeChange(active, meta)
   *   setComposerHint?(text)
   */
  async function startHandoff(adapters, userText) {
    if (!adapters) return;
    if (state.active) {
      adapters.appendHuman(
        "您已在人工客服会话中，我是" + AGENT_NAME + "，请直接说明需要协助的事项即可。"
      );
      if (adapters.scroll) adapters.scroll();
      return;
    }
    if (state.connecting) return;

    state.connecting = true;
    notify(adapters);

    var reason = String(userText || "").trim();
    adapters.appendSystem("正在为您转接人工客服，请稍候…");
    if (adapters.scroll) adapters.scroll();

    await wait(700);
    adapters.appendSystem("当前排队第 1 位，预计等待约 20 秒");
    if (adapters.scroll) adapters.scroll();

    await wait(1100);
    state.sessionId =
      "CS" +
      String(Date.now()).slice(-8) +
      String(Math.floor(Math.random() * 90 + 10));
    state.connecting = false;
    state.active = true;
    notify(adapters);

    adapters.appendSystem("已接通 · " + AGENT_TITLE + "（会话 " + state.sessionId + "）");
    if (adapters.scroll) adapters.scroll();

    await wait(480);
    var greet =
      "您好，我是人工客服" +
      AGENT_NAME +
      "，很高兴为您服务。\n\n" +
      (reason && !isHandoffIntent(reason)
        ? "已看到您刚才说的：「" + reason + "」，我来帮您处理。"
        : reason
          ? "已收到您的转人工请求"
          : "请问今天需要帮忙处理什么呢？") +
      "\n\n常见可协助：下单支付、售后退款、预约上门、物流查询。说「结束人工」可返回智伴。";
    adapters.appendHuman(greet);
    if (adapters.setComposerHint) {
      adapters.setComposerHint("正在与人工客服 " + AGENT_NAME + " 对话…");
    }
    if (adapters.scroll) adapters.scroll();
  }

  async function replyAsHuman(adapters, userText) {
    if (!adapters || !state.active) return;
    var text = String(userText || "").trim();
    if (!text) return;

    if (isEndIntent(text)) {
      await endSession(adapters, "user");
      return;
    }

    await wait(600 + Math.floor(Math.random() * 500));
    adapters.appendHuman(pickReply(text));
    if (adapters.scroll) adapters.scroll();
  }

  async function endSession(adapters, reason) {
    if (!adapters) {
      reset();
      return;
    }
    clearTimers();
    if (!state.active && !state.connecting) return;

    state.active = false;
    state.connecting = false;
    var sid = state.sessionId;
    state.sessionId = "";
    notify(adapters);

    adapters.appendHuman(
      "好的，本次人工服务先告一段落" +
        (sid ? "（会话 " + sid + "）" : "") +
        "。后续健康咨询可继续问智伴；需要时再说「转人工」即可。"
    );
    await wait(280);
    adapters.appendSystem(
      reason === "reset"
        ? "已结束人工会话，对话已清空"
        : "已结束人工会话，已返回智伴"
    );
    if (adapters.setComposerHint) {
      adapters.setComposerHint("");
    }
    if (adapters.scroll) adapters.scroll();
  }

  global.AgentHuman = {
    isHandoffIntent: isHandoffIntent,
    isEndIntent: isEndIntent,
    isActive: isActive,
    isConnecting: isConnecting,
    agentLabel: agentLabel,
    agentShort: agentShort,
    sessionId: sessionId,
    startHandoff: startHandoff,
    replyAsHuman: replyAsHuman,
    endSession: endSession,
    reset: reset,
  };
})(typeof window !== "undefined" ? window : this);
