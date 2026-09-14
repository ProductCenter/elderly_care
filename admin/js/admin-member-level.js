(() => {
  let booted = false;

  function render() {
    const body = document.getElementById("levelBody");
    if (!body) return;
    const levels = MemberStore.getLevels();
    body.innerHTML = levels
      .map(
        (lv) => `<tr>
          <td>
            <input class="ctrl" name="name" value="${lv.name || ""}" />
            <input type="hidden" name="id" value="${lv.id || ""}" />
          </td>
          <td><input class="ctrl" name="minGrowth" type="number" min="0" value="${lv.minGrowth ?? 0}" /></td>
          <td><input class="ctrl" name="discount" type="number" min="1" max="100" value="${lv.discount ?? 100}" /></td>
          <td><input class="ctrl" name="pointsRate" type="number" min="0.1" step="0.1" value="${lv.pointsRate ?? 1}" /></td>
          <td><input class="ctrl" name="perks" value="${(lv.perks || []).join("，")}" /></td>
        </tr>`
      )
      .join("");
  }

  function boot() {
    if (booted || !document.getElementById("levelBody")) return;
    booted = true;
    render();
    document.getElementById("btnSaveLevels")?.addEventListener("click", () => {
      const rows = [...document.querySelectorAll("#levelBody tr")];
      const levels = rows.map((tr) => {
        const id = tr.querySelector('[name="id"]')?.value || `lv_${Date.now()}`;
        const perksRaw = tr.querySelector('[name="perks"]')?.value || "";
        return {
          id,
          name: tr.querySelector('[name="name"]')?.value.trim() || "会员",
          minGrowth: Number(tr.querySelector('[name="minGrowth"]')?.value) || 0,
          discount: Number(tr.querySelector('[name="discount"]')?.value) || 100,
          pointsRate: Number(tr.querySelector('[name="pointsRate"]')?.value) || 1,
          color:
            MemberStore.DEFAULT_LEVELS.find((x) => x.id === id)?.color || "#64748b",
          perks: perksRaw
            .split(/[,，]/)
            .map((s) => s.trim())
            .filter(Boolean),
        };
      });
      MemberStore.saveLevels(levels);
      AdminUI.toast("等级配置已保存");
      render();
    });
  }

  AdminUI.onReady(boot);
})();
