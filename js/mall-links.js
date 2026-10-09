/** 商城 Banner / 运营位跳转目标 */
window.MALL_LINK_TYPES = [
  { key: "product", label: "商品详情" },
  { key: "article", label: "文章详情" },
  { key: "activity", label: "活动落地页" },
  { key: "theme", label: "主题活动" },
];

window.MALL_THEME_LINKS = [
  { id: "chronic", label: "慢病守护" },
  { id: "rehab", label: "康复照护" },
  { id: "meal", label: "银发餐桌" },
  { id: "life", label: "乐龄生活" },
  { id: "safe", label: "安心适老" },
];

window.MALL_SECTION_META = {
  banshi: { label: "办事通", listHref: "./banshi.html", detailFrom: "banshi" },
  moments: { label: "朋友圈", listHref: "./moments.html", detailFrom: "moments" },
  broadcast: { label: "广播站", listHref: "./broadcast.html", detailFrom: "broadcast" },
  xue: { label: "学堂", listHref: "./xue.html", detailFrom: "xue" },
};

window.MALL_ARTICLES = [
  {
    id: "art_sleep_guide",
    title: "长者睡眠改善指南",
    summary: "科学作息与夜间护理要点",
    cover: "./assets/cover-health-check.png",
    author: "春风康养 · 护理学堂",
    date: "2026-07-18",
    readMin: 6,
    tags: ["睡眠", "居家护理"],
    sections: ["xue", "broadcast"],
    relatedProductId: "health_check",
    relatedCta: "预约健康评估",
    paragraphs: [
      "睡眠质量直接影响长者日间精神状态与跌倒风险。建议固定就寝与起床时间，午休控制在 30 分钟以内，避免傍晚大量饮水与咖啡因饮品。",
      "卧室保持安静、微暗与适宜温度；床头留夜灯与扶手，减少起夜摸黑。若有打鼾、憋气或频繁夜醒，应及时进行基础健康评估。",
      "夜间护理可配合轻柔拉伸与放松呼吸；有慢性病或用药影响睡眠时，请遵医嘱调整，切勿自行停药。",
    ],
    tips: ["睡前 1 小时避免刷手机强光", "床边放置防滑拖鞋与呼叫设备", "连续失眠超过一周建议到店评估"],
  },
  {
    id: "art_nutrition",
    title: "社区营养配餐怎么吃更合适",
    summary: "低盐少油，兼顾口味与营养",
    cover: "./assets/cover-nutrition-meal.png",
    author: "春风康养 · 营养组",
    date: "2026-07-22",
    readMin: 5,
    tags: ["营养", "配餐"],
    sections: ["xue", "broadcast"],
    relatedProductId: "nutrition_meal",
    relatedCta: "查看营养配餐",
    paragraphs: [
      "社区配餐宜「低盐少油、软烂易嚼、色香味兼顾」。蛋白质可来自鱼肉蛋豆，蔬菜尽量切细炖软，主食可粗细搭配。",
      "糖尿病、高血压、肾病等慢病长者需按医嘱控盐控糖；吞咽困难者优先糊状/软食，并在护理人员指导下进食。",
      "订餐后注意保温与分餐卫生；如有剩菜建议及时冷藏，再次加热至彻底热透再食用。",
    ],
    tips: ["每餐尽量包含蔬菜与优质蛋白", "口味清淡不等于寡淡，可用香草提味", "包月订餐可按体质备注忌口"],
  },
  {
    id: "art_rehab",
    title: "居家康复训练注意事项",
    summary: "循序渐进，避免二次损伤",
    cover: "./assets/cover-neck-massage.png",
    author: "春风康养 · 康复师",
    date: "2026-08-01",
    readMin: 7,
    tags: ["康复", "居家"],
    sections: ["xue"],
    relatedProductId: "neck_massage",
    relatedCta: "了解颈椎舒缓服务",
    paragraphs: [
      "居家康复应遵循「评估—处方—循序渐进」原则，疼痛明显或关节红肿发热时先暂停训练并就医。",
      "训练前热身 5–10 分钟，动作幅度由小到大；完成后做拉伸放松。地面防滑、旁边有人陪同更安全。",
      "颈肩腰等常见不适可配合到店理疗与居家拉伸，但推拿力度与频次需由专业人员把控。",
    ],
    tips: ["不要用疼痛硬扛完成次数", "记录每日完成度，方便复诊沟通", "辅具使用前先学习正确方式"],
  },
  {
    id: "art_safety",
    title: "适老化居家安全清单",
    summary: "防滑、照明与紧急呼叫建议",
    cover: "./assets/cover-therapy-device.png",
    author: "春风康养 · 适老化顾问",
    date: "2026-08-05",
    readMin: 4,
    tags: ["适老化", "安全"],
    sections: ["xue", "banshi"],
    relatedProductId: "therapy_device",
    relatedCta: "看看适老辅具",
    paragraphs: [
      "居家跌倒多发生在卫生间、走廊与夜间起身。优先完成：防滑垫、扶手、门槛处理、夜间感应灯。",
      "常用物品放在腰部高度，减少踮脚与弯腰；电源线收纳整齐，避免绊倒。",
      "建议配置一键呼叫或可穿戴报警设备，并让子女/邻里知晓紧急联系方式。",
    ],
    tips: ["浴室干湿分区并加装扶手", "床到卫生间路径保持畅通", "每月检查呼叫设备电量"],
  },
  {
    id: "art_banshi_gaoling",
    title: "济南高龄津贴申领与年检指南",
    summary: "材料清单、办理进度与补交提醒（演示）",
    cover: "./assets/cover-health-check.png",
    author: "春风康养 · 办事通",
    date: "2026-09-10",
    readMin: 5,
    tags: ["高龄津贴", "政务"],
    sections: ["banshi"],
    relatedCta: "问智伴怎么办",
    relatedAgentQ: "高龄津贴怎么申请？",
    paragraphs: [
      "高龄津贴面向符合年龄与户籍条件的长者，按年度进行身份与居住核验。演示场景以济南历下区为例，正式办理以当地民政窗口为准。",
      "常见材料包括：身份证件、户口簿或居住证明、银行卡信息；若为代办，还需代办人身份证明与委托说明。",
      "材料将到期时，可在办事通「补贴政务」查看待补清单与截止时间，也可让智伴协助整理材料清单。",
    ],
    tips: ["提前核对银行卡户名是否与本人一致", "年检截止前 15 天建议完成补交", "进度异常可携带原件到窗口复核"],
  },
  {
    id: "art_banshi_home_care",
    title: "居家养老服务补贴怎么申",
    summary: "助浴、助洁等基础服务覆盖范围说明",
    cover: "./assets/cover-home-clean.png",
    author: "春风康养 · 办事通",
    date: "2026-09-08",
    readMin: 6,
    tags: ["居家养老", "补贴"],
    sections: ["banshi"],
    relatedProductId: "home_meal",
    relatedCta: "看看居家服务",
    relatedAgentQ: "居家养老服务补贴怎么申？",
    paragraphs: [
      "居家养老服务补贴可用于助浴、助洁、助行等基础服务，具体项目与额度因区县政策而异。",
      "申请前建议先完成能力评估或由社区工作人员上门摸底；评估结果影响可享受的服务包档位。",
      "演示入口已接入办事通与智伴问答，正式受理仍需提交纸质或政务平台材料。",
    ],
    tips: ["保留评估回执与服务确认单", "补贴不可随意转让他人使用", "服务不满意可走售后投诉通道"],
  },
  {
    id: "art_banshi_aging",
    title: "适老化改造申请流程一览",
    summary: "卫生间扶手、防滑与工单跟进（演示）",
    cover: "./assets/cover-therapy-device.png",
    author: "春风康养 · 适老化顾问",
    date: "2026-09-06",
    readMin: 5,
    tags: ["适老化", "改造"],
    sections: ["banshi", "xue"],
    relatedProductId: "therapy_device",
    relatedCta: "了解适老辅具",
    relatedAgentQ: "家里适老化改造怎么申请？",
    paragraphs: [
      "适老化改造通常从卫生间与夜间通行路径优先：防滑垫、扶手、感应灯、门槛处理。",
      "申请后会有上门评估与方案确认，施工完成需子女或本人签字验收。",
      "科技金融大厦周边演示站点可协助预约评估，正式补贴资格以政务审核为准。",
    ],
    tips: ["改造前先拍照留存现场情况", "重点先做防跌倒场景", "验收时核对扶手承重与防滑效果"],
  },
  {
    id: "art_banshi_coop",
    title: "B 端合作供需怎么发布与对接",
    summary: "闲置床位、配餐产能与人才培训入口说明",
    cover: "./assets/cover-companion-care.png",
    author: "春风康养 · 合作大厅",
    date: "2026-09-05",
    readMin: 4,
    tags: ["合作", "B-B"],
    sections: ["banshi"],
    relatedCta: "打开合作供需",
    paragraphs: [
      "办事通「合作供需」承接机构闲置床位、配餐产能、设备档期等 B-B 信息，便于站点与机构快速对接。",
      "发布前请准备资质材料与档期说明；正式合作需协议与审核，本页仅为演示说明。",
      "人才培训栏目可查看招聘与认知照护等入门工作坊信息。",
    ],
    tips: ["信息注明区域与可对接时段", "勿在公开页泄露敏感合同条款", "紧急档期可同步广播站扩散"],
  },
  {
    id: "art_moments_memory",
    title: "爸妈总说「钥匙放哪了」：认知训练怎么安排",
    summary: "子女关心动态延伸：近事记忆与小组课建议",
    cover: "./assets/cover-calligraphy.png",
    author: "社区朋友圈精选",
    date: "2026-09-14",
    readMin: 6,
    tags: ["认知", "子女关心"],
    sections: ["moments", "xue"],
    relatedProductId: "cognitive_group",
    relatedCta: "预约认知小组课",
    relatedAgentQ: "爸妈的认知训练怎么安排的？",
    paragraphs: [
      "偶尔忘放钥匙不一定是疾病，但若近事记忆明显变差、重复提问增多，建议尽早做认知筛查与非药物干预。",
      "居家可从「手指操 + 近事回忆」开始，每日 10 分钟；子女陪同更易坚持。社区认知训练小组课可提供结构化练习。",
      "本文根据朋友圈公开动态整理，仅供参考，不替代医疗诊断。",
    ],
    tips: ["用日记本记录遗忘频率变化", "避免当众指责「你又忘了」", "可让智伴根据公开动态跟进提醒"],
  },
  {
    id: "art_moments_lecture",
    title: "本周日控糖讲座：子女陪同报名须知",
    summary: "名额、地点与陪同建议（朋友圈同步）",
    cover: "./assets/cover-nutrition-meal.png",
    author: "历下旗舰店",
    date: "2026-09-13",
    readMin: 3,
    tags: ["讲座", "控糖"],
    sections: ["moments", "broadcast"],
    relatedProductId: "health_check",
    relatedCta: "预约健康评估",
    paragraphs: [
      "科技金融大厦 2F 健康讲堂将举办控糖饮食专场，适合糖尿病及前期长者，子女可陪同参加。",
      "现场提供控糖一周食谱，并开放少量免费血糖检测名额，建议提前在广播站或朋友圈入口确认剩余席位。",
      "讲座内容为科普示意，个体化用药与饮食请遵医嘱。",
    ],
    tips: ["提前 10 分钟到场签到", "可携带近期血糖记录便于提问", "行动不便者可预约陪同接送示意"],
  },
  {
    id: "art_moments_neighbor",
    title: "邻里互助：日托喘息与床位空档怎么对接",
    summary: "朋友圈公开合作动态解读",
    cover: "./assets/cover-companion-care.png",
    author: "高新区合作机构",
    date: "2026-09-11",
    readMin: 4,
    tags: ["邻里", "日托"],
    sections: ["moments", "banshi"],
    relatedCta: "去办事通合作大厅",
    paragraphs: [
      "部分康复机构工作日下午有空余床位与治疗师档期，可对接社区日托喘息，减轻家庭照护压力。",
      "公开朋友圈动态便于站点快速看见供需；正式对接请走办事通合作审核流程。",
      "请注意保护长者隐私，勿在动态中披露可识别的医疗细节。",
    ],
    tips: ["对接时注明区域与可服务时段", "首次合作建议当面确认资质", "喘息服务结束后做好交接记录"],
  },
  {
    id: "art_bc_sugar_rules",
    title: "长者控糖饮食三原则",
    summary: "顺序吃、控主食、晚间不加餐",
    cover: "./assets/cover-nutrition-meal.png",
    author: "广播站 · 健康科普",
    date: "2026-09-14",
    readMin: 5,
    tags: ["科普", "控糖"],
    sections: ["broadcast", "xue"],
    relatedProductId: "package_meal_month",
    relatedCta: "看控糖套餐",
    paragraphs: [
      "控糖饮食不必「少吃到饿」，关键是进餐顺序：先菜再蛋白，主食放最后，并尽量选择低 GI 主食。",
      "晚 8 点后尽量不加餐；若必须加餐，优选原味酸奶或半个水果，并记入当日碳水。",
      "本文为广播站科普图文，不替代医生个体化医嘱。",
    ],
    tips: ["进餐细嚼慢咽，有助血糖更稳", "主食可用杂粮部分替换精米白面", "定期复查糖化血红蛋白"],
  },
  {
    id: "art_bc_policy_notice",
    title: "高龄津贴与居家养老补贴申报提醒",
    summary: "材料清单与截止时间一览",
    cover: "./assets/cover-health-check.png",
    author: "广播站 · 政策速递",
    date: "2026-09-12",
    readMin: 4,
    tags: ["政策", "补贴"],
    sections: ["broadcast", "banshi"],
    relatedCta: "打开办事通",
    paragraphs: [
      "高龄津贴需按年度核验居住与身份材料；居家养老服务补贴可覆盖助浴、助洁等基础服务。",
      "广播站同步政策提醒，详细材料与进度请在办事通查看。",
      "演示内容仅供示意，正式政策以主管部门发布为准。",
    ],
    tips: ["关注广播站「政策」分类", "材料临期提前准备复印件", "疑问可一键问智伴"],
  },
  {
    id: "art_bc_finger_exercise",
    title: "认知训练手指操示范要点",
    summary: "3 分钟跟练：手指操 + 近事回忆",
    cover: "./assets/cover-calligraphy.png",
    author: "广播站 · 视频图文",
    date: "2026-09-10",
    readMin: 3,
    tags: ["视频", "认知"],
    sections: ["broadcast", "xue"],
    relatedProductId: "cognitive_group",
    relatedCta: "预约小组课",
    paragraphs: [
      "手指操配合近事回忆，适合居家无设备场景。建议每日 10 分钟，子女可旁听鼓励。",
      "演示视频封面位可在广播站「视频」分类回看；正式环境可接入点播。",
      "若出现明显认知下降，请及时就医评估，勿仅依赖居家训练。",
    ],
    tips: ["选择安静、光线充足的环境", "动作由慢到快，避免关节疼痛", "可用日历打卡记录坚持天数"],
  },
  {
    id: "art_xue_chronic",
    title: "慢病长者居家监测日记怎么记",
    summary: "血压血糖记录模板与复诊沟通要点",
    cover: "./assets/cover-bp-monitor.png",
    author: "康养学堂",
    date: "2026-09-09",
    readMin: 5,
    tags: ["慢病", "监测"],
    sections: ["xue"],
    relatedProductId: "health_check",
    relatedCta: "预约健康评估",
    paragraphs: [
      "居家监测日记建议固定时段测量，并记录用药、饮食与不适症状，便于复诊时快速沟通。",
      "血压宜静坐休息后测量；血糖按医嘱选择空腹或餐后，勿随意更改测量条件。",
      "学堂课程可结合广播站科普与到店评估，形成「学—练—问」闭环。",
    ],
    tips: ["同一设备、同一手臂便于对比", "异常读数先复测再决定是否就医", "电子记录可让子女共同查看"],
  },
  {
    id: "art_xue_fall_prevent",
    title: "防跌倒小课堂：家中高风险角落",
    summary: "卫生间、走廊、夜间起身三点突破",
    cover: "./assets/cover-therapy-device.png",
    author: "康养学堂",
    date: "2026-09-07",
    readMin: 4,
    tags: ["防跌倒", "安全"],
    sections: ["xue", "banshi"],
    relatedProductId: "therapy_device",
    relatedCta: "看看防跌倒辅具",
    paragraphs: [
      "跌倒是长者致残的重要原因之一。优先排查卫生间湿滑、走廊杂物与夜间照明不足。",
      "穿合脚防滑鞋、起身先坐稳再站立、床边留扶手，都是低成本高收益措施。",
      "可结合适老化改造申请与学堂安全课一并推进。",
    ],
    tips: ["夜间路径保持畅通无电线", "浴室加装扶手与防滑垫", "头晕乏力时暂缓独自沐浴"],
  },
  {
    id: "art_banshi_disability",
    title: "残疾人两项补贴与养老服务衔接说明",
    summary: "生活补贴、护理补贴与居家服务如何叠加（演示）",
    cover: "./assets/cover-care-pad.png",
    author: "春风康养 · 办事通",
    date: "2026-09-15",
    readMin: 5,
    tags: ["两项补贴", "政务"],
    sections: ["banshi"],
    relatedAgentQ: "残疾人两项补贴怎么和养老服务衔接？",
    relatedCta: "问智伴怎么办",
    paragraphs: [
      "符合条件的残疾人可申请生活补贴与护理补贴；部分区县允许与居家养老服务补贴按规则衔接，但不可重复享受同类项目。",
      "办理时建议同时准备残疾证、身份证明与银行账户信息，并确认户籍与居住地管辖窗口。",
      "演示场景可在办事通查看材料清单，正式受理以当地残联/民政窗口为准。",
    ],
    tips: ["补贴类别变更需重新核验", "代办须携带委托材料", "到账异常先核对银行卡户名"],
  },
  {
    id: "art_banshi_meal_aid",
    title: "老年助餐补贴怎么领、怎么用",
    summary: "食堂核销、包月订餐与站点共配说明",
    cover: "./assets/cover-nutrition-meal.png",
    author: "春风康养 · 办事通",
    date: "2026-09-14",
    readMin: 4,
    tags: ["助餐", "补贴"],
    sections: ["banshi", "xue"],
    relatedProductId: "package_meal_month",
    relatedCta: "查看包月订餐",
    relatedAgentQ: "老年助餐补贴怎么用？",
    paragraphs: [
      "老年助餐补贴通常用于社区食堂或定点配餐核销，部分站点支持包月订餐抵扣。",
      "使用前请确认本人是否在补贴名单内，并携带身份证件到食堂登记。",
      "控糖/低盐需求可在订餐备注中说明，营养师会尽量匹配软食方案。",
    ],
    tips: ["补贴余额以窗口或小程序查询为准", "过期未用一般不结转（以政策为准）", "剩餐勿反复加热过夜"],
  },
  {
    id: "art_banshi_nurse_hire",
    title: "上门护理员招聘与上岗须知",
    summary: "持证要求、驻点调度与培训路径",
    cover: "./assets/cover-companion-care.png",
    author: "春风康养 · 人才培训",
    date: "2026-09-13",
    readMin: 5,
    tags: ["招聘", "护理"],
    sections: ["banshi"],
    relatedCta: "打开人才培训",
    paragraphs: [
      "上门护理员优先招聘持证人员，负责助浴、基础护理与服务确认单签署。",
      "历下旗舰店可统一调度周边工单；新人需完成安全、隐私与急救入门培训后方可上岗。",
      "合作机构也可通过办事通「人才培训」报名认知照护等专题工作坊。",
    ],
    tips: ["简历注明可服务区域与时段", "上岗前完成背景核验", "服务过程注意保护长者隐私"],
  },
  {
    id: "art_banshi_device_share",
    title: "监测设备跨店调拨与租赁指引",
    summary: "血压/血糖仪闲置机共享流程（演示）",
    cover: "./assets/cover-bp-monitor.png",
    author: "春风康养 · 合作大厅",
    date: "2026-09-12",
    readMin: 4,
    tags: ["设备", "合作"],
    sections: ["banshi"],
    relatedProductId: "health_check",
    relatedCta: "预约健康评估",
    paragraphs: [
      "站点间可将闲置血压计、血糖仪按档期调拨，减少重复采购。",
      "调拨前需完成设备校准与清洁消毒记录；归还时核对配件齐全。",
      "正式合作需签署设备借用协议，本页仅为演示说明。",
    ],
    tips: ["出库前拍照留存设备状态", "校准过期设备不得外借", "长者使用前先做操作指导"],
  },
  {
    id: "art_moments_meal_day",
    title: "父亲包月订餐一周体验：口味与血糖都稳了",
    summary: "子女晒单：软食控糖餐的真实反馈",
    cover: "./assets/cover-nutrition-meal.png",
    author: "赵敏（子女）",
    date: "2026-09-15",
    readMin: 4,
    tags: ["订餐", "晒单"],
    sections: ["moments", "xue"],
    relatedProductId: "package_meal_month",
    relatedCta: "去看看包月订餐",
    relatedAgentQ: "控糖包月订餐适合爸妈吗？",
    paragraphs: [
      "父亲糖尿病前期，我们试了社区控糖软食包月。一周下来口味能接受，餐后血糖波动比自己炒菜时更稳。",
      "备注里写了少油少盐、肉要切细，站点基本都能做到；偶尔青菜偏软，但父亲说好嚼。",
      "公开动态仅供参考，个体差异大，换餐前仍建议咨询医生或营养师。",
    ],
    tips: ["先试周套餐再决定包月", "把近期血糖本发给营养师参考", "忌口一定写进备注"],
  },
  {
    id: "art_moments_sleep_tip",
    title: "妈妈夜醒变少了：我们做的三件小事",
    summary: "朋友圈热议：夜灯、午休与睡前拉伸",
    cover: "./assets/cover-sleep-breath.png",
    author: "陈可（子女）",
    date: "2026-09-14",
    readMin: 5,
    tags: ["睡眠", "居家"],
    sections: ["moments", "xue"],
    relatedProductId: "health_check",
    relatedCta: "预约睡眠相关评估",
    relatedAgentQ: "长者夜间总醒怎么改善？",
    paragraphs: [
      "妈妈以前一夜醒三四次。我们加了床到卫生间的感应夜灯、把午休压到 30 分钟内，睡前一起做 5 分钟肩颈拉伸。",
      "两周后夜醒明显减少，白天精神也好些。若有严重打鼾憋气，还是建议做专业评估。",
      "动态里的方法是经验分享，不替代诊疗。",
    ],
    tips: ["傍晚少喝大量水", "卧室保持凉爽安静", "连续失眠要及时就医"],
  },
  {
    id: "art_moments_volunteer",
    title: "周末志愿者陪诊：科技金融大厦站集结通知",
    summary: "陪诊路线、报名方式与注意事项",
    cover: "./assets/cover-companion-care.png",
    author: "历下志愿队",
    date: "2026-09-13",
    readMin: 3,
    tags: ["志愿", "陪诊"],
    sections: ["moments", "broadcast"],
    relatedCta: "问智伴怎么报名",
    relatedAgentQ: "陪诊志愿者怎么报名？",
    paragraphs: [
      "本周六上午在科技金融大厦 1F 集结，志愿者将陪同行动不便长者前往附近医院取药、复诊。",
      "请提前在朋友圈或站点报名，并备注是否能协助轮椅推行。",
      "志愿者需遵守隐私约定，不得拍摄长者病历与面部特写。",
    ],
    tips: ["穿着舒适鞋便于步行", "携带本人身份证件", "如遇突发不适立即联系站长"],
  },
  {
    id: "art_moments_shop_open",
    title: "驿站新开了足疗体验角，长者说腿轻松了",
    summary: "到店晒图：足疗与休息区开放日",
    cover: "./assets/cover-foot-spa.png",
    author: "市中驿站",
    date: "2026-09-12",
    readMin: 3,
    tags: ["到店", "体验"],
    sections: ["moments", "broadcast"],
    relatedProductId: "foot_spa",
    relatedCta: "了解足疗服务",
    paragraphs: [
      "市中驿站本周开放足疗体验角，首次体验有优惠名额，适合久坐腿肿的长者。",
      "开放日提供热水与休息座椅，子女可陪同选项目。",
      "有严重下肢血管疾病者请先咨询医护人员。",
    ],
    tips: ["体验前说明用药与基础病", "水温以温热舒适为准", "体验后缓慢起身防头晕"],
  },
  {
    id: "art_bc_bp_home",
    title: "居家量血压：姿势、时段与记录法",
    summary: "广播站科普：测准比测多更重要",
    cover: "./assets/cover-bp-monitor.png",
    author: "广播站 · 健康科普",
    date: "2026-09-15",
    readMin: 5,
    tags: ["科普", "血压"],
    sections: ["broadcast", "xue"],
    relatedProductId: "health_check",
    relatedCta: "预约健康评估",
    paragraphs: [
      "测量前静坐休息 5 分钟，背部有靠、双脚着地，袖带与心脏同高。",
      "建议晨起服药前与晚间各测一次，连续记录一周再给医生看。",
      "单次偏高不必过度紧张，先复测并观察有无头痛胸闷等症状。",
    ],
    tips: ["避免交谈与翘二郎腿", "袖带松紧以能伸进一指为宜", "设备每年校准一次更稳妥"],
  },
  {
    id: "art_bc_heat_summer",
    title: "秋老虎还在：长者防暑与补水提醒",
    summary: "政策与科普结合的季节提示",
    cover: "./assets/cover-thermometer.png",
    author: "广播站 · 季节提醒",
    date: "2026-09-14",
    readMin: 3,
    tags: ["季节", "防暑"],
    sections: ["broadcast"],
    relatedCta: "打开办事通",
    paragraphs: [
      "昼夜温差大时，长者易出现头晕与血压波动。外出选清晨或傍晚，备好遮阳帽与温水。",
      "空调不宜直吹；补水少量多次，心肾功能异常者遵医嘱控制入量。",
      "社区站点可提供临时休息与饮水，欢迎路过歇脚。",
    ],
    tips: ["中午高温减少户外活动", "发现意识模糊立即求助", "备一瓶常温水在随身包"],
  },
  {
    id: "art_bc_group_buy",
    title: "本周站点团购：蛋白粉与护理垫开团",
    summary: "优惠档期与自提点说明",
    cover: "./assets/cover-protein-powder.png",
    author: "广播站 · 优惠",
    date: "2026-09-13",
    readMin: 3,
    tags: ["优惠", "团购"],
    sections: ["broadcast"],
    relatedProductId: "protein_powder",
    relatedCta: "去看看商品",
    paragraphs: [
      "本周团购包含营养蛋白粉与护理垫，科技金融大厦站与市中驿站可自提。",
      "下单后按短信到站核销；缺货商品将自动转入下周或退款（演示规则）。",
      "购买保健食品前请阅读配料表，并遵医嘱使用。",
    ],
    tips: ["关注广播站「优惠」分类", "自提前确认营业时间", "大宗订单可联系站长拼车配送"],
  },
  {
    id: "art_bc_new_course",
    title: "【上新】乐龄书法与合唱兴趣课开放预约",
    summary: "学堂联动：认知友好社交课表",
    cover: "./assets/cover-calligraphy.png",
    author: "广播站 · 上新",
    date: "2026-09-11",
    readMin: 3,
    tags: ["上新", "兴趣课"],
    sections: ["broadcast", "xue"],
    relatedProductId: "cognitive_group",
    relatedCta: "预约兴趣课",
    paragraphs: [
      "书法与合唱课程本月开放预约，强调社交陪伴与轻度认知刺激，不要求专业基础。",
      "可在学堂或广播站报名，名额有限，子女可陪同试听一节。",
      "行动不便者可申请一楼教室安排。",
    ],
    tips: ["试听后决定是否包月", "自备老花镜与水杯", "咳嗽发热请改期参加"],
  },
  {
    id: "art_xue_med_safe",
    title: "家庭药箱整理课：过期药与分装盒",
    summary: "学堂实操：看懂说明书与用药提醒",
    cover: "./assets/cover-wellness-kit.png",
    author: "康养学堂",
    date: "2026-09-15",
    readMin: 6,
    tags: ["用药", "安全"],
    sections: ["xue"],
    relatedProductId: "health_check",
    relatedCta: "预约用药评估咨询",
    paragraphs: [
      "定期清理过期药、分品种分装，并用大字标签写清服用时间，能显著降低漏服错服风险。",
      "多种慢病用药建议列一张「用药时间表」，复诊时带给医生核对相互作用。",
      "本课为科普示意，具体用药务必遵医嘱，勿自行停药或加量。",
    ],
    tips: ["药箱放在干燥阴凉处", "儿童与宠物接触不到的位置", "外观破损的药品及时丢弃"],
  },
  {
    id: "art_xue_swallow",
    title: "吞咽友好饮食：软食与进食姿势",
    summary: "营养组学堂：降低呛咳风险",
    cover: "./assets/cover-nutrition-meal.png",
    author: "康养学堂 · 营养组",
    date: "2026-09-14",
    readMin: 5,
    tags: ["吞咽", "软食"],
    sections: ["xue", "broadcast"],
    relatedProductId: "nutrition_meal",
    relatedCta: "查看营养配餐",
    paragraphs: [
      "轻度吞咽困难者宜选择软烂、黏稠适中的食物，避免干散与粘牙食物。",
      "进食时身体坐直、低头含胸少许，一次一口，吞完再吃下一口。",
      "若频繁呛咳或体重下降，应尽早做吞咽评估，而非仅靠「煮得更烂」。",
    ],
    tips: ["饭后保持坐姿 20 分钟", "吃药可用温水送服并确认吞下", "家属学习海姆立克急救示意"],
  },
  {
    id: "art_xue_emotion",
    title: "空巢情绪疏导：倾听比讲道理更重要",
    summary: "心理课纪要：陪伴话术与求助信号",
    cover: "./assets/cover-companion-care.png",
    author: "康养学堂 · 心理",
    date: "2026-09-12",
    readMin: 5,
    tags: ["心理", "陪伴"],
    sections: ["xue", "moments"],
    relatedCta: "问智伴怎么陪聊",
    relatedAgentQ: "爸妈情绪低落我该怎么陪？",
    paragraphs: [
      "长者情绪低落时，先共情再建议：可以说「我听到您最近有点闷」，而不是急着「你要多出去走走」。",
      "持续失眠、食欲下降、反复说「没意思」等信号，建议联系站点社工或专业心理支持。",
      "朋友圈公开动态可作为关心线索，但隐私话题不要公开讨论。",
    ],
    tips: ["每周固定一次视频或到访", "一起做一件小事比说教有效", "必要时寻求专业帮助"],
  },
  {
    id: "art_xue_exercise",
    title: "坐着也能练：椅子操入门 8 式",
    summary: "康复学堂：安全热身与呼吸配合",
    cover: "./assets/cover-ar-sports.png",
    author: "康养学堂 · 康复",
    date: "2026-09-10",
    readMin: 6,
    tags: ["运动", "康复"],
    sections: ["xue"],
    relatedProductId: "neck_massage",
    relatedCta: "了解舒缓服务",
    paragraphs: [
      "椅子操适合平衡较差或刚做完手术恢复期的长者，强调缓慢、有控制的动作。",
      "练习前确认椅子稳固，旁侧留有扶手或家人陪同；出现胸痛气促立即停止。",
      "可与广播站手指操、学堂防跌倒课组合安排每周计划。",
    ],
    tips: ["餐后 1 小时再练习", "穿防滑鞋、地面干燥", "记录完成组数方便复诊"],
  },
];

window.MALL_ACTIVITIES = [
  {
    id: "act_99_discount",
    title: "超低折扣 · 9.9 折专场",
    summary: "精选到店服务限时优惠",
    cover: "./assets/discount-lifestyle.png",
    period: "2026.09.01 — 2026.09.30",
    badge: "限时",
    highlight: "指定到店服务下单享 9.9 折",
    rules: [
      "活动期内在春风康养小程序下单指定服务即可享受折扣。",
      "优惠可与部分站点券叠加，以结算页为准。",
      "名额有限，先到先得。",
    ],
    benefits: ["到店理疗精选项目", "结算页自动计价", "支持预约到店时段"],
    coupons: [
      { name: "理疗立减", value: "10", tip: "满 50 可用" },
      { name: "首单体验", value: "9.9", tip: "限 1 次" },
    ],
    online: [
      { name: "问智伴怎么选", desc: "按肩颈腰腿推荐项目", href: "./agent.html?q=附近有什么适合长者的到店服务？" },
    ],
    articles: ["art_rehab"],
    products: ["ai_massage", "foot_spa", "neck_massage"],
    relatedProductId: "ai_massage",
    cta: "立即抢购 AI 舒压",
  },
  {
    id: "act_free_check",
    title: "体检套餐 · 安心守护",
    summary: "血压、血糖、体成分筛查，报告有人讲清楚",
    cover: "./assets/cover-health-check.png",
    period: "2026.09.12 — 2026.09.30",
    badge: "公益周",
    highlight: "本周社区中心站免费基础筛查，异常可转正式套餐",
    stats: [
      { n: "1 次", l: "免费筛查名额" },
      { n: "20 分", l: "到店即出" },
      { n: "子女", l: "报告可回传" },
    ],
    rules: [
      "需提前预约到店时段，携带身份证到场。",
      "每位用户活动期内限 1 次免费基础筛查。",
      "异常指标可预约正式体检套餐深度解读，不替代医生诊断。",
    ],
    benefits: ["血压 / 血糖快检", "体成分简易评估", "报告口头解读并推送子女"],
    coupons: [
      { name: "筛查免单", value: "免", tip: "限前 200 名" },
      { name: "套餐立减", value: "50", tip: "转正式体检" },
    ],
    live: {
      title: "周日 09:00 控糖讲座",
      speaker: "驻店营养师 · 化验单怎么看",
      href: "./agent.html?q=预约本周健康讲座",
    },
    checkin: { title: "筛查后 7 日打卡", days: ["一", "二", "三", "四", "五", "六", "日"], done: [1, 1, 0, 0, 0, 0, 0] },
    online: [
      { name: "线上预约筛查", desc: "选站点与时段", href: "./detail.html?id=health_check" },
      { name: "报告问智伴", desc: "帮父母看指标", href: "./agent.html?q=打开爸妈的健康档案" },
      { name: "慢病主题页", desc: "监测、控糖餐、用药", href: "./theme.html?id=chronic" },
    ],
    articles: ["art_sleep_guide", "art_nutrition"],
    products: ["health_check", "bp_monitor", "glucometer", "pulse_oximeter"],
    relatedProductId: "health_check",
    cta: "预约体检套餐",
  },
  {
    id: "act_massage_trial",
    title: "AI 舒压 · 一键放松",
    summary: "智能分区理疗，首次体验 9.9 元，到店就能做",
    cover: "./assets/cover-ai-massage.png",
    period: "长期有效 · 名额滚动开放",
    badge: "体验官",
    highlight: "完成 45 分钟体验，即领下单立减券",
    stats: [
      { n: "9.9", l: "首次体验价" },
      { n: "45′", l: "智能分区" },
      { n: "3F", l: "科技金融大厦理疗室" },
    ],
    rules: [
      "点「马上体验」预约时段，高峰期可能排队。",
      "到店完成体验后发放服务券至账户，有效期见券面。",
      "严重骨质疏松、皮肤破损或佩戴起搏器请先告知理疗师。",
    ],
    benefits: ["AI 识别肩颈腰背重点区", "热敷力度可调", "体验后领券可再约"],
    coupons: [
      { name: "体验价", value: "9.9", tip: "限新客 1 次" },
      { name: "复购立减", value: "15", tip: "满 80 可用" },
    ],
    live: {
      title: "本周三 15:00 到店开放日",
      speaker: "理疗师现场讲解适老力度",
      href: "./agent.html?q=预约AI舒压体验",
    },
    seckill: { title: "今日体验秒杀", productId: "ai_massage", price: "9.9", origin: "19.9", stock: "还剩 12 个时段" },
    online: [
      { name: "线上下单占时段", desc: "选上午或下午", href: "./detail.html?id=ai_massage" },
      { name: "问智伴适不适合", desc: "按爸妈情况推荐", href: "./agent.html?q=附近有什么适合长者的到店服务？" },
      { name: "居家康复注意", desc: "体验后怎么拉伸", href: "./article.html?id=art_rehab" },
    ],
    articles: ["art_rehab"],
    products: ["ai_massage", "neck_massage", "foot_spa", "therapy_device"],
    relatedProductId: "ai_massage",
    cta: "马上体验 AI 舒压",
  },
  {
    id: "act_meal_month",
    title: "暖心简餐 · 每日新鲜",
    summary: "低盐少油软食，食堂到家与包月核销都能订",
    cover: "./assets/cover-nutrition-meal.png",
    period: "2026.09.01 — 2026.09.30",
    badge: "开季礼",
    highlight: "首次包月订餐赠社区饮品权益，可备注控糖 / 防呛",
    stats: [
      { n: "26天", l: "包月可核销" },
      { n: "低盐", l: "全菜单标注" },
      { n: "软食", l: "防呛可选" },
    ],
    rules: [
      "活动期内首次开通包月即可获赠饮品权益。",
      "当日 11:00 前可改口味；慢病忌口请在订单备注。",
      "不可与其他开季礼重复领取。",
    ],
    benefits: ["低盐少油社区餐", "可备注控糖 / 软食", "满月赠饮权益"],
    coupons: [
      { name: "开季赠饮", value: "赠", tip: "首次包月" },
      { name: "邻里拼团", value: "80", tip: "满 8 户减" },
    ],
    menu: [
      { day: "周一", name: "清蒸鲈鱼 · 南瓜粥", tag: "控糖" },
      { day: "周二", name: "豆腐蒸蛋 · 软米饭", tag: "软食" },
      { day: "周三", name: "番茄牛腩 · 菠菜", tag: "低盐" },
      { day: "周四", name: "鸡肉丸 · 山药泥", tag: "防呛" },
      { day: "周五", name: "清炒时蔬 · 小米粥", tag: "控糖" },
    ],
    groupbuy: {
      title: "邻里拼团 · 包月午餐",
      tip: "满 8 户立减 80 元",
      progress: 6,
      total: 8,
      productId: "package_meal_month",
    },
    online: [
      { name: "线上下单送餐", desc: "当日 11:00 前可改", href: "./detail.html?id=home_meal" },
      { name: "问营养师配餐", desc: "按爸妈血糖配一周", href: "./agent.html?q=附近哪家食堂的控糖套餐更合适？" },
      { name: "银发餐桌主题", desc: "菜单、拼团、包月", href: "./theme.html?id=meal" },
    ],
    articles: ["art_nutrition"],
    products: ["package_meal_month", "nutrition_meal", "home_meal"],
    relatedProductId: "package_meal_month",
    cta: "开通包月订餐",
  },
];

window.getMallLinkLabel = function getMallLinkLabel(type, id) {
  if (!type || !id) return "";
  if (type === "product") {
    const p = (window.MALL_PRODUCTS || {})[id];
    return p?.name || id;
  }
  if (type === "article") {
    const a = (window.MALL_ARTICLES || []).find((x) => x.id === id);
    return a?.title || id;
  }
  if (type === "activity") {
    const a = (window.MALL_ACTIVITIES || []).find((x) => x.id === id);
    return a?.title || id;
  }
  if (type === "theme") {
    const t = (window.MALL_THEME_LINKS || []).find((x) => x.id === id);
    return t?.label || window.MALL_THEMES?.[id]?.name || id;
  }
  return id;
};

window.resolveMallLinkHref = function resolveMallLinkHref(type, id, pageBase) {
  const base = pageBase || "./";
  if (!type || !id) return "";
  if (type === "product") return `${base}detail.html?id=${encodeURIComponent(id)}`;
  if (type === "article") return `${base}article.html?id=${encodeURIComponent(id)}`;
  if (type === "activity") return `${base}activity.html?id=${encodeURIComponent(id)}`;
  if (type === "theme") return `${base}theme.html?id=${encodeURIComponent(id)}`;
  return "";
};

window.listMallLinkOptions = function listMallLinkOptions(type) {
  if (type === "product") {
    return Object.values(window.MALL_PRODUCTS || {})
      .filter((p) => p && p.id)
      .map((p) => ({ id: p.id, label: p.name || p.id }));
  }
  if (type === "article") {
    return (window.MALL_ARTICLES || []).map((a) => ({ id: a.id, label: a.title }));
  }
  if (type === "activity") {
    return (window.MALL_ACTIVITIES || []).map((a) => ({ id: a.id, label: a.title }));
  }
  if (type === "theme") {
    return (window.MALL_THEME_LINKS || []).map((t) => ({ id: t.id, label: t.label }));
  }
  return [];
};

window.MALL_BROADCASTS = [
  {
    id: "bc_policy_sugar",
    title: "【科普】长者控糖饮食三原则，餐后血糖更稳",
    summary: "广播站健康科普图文：顺序吃、控主食、晚间不加餐。",
    cover: "./assets/cover-nutrition-meal.png",
    badge: "科普",
    mediaType: "article",
    articleId: "art_bc_sugar_rules",
    date: "2026-09-14",
    time: "",
    location: "济南历下 · 广播站",
    relatedProductId: "package_meal_month",
    relatedCta: "看控糖套餐",
    paragraphs: [
      "控糖饮食不必「少吃到饿」，关键是进餐顺序：先菜再蛋白，主食放最后，并尽量选择低 GI 主食。",
      "晚 8 点后尽量不加餐；若必须加餐，优选原味酸奶或半个水果，并记入当日碳水。",
      "本文为演示科普，不替代医生个体化医嘱。",
    ],
  },
  {
    id: "bc_policy_subsidy",
    title: "【政策】济南高龄津贴与居家养老服务补贴申报提醒",
    summary: "办事通联动：材料清单与截止时间一览。",
    cover: "./assets/cover-health-check.png",
    badge: "政策",
    mediaType: "article",
    articleId: "art_bc_policy_notice",
    date: "2026-09-12",
    time: "",
    location: "济南市民政示意",
    relatedCta: "去办事通",
    paragraphs: [
      "高龄津贴需按年度核验居住与身份材料；居家养老服务补贴可覆盖助浴、助洁等基础服务。",
      "演示入口在「办事通」，可查看进度与所需材料清单。",
    ],
  },
  {
    id: "bc_coop_bed",
    title: "【合作】周边康复机构闲置床位可对接日托喘息",
    summary: "B-B 供需：闲置档期开放，欢迎站点与机构对接。",
    cover: "./assets/cover-companion-care.png",
    badge: "合作",
    mediaType: "article",
    articleId: "art_moments_neighbor",
    date: "2026-09-11",
    time: "",
    location: "济南高新区",
    paragraphs: [
      "部分康复机构工作日下午有空余床位与治疗师档期，可对接社区日托喘息。",
      "本条为演示供需信息，正式合作需资质审核与协议。",
    ],
  },
  {
    id: "bc_video_cog",
    title: "【视频】认知训练手指操示范（3 分钟）",
    summary: "跟着做：手指操 + 近事回忆，适合居家无设备场景。",
    cover: "./assets/cover-calligraphy.png",
    badge: "视频",
    mediaType: "video",
    articleId: "art_bc_finger_exercise",
    date: "2026-09-10",
    time: "03:12",
    location: "广播站视频",
    relatedProductId: "cognitive_group",
    relatedCta: "预约小组课",
    paragraphs: [
      "演示视频封面位：正式环境可接入点播。",
      "建议每日 10 分钟，子女可旁听鼓励。",
    ],
  },
  {
    id: "bc_lecture_sugar",
    title: "本周健康讲座：控糖饮食专场，周日上午 9:00",
    summary: "营养师现场讲解控糖饮食搭配，适合糖尿病及前期长者参加。",
    cover: "./assets/cover-calligraphy.png",
    badge: "讲座",
    mediaType: "article",
    articleId: "art_moments_lecture",
    date: "2026-09-13",
    time: "09:00",
    location: "山东省济南市历下区姚家街道科技金融大厦 2F 健康讲堂",
    relatedProductId: "health_check",
    relatedCta: "预约健康评估",
    paragraphs: [
      "控糖饮食不是一味少吃，而是吃得对、吃得稳。本次讲座将由驻店营养师讲解 GI 指数、食物搭配与进餐顺序。",
      "现场提供一份「控糖一周食谱」供带走，并开放 3 个免费血糖检测名额。",
    ],
  },
  {
    id: "bc_ai_massage_trial",
    title: "科技金融大厦旗舰店新增 AI 舒压理疗体验，首次仅需 9.9 元",
    summary: "AI 智能分区舒缓，45 分钟全身放松，到店即可体验。",
    cover: "./assets/cover-ai-massage.png",
    badge: "体验",
    mediaType: "article",
    date: "长期有效",
    time: "09:00-18:00",
    location: "山东省济南市历下区姚家街道科技金融大厦 3F 理疗室",
    relatedProductId: "ai_massage",
    relatedCta: "去体验",
    paragraphs: [
      "AI 舒压理疗通过智能分区识别肩颈、腰背等重点区域，自动调节力度与热敷温度。",
      "首次体验价 9.9 元，到店核销。",
    ],
  },
  {
    id: "bc_bp_home",
    title: "【科普】居家量血压：姿势对了，读数才准",
    summary: "静坐、袖带同高、早晚各一次，连续记一周。",
    cover: "./assets/cover-bp-monitor.png",
    badge: "科普",
    mediaType: "article",
    articleId: "art_bc_bp_home",
    date: "2026-09-15",
    time: "",
    location: "济南历下 · 广播站",
    relatedProductId: "health_check",
    relatedCta: "预约健康评估",
    paragraphs: [
      "测量前静坐休息 5 分钟，背部有靠、双脚着地，袖带与心脏同高。",
      "建议晨起服药前与晚间各测一次，连续记录一周再给医生看。",
    ],
  },
  {
    id: "bc_heat_tip",
    title: "【政策】季节提示：秋老虎期间长者防暑补水",
    summary: "社区站点开放临时休息与饮水（演示通知）。",
    cover: "./assets/cover-thermometer.png",
    badge: "政策",
    mediaType: "article",
    articleId: "art_bc_heat_summer",
    date: "2026-09-14",
    time: "",
    location: "济南市社区站点",
    paragraphs: [
      "昼夜温差大时注意补水与防暑，中午高温减少户外活动。",
      "站点可提供临时休息座位与温水。",
    ],
  },
  {
    id: "bc_group_buy",
    title: "【优惠】本周团购：蛋白粉 + 护理垫，两站可自提",
    summary: "科技金融大厦站、市中驿站核销自提。",
    cover: "./assets/cover-protein-powder.png",
    badge: "优惠",
    mediaType: "article",
    articleId: "art_bc_group_buy",
    date: "2026-09-13",
    time: "09:00-18:00",
    location: "历下 / 市中自提点",
    relatedProductId: "protein_powder",
    relatedCta: "去看看商品",
    paragraphs: [
      "本周团购包含营养蛋白粉与护理垫，下单后按短信到站核销。",
      "保健食品请按说明书与医嘱使用。",
    ],
  },
  {
    id: "bc_new_course",
    title: "【上新】乐龄书法与合唱兴趣课开放预约",
    summary: "学堂联动社交课，可试听一节。",
    cover: "./assets/cover-calligraphy.png",
    badge: "上新",
    mediaType: "article",
    articleId: "art_bc_new_course",
    date: "2026-09-11",
    time: "14:00",
    location: "科技金融大厦 2F 学堂",
    relatedProductId: "cognitive_group",
    relatedCta: "预约兴趣课",
    paragraphs: [
      "书法与合唱课程本月开放预约，强调社交陪伴与轻度认知刺激。",
      "子女可陪同试听一节再决定是否包月。",
    ],
  },
  {
    id: "bc_video_chair",
    title: "【视频】椅子操入门：坐着也能练的 8 个动作",
    summary: "康复学堂联动短视频，适合平衡较弱长者。",
    cover: "./assets/cover-ar-sports.png",
    badge: "视频",
    mediaType: "video",
    articleId: "art_xue_exercise",
    date: "2026-09-10",
    time: "04:20",
    location: "广播站视频",
    relatedProductId: "neck_massage",
    relatedCta: "了解舒缓服务",
    paragraphs: [
      "椅子操强调缓慢有控制，练习前确认椅子稳固。",
      "出现胸痛气促立即停止并休息。",
    ],
  },
  {
    id: "bc_coop_meal",
    title: "【合作】控糖软食产能可周供 800 份，寻食堂共配",
    summary: "配餐商 B-B 合作信息，历下/市中优先。",
    cover: "./assets/cover-nutrition-meal.png",
    badge: "合作",
    mediaType: "article",
    articleId: "art_banshi_coop",
    date: "2026-09-09",
    time: "",
    location: "济南配餐中心（演示）",
    paragraphs: [
      "控糖软食产能可周供约 800 份，寻找历下、市中食堂或站点共配。",
      "正式合作需资质审核与供货协议。",
    ],
  },
  {
    id: "bc_lecture_fall",
    title: "本周讲座：防跌倒家居改造，周三晚 19:00",
    summary: "适老化顾问现场答疑，可带户型照片咨询。",
    cover: "./assets/cover-therapy-device.png",
    badge: "讲座",
    mediaType: "article",
    articleId: "art_xue_fall_prevent",
    date: "2026-09-17",
    time: "19:00",
    location: "科技金融大厦 2F 健康讲堂",
    relatedCta: "去办事通看改造",
    paragraphs: [
      "讲座覆盖卫生间扶手、夜间照明与门槛处理等优先项。",
      "可携带户型或现场照片，顾问现场给改造顺序建议。",
    ],
  },
  {
    id: "bc_volunteer",
    title: "【体验】周六陪诊志愿集结：科技金融大厦 1F",
    summary: "行动不便长者可报名陪诊协助（演示）。",
    cover: "./assets/cover-companion-care.png",
    badge: "体验",
    mediaType: "article",
    articleId: "art_moments_volunteer",
    date: "2026-09-20",
    time: "08:30",
    location: "科技金融大厦 1F",
    paragraphs: [
      "志愿者陪同取药、复诊，需提前报名并备注是否可推行轮椅。",
      "严格保护隐私，禁止拍摄病历与面部特写。",
    ],
  },
];

window.MALL_BROADCAST_BADGES = ["政策", "科普", "合作", "视频", "讲座", "体验", "优惠", "上新"];

function parseBroadcastDay(raw) {
  const m = String(raw || "").match(/(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return null;
  return new Date(+m[1], +m[2] - 1, +m[3]);
}

function formatBroadcastDay(d) {
  if (!(d instanceof Date) || Number.isNaN(d.getTime())) return "";
  const w = "日一二三四五六"[d.getDay()];
  return `${d.getMonth() + 1}月${d.getDate()}日 周${w}`;
}

window.formatBroadcastWhen = function formatBroadcastWhen(b) {
  const raw = String(b?.date || "").trim();
  const time = String(b?.time || "").trim();
  if (!raw || raw === "长期有效") {
    return time ? `长期有效 · 每日 ${time}` : "长期有效";
  }
  if (raw.includes("—")) {
    const [a, c] = raw.split("—").map((s) => s.trim());
    const da = parseBroadcastDay(a);
    const dc = parseBroadcastDay(c);
    const range =
      da && dc
        ? `${da.getMonth() + 1}月${da.getDate()}日至${dc.getMonth() + 1}月${dc.getDate()}日`
        : raw.replace("—", "至");
    return time ? `${range} · ${time}` : range;
  }
  const d = parseBroadcastDay(raw);
  const day = d ? formatBroadcastDay(d) : raw;
  return time ? `${day} ${time}` : day;
};

window.getMallBroadcastsSorted = function getMallBroadcastsSorted() {
  const list = (window.MALL_BROADCASTS || []).slice();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTs = today.getTime();
  const rank = (b) => {
    if (!b?.date || b.date === "长期有效") return [3, 9e15];
    const start = parseBroadcastDay(String(b.date).split("—")[0]);
    if (!start) return [3, 9e15];
    const ts = start.getTime();
    if (ts === todayTs) return [0, ts];
    if (ts > todayTs) return [1, ts];
    return [2, -ts];
  };
  return list.sort((a, b) => {
    const ra = rank(a);
    const rb = rank(b);
    return ra[0] - rb[0] || ra[1] - rb[1];
  });
};

window.getMallArticle = function getMallArticle(id) {
  return (window.MALL_ARTICLES || []).find((a) => a.id === id) || null;
};

window.getMallArticlesBySection = function getMallArticlesBySection(section) {
  const key = String(section || "").trim();
  if (!key) return (window.MALL_ARTICLES || []).slice();
  return (window.MALL_ARTICLES || []).filter((a) => (a.sections || []).includes(key));
};

window.articleDetailHref = function articleDetailHref(id, from) {
  const q = new URLSearchParams();
  q.set("id", id);
  if (from) q.set("from", from);
  return `./article.html?${q.toString()}`;
};

window.getMallActivity = function getMallActivity(id) {
  return (window.MALL_ACTIVITIES || []).find((a) => a.id === id) || null;
};

window.getMallBroadcast = function getMallBroadcast(id) {
  return (window.MALL_BROADCASTS || []).find((b) => b.id === id) || null;
};
