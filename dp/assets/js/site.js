/*
 * 小象智伴官网 · 公共交互
 * 负责：导航高亮、登录/注册、图片云端地址注入、表单提交到云端数据库、FAQ 折叠
 */

(function () {
  'use strict';

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------- 导航高亮 ---------- */
  var here = location.pathname.split('/').pop() || 'index.html';
  $$('.nav a').forEach(function (a) {
    if (a.getAttribute('href') === here) a.classList.add('on');
  });

  /* ---------- 云端图片注入 ---------- */
  $$('[data-asset]').forEach(function (el) {
    el.src = window.XZ.asset(el.dataset.asset);
  });

  /* ---------- 登录入口 ---------- */
  var slot = $('#authSlot');
  var mode = 'login';

  function render() {
    var u = window.XZ.auth.user();
    if (!slot) return;
    if (u) {
      slot.innerHTML =
        '<div class="user-menu">' +
        '<button class="btn btn-s btn-o">' + (u.name || u.account) + ' ▾</button>' +
        '<div class="box">' +
        '<b>' + (u.name || u.account) + '</b>' +
        '<div class="row"><span>' + (u.org || '个人账号') + '</span></div>' +
        '<div class="row"><span>' + (u.role || '访客') + '</span></div>' +
        '<div style="margin-top:10px"><button class="link-btn" id="logoutBtn">退出登录</button></div>' +
        '</div></div>';
      $('#logoutBtn').addEventListener('click', function () {
        window.XZ.auth.logout();
        render();
        toast('已退出登录');
      });
    } else {
      slot.innerHTML = '<button class="btn btn-s btn-g" id="loginBtn">登录</button>' +
        '<a class="btn btn-s btn-p" href="contact.html">预约演示</a>';
      $('#loginBtn').addEventListener('click', openAuth);
    }
  }

  /* ---------- 登录弹层 ---------- */
  function openAuth() {
    mode = 'login';
    drawDialog();
    $('.auth-mask').classList.add('show');
  }

  function drawDialog() {
    var isLogin = mode === 'login';
    $('.auth-box').innerHTML =
      '<h3>' + (isLogin ? '登录客户中心' : '注册机构账号') + '</h3>' +
      '<div class="tip">账号数据存储于云端数据库，可用于查看服务方案、下载资料</div>' +
      '<div class="auth-tabs"><div class="' + (isLogin ? 'on' : '') + '" data-m="login">登录</div>' +
      '<div class="' + (isLogin ? '' : 'on') + '" data-m="reg">注册</div></div>' +
      (isLogin
        ? '<div class="frm"><div class="full"><label>手机号 / 账号</label><input id="aAcc" value="13800000001"></div>' +
          '<div class="full"><label>密码</label><input id="aPwd" type="password" value="xiaoxiang"></div></div>'
        : '<div class="frm">' +
          '<div><label>联系人姓名</label><input id="rName" placeholder="张院长"></div>' +
          '<div><label>机构名称</label><input id="rOrg" placeholder="例如：夕阳红护理院"></div>' +
          '<div class="full"><label>手机号 / 账号</label><input id="aAcc" placeholder="请输入手机号"></div>' +
          '<div class="full"><label>密码</label><input id="aPwd" type="password" placeholder="设置登录密码"></div></div>') +
      '<div class="form-msg" id="aMsg"></div>' +
      '<div style="display:flex;gap:10px;margin-top:14px">' +
      '<button class="btn btn-g" style="flex:1" id="aCancel">取消</button>' +
      '<button class="btn btn-p" style="flex:1" id="aOk">' + (isLogin ? '登录' : '注册并登录') + '</button></div>' +
      '<div class="note">演示账号：13800000001 / xiaoxiang</div>';

    $$('.auth-box .auth-tabs div').forEach(function (t) {
      t.addEventListener('click', function () { mode = t.dataset.m; drawDialog(); });
    });
    $('#aCancel').addEventListener('click', closeAuth);
    $('#aOk').addEventListener('click', submit);
  }

  function submit() {
    var msg = $('#aMsg');
    msg.className = 'form-msg';
    var acc = $('#aAcc').value.trim();
    var pwd = $('#aPwd').value;
    if (!acc || !pwd) {
      msg.textContent = '请填写完整信息';
      msg.className = 'form-msg err';
      return;
    }
    var task = mode === 'login'
      ? XZ.auth.login(acc, pwd)
      : XZ.auth.register({ name: $('#rName').value.trim(), org: $('#rOrg').value.trim(), account: acc, password: pwd });

    msg.textContent = '正在校验…';
    task.then(function (u) {
      render();
      closeAuth();
      toast('欢迎回来，' + (u.name || u.account));
    }).catch(function (e) {
      msg.textContent = e.message || '操作失败，请稍后重试';
      msg.className = 'form-msg err';
    });
  }

  function closeAuth() { $('.auth-mask').classList.remove('show'); }

  if ($('.auth-mask')) {
    $('.auth-mask').addEventListener('click', function (e) {
      if (e.target === $('.auth-mask')) closeAuth();
    });
  }

  /* ---------- 表单：预约演示 / 联系我们 ---------- */
  $$('form[data-cloud]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var box = $('.form-msg', form.parentNode) || $('.form-msg');
      var collection = form.dataset.cloud;
      var payload = {};
      $$('input,select,textarea', form).forEach(function (el) {
        if (el.name) payload[el.name] = el.value.trim();
      });
      if (!payload.name || !payload.phone) {
        if (box) { box.textContent = '请填写姓名与联系电话'; box.className = 'form-msg err'; }
        return;
      }
      if (box) { box.textContent = '正在提交…'; box.className = 'form-msg'; }
      XZ.db.insert(collection, Object.assign(payload, { source: here, ua: navigator.userAgent.slice(0, 120) }))
        .then(function () {
          form.reset();
          if (box) {
            box.textContent = XZ.cloud.apiBase
              ? '提交成功，已存入云端数据库，顾问将在 1 个工作日内与您联系。'
              : '提交成功，数据已保存。当前为本地演示存储，配置云端地址后将自动写入云端数据库。';
            box.className = 'form-msg ok';
          }
        })
        .catch(function (err) {
          if (box) { box.textContent = err.message || '提交失败'; box.className = 'form-msg err'; }
        });
    });
  });

  /* ---------- FAQ ---------- */
  $$('.qa .q').forEach(function (q) {
    q.addEventListener('click', function () { q.parentNode.classList.toggle('open'); });
  });

  /* ---------- 轻提示 ---------- */
  function toast(text) {
    var el = document.createElement('div');
    el.textContent = text;
    el.style.cssText = 'position:fixed;left:50%;top:90px;transform:translateX(-50%);background:#10283a;color:#fff;' +
      'padding:11px 22px;border-radius:10px;font-size:14px;z-index:99;box-shadow:0 12px 30px rgba(16,40,58,.24)';
    document.body.appendChild(el);
    setTimeout(function () {
      el.style.transition = 'opacity .4s';
      el.style.opacity = '0';
      setTimeout(function () { el.remove(); }, 400);
    }, 2000);
  }

  render();
  window.addEventListener('storage', render);
})();
