(function () {
  'use strict';

  var NS = 'http://www.w3.org/2000/svg';
  var pathSets = {
    activity: ['M3 12h4l2.2-7 4.6 14 2.2-7H21'],
    alert: ['M12 3 22 20H2L12 3Z', 'M12 9v4', 'M12 16.5h.01'],
    arrow: ['M12 19V5', 'm5 12 7-7 7 7'],
    award: ['m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z'],
    bag: ['M5 8h14l1 13H4L5 8Z', 'M9 8V6a3 3 0 0 1 6 0v2', 'M9 12h6'],
    battery: ['M3 7h17v10H3z', 'M21 10v4', 'M6 10h8v4H6z'],
    bell: ['M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9', 'M10 21h4'],
    bot: ['M12 3v3', 'M9 3h6', 'M5 8h14v12H5z', 'M9 12h.01', 'M15 12h.01', 'M9 16h6'],
    bed: ['M3 19V5', 'M3 14h18v5', 'M3 11h5a4 4 0 0 1 4 4', 'M12 14h9v-3a3 3 0 0 0-3-3h-6'],
    book: ['M5 4.5A2.5 2.5 0 0 1 7.5 2H20v18H7.5A2.5 2.5 0 0 0 5 22V4.5Z', 'M5 5v17', 'M9 7h7', 'M9 11h7'],
    box: ['m3 7 9-4 9 4v10l-9 4-9-4V7Z', 'm3 7 9 4 9-4', 'M12 11v10', 'M7.5 5l9 4'],
    broom: ['m4 20 9-9', 'm9 15 4 4', 'm2 22 5-5', 'm11 8 5-5 5 5-5 5'],
    calendar: ['M4 5h16v16H4z', 'M8 3v4', 'M16 3v4', 'M4 10h16', 'M8 14h3', 'M14 14h2', 'M8 18h3'],
    camera: ['M4 7h3l2-3h6l2 3h3v13H4z', 'M12 10a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z'],
    cake: ['M4 11h16v10H4z', 'M3 11a3 3 0 0 1 6 0 3 3 0 0 1 6 0 3 3 0 0 1 6 0', 'M8 16h.01', 'M12 16h.01', 'M16 16h.01', 'M12 6V3'],
    capsule: ['M7.5 5.5a5 5 0 0 1 7 0l4 4a5 5 0 0 1-7 7l-4-4a5 5 0 0 1 0-7Z', 'm9 14 7-7'],
    chart: ['M4 19V5', 'M4 19h17', 'm7 15 4-5 3 2 5-7', 'm16 5 3 0 0 3'],
    check: ['m5 12 4 4L19 6'],
    clock: ['M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z', 'M12 6v6l4 2'],
    cloud: ['M7 18h10a4 4 0 0 0 .6-8A6 6 0 0 0 6 9a4.5 4.5 0 0 0 1 9Z'],
    cross: ['M12 4v16', 'M4 12h16'],
    diamond: ['m12 2 9 7-9 13L3 9l9-7Z', 'M3 9h18', 'm8 9 4 13 4-13', 'm8 9 4-7 4 7'],
    document: ['M6 3h9l5 5v13H6z', 'M14 3v6h6', 'M9 13h8', 'M9 17h6'],
    drop: ['M12 2s7 8 7 13a7 7 0 0 1-14 0c0-5 7-13 7-13Z', 'M9 16a3 3 0 0 0 3 3'],
    eye: ['M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z', 'M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z'],
    file: ['M6 3h9l5 5v13H6z', 'M14 3v6h6', 'M9 14h8', 'M9 17h5'],
    flame: ['M12 22a7 7 0 0 0 7-7c0-4-3-6-3-10-2 2-3 4-3 6-2-2-3-4-3-7-3 3-5 7-5 11a7 7 0 0 0 7 7Z', 'M12 22a3 3 0 0 0 3-3c0-2-2-4-3-5-1 2-3 3-3 5a3 3 0 0 0 3 3Z'],
    folder: ['M3 6h7l2 2h9v12H3z', 'M3 9h18'],
    gift: ['M3 10h18v11H3z', 'M2 7h20v3H2z', 'M12 7v14', 'M12 7H8a2.5 2.5 0 1 1 2.5-2.5L12 7Zm0 0h4a2.5 2.5 0 1 0-2.5-2.5L12 7Z'],
    heart: ['M20.8 8.8c0 5.2-8.8 11-8.8 11s-8.8-5.8-8.8-11a4.8 4.8 0 0 1 8.8-2.6 4.8 4.8 0 0 1 8.8 2.6Z'],
    help: ['M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3', 'M12 17h.01', 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z'],
    home: ['m3 10 9-7 9 7', 'M5 9v12h14V9', 'M9 21v-7h6v7'],
    hospital: ['M4 21V5h16v16H4Z', 'M9 21v-5h6v5', 'M12 7v5', 'M9.5 9.5h5'],
    mealBowl: ['M4 12h16', 'M5 12a7 7 0 0 0 14 0', 'M7 17h10', 'M9 20h6'],
    image: ['M4 4h16v16H4z', 'M8.5 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z', 'm20 15-5-5L5 20'],
    info: ['M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z', 'M12 11v6', 'M12 7h.01'],
    inbox: ['M4 4h16v16H4z', 'M4 13h4l2 3h4l2-3h4'],
    flag: ['M5 21V4', 'M5 5c5-3 9 3 14 0v10c-5 3-9-3-14 0'],
    leaf: ['M20 4c-8 0-14 3-14 10a6 6 0 0 0 6 6c7 0 10-6 8-16Z', 'M4 21c3-5 7-8 12-11'],
    link: ['M10 13a5 5 0 0 0 7.1 0l2-2a5 5 0 0 0-7.1-7.1l-1.1 1.1', 'M14 11a5 5 0 0 0-7.1 0l-2 2A5 5 0 0 0 12 20l1.1-1.1'],
    lock: ['M5 11h14v10H5z', 'M8 11V7a4 4 0 0 1 8 0v4', 'M12 15v2'],
    mail: ['M3 5h18v14H3z', 'm3 7 9 7 9-7'],
    megaphone: ['m3 11 15-6v14L3 13z', 'M7 14l2 7h4l-3-6', 'M21 10v4'],
    microphone: ['M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3Z', 'M19 11a7 7 0 0 1-14 0', 'M12 18v4', 'M8 22h8'],
    music: ['M9 18V5l12-2v13', 'M9 18a3 3 0 1 1-3-3 3 3 0 0 1 3 3Z', 'M21 16a3 3 0 1 1-3-3 3 3 0 0 1 3 3Z'],
    moon: ['M20.5 14A8.5 8.5 0 0 1 10 3.5 8.5 8.5 0 1 0 20.5 14Z'],
    more: ['M5 12h.01', 'M12 12h.01', 'M19 12h.01'],
    note: ['M5 3h14v18l-7-4-7 4z', 'M8 8h8', 'M8 12h6'],
    pin: ['M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z', 'M12 10a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z'],
    play: ['m8 5 11 7-11 7z'],
    pulse: ['M3 12h4l2-6 4 12 3-7 2 1h3'],
    phone: ['M7 3H4a1 1 0 0 0-1 1c0 9.4 7.6 17 17 17a1 1 0 0 0 1-1v-3l-5-2-2 3a14 14 0 0 1-6-6l3-2-2-5Z'],
    phoneOff: ['M7 3H4a1 1 0 0 0-1 1c0 9.4 7.6 17 17 17a1 1 0 0 0 1-1v-3l-5-2-2 3a14 14 0 0 1-3-2', 'm3 3 18 18'],
    receipt: ['M5 3h14v18l-3-2-4 2-4-2-3 2z', 'M8 8h8', 'M8 12h6'],
    shoppingCart: ['M3 4h2l2.2 11.2a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L22 8H6', 'M9 21a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z', 'M18 21a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z'],
    refresh: ['M20 7v5h-5', 'M4 17v-5h5', 'M5.5 9A7 7 0 0 1 18 6l2 6', 'M18.5 15A7 7 0 0 1 6 18l-2-6'],
    ruler: ['M3 16 16 3l5 5-13 13z', 'm11 8 2 2', 'm8 11 2 2', 'm14 5 2 2'],
    scale: ['M12 3v17', 'M5 6h14', 'M5 6 2 13h6L5 6Z', 'm19 6-3 7h6l-3-7Z', 'M7 21h10'],
    search: ['M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z', 'm17 17 4 4'],
    settings: ['M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z', 'M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.7 2.9-.2-.1a1.7 1.7 0 0 0-1.8.5l-.1.2h-3.4l-.1-.2a1.7 1.7 0 0 0-1.8-.5l-.2.1-1.7-2.9.1-.1a1.7 1.7 0 0 0 .3-1.9l-.1-.2-3.2-1.7v-3.4l.2-.1a1.7 1.7 0 0 0 .5-1.8l-.1-.2 2.9-1.7.1.1a1.7 1.7 0 0 0 1.9.3l.2-.1h3.4l.1.2a1.7 1.7 0 0 0 1.8.5l.2-.1 1.7 2.9-.1.1a1.7 1.7 0 0 0-.3 1.9l.1.2 3.2 1.7v3.4l-.2.1a1.7 1.7 0 0 0-.5 1.8'],
    shield: ['M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z', 'm9 12 2 2 4-4'],
    shirt: ['M8 4 12 6l4-2 5 3-3 4-2-1v11H8V10l-2 1-3-4z'],
    lantern: ['M6 7h12l1 14H5L6 7Z', 'M7 7l1-4h8l1 4', 'M9 11h6', 'M9 15h6', 'M12 3V1'],
    dna: ['M7 3c0 6 10 12 10 18', 'M17 3C17 9 7 15 7 21', 'M8 6h8', 'M7 10h10', 'M7 14h10', 'M8 18h8'],
    signal: ['M3 20h2', 'M7 17h2', 'M11 14h2', 'M15 11h2', 'M19 8h2'],
    chair: ['M6 12V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v7', 'M4 12h16v5H4z', 'M6 17v4', 'M18 17v4'],
    massage: ['M7 20c1-3 2-4 5-5', 'M12 15c0-3 2-5 5-6', 'M8 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z', 'M17 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z'],
    type: ['M4 6V4h16v2', 'M12 4v16', 'M8 20h8'],
    quiet: ['M3 10v4h4l5 4V6l-5 4H3Z', 'M17 9l4 6', 'm21 9-4 6'],
    snowflake: ['M12 2v20', 'm4.9 6 14.2 12', 'M19.1 6 4.9 18', 'm9 4 3 2 3-2', 'm9 20 3-2 3 2', 'm3 10 1.9-1 0-3', 'm21 14-1.9 1 0 3', 'm21 10-1.9-1 0-3', 'M3 14l1.9 1 0 3'],
    smile: ['M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z', 'M8 14s1.5 3 4 3 4-3 4-3', 'M9 9h.01', 'M15 9h.01'],
    sparkles: ['m12 3 1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7L12 3Z', 'm19 14 .8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8L19 14Z'],
    speaker: ['M4 10v4h4l5 4V6l-5 4H4Z', 'M17 9a5 5 0 0 1 0 6', 'M19 6a9 9 0 0 1 0 12'],
    stethoscope: ['M6 3v5a4 4 0 0 0 8 0V3', 'M6 5H4V3h4v2H6Z', 'M12 12v2a5 5 0 0 0 10 0v-2', 'M22 11a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z'],
    teapot: ['M7 8h10a2 2 0 0 1 2 2v5a5 5 0 0 1-5 5h-4a5 5 0 0 1-5-5v-5a2 2 0 0 1 2-2Z', 'M19 10h1a3 3 0 0 1 0 6h-2', 'M8 8l-4 3v3l4-1', 'M9 6h6', 'M12 6V4'],
    testTube: ['M9 3h6', 'M10 3v8l-5.5 8.5A1.7 1.7 0 0 0 6 22h12a1.7 1.7 0 0 0 1.5-2.5L14 11V3', 'M8 17h8'],
    shower: ['M4 9a8 8 0 0 1 16 0', 'M17 9h4', 'M7 13v.01', 'M11 15v.01', 'M15 13v.01', 'M19 15v.01'],
    target: ['M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z', 'M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z', 'M12 12h.01'],
    sun: ['M12 3v2', 'M12 19v2', 'M3 12h2', 'M19 12h2', 'm5.6 5.6 1.4 1.4', 'm17 17 1.4 1.4', 'm18.4 5.6-1.4 1.4', 'M7 17l-1.4 1.4', 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z'],
    thermometer: ['M14 14.8V5a3 3 0 0 0-6 0v9.8a5 5 0 1 0 6 0Z', 'M11 8v8'],
    tools: ['m14 7 3-3 4 4-3 3', 'm5 19 9-9', 'M4 4l6 6', 'M3 8l5-5'],
    truck: ['M3 6h11v12H3z', 'M14 10h4l3 3v5h-7z', 'M7 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z', 'M18 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z'],
    user: ['M20 21a8 8 0 0 0-16 0', 'M12 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z'],
    users: ['M16 21a6 6 0 0 0-12 0', 'M10 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z', 'M20 21a5 5 0 0 0-4-4.8', 'M16 5.2a4 4 0 0 1 0 7.6'],
    utensils: ['M7 3v7', 'M4 3v4a3 3 0 0 0 6 0V3', 'M7 10v11', 'M16 3v18', 'M16 3c3 2 4 6 0 9'],
    video: ['M4 6h11a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z', 'm17 10 5-3v10l-5-3'],
    wallet: ['M3 6h17a1 1 0 0 1 1 1v13H3z', 'M3 6V4l15-2', 'M16 13h5', 'M17 13h.01'],
    walking: ['M13 5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z', 'm12 7-3 5 4 2 1 7', 'm9 12-4 2-2 5', 'm12 8 5 3 3-1'],
    wash: ['M12 2s7 8 7 13a7 7 0 0 1-14 0c0-5 7-13 7-13Z', 'M9 16a3 3 0 0 0 5 1'],
    watch: ['M8 7V4h8v3', 'M8 17v3h8v-3', 'M6 7h12v10H6z', 'M10 10h4'],
    wrench: ['M14 6a5 5 0 0 0 6 6l-9 9a2 2 0 0 1-3-3l9-9a5 5 0 0 1-6-6l3 3 3-1 1-3z'],
    x: ['M18 6 6 18', 'M6 6l12 12']
  };

  var glyphMap = {};
  function assign(name, glyphs) {
    glyphs.split(' ').forEach(function (glyph) {
      glyphMap[glyph.replace(/\uFE0F/g, '')] = name;
    });
  }
  assign('activity', '⚡ 🫁 🫀');
  assign('alert', '⚠ ⚠️ 🚨');
  assign('arrow', '⬆️');
  assign('award', '🏅 🥇 🥈');
  assign('bag', '🛍️ 🧰 🧺');
  assign('battery', '🔋');
  assign('bell', '🔔');
  assign('book', '📖 📚');
  assign('calendar', '📅 🗓️');
  assign('camera', '📷 🖼 🖼️');
  assign('cake', '🎂');
  assign('capsule', '💊');
  assign('chart', '📈 📊');
  assign('check', '✅ 👍');
  assign('clock', '🕐 🕘 ⏰ 🕰️');
  assign('cloud', '🌧️');
  assign('cross', '✚');
  assign('diamond', '💎 💠');
  assign('document', '📄 📋 🧾 🪪 📇');
  assign('drop', '💧');
  assign('cross', '✚ 🩸 🩹');
  assign('eye', '👀');
  assign('file', '📑');
  assign('flame', '🔥');
  assign('folder', '📁 🗂️');
  assign('gift', '🎁');
  assign('heart', '♥ 💓 💗 💛 💕 💖');
  assign('help', '❓');
  assign('home', '🏠 🏘️ 🏙️');
  assign('hospital', '🏥 🚑');
  assign('image', '🖼 🖼️');
  assign('info', 'ℹ️');
  assign('inbox', '📬 📭');
  assign('leaf', '🌿 🌼 🍐 🥗');
  assign('link', '🔗');
  assign('lock', '🔒 🔐');
  assign('mail', '💌');
  assign('megaphone', '📣');
  assign('microphone', '🎤 🎙️');
  assign('music', '🎵');
  assign('moon', '🌙 😴 💤 🛏️');
  assign('more', '⋯');
  assign('note', '📌 🎫');
  assign('pin', '📍');
  assign('play', '▶️');
  assign('pulse', '🩺');
  assign('receipt', '📦');
  assign('refresh', '🔄');
  assign('ruler', '📐');
  assign('scale', '⚖️');
  assign('search', '🔍');
  assign('settings', '⚙️ 🎚️');
  assign('shield', '🛡️');
  assign('shirt', '🧣');
  assign('smile', '😊 🙂 😐 😔 🤗');
  assign('sparkles', '✨ 🎉 🌟');
  assign('speaker', '🔊 🔕');
  assign('stethoscope', '🩺');
  assign('testTube', '🧪');
  assign('dna', '🧬');
  assign('sun', '☀️ 🌅 🌇');
  assign('thermometer', '🌡️');
  assign('tools', '✏️ ✍️ 🖋️');
  assign('broom', '🧹');
  assign('user', '👩 🧑‍⚕️ 👋');
  assign('users', '👥 👨‍👩‍👧 👨‍👧');
  assign('utensils', '🍖 🥣 🍚 🍲 🍽️ 🍛 🥢 🫖');
  assign('video', '📹');
  assign('wallet', '💰 💳');
  assign('walking', '🚶 🏃 🤸 💪 🦶');
  assign('wash', '🛁 🚿 🧼');
  assign('watch', '⌚');
  assign('wrench', '🪛');
  assign('activity', '📡');
  assign('phoneOff', '📵');
  assign('gift', '🎀');
  assign('wash', '♨️');
  assign('leaf', '🍐');
  assign('note', '📝');
  assign('pulse', '💓 💗');
  assign('receipt', '🛒');
  assign('sparkles', '✨ 🎉 🌟');
  assign('target', '🎯');
  assign('lantern', '🏮');
  assign('flag', '🎏');
  assign('truck', '🚚');
  assign('massage', '💆');
  assign('chair', '🪑');
  assign('type', '🔤 🔠 ⌨️');
  assign('snowflake', '❄ ❄️ 🧊');
  assign('signal', '📶');
  assign('phone', '📱 📞');
  assign('bot', '🐘 🤖');
  assign('quiet', '🤫');
  assign('clock', '🐢');
  assign('activity', '📡');
  assign('sparkles', '✨ 🎉 🌟');
  assign('bed', '🛏️');
  assign('teapot', '🫖');
  assign('mealBowl', '🍚 🍲');
  assign('shoppingCart', '🛒');
  assign('shower', '🚿');
  assign('stethoscope', '👩‍⚕️');

  var palettes = {
    alert:['#D76558','#F3A58F','#FFF0EB'], award:['#C28B2D','#E8BC5A','#FFF5D9'], bed:['#647FAE','#A8B9DD','#EEF3FF'], bell:['#D99731','#F0BF58','#FFF4D6'], book:['#5588B5','#89B8D8','#EAF4FF'], broom:['#A77B39','#E2B457','#FFF4D8'], cake:['#D7657C','#F0A7B4','#FFF0F3'], calendar:['#5E8D79','#95C5A9','#EDF8F1'], capsule:['#CE7045','#F3AD68','#FFF1E5'], chart:['#4C91A1','#82C1C7','#E8F7F7'], check:['#53976B','#8DC59A','#EFF8EE'], cloud:['#618AB8','#A4C2E4','#EEF5FF'], cross:['#D35C54','#F0A29A','#FFF0EE'], document:['#6688A9','#ABC4DD','#EFF5FB'], drop:['#478FAE','#82C5D7','#E9F8FC'], gift:['#D3795D','#F2AE8E','#FFF2EB'], heart:['#D45E6A','#F39AA4','#FFF0F2'], hospital:['#D65F50','#EF9C80','#FFF0EA'], home:['#C68645','#E9B66F','#FFF5E5'], leaf:['#59956C','#98C990','#F0F8EA'], massage:['#8C70AA','#B8A2D4','#F4EEFA'], mealBowl:['#C1873D','#E6B465','#FFF5E4'], moon:['#687FAE','#AEBCE0','#F0F3FF'], music:['#806CB0','#B4A3D6','#F4F0FB'], nurse:['#559C78','#9BCFAE','#EFF9F1'], pulse:['#D65C62','#F0A0A0','#FFF0F1'], receipt:['#BD7C3E','#E6B56F','#FFF5E6'], shower:['#4E9DB9','#8ACBDD','#EAF8FC'], shoppingCart:['#D48C32','#F0BB58','#FFF5DE'], stethoscope:['#5386B0','#92B9D2','#EEF6FC'], teapot:['#C58047','#E9B178','#FFF4E8'], utensils:['#6D9A56','#AAC982','#F3F9E9'], video:['#5C91B8','#9BC7DE','#EEF7FC'], walking:['#579875','#91C59D','#EEF8EF'], wash:['#4F9BB9','#92CEE0','#EBF8FC']
  };
  var fallbackPalettes = [
    ['#C47A52','#E9AC7D','#FFF2E8'], ['#6C8E76','#A7C7A5','#F0F8EF'],
    ['#6A85B0','#AABBE0','#EFF3FF'], ['#AE7C45','#E4B768','#FFF5DF'],
    ['#9474A8','#C2A8D1','#F6F0F8'], ['#4F91A0','#92C9C9','#EAF8F7']
  ];
  function paletteFor(name) {
    if (palettes[name]) return palettes[name];
    var score = 0;
    for (var i = 0; i < name.length; i++) score = (score + name.charCodeAt(i) * (i + 1)) % fallbackPalettes.length;
    return fallbackPalettes[score];
  }

  var tokenRx = /\p{Extended_Pictographic}(?:\uFE0F|\u200D\p{Extended_Pictographic}|\p{Emoji_Modifier})*/gu;
  var prefixSelector = 'h1,h2,h3,h4,.nb-h,.good-sec-h,.hr-sec-h,.sec-h,.fs-h,.gd-hero-k,.lh-b-k,.gd-chip,.mhb-badge,.lab,.lbl,.eh,.tl-h,.bx-h,.rm-sec-h,.pa,.mi,.tl,.cap,.chat-btn,.good-tip,.gd-note,.kpi-top,.gh,.fm-kpi,button';
  var ignoredSelector = 'script,style,textarea,noscript,svg,.toast,.toast-box';

  function iconName(glyph, context) {
    var base = glyph.replace(/\uFE0F/g, '');
    if (glyphMap[base]) return glyphMap[base];
    var words = context || '';
    if (/睡|眠|夜醒|助眠/.test(words)) return 'moon';
    if (/血压|心率|健康|医疗|医生|药|血糖|护理|体检/.test(words)) return /药|服用/.test(words) ? 'capsule' : 'pulse';
    if (/餐|饭|食|粥|营养|厨房|吃/.test(words)) return 'utensils';
    if (/日历|日期|生日|安排|日程/.test(words)) return 'calendar';
    if (/订单|账单|费用|积分|支付/.test(words)) return 'receipt';
    if (/设备|手环|手表/.test(words)) return 'watch';
    if (/安全|风险|保护/.test(words)) return 'shield';
    if (/家人|家庭|成员|长辈/.test(words)) return 'users';
    if (/消息|留言|沟通|评论|问候/.test(words)) return 'mail';
    if (/活动|运动|康复|散步/.test(words)) return 'walking';
    if (/提醒|通知|告警/.test(words)) return 'bell';
    if (/设置|管理|控制/.test(words)) return 'settings';
    if (/档案|报告|病历/.test(words)) return 'document';
    return 'sparkles';
  }

  function makeIcon(glyph, context) {
    var svg = document.createElementNS(NS, 'svg');
    var name = iconName(glyph, context);
    var palette = paletteFor(name);
    svg.setAttribute('class', 'ui-context-icon ui-icon-' + name);
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    svg.style.setProperty('--icon-primary', palette[0]);
    svg.style.setProperty('--icon-accent', palette[1]);
    svg.style.setProperty('--icon-tint', palette[2]);
    var paths = pathSets[name] || pathSets.sparkles;
    paths.forEach(function (d) {
      var path = document.createElementNS(NS, 'path');
      path.setAttribute('d', d);
      path.setAttribute('stroke', paths.length > 2 && d !== paths[0] ? palette[1] : (d === paths[0] ? palette[0] : palette[1]));
      path.setAttribute('fill', 'none');
      svg.appendChild(path);
    });
    return svg;
  }

  function isPrefixNode(node) {
    var element = node.parentElement;
    if (!element || !element.closest) return false;
    var block = element.closest(prefixSelector);
    if (!block) return false;
    var previous = node.previousSibling;
    while (previous) {
      if (previous.nodeType === 1 && previous.textContent.trim()) return false;
      if (previous.nodeType === 3 && previous.nodeValue.trim()) return false;
      previous = previous.previousSibling;
    }
    return true;
  }

  function convertText(node) {
    var parent = node.parentElement;
    if (!parent || parent.closest(ignoredSelector)) return;
    var text = node.nodeValue;
    var trim = text.trim();
    var tokens = trim.match(tokenRx);
    if (!tokens || !tokens.length) return;
    var context = parent.closest('button,[role="button"],section,article,li,header')?.textContent || parent.parentElement?.textContent || '';
    var exact = trim.replace(tokenRx, '').trim() === '';
    if (exact) {
      var fragment = document.createDocumentFragment();
      tokens.forEach(function (glyph, index) {
        if (index) fragment.appendChild(document.createTextNode(' '));
        fragment.appendChild(makeIcon(glyph, context));
      });
      parent.replaceChild(fragment, node);
      return;
    }
    if (!isPrefixNode(node)) return;
    var first = tokenRx.exec(text);
    tokenRx.lastIndex = 0;
    if (!first || first.index > text.search(/\S/)) return;
    var before = text.slice(0, first.index);
    var after = text.slice(first.index + first[0].length);
    var fragment = document.createDocumentFragment();
    if (before) fragment.appendChild(document.createTextNode(before));
    fragment.appendChild(makeIcon(first[0], context));
    fragment.appendChild(document.createTextNode(after));
    parent.replaceChild(fragment, node);
  }

  function scan(root) {
    if (!root) return;
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    var nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(convertText);
  }

  var style = document.createElement('style');
  style.textContent = '.ui-context-icon{display:inline-block;width:1em;height:1em;flex:none;vertical-align:-.14em;fill:none;stroke-width:1.75;stroke-linecap:round;stroke-linejoin:round}.ui-context-icon path{fill:none;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}#shopTabPage .lh-goods .gi .ui-context-icon{box-sizing:border-box;width:44px;height:44px;padding:8px;border-radius:14px;background:var(--icon-tint);stroke-width:1.9}#shopTabPage .lh-goods .gi .ui-context-icon path{stroke-width:1.9}.fm-srv .si .ui-context-icon{box-sizing:border-box;width:38px;height:38px;padding:4px;border-radius:12px;background:rgba(255,255,255,.48);stroke-width:1.9}.fm-order .oi .ui-context-icon{width:25px;height:25px}#iaGlobalMsg{position:relative}#iaGlobalMsg::after{content:"";position:absolute;top:4px;right:4px;width:8px;height:8px;border:2px solid #fff;border-radius:50%;background:#F05454;box-shadow:0 1px 3px rgba(111,35,35,.25)}';
  (document.head || document.documentElement).appendChild(style);
  scan(document.body);
  if (document.body && window.MutationObserver) {
    var pending = false;
    new MutationObserver(function (records) {
      if (pending) return;
      pending = true;
      Promise.resolve().then(function () {
        pending = false;
        records.forEach(function (record) {
          record.addedNodes.forEach(function (node) {
            if (node.nodeType === 1) scan(node);
            else if (node.nodeType === 3) convertText(node);
          });
        });
      });
    }).observe(document.body, { childList: true, subtree: true });
  }
})();
