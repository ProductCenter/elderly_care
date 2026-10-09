/*
 * 小象智伴 · 云端数据 / 存储接入层
 * ------------------------------------------------------------
 * 1) 云端数据库：通过 XZCloud.apiBase 指向云函数 / API 网关（腾讯云 CloudBase HTTP 访问服务）
 *    未配置时自动回退到浏览器本地存储，保证离线演示可用。
 * 2) 云端存储：通过 XZCloud.storageBase 指向对象存储 / CDN 域名，
 *    所有图片、文件统一走 XZ.assets.url() 获取地址，切换云端仅需改这一处。
 * ------------------------------------------------------------
 */

(function (global) {
  'use strict';

  var CONFIG_KEY = 'xz:cloud:config';
  var TOKEN_KEY = 'xz:auth:token';
  var USER_KEY = 'xz:auth:user';
  var DB_KEY = 'xz:db';

  var persisted = {};
  try {
    persisted = JSON.parse(localStorage.getItem(CONFIG_KEY) || '{}') || {};
  } catch (e) {
    persisted = {};
  }

  var XZCloud = {
    // 云端 API 网关地址（例如 https://xxx.service.tcloudbase.com）
    apiBase: persisted.apiBase || '',
    // 云端对象存储 / CDN 地址（例如 https://xxx.cos.ap-guangzhou.myqcloud.com/site）
    storageBase: persisted.storageBase || '',
    // 本地回退开关：false 表示强制走云端
    localFallback: persisted.localFallback !== false,
    // 本地资源映射表（切换到云端时，同名文件放到对象存储根目录即可）
    assetMap: {
      'hero-care': 'hero-care.jpg',
      'rehab': 'rehab.jpg',
      'pharmacy': 'pharmacy.jpg',
      'og-cover': 'hero-care.jpg'
    }
  };

  function saveConfig(patch) {
    Object.keys(patch || {}).forEach(function (k) {
      XZCloud[k] = patch[k];
    });
    try {
      localStorage.setItem(CONFIG_KEY, JSON.stringify({
        apiBase: XZCloud.apiBase,
        storageBase: XZCloud.storageBase,
        localFallback: XZCloud.localFallback
      }));
    } catch (e) { /* ignore quota errors */ }
  }

  /* ---------------- 基础存储读写 ---------------- */

  function readDB() {
    try {
      return JSON.parse(localStorage.getItem(DB_KEY) || '{}') || {};
    } catch (e) {
      return {};
    }
  }

  function writeDB(db) {
    try {
      localStorage.setItem(DB_KEY, JSON.stringify(db));
    } catch (e) { /* ignore */ }
  }

  function uuid() {
    return 'x' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  /* ---------------- 口令摘要 ---------------- */

  function digest(text) {
    if (global.crypto && global.crypto.subtle && global.TextEncoder) {
      return global.crypto.subtle.digest('SHA-256', new TextEncoder().encode('xz::' + text))
        .then(function (buf) {
          return Array.prototype.map.call(new Uint8Array(buf), function (b) {
            return ('0' + b.toString(16)).slice(-2);
          }).join('');
        })
        .catch(function () {
          return simpleDigest(text);
        });
    }
    return Promise.resolve(simpleDigest(text));
  }

  function simpleDigest(text) {
    var h1 = 0x811c9dc5, h2 = 0x01000193, i;
    var s = 'xz::' + text;
    for (i = 0; i < s.length; i++) {
      h1 = (h1 ^ s.charCodeAt(i)) >>> 0;
      h2 = ((h2 << 5) + h2 + s.charCodeAt(i)) >>> 0;
    }
    return ('f' + h1.toString(16) + h2.toString(16)).slice(0, 32);
  }

  /* ---------------- 云端请求 ---------------- */

  function cloudEnabled() {
    return !!XZCloud.apiBase;
  }

  function request(path, options) {
    var opts = options || {};
    return fetch(XZCloud.apiBase.replace(/\/$/, '') + path, {
      method: opts.method || 'GET',
      headers: Object.assign({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + (XZCloud.auth.token() || '')
      }, opts.headers || {}),
      body: opts.body ? JSON.stringify(opts.body) : undefined
    }).then(function (res) {
      if (!res.ok) {
        throw new Error('云端请求失败：' + res.status);
      }
      return res.json();
    });
  }

  /* ---------------- 账号体系 ---------------- */

  XZCloud.auth = {
    token: function () {
      return localStorage.getItem(TOKEN_KEY) || '';
    },
    user: function () {
      try {
        return JSON.parse(localStorage.getItem(USER_KEY) || 'null');
      } catch (e) {
        return null;
      }
    },
    isLogin: function () {
      return !!XZCloud.auth.token() && !!XZCloud.auth.user();
    },
    setSession: function (payload) {
      localStorage.setItem(TOKEN_KEY, payload.token);
      localStorage.setItem(USER_KEY, JSON.stringify(payload.user));
    },
    logout: function () {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    },
    login: function (account, password) {
      if (cloudEnabled()) {
        return request('/auth/login', {
          method: 'POST',
          body: { account: account, password: password }
        }).then(function (data) {
          XZCloud.auth.setSession(data.data || data);
          return XZCloud.auth.user();
        });
      }
      if (!XZCloud.localFallback) {
        return Promise.reject(new Error('未配置云端数据库地址'));
      }
      var db = readDB();
      var users = db.users || [];
      var hit = users.filter(function (u) {
        return u.account === account;
      })[0];
      if (!hit) {
        return Promise.reject(new Error('账号不存在，请先注册'));
      }
      return digest(password).then(function (hash) {
        if (hash !== hit.passwordHash) {
          throw new Error('密码不正确');
        }
        XZCloud.auth.setSession({
          token: 'local.' + uuid(),
          user: { id: hit.id, account: hit.account, name: hit.name, org: hit.org }
        });
        return XZCloud.auth.user();
      });
    },
    register: function (payload) {
      if (cloudEnabled()) {
        return request('/auth/register', { method: 'POST', body: payload })
          .then(function (data) {
            XZCloud.auth.setSession(data.data || data);
            return XZCloud.auth.user();
          });
      }
      if (!XZCloud.localFallback) {
        return Promise.reject(new Error('未配置云端数据库地址'));
      }
      var db = readDB();
      db.users = db.users || [];
      if (db.users.some(function (u) { return u.account === payload.account; })) {
        return Promise.reject(new Error('该手机号已注册'));
      }
      return digest(payload.password).then(function (hash) {
        var user = {
          id: uuid(),
          account: payload.account,
          name: payload.name,
          org: payload.org || '',
          role: payload.role || '机构管理员',
          passwordHash: hash,
          createdAt: new Date().toISOString()
        };
        db.users.push(user);
        writeDB(db);
        XZCloud.auth.setSession({
          token: 'local.' + uuid(),
          user: { id: user.id, account: user.account, name: user.name, org: user.org, role: user.role }
        });
        return XZCloud.auth.user();
      });
    }
  };

  /* ---------------- 业务数据读写 ---------------- */

  XZCloud.db = {
    insert: function (collection, doc) {
      var record = Object.assign({ _id: uuid(), _createdAt: new Date().toISOString() }, doc);
      if (cloudEnabled()) {
        return request('/db/' + collection, { method: 'POST', body: doc })
          .then(function (data) { return data.data || record; });
      }
      if (!XZCloud.localFallback) {
        return Promise.reject(new Error('未配置云端数据库地址'));
      }
      var db = readDB();
      db[collection] = db[collection] || [];
      db[collection].push(record);
      writeDB(db);
      return Promise.resolve(record);
    },
    list: function (collection) {
      if (cloudEnabled()) {
        return request('/db/' + collection).then(function (data) {
          return data.data || [];
        });
      }
      if (!XZCloud.localFallback) {
        return Promise.reject(new Error('未配置云端数据库地址'));
      }
      return Promise.resolve((readDB()[collection] || []).slice());
    }
  };

  /* ---------------- 云端存储 ---------------- */

  XZCloud.assets = {
    url: function (key) {
      var file = XZCloud.assetMap[key] || key;
      if (XZCloud.storageBase) {
        return XZCloud.storageBase.replace(/\/$/, '') + '/' + file;
      }
      return 'assets/img/' + file;
    },
    // 上传附件（表单数据直传对象存储），未配置时可继续走云端 API 代理
    upload: function (file) {
      if (!cloudEnabled()) {
        return Promise.reject(new Error('未配置文件上传服务地址'));
      }
      return request('/storage/upload', {
        method: 'POST',
        body: { name: file.name, size: file.size, type: file.type }
      });
    }
  };

  XZCloud.config = saveConfig;

  /* 首次访问时写入一个演示账号，方便直接体验登录流程 */
  (function seed() {
    try {
      var db = readDB();
      if (db.users && db.users.length) return;
      digest('xiaoxiang').then(function (hash) {
        var d = readDB();
        if (d.users && d.users.length) return;
        d.users = [{
          id: uuid(),
          account: '13800000001',
          name: '演示账号',
          org: '夕阳红护理院',
          role: '机构管理员',
          passwordHash: hash,
          createdAt: new Date().toISOString()
        }];
        writeDB(d);
      });
    } catch (e) { /* 忽略存储异常 */ }
  })();

  global.XZCloud = XZCloud;
  global.XZ = {
    auth: XZCloud.auth,
    db: XZCloud.db,
    asset: XZCloud.assets.url,
    upload: XZCloud.assets.upload,
    cloud: XZCloud
  };
})(window);
