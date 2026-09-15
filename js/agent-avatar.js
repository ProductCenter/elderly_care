(() => {
  const KEY = "kangyang-agent:avatar-id";
  const LIST = [
    { id: "xiaohu", name: "康小护", src: "./assets/moko-avatar.png", tip: "默认形象" },
    { id: "hello", name: "小护·招呼", src: "./assets/moko/moko-hello.png", tip: "热情打招呼" },
    { id: "cheer", name: "小护·加油", src: "./assets/moko/moko-cheer.png", tip: "打气鼓励" },
    { id: "great", name: "小护·真棒", src: "./assets/moko/moko-great.png", tip: "点赞鼓励" },
    { id: "think", name: "小护·思考", src: "./assets/moko/moko-loading.png", tip: "认真思考中" },
  ];

  function get() {
    const id = localStorage.getItem(KEY) || "xiaohu";
    return LIST.find((a) => a.id === id) || LIST[0];
  }

  function set(idOrAv) {
    const id = typeof idOrAv === "string" ? idOrAv : idOrAv?.id;
    const a = LIST.find((x) => x.id === id) || LIST[0];
    localStorage.setItem(KEY, a.id);
    return a;
  }

  function apply(av) {
    const a = av || get();
    set(a);
    document.querySelectorAll("[data-agent-avatar], [data-tab-agent-avatar]").forEach((img) => {
      img.src = a.src;
      img.alt = a.name;
    });
    document.querySelectorAll("#heroAvatar, .msg-avatar img").forEach((img) => {
      img.src = a.src;
    });
    document.querySelectorAll(".agent-avatar img").forEach((img) => {
      if (!img.closest("#avatarOptions") && !img.closest("#mallAvatarOptions")) {
        img.src = a.src;
      }
    });
    const nameEl = document.getElementById("heroAgentName");
    if (nameEl) nameEl.textContent = a.name;
    document.querySelectorAll("[data-agent-name]").forEach((el) => {
      el.textContent = a.name;
    });
    document
      .querySelectorAll("#avatarOptions .avatar-opt, #mallAvatarOptions .avatar-opt")
      .forEach((btn) => {
        btn.classList.toggle("on", btn.dataset.id === a.id);
      });
    return a;
  }

  function renderOptions(boxId) {
    const box = document.getElementById(boxId || "avatarOptions");
    if (!box) return;
    const cur = get().id;
    box.innerHTML = LIST.map(
      (a) => `<button type="button" class="avatar-opt${a.id === cur ? " on" : ""}" data-id="${a.id}" aria-label="${a.name}">
        <img src="${a.src}" alt="" loading="lazy" /><span>${a.name}</span>
      </button>`
    ).join("");
  }

  window.AgentAvatar = { KEY, LIST, get, set, apply, renderOptions };
})();
