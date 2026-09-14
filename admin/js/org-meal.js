(() => {
  const days = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];
  let offset = 0;
  const base = {
    早餐: ["小米粥,鸡蛋,酱菜", "豆浆,包子,咸鸭蛋", "南瓜粥,花卷,牛奶", "燕麦粥,茶叶蛋", "白粥,油条,豆腐乳", "豆浆,馒头", "八宝粥,鸡蛋"],
    午餐: ["番茄牛腩,清炒时蔬,米饭", "红烧鱼,蒜蓉菠菜,米饭", "宫保鸡丁,上汤娃娃菜", "清蒸鲈鱼,蒜苔肉丝", "炖排骨,凉拌黄瓜", "可乐鸡翅,地三鲜", "家常豆腐,青椒肉丝"],
    晚餐: ["疙瘩汤,拌面,凉拌木耳", "馄饨,青菜", "鸡蛋面,凉拌黄瓜", "小笼包,紫菜汤", "米线,凉拌豆芽", "炒饭,番茄蛋汤", "粥铺,小菜拼盘"],
  };
  const SEED = days.map((d, i) => ({
    day: d,
    早餐: base.早餐[i],
    午餐: base.午餐[i],
    晚餐: base.晚餐[i],
  }));
  let data = AdminStore.load("org-meal", SEED);
  function persist() {
    AdminStore.save("org-meal", data);
  }

  function weekLabel() {
    const start = new Date(2026, 6, 27);
    start.setDate(start.getDate() + offset * 7);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    const fmt = (d) => `${d.getMonth() + 1}/${d.getDate()}`;
    return `${fmt(start)} - ${fmt(end)}`;
  }

  function render() {
    stWeek.textContent = weekLabel();
    stDays.innerHTML = `7<em>天</em>`;
    menuWeek.innerHTML = data
      .map(
        (d) => `<div class="menu-day">
          <h3>${d.day}</h3>
          <div class="meal"><div class="t">早餐</div><div class="d">${d.早餐}</div></div>
          <div class="meal"><div class="t">午餐</div><div class="d">${d.午餐}</div></div>
          <div class="meal"><div class="t">晚餐</div><div class="d">${d.晚餐}</div></div>
        </div>`
      )
      .join("");
    mDay.innerHTML = days.map((d) => `<option>${d}</option>`).join("");
  }

  AdminUI.onReady(() => {
    AdminUI.bindDrawer("mealDrawer");
    btnPrev.onclick = () => {
      offset -= 1;
      render();
    };
    btnNext.onclick = () => {
      offset += 1;
      render();
    };
    btnEdit.onclick = () => AdminUI.openDrawer("mealDrawer");
    btnSave.onclick = () => {
      const day = mDay.value;
      const meal = mMeal.value;
      const dishes = mDishes.value.trim();
      if (!dishes) {
        AdminUI.toast("请填写菜品", "error");
        return;
      }
      const row = data.find((d) => d.day === day);
      if (row) row[meal] = dishes;
      persist();
      AdminUI.closeDrawer("mealDrawer");
      AdminUI.toast("菜谱已更新");
      render();
    };
    render();
  });
})();
