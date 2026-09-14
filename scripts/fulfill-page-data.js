module.exports = { pages: [
{
  "file": "logistics-ship.html",
  "sub": "logistics-ship",
  "title": "商户订单发货",
  "desc": "商户查看待发货订单并确认发货，填写物流公司、运单号与发货备注；支持物流信息更正",
  "addTitle": "登记发货",
  "columns": [
    {
      "key": "orderId",
      "label": "订单号"
    },
    {
      "key": "goods",
      "label": "商品"
    },
    {
      "key": "user",
      "label": "用户"
    },
    {
      "key": "company",
      "label": "物流公司"
    },
    {
      "key": "trackingNo",
      "label": "运单号"
    },
    {
      "key": "shipAt",
      "label": "发货时间"
    },
    {
      "key": "status",
      "label": "状态",
      "status": true
    }
  ],
  "filters": [
    {
      "id": "qKeyword",
      "label": "订单/用户",
      matchExpr: "!v||String(r.orderId||\"\").includes(v)||String(r.user||\"\").includes(v)||String(r.goods||\"\").includes(v)"
    },
    {
      "id": "qStatus",
      "label": "状态",
      "type": "select",
      "options": [
        "待发货",
        "已发货",
        "已更正"
      ],
      matchExpr: "!v||String(r.status)===v"
    },
    {
      "id": "qCompany",
      "label": "物流公司",
      "field": "company"
    }
  ],
  "formFields": [
    {
      "id": "fOrderId",
      "key": "orderId",
      "label": "订单号",
      "required": true
    },
    {
      "id": "fGoods",
      "key": "goods",
      "label": "商品",
      "required": true
    },
    {
      "id": "fUser",
      "key": "user",
      "label": "用户",
      "required": true
    },
    {
      "id": "fCompany",
      "key": "company",
      "label": "物流公司",
      "type": "select",
      "options": [
        "顺丰速运",
        "京东物流",
        "中通快递",
        "圆通速递"
      ],
      "required": true
    },
    {
      "id": "fTracking",
      "key": "trackingNo",
      "label": "运单号",
      "required": true
    },
    {
      "id": "fShipAt",
      "key": "shipAt",
      "label": "发货时间",
      "type": "date",
      "required": true
    },
    {
      "id": "fStatus",
      "key": "status",
      "label": "状态",
      "type": "select",
      "options": [
        "待发货",
        "已发货",
        "已更正"
      ]
    },
    {
      "id": "fNote",
      "key": "note",
      "label": "发货备注",
      "type": "textarea"
    }
  ],
  "stats": [
    {
      "id": "stPend",
      "label": "待发货",
      valueExpr: "(l)=>l.filter(r=>r.status===\"待发货\").length"
    },
    {
      "id": "stShip",
      "label": "已发货",
      valueExpr: "(l)=>l.filter(r=>r.status===\"已发货\").length"
    },
    {
      "id": "stFix",
      "label": "已更正",
      valueExpr: "(l)=>l.filter(r=>r.status===\"已更正\").length"
    },
    {
      "id": "stAll",
      "label": "全部",
      valueExpr: "(l)=>l.length"
    }
  ],
  getStatusExpr: "r.status===\"待发货\"?{text:r.status,cls:\"status-warn\"}:r.status===\"已发货\"?{text:r.status,cls:\"status-on\"}:{text:r.status,cls:\"status-off\"}",
  "rows": [
    {
      "orderId": "O20260731001",
      "goods": "智能紧急呼叫器",
      "user": "安辉",
      "company": "—",
      "trackingNo": "—",
      "shipAt": "—",
      "status": "待发货",
      "note": ""
    },
    {
      "orderId": "O20260730088",
      "goods": "防跌倒感应夜灯",
      "user": "张伟",
      "company": "顺丰速运",
      "trackingNo": "SF1234567890",
      "shipAt": "2026-07-30",
      "status": "已发货",
      "note": "已验货出库"
    },
    {
      "orderId": "O20260729012",
      "goods": "适老化扶手套装",
      "user": "李娜",
      "company": "京东物流",
      "trackingNo": "JD9988776655",
      "shipAt": "2026-07-29",
      "status": "已更正",
      "note": "运单号纠错"
    }
  ]
},
{
  "file": "logistics-track.html",
  "sub": "logistics-track",
  "title": "物流轨迹查询",
  "desc": "对接物流轨迹：揽收、运输、派送、签收等节点；用户/商户/平台均可查询",
  "addTitle": "录入轨迹",
  "columns": [
    {
      "key": "trackingNo",
      "label": "运单号"
    },
    {
      "key": "orderId",
      "label": "订单号"
    },
    {
      "key": "node",
      "label": "当前节点"
    },
    {
      "key": "city",
      "label": "所在城市"
    },
    {
      "key": "updatedAt",
      "label": "更新时间"
    },
    {
      "key": "viewer",
      "label": "可见方"
    },
    {
      "key": "status",
      "label": "状态",
      "status": true
    }
  ],
  "filters": [
    {
      "id": "qKeyword",
      "label": "运单/订单",
      matchExpr: "!v||String(r.trackingNo||\"\").includes(v)||String(r.orderId||\"\").includes(v)"
    },
    {
      "id": "qNode",
      "label": "节点",
      "type": "select",
      "options": [
        "揽收",
        "运输中",
        "派送中",
        "已签收",
        "退回"
      ],
      matchExpr: "!v||String(r.node)===v"
    },
    {
      "id": "q",
      "label": "城市",
      "field": "city"
    }
  ],
  "formFields": [
    {
      "id": "fTracking",
      "key": "trackingNo",
      "label": "运单号",
      "required": true
    },
    {
      "id": "fOrderId",
      "key": "orderId",
      "label": "订单号",
      "required": true
    },
    {
      "id": "fNode",
      "key": "node",
      "label": "当前节点",
      "type": "select",
      "options": [
        "揽收",
        "运输中",
        "派送中",
        "已签收",
        "退回"
      ],
      "required": true
    },
    {
      "id": "fCity",
      "key": "city",
      "label": "所在城市",
      "required": true
    },
    {
      "id": "fUpdatedAt",
      "key": "updatedAt",
      "label": "更新时间",
      "type": "date",
      "required": true
    },
    {
      "id": "fViewer",
      "key": "viewer",
      "label": "可见方",
      "type": "select",
      "options": [
        "用户/商户/平台",
        "商户/平台",
        "仅平台"
      ]
    },
    {
      "id": "fStatus",
      "key": "status",
      "label": "状态",
      "type": "select",
      "options": [
        "正常",
        "停滞",
        "异常"
      ]
    },
    {
      "id": "fDetail",
      "key": "detail",
      "label": "节点说明",
      "type": "textarea"
    }
  ],
  "stats": [
    {
      "id": "stOn",
      "label": "运输中",
      valueExpr: "(l)=>l.filter(r=>r.node===\"运输中\"||r.node===\"派送中\").length"
    },
    {
      "id": "stDone",
      "label": "已签收",
      valueExpr: "(l)=>l.filter(r=>r.node===\"已签收\").length"
    },
    {
      "id": "stBad",
      "label": "异常",
      valueExpr: "(l)=>l.filter(r=>r.status===\"异常\"||r.status===\"停滞\").length"
    },
    {
      "id": "stAll",
      "label": "轨迹单",
      valueExpr: "(l)=>l.length"
    }
  ],
  getStatusExpr: "r.status===\"正常\"?{text:r.status,cls:\"status-on\"}:r.status===\"停滞\"?{text:r.status,cls:\"status-warn\"}:{text:r.status,cls:\"status-off\"}",
  "rows": [
    {
      "trackingNo": "SF1234567890",
      "orderId": "O20260730088",
      "node": "派送中",
      "city": "北京",
      "updatedAt": "2026-07-31",
      "viewer": "用户/商户/平台",
      "status": "正常",
      "detail": "快递员正在派送"
    },
    {
      "trackingNo": "JD9988776655",
      "orderId": "O20260729012",
      "node": "已签收",
      "city": "北京",
      "updatedAt": "2026-07-30",
      "viewer": "用户/商户/平台",
      "status": "正常",
      "detail": "本人签收"
    },
    {
      "trackingNo": "ZT5566778899",
      "orderId": "O20260728003",
      "node": "运输中",
      "city": "廊坊",
      "updatedAt": "2026-07-28",
      "viewer": "商户/平台",
      "status": "停滞",
      "detail": "超48小时无更新"
    }
  ]
},
{
  "file": "logistics-receive.html",
  "sub": "logistics-receive",
  "title": "收货确认",
  "desc": "用户手动确认收货或系统按规则自动确认；记录签收时间、状态与异常说明",
  "addTitle": "确认收货",
  "columns": [
    {
      "key": "orderId",
      "label": "订单号"
    },
    {
      "key": "user",
      "label": "用户"
    },
    {
      "key": "mode",
      "label": "确认方式"
    },
    {
      "key": "receiveAt",
      "label": "签收时间"
    },
    {
      "key": "status",
      "label": "状态",
      "status": true
    },
    {
      "key": "exception",
      "label": "异常说明"
    }
  ],
  "filters": [
    {
      "id": "qKeyword",
      "label": "订单/用户",
      matchExpr: "!v||String(r.orderId||\"\").includes(v)||String(r.user||\"\").includes(v)"
    },
    {
      "id": "qMode",
      "label": "确认方式",
      "type": "select",
      "options": [
        "用户确认",
        "系统自动"
      ],
      matchExpr: "!v||String(r.mode)===v"
    },
    {
      "id": "qStatus",
      "label": "状态",
      "type": "select",
      "options": [
        "待确认",
        "已签收",
        "异常签收"
      ],
      matchExpr: "!v||String(r.status)===v"
    }
  ],
  "formFields": [
    {
      "id": "fOrderId",
      "key": "orderId",
      "label": "订单号",
      "required": true
    },
    {
      "id": "fUser",
      "key": "user",
      "label": "用户",
      "required": true
    },
    {
      "id": "fMode",
      "key": "mode",
      "label": "确认方式",
      "type": "select",
      "options": [
        "用户确认",
        "系统自动"
      ]
    },
    {
      "id": "fReceiveAt",
      "key": "receiveAt",
      "label": "签收时间",
      "type": "date",
      "required": true
    },
    {
      "id": "fStatus",
      "key": "status",
      "label": "状态",
      "type": "select",
      "options": [
        "待确认",
        "已签收",
        "异常签收"
      ]
    },
    {
      "id": "fException",
      "key": "exception",
      "label": "异常说明",
      "type": "textarea"
    }
  ],
  "stats": [
    {
      "id": "stWait",
      "label": "待确认",
      valueExpr: "(l)=>l.filter(r=>r.status===\"待确认\").length"
    },
    {
      "id": "stOk",
      "label": "已签收",
      valueExpr: "(l)=>l.filter(r=>r.status===\"已签收\").length"
    },
    {
      "id": "stEx",
      "label": "异常签收",
      valueExpr: "(l)=>l.filter(r=>r.status===\"异常签收\").length"
    },
    {
      "id": "stAuto",
      "label": "系统自动",
      valueExpr: "(l)=>l.filter(r=>r.mode===\"系统自动\").length"
    }
  ],
  getStatusExpr: "r.status===\"已签收\"?{text:r.status,cls:\"status-on\"}:r.status===\"待确认\"?{text:r.status,cls:\"status-warn\"}:{text:r.status,cls:\"status-off\"}",
  "rows": [
    {
      "orderId": "O20260730088",
      "user": "张伟",
      "mode": "用户确认",
      "receiveAt": "—",
      "status": "待确认",
      "exception": ""
    },
    {
      "orderId": "O20260729012",
      "user": "李娜",
      "mode": "用户确认",
      "receiveAt": "2026-07-30",
      "status": "已签收",
      "exception": ""
    },
    {
      "orderId": "O20260727055",
      "user": "王敏",
      "mode": "系统自动",
      "receiveAt": "2026-07-30",
      "status": "异常签收",
      "exception": "外包装破损，待售后"
    }
  ]
},
{
  "file": "logistics-exception.html",
  "sub": "logistics-exception",
  "title": "物流异常监控",
  "desc": "识别发货超时、运输停滞、签收超时、退回等异常并生成待办，通知商户与平台处理",
  "addTitle": "登记异常",
  "columns": [
    {
      "key": "taskId",
      "label": "待办编号"
    },
    {
      "key": "orderId",
      "label": "订单号"
    },
    {
      "key": "type",
      "label": "异常类型"
    },
    {
      "key": "owner",
      "label": "处理方"
    },
    {
      "key": "createdAt",
      "label": "发现时间"
    },
    {
      "key": "status",
      "label": "处理状态",
      "status": true
    }
  ],
  "filters": [
    {
      "id": "qKeyword",
      "label": "订单/编号",
      matchExpr: "!v||String(r.taskId||\"\").includes(v)||String(r.orderId||\"\").includes(v)"
    },
    {
      "id": "qType",
      "label": "异常类型",
      "type": "select",
      "options": [
        "发货超时",
        "运输停滞",
        "签收超时",
        "退回"
      ],
      matchExpr: "!v||String(r.type)===v"
    },
    {
      "id": "qStatus",
      "label": "处理状态",
      "type": "select",
      "options": [
        "待处理",
        "处理中",
        "已闭环"
      ],
      matchExpr: "!v||String(r.status)===v"
    }
  ],
  "formFields": [
    {
      "id": "fTaskId",
      "key": "taskId",
      "label": "待办编号",
      "required": true
    },
    {
      "id": "fOrderId",
      "key": "orderId",
      "label": "订单号",
      "required": true
    },
    {
      "id": "fType",
      "key": "type",
      "label": "异常类型",
      "type": "select",
      "options": [
        "发货超时",
        "运输停滞",
        "签收超时",
        "退回"
      ],
      "required": true
    },
    {
      "id": "fOwner",
      "key": "owner",
      "label": "处理方",
      "type": "select",
      "options": [
        "商户",
        "平台",
        "商户+平台"
      ]
    },
    {
      "id": "fCreatedAt",
      "key": "createdAt",
      "label": "发现时间",
      "type": "date",
      "required": true
    },
    {
      "id": "fStatus",
      "key": "status",
      "label": "处理状态",
      "type": "select",
      "options": [
        "待处理",
        "处理中",
        "已闭环"
      ]
    },
    {
      "id": "fAction",
      "key": "action",
      "label": "处理说明",
      "type": "textarea"
    }
  ],
  "stats": [
    {
      "id": "stOpen",
      "label": "待处理",
      valueExpr: "(l)=>l.filter(r=>r.status===\"待处理\").length"
    },
    {
      "id": "stDoing",
      "label": "处理中",
      valueExpr: "(l)=>l.filter(r=>r.status===\"处理中\").length"
    },
    {
      "id": "stDone",
      "label": "已闭环",
      valueExpr: "(l)=>l.filter(r=>r.status===\"已闭环\").length"
    },
    {
      "id": "stAll",
      "label": "异常单",
      valueExpr: "(l)=>l.length"
    }
  ],
  getStatusExpr: "r.status===\"已闭环\"?{text:r.status,cls:\"status-on\"}:r.status===\"处理中\"?{text:r.status,cls:\"status-warn\"}:{text:r.status,cls:\"status-off\"}",
  "rows": [
    {
      "taskId": "EX26073101",
      "orderId": "O20260728003",
      "type": "运输停滞",
      "owner": "商户+平台",
      "createdAt": "2026-07-31",
      "status": "待处理",
      "action": ""
    },
    {
      "taskId": "EX26073002",
      "orderId": "O20260726011",
      "type": "发货超时",
      "owner": "商户",
      "createdAt": "2026-07-30",
      "status": "处理中",
      "action": "已催发"
    },
    {
      "taskId": "EX26072903",
      "orderId": "O20260722008",
      "type": "签收超时",
      "owner": "平台",
      "createdAt": "2026-07-29",
      "status": "已闭环",
      "action": "系统自动确认收货"
    }
  ]
},
{
  "file": "aid-project.html",
  "sub": "aid-project",
  "title": "租赁项目发布",
  "desc": "发布辅具租赁项目：品类、规格、租金、押金、租期、续租规则、服务区域与说明",
  "addTitle": "发布项目",
  "columns": [
    {
      "key": "name",
      "label": "项目名称"
    },
    {
      "key": "category",
      "label": "品类"
    },
    {
      "key": "spec",
      "label": "规格"
    },
    {
      "key": "rent",
      "label": "月租金"
    },
    {
      "key": "deposit",
      "label": "押金"
    },
    {
      "key": "period",
      "label": "租期(月)"
    },
    {
      "key": "area",
      "label": "服务区域"
    },
    {
      "key": "status",
      "label": "状态",
      "status": true
    }
  ],
  "filters": [
    {
      "id": "qKeyword",
      "label": "名称/品类",
      matchExpr: "!v||String(r.name||\"\").includes(v)||String(r.category||\"\").includes(v)"
    },
    {
      "id": "qCat",
      "label": "品类",
      "type": "select",
      "options": [
        "行动辅具",
        "如厕洗浴",
        "护理床具",
        "监测设备"
      ],
      matchExpr: "!v||String(r.category)===v"
    },
    {
      "id": "qStatus",
      "label": "状态",
      "type": "select",
      "options": [
        "上架",
        "下架"
      ],
      matchExpr: "!v||String(r.status)===v"
    }
  ],
  "formFields": [
    {
      "id": "fName",
      "key": "name",
      "label": "项目名称",
      "required": true
    },
    {
      "id": "fCategory",
      "key": "category",
      "label": "品类",
      "type": "select",
      "options": [
        "行动辅具",
        "如厕洗浴",
        "护理床具",
        "监测设备"
      ],
      "required": true
    },
    {
      "id": "fSpec",
      "key": "spec",
      "label": "规格",
      "required": true
    },
    {
      "id": "fRent",
      "key": "rent",
      "label": "月租金",
      "type": "number",
      "required": true,
      "default": 0
    },
    {
      "id": "fDeposit",
      "key": "deposit",
      "label": "押金",
      "type": "number",
      "required": true,
      "default": 0
    },
    {
      "id": "fPeriod",
      "key": "period",
      "label": "租期(月)",
      "type": "number",
      "default": 1
    },
    {
      "id": "fRenew",
      "key": "renewRule",
      "label": "续租规则"
    },
    {
      "id": "fArea",
      "key": "area",
      "label": "服务区域",
      "required": true
    },
    {
      "id": "fStatus",
      "key": "status",
      "label": "状态",
      "type": "select",
      "options": [
        "上架",
        "下架"
      ]
    },
    {
      "id": "fIntro",
      "key": "intro",
      "label": "使用说明",
      "type": "textarea"
    }
  ],
  "stats": [
    {
      "id": "stOn",
      "label": "上架",
      valueExpr: "(l)=>l.filter(r=>r.status===\"上架\").length"
    },
    {
      "id": "stOff",
      "label": "下架",
      valueExpr: "(l)=>l.filter(r=>r.status===\"下架\").length"
    },
    {
      "id": "stAvg",
      "label": "均租金",
      valueExpr: "(l)=>{const a=l.filter(r=>r.status===\"上架\");return a.length?Math.round(a.reduce((s,r)=>s+Number(r.rent||0),0)/a.length):0}"
    },
    {
      "id": "stAll",
      "label": "项目数",
      valueExpr: "(l)=>l.length"
    }
  ],
  getStatusExpr: "r.status===\"上架\"?{text:r.status,cls:\"status-on\"}:{text:r.status,cls:\"status-off\"}",
  "rows": [
    {
      "name": "铝合金四脚拐杖",
      "category": "行动辅具",
      "spec": "可调高度",
      "rent": 30,
      "deposit": 100,
      "period": 1,
      "renewRule": "到期前7天可续",
      "area": "朝阳/东城",
      "status": "上架",
      "intro": "适短途助行"
    },
    {
      "name": "电动护理床",
      "category": "护理床具",
      "spec": "三功能",
      "rent": 380,
      "deposit": 1500,
      "period": 3,
      "renewRule": "可续租最多12个月",
      "area": "城六区",
      "status": "上架",
      "intro": "含上门安装"
    },
    {
      "name": "防滑沐浴椅",
      "category": "如厕洗浴",
      "spec": "带扶手",
      "rent": 45,
      "deposit": 150,
      "period": 1,
      "renewRule": "到期前3天可续",
      "area": "全市",
      "status": "下架",
      "intro": "暂停供应"
    }
  ]
},
{
  "file": "aid-stock.html",
  "sub": "aid-stock",
  "title": "租赁库存与状态",
  "desc": "管理可租/在租/待归还/维修中/不可租数量；支持库存预占、释放与资产状态查询",
  "addTitle": "登记库存",
  "columns": [
    {
      "key": "assetId",
      "label": "资产编号"
    },
    {
      "key": "name",
      "label": "辅具"
    },
    {
      "key": "available",
      "label": "可租"
    },
    {
      "key": "rented",
      "label": "在租"
    },
    {
      "key": "returning",
      "label": "待归还"
    },
    {
      "key": "repair",
      "label": "维修中"
    },
    {
      "key": "blocked",
      "label": "不可租"
    },
    {
      "key": "status",
      "label": "汇总状态",
      "status": true
    }
  ],
  "filters": [
    {
      "id": "qKeyword",
      "label": "资产/名称",
      matchExpr: "!v||String(r.assetId||\"\").includes(v)||String(r.name||\"\").includes(v)"
    },
    {
      "id": "qStatus",
      "label": "状态",
      "type": "select",
      "options": [
        "充足",
        "紧张",
        "无库存"
      ],
      matchExpr: "!v||String(r.status)===v"
    },
    {
      "id": "q",
      "label": "备注",
      "field": "note"
    }
  ],
  "formFields": [
    {
      "id": "fAssetId",
      "key": "assetId",
      "label": "资产编号",
      "required": true
    },
    {
      "id": "fName",
      "key": "name",
      "label": "辅具",
      "required": true
    },
    {
      "id": "fAvailable",
      "key": "available",
      "label": "可租",
      "type": "number",
      "default": 0
    },
    {
      "id": "fRented",
      "key": "rented",
      "label": "在租",
      "type": "number",
      "default": 0
    },
    {
      "id": "fReturning",
      "key": "returning",
      "label": "待归还",
      "type": "number",
      "default": 0
    },
    {
      "id": "fRepair",
      "key": "repair",
      "label": "维修中",
      "type": "number",
      "default": 0
    },
    {
      "id": "fBlocked",
      "key": "blocked",
      "label": "不可租",
      "type": "number",
      "default": 0
    },
    {
      "id": "fStatus",
      "key": "status",
      "label": "汇总状态",
      "type": "select",
      "options": [
        "充足",
        "紧张",
        "无库存"
      ]
    },
    {
      "id": "fNote",
      "key": "note",
      "label": "备注",
      "type": "textarea"
    }
  ],
  "stats": [
    {
      "id": "stAv",
      "label": "可租总量",
      valueExpr: "(l)=>l.reduce((s,r)=>s+Number(r.available||0),0)"
    },
    {
      "id": "stRent",
      "label": "在租总量",
      valueExpr: "(l)=>l.reduce((s,r)=>s+Number(r.rented||0),0)"
    },
    {
      "id": "stRep",
      "label": "维修中",
      valueExpr: "(l)=>l.reduce((s,r)=>s+Number(r.repair||0),0)"
    },
    {
      "id": "stLow",
      "label": "紧张/无货",
      valueExpr: "(l)=>l.filter(r=>r.status!==\"充足\").length"
    }
  ],
  getStatusExpr: "r.status===\"充足\"?{text:r.status,cls:\"status-on\"}:r.status===\"紧张\"?{text:r.status,cls:\"status-warn\"}:{text:r.status,cls:\"status-off\"}",
  "rows": [
    {
      "assetId": "AID-CT-01",
      "name": "铝合金四脚拐杖",
      "available": 26,
      "rented": 12,
      "returning": 2,
      "repair": 1,
      "blocked": 0,
      "status": "充足",
      "note": ""
    },
    {
      "assetId": "AID-BED-02",
      "name": "电动护理床",
      "available": 2,
      "rented": 8,
      "returning": 1,
      "repair": 1,
      "blocked": 0,
      "status": "紧张",
      "note": "预占1台"
    },
    {
      "assetId": "AID-CHAIR-03",
      "name": "防滑沐浴椅",
      "available": 0,
      "rented": 0,
      "returning": 0,
      "repair": 3,
      "blocked": 5,
      "status": "无库存",
      "note": "批次召回"
    }
  ]
},
{
  "file": "aid-deposit.html",
  "sub": "aid-deposit",
  "title": "租期租金与押金",
  "desc": "按租期自动计算租金与押金；支持押金支付、冻结、扣减、退还与进度查询",
  "addTitle": "新建账单",
  "columns": [
    {
      "key": "billId",
      "label": "账单号"
    },
    {
      "key": "user",
      "label": "用户"
    },
    {
      "key": "item",
      "label": "辅具"
    },
    {
      "key": "months",
      "label": "租期"
    },
    {
      "key": "rent",
      "label": "租金"
    },
    {
      "key": "deposit",
      "label": "押金"
    },
    {
      "key": "depStatus",
      "label": "押金状态",
      "status": true
    }
  ],
  "filters": [
    {
      "id": "qKeyword",
      "label": "账单/用户",
      matchExpr: "!v||String(r.billId||\"\").includes(v)||String(r.user||\"\").includes(v)||String(r.item||\"\").includes(v)"
    },
    {
      "id": "qDep",
      "label": "押金状态",
      "type": "select",
      "options": [
        "待支付",
        "已冻结",
        "已扣减",
        "已退还"
      ],
      matchExpr: "!v||String(r.depStatus)===v"
    },
    {
      "id": "q",
      "label": "辅具",
      "field": "item"
    }
  ],
  "formFields": [
    {
      "id": "fBillId",
      "key": "billId",
      "label": "账单号",
      "required": true
    },
    {
      "id": "fUser",
      "key": "user",
      "label": "用户",
      "required": true
    },
    {
      "id": "fItem",
      "key": "item",
      "label": "辅具",
      "required": true
    },
    {
      "id": "fMonths",
      "key": "months",
      "label": "租期(月)",
      "type": "number",
      "default": 1
    },
    {
      "id": "fRent",
      "key": "rent",
      "label": "租金",
      "type": "number",
      "default": 0
    },
    {
      "id": "fDeposit",
      "key": "deposit",
      "label": "押金",
      "type": "number",
      "default": 0
    },
    {
      "id": "fDepStatus",
      "key": "depStatus",
      "label": "押金状态",
      "type": "select",
      "options": [
        "待支付",
        "已冻结",
        "已扣减",
        "已退还"
      ]
    },
    {
      "id": "fProgress",
      "key": "progress",
      "label": "进度说明",
      "type": "textarea"
    }
  ],
  "stats": [
    {
      "id": "stPay",
      "label": "待支付",
      valueExpr: "(l)=>l.filter(r=>r.depStatus===\"待支付\").length"
    },
    {
      "id": "stFreeze",
      "label": "已冻结",
      valueExpr: "(l)=>l.filter(r=>r.depStatus===\"已冻结\").length"
    },
    {
      "id": "stCut",
      "label": "已扣减",
      valueExpr: "(l)=>l.filter(r=>r.depStatus===\"已扣减\").length"
    },
    {
      "id": "stBack",
      "label": "已退还",
      valueExpr: "(l)=>l.filter(r=>r.depStatus===\"已退还\").length"
    }
  ],
  getStatusExpr: "r.depStatus===\"已退还\"?{text:r.depStatus,cls:\"status-on\"}:r.depStatus===\"已冻结\"?{text:r.depStatus,cls:\"status-warn\"}:r.depStatus===\"已扣减\"?{text:r.depStatus,cls:\"status-off\"}:{text:r.depStatus,cls:\"status-warn\"}",
  "rows": [
    {
      "billId": "RB26073101",
      "user": "安辉",
      "item": "铝合金四脚拐杖",
      "months": 1,
      "rent": 30,
      "deposit": 100,
      "depStatus": "已冻结",
      "progress": "租期进行中"
    },
    {
      "billId": "RB26072008",
      "user": "张伟",
      "item": "电动护理床",
      "months": 3,
      "rent": 1140,
      "deposit": 1500,
      "depStatus": "待支付",
      "progress": "待支付押金"
    },
    {
      "billId": "RB26061003",
      "user": "李娜",
      "item": "防滑沐浴椅",
      "months": 1,
      "rent": 45,
      "deposit": 150,
      "depStatus": "已退还",
      "progress": "验收完好全额退还"
    }
  ]
},
{
  "file": "aid-renew.html",
  "sub": "aid-renew",
  "title": "租赁续约",
  "desc": "到期前用户可续租；系统重算租期与租金，并同步订单、库存与提醒",
  "addTitle": "办理续约",
  "columns": [
    {
      "key": "renewId",
      "label": "续约单号"
    },
    {
      "key": "user",
      "label": "用户"
    },
    {
      "key": "item",
      "label": "辅具"
    },
    {
      "key": "oldEnd",
      "label": "原到期日"
    },
    {
      "key": "newEnd",
      "label": "新到期日"
    },
    {
      "key": "addRent",
      "label": "续租金"
    },
    {
      "key": "status",
      "label": "状态",
      "status": true
    }
  ],
  "filters": [
    {
      "id": "qKeyword",
      "label": "单号/用户",
      matchExpr: "!v||String(r.renewId||\"\").includes(v)||String(r.user||\"\").includes(v)"
    },
    {
      "id": "qStatus",
      "label": "状态",
      "type": "select",
      "options": [
        "待支付",
        "已生效",
        "已取消"
      ],
      matchExpr: "!v||String(r.status)===v"
    },
    {
      "id": "q",
      "label": "辅具",
      "field": "item"
    }
  ],
  "formFields": [
    {
      "id": "fRenewId",
      "key": "renewId",
      "label": "续约单号",
      "required": true
    },
    {
      "id": "fUser",
      "key": "user",
      "label": "用户",
      "required": true
    },
    {
      "id": "fItem",
      "key": "item",
      "label": "辅具",
      "required": true
    },
    {
      "id": "fOldEnd",
      "key": "oldEnd",
      "label": "原到期日",
      "type": "date",
      "required": true
    },
    {
      "id": "fNewEnd",
      "key": "newEnd",
      "label": "新到期日",
      "type": "date",
      "required": true
    },
    {
      "id": "fAddRent",
      "key": "addRent",
      "label": "续租金",
      "type": "number",
      "default": 0
    },
    {
      "id": "fStatus",
      "key": "status",
      "label": "状态",
      "type": "select",
      "options": [
        "待支付",
        "已生效",
        "已取消"
      ]
    },
    {
      "id": "fSync",
      "key": "syncNote",
      "label": "同步说明",
      "type": "textarea"
    }
  ],
  "stats": [
    {
      "id": "stPay",
      "label": "待支付",
      valueExpr: "(l)=>l.filter(r=>r.status===\"待支付\").length"
    },
    {
      "id": "stOk",
      "label": "已生效",
      valueExpr: "(l)=>l.filter(r=>r.status===\"已生效\").length"
    },
    {
      "id": "stCancel",
      "label": "已取消",
      valueExpr: "(l)=>l.filter(r=>r.status===\"已取消\").length"
    },
    {
      "id": "stAmt",
      "label": "续租金额",
      valueExpr: "(l)=>l.filter(r=>r.status===\"已生效\").reduce((s,r)=>s+Number(r.addRent||0),0)"
    }
  ],
  getStatusExpr: "r.status===\"已生效\"?{text:r.status,cls:\"status-on\"}:r.status===\"待支付\"?{text:r.status,cls:\"status-warn\"}:{text:r.status,cls:\"status-off\"}",
  "rows": [
    {
      "renewId": "RN26073101",
      "user": "安辉",
      "item": "铝合金四脚拐杖",
      "oldEnd": "2026-08-05",
      "newEnd": "2026-09-05",
      "addRent": 30,
      "status": "待支付",
      "syncNote": ""
    },
    {
      "renewId": "RN26072002",
      "user": "王敏",
      "item": "电动护理床",
      "oldEnd": "2026-07-20",
      "newEnd": "2026-10-20",
      "addRent": 1140,
      "status": "已生效",
      "syncNote": "库存占用已延长"
    }
  ]
},
{
  "file": "aid-delivery.html",
  "sub": "aid-delivery",
  "title": "租赁交付与归还",
  "desc": "记录交付/归还时间、凭证、用户确认与归还申请",
  "addTitle": "登记交付/归还",
  "columns": [
    {
      "key": "recordId",
      "label": "记录号"
    },
    {
      "key": "user",
      "label": "用户"
    },
    {
      "key": "item",
      "label": "辅具"
    },
    {
      "key": "type",
      "label": "类型"
    },
    {
      "key": "time",
      "label": "时间"
    },
    {
      "key": "confirm",
      "label": "用户确认"
    },
    {
      "key": "status",
      "label": "状态",
      "status": true
    }
  ],
  "filters": [
    {
      "id": "qKeyword",
      "label": "记录/用户",
      matchExpr: "!v||String(r.recordId||\"\").includes(v)||String(r.user||\"\").includes(v)"
    },
    {
      "id": "qType",
      "label": "类型",
      "type": "select",
      "options": [
        "交付",
        "归还申请",
        "已归还"
      ],
      matchExpr: "!v||String(r.type)===v"
    },
    {
      "id": "qStatus",
      "label": "状态",
      "type": "select",
      "options": [
        "待确认",
        "已完成",
        "待上门"
      ],
      matchExpr: "!v||String(r.status)===v"
    }
  ],
  "formFields": [
    {
      "id": "fRecordId",
      "key": "recordId",
      "label": "记录号",
      "required": true
    },
    {
      "id": "fUser",
      "key": "user",
      "label": "用户",
      "required": true
    },
    {
      "id": "fItem",
      "key": "item",
      "label": "辅具",
      "required": true
    },
    {
      "id": "fType",
      "key": "type",
      "label": "类型",
      "type": "select",
      "options": [
        "交付",
        "归还申请",
        "已归还"
      ]
    },
    {
      "id": "fTime",
      "key": "time",
      "label": "时间",
      "type": "date",
      "required": true
    },
    {
      "id": "fConfirm",
      "key": "confirm",
      "label": "用户确认",
      "type": "select",
      "options": [
        "已确认",
        "未确认"
      ]
    },
    {
      "id": "fStatus",
      "key": "status",
      "label": "状态",
      "type": "select",
      "options": [
        "待确认",
        "已完成",
        "待上门"
      ]
    },
    {
      "id": "fProof",
      "key": "proof",
      "label": "凭证说明",
      "type": "textarea"
    }
  ],
  "stats": [
    {
      "id": "stDel",
      "label": "交付",
      valueExpr: "(l)=>l.filter(r=>r.type===\"交付\").length"
    },
    {
      "id": "stApply",
      "label": "归还申请",
      valueExpr: "(l)=>l.filter(r=>r.type===\"归还申请\").length"
    },
    {
      "id": "stBack",
      "label": "已归还",
      valueExpr: "(l)=>l.filter(r=>r.type===\"已归还\").length"
    },
    {
      "id": "stWait",
      "label": "待确认",
      valueExpr: "(l)=>l.filter(r=>r.status===\"待确认\").length"
    }
  ],
  getStatusExpr: "r.status===\"已完成\"?{text:r.status,cls:\"status-on\"}:r.status===\"待上门\"?{text:r.status,cls:\"status-warn\"}:{text:r.status,cls:\"status-off\"}",
  "rows": [
    {
      "recordId": "DL26073101",
      "user": "安辉",
      "item": "铝合金四脚拐杖",
      "type": "交付",
      "time": "2026-07-31",
      "confirm": "已确认",
      "status": "已完成",
      "proof": "签收单S001"
    },
    {
      "recordId": "RT26073102",
      "user": "张伟",
      "item": "电动护理床",
      "type": "归还申请",
      "time": "2026-07-31",
      "confirm": "未确认",
      "status": "待上门",
      "proof": "预约8/2上门"
    }
  ]
},
{
  "file": "aid-inspect.html",
  "sub": "aid-inspect",
  "title": "归还验收与损坏赔付",
  "desc": "商户验收完好/损坏/配件缺失，计算维修费或赔付金额",
  "addTitle": "验收登记",
  "columns": [
    {
      "key": "inspectId",
      "label": "验收单"
    },
    {
      "key": "user",
      "label": "用户"
    },
    {
      "key": "item",
      "label": "辅具"
    },
    {
      "key": "result",
      "label": "验收结果"
    },
    {
      "key": "fee",
      "label": "赔付/维修费"
    },
    {
      "key": "inspector",
      "label": "验收人"
    },
    {
      "key": "status",
      "label": "状态",
      "status": true
    }
  ],
  "filters": [
    {
      "id": "qKeyword",
      "label": "单号/用户",
      matchExpr: "!v||String(r.inspectId||\"\").includes(v)||String(r.user||\"\").includes(v)"
    },
    {
      "id": "qResult",
      "label": "验收结果",
      "type": "select",
      "options": [
        "完好",
        "损坏",
        "配件缺失"
      ],
      matchExpr: "!v||String(r.result)===v"
    },
    {
      "id": "qStatus",
      "label": "状态",
      "type": "select",
      "options": [
        "待验收",
        "已计价",
        "已确认"
      ],
      matchExpr: "!v||String(r.status)===v"
    }
  ],
  "formFields": [
    {
      "id": "fInspectId",
      "key": "inspectId",
      "label": "验收单",
      "required": true
    },
    {
      "id": "fUser",
      "key": "user",
      "label": "用户",
      "required": true
    },
    {
      "id": "fItem",
      "key": "item",
      "label": "辅具",
      "required": true
    },
    {
      "id": "fResult",
      "key": "result",
      "label": "验收结果",
      "type": "select",
      "options": [
        "完好",
        "损坏",
        "配件缺失"
      ]
    },
    {
      "id": "fFee",
      "key": "fee",
      "label": "赔付/维修费",
      "type": "number",
      "default": 0
    },
    {
      "id": "fInspector",
      "key": "inspector",
      "label": "验收人",
      "required": true
    },
    {
      "id": "fStatus",
      "key": "status",
      "label": "状态",
      "type": "select",
      "options": [
        "待验收",
        "已计价",
        "已确认"
      ]
    },
    {
      "id": "fNote",
      "key": "note",
      "label": "验收说明",
      "type": "textarea"
    }
  ],
  "stats": [
    {
      "id": "stOk",
      "label": "完好",
      valueExpr: "(l)=>l.filter(r=>r.result===\"完好\").length"
    },
    {
      "id": "stDmg",
      "label": "损坏/缺失",
      valueExpr: "(l)=>l.filter(r=>r.result!==\"完好\").length"
    },
    {
      "id": "stFee",
      "label": "赔付合计",
      valueExpr: "(l)=>l.reduce((s,r)=>s+Number(r.fee||0),0)"
    },
    {
      "id": "stWait",
      "label": "待验收",
      valueExpr: "(l)=>l.filter(r=>r.status===\"待验收\").length"
    }
  ],
  getStatusExpr: "r.status===\"已确认\"?{text:r.status,cls:\"status-on\"}:r.status===\"已计价\"?{text:r.status,cls:\"status-warn\"}:{text:r.status,cls:\"status-off\"}",
  "rows": [
    {
      "inspectId": "IS26073001",
      "user": "李娜",
      "item": "防滑沐浴椅",
      "result": "完好",
      "fee": 0,
      "inspector": "店员小李",
      "status": "已确认",
      "note": "外观功能正常"
    },
    {
      "inspectId": "IS26073102",
      "user": "张伟",
      "item": "电动护理床",
      "result": "配件缺失",
      "fee": 120,
      "inspector": "店员小王",
      "status": "已计价",
      "note": "缺失遥控电池盖"
    }
  ]
},
{
  "file": "aid-refund.html",
  "sub": "aid-refund",
  "title": "押金退还与申诉",
  "desc": "验收后自动触发退还或扣减；用户可查看进度并对扣减结果申诉",
  "addTitle": "登记退还/申诉",
  "columns": [
    {
      "key": "caseId",
      "label": "单号"
    },
    {
      "key": "user",
      "label": "用户"
    },
    {
      "key": "item",
      "label": "辅具"
    },
    {
      "key": "deposit",
      "label": "押金"
    },
    {
      "key": "refund",
      "label": "应退金额"
    },
    {
      "key": "type",
      "label": "类型"
    },
    {
      "key": "status",
      "label": "状态",
      "status": true
    }
  ],
  "filters": [
    {
      "id": "qKeyword",
      "label": "单号/用户",
      matchExpr: "!v||String(r.caseId||\"\").includes(v)||String(r.user||\"\").includes(v)"
    },
    {
      "id": "qType",
      "label": "类型",
      "type": "select",
      "options": [
        "自动退还",
        "扣减退还",
        "用户申诉"
      ],
      matchExpr: "!v||String(r.type)===v"
    },
    {
      "id": "qStatus",
      "label": "状态",
      "type": "select",
      "options": [
        "处理中",
        "已退款",
        "申诉中",
        "已驳回"
      ],
      matchExpr: "!v||String(r.status)===v"
    }
  ],
  "formFields": [
    {
      "id": "fCaseId",
      "key": "caseId",
      "label": "单号",
      "required": true
    },
    {
      "id": "fUser",
      "key": "user",
      "label": "用户",
      "required": true
    },
    {
      "id": "fItem",
      "key": "item",
      "label": "辅具",
      "required": true
    },
    {
      "id": "fDeposit",
      "key": "deposit",
      "label": "押金",
      "type": "number",
      "default": 0
    },
    {
      "id": "fRefund",
      "key": "refund",
      "label": "应退金额",
      "type": "number",
      "default": 0
    },
    {
      "id": "fType",
      "key": "type",
      "label": "类型",
      "type": "select",
      "options": [
        "自动退还",
        "扣减退还",
        "用户申诉"
      ]
    },
    {
      "id": "fStatus",
      "key": "status",
      "label": "状态",
      "type": "select",
      "options": [
        "处理中",
        "已退款",
        "申诉中",
        "已驳回"
      ]
    },
    {
      "id": "fReason",
      "key": "reason",
      "label": "说明/申诉理由",
      "type": "textarea"
    }
  ],
  "stats": [
    {
      "id": "stProc",
      "label": "处理中",
      valueExpr: "(l)=>l.filter(r=>r.status===\"处理中\"||r.status===\"申诉中\").length"
    },
    {
      "id": "stOk",
      "label": "已退款",
      valueExpr: "(l)=>l.filter(r=>r.status===\"已退款\").length"
    },
    {
      "id": "stAppeal",
      "label": "申诉中",
      valueExpr: "(l)=>l.filter(r=>r.status===\"申诉中\").length"
    },
    {
      "id": "stAmt",
      "label": "应退合计",
      valueExpr: "(l)=>l.reduce((s,r)=>s+Number(r.refund||0),0)"
    }
  ],
  getStatusExpr: "r.status===\"已退款\"?{text:r.status,cls:\"status-on\"}:r.status===\"申诉中\"?{text:r.status,cls:\"status-warn\"}:r.status===\"已驳回\"?{text:r.status,cls:\"status-off\"}:{text:r.status,cls:\"status-warn\"}",
  "rows": [
    {
      "caseId": "DP26073001",
      "user": "李娜",
      "item": "防滑沐浴椅",
      "deposit": 150,
      "refund": 150,
      "type": "自动退还",
      "status": "已退款",
      "reason": "验收完好"
    },
    {
      "caseId": "DP26073102",
      "user": "张伟",
      "item": "电动护理床",
      "deposit": 1500,
      "refund": 1380,
      "type": "扣减退还",
      "status": "申诉中",
      "reason": "不服配件扣款120"
    }
  ]
},
{
  "file": "aftersale-apply.html",
  "sub": "aftersale-apply",
  "title": "用户售后申请",
  "desc": "用户发起退款/退货退款/换货/服务取消/投诉/押金申诉，支持图片凭证",
  "addTitle": "登记申请",
  "columns": [
    {
      "key": "applyId",
      "label": "申请单"
    },
    {
      "key": "user",
      "label": "用户"
    },
    {
      "key": "orderId",
      "label": "订单号"
    },
    {
      "key": "type",
      "label": "类型"
    },
    {
      "key": "reason",
      "label": "原因"
    },
    {
      "key": "createdAt",
      "label": "申请时间"
    },
    {
      "key": "status",
      "label": "状态",
      "status": true
    }
  ],
  "filters": [
    {
      "id": "qKeyword",
      "label": "申请/用户/订单",
      matchExpr: "!v||String(r.applyId||\"\").includes(v)||String(r.user||\"\").includes(v)||String(r.orderId||\"\").includes(v)"
    },
    {
      "id": "qType",
      "label": "类型",
      "type": "select",
      "options": [
        "仅退款",
        "退货退款",
        "换货",
        "服务取消",
        "投诉",
        "押金申诉"
      ],
      matchExpr: "!v||String(r.type)===v"
    },
    {
      "id": "qStatus",
      "label": "状态",
      "type": "select",
      "options": [
        "待审核",
        "处理中",
        "已完成",
        "已驳回"
      ],
      matchExpr: "!v||String(r.status)===v"
    }
  ],
  "formFields": [
    {
      "id": "fApplyId",
      "key": "applyId",
      "label": "申请单",
      "required": true
    },
    {
      "id": "fUser",
      "key": "user",
      "label": "用户",
      "required": true
    },
    {
      "id": "fOrderId",
      "key": "orderId",
      "label": "订单号",
      "required": true
    },
    {
      "id": "fType",
      "key": "type",
      "label": "类型",
      "type": "select",
      "options": [
        "仅退款",
        "退货退款",
        "换货",
        "服务取消",
        "投诉",
        "押金申诉"
      ],
      "required": true
    },
    {
      "id": "fReason",
      "key": "reason",
      "label": "原因",
      "required": true
    },
    {
      "id": "fCreatedAt",
      "key": "createdAt",
      "label": "申请时间",
      "type": "date",
      "required": true
    },
    {
      "id": "fStatus",
      "key": "status",
      "label": "状态",
      "type": "select",
      "options": [
        "待审核",
        "处理中",
        "已完成",
        "已驳回"
      ]
    },
    {
      "id": "fProof",
      "key": "proof",
      "label": "凭证",
      "type": "textarea"
    }
  ],
  "stats": [
    {
      "id": "stWait",
      "label": "待审核",
      valueExpr: "(l)=>l.filter(r=>r.status===\"待审核\").length"
    },
    {
      "id": "stDoing",
      "label": "处理中",
      valueExpr: "(l)=>l.filter(r=>r.status===\"处理中\").length"
    },
    {
      "id": "stDone",
      "label": "已完成",
      valueExpr: "(l)=>l.filter(r=>r.status===\"已完成\").length"
    },
    {
      "id": "stReject",
      "label": "已驳回",
      valueExpr: "(l)=>l.filter(r=>r.status===\"已驳回\").length"
    }
  ],
  getStatusExpr: "r.status===\"已完成\"?{text:r.status,cls:\"status-on\"}:r.status===\"已驳回\"?{text:r.status,cls:\"status-off\"}:{text:r.status,cls:\"status-warn\"}",
  "rows": [
    {
      "applyId": "AS26073101",
      "user": "安辉",
      "orderId": "O20260730088",
      "type": "仅退款",
      "reason": "少发配件",
      "createdAt": "2026-07-31",
      "status": "待审核",
      "proof": "开箱照片×2"
    },
    {
      "applyId": "AS26073002",
      "user": "张伟",
      "orderId": "RB26073102",
      "type": "押金申诉",
      "reason": "不服配件扣款",
      "createdAt": "2026-07-30",
      "status": "处理中",
      "proof": "验收视频"
    },
    {
      "applyId": "AS26072803",
      "user": "李娜",
      "orderId": "O20260725001",
      "type": "服务取消",
      "reason": "改期失败要求取消",
      "createdAt": "2026-07-28",
      "status": "已完成",
      "proof": ""
    }
  ]
},
{
  "file": "aftersale-merchant.html",
  "sub": "aftersale-merchant",
  "title": "商户售后处理",
  "desc": "商户审核售后：同意/拒绝、设置退款金额、退货地址，并跟踪退货进度",
  "addTitle": "处理售后",
  "columns": [
    {
      "key": "applyId",
      "label": "申请单"
    },
    {
      "key": "merchant",
      "label": "商户"
    },
    {
      "key": "decision",
      "label": "处理结论"
    },
    {
      "key": "refundAmt",
      "label": "退款金额"
    },
    {
      "key": "returnAddr",
      "label": "退货地址"
    },
    {
      "key": "progress",
      "label": "退货进度"
    },
    {
      "key": "status",
      "label": "状态",
      "status": true
    }
  ],
  "filters": [
    {
      "id": "qKeyword",
      "label": "申请/商户",
      matchExpr: "!v||String(r.applyId||\"\").includes(v)||String(r.merchant||\"\").includes(v)"
    },
    {
      "id": "qDecision",
      "label": "结论",
      "type": "select",
      "options": [
        "同意退款",
        "同意退货退款",
        "拒绝",
        "待处理"
      ],
      matchExpr: "!v||String(r.decision)===v"
    },
    {
      "id": "qStatus",
      "label": "状态",
      "type": "select",
      "options": [
        "待处理",
        "待退货",
        "已完结"
      ],
      matchExpr: "!v||String(r.status)===v"
    }
  ],
  "formFields": [
    {
      "id": "fApplyId",
      "key": "applyId",
      "label": "申请单",
      "required": true
    },
    {
      "id": "fMerchant",
      "key": "merchant",
      "label": "商户",
      "required": true
    },
    {
      "id": "fDecision",
      "key": "decision",
      "label": "处理结论",
      "type": "select",
      "options": [
        "同意退款",
        "同意退货退款",
        "拒绝",
        "待处理"
      ]
    },
    {
      "id": "fRefundAmt",
      "key": "refundAmt",
      "label": "退款金额",
      "type": "number",
      "default": 0
    },
    {
      "id": "fReturnAddr",
      "key": "returnAddr",
      "label": "退货地址"
    },
    {
      "id": "fProgress",
      "key": "progress",
      "label": "退货进度",
      "type": "select",
      "options": [
        "—",
        "待寄回",
        "运输中",
        "已收货",
        "已完结"
      ]
    },
    {
      "id": "fStatus",
      "key": "status",
      "label": "状态",
      "type": "select",
      "options": [
        "待处理",
        "待退货",
        "已完结"
      ]
    },
    {
      "id": "fReject",
      "key": "rejectReason",
      "label": "拒绝原因",
      "type": "textarea"
    }
  ],
  "stats": [
    {
      "id": "stWait",
      "label": "待处理",
      valueExpr: "(l)=>l.filter(r=>r.status===\"待处理\").length"
    },
    {
      "id": "stReturn",
      "label": "待退货",
      valueExpr: "(l)=>l.filter(r=>r.status===\"待退货\").length"
    },
    {
      "id": "stDone",
      "label": "已完结",
      valueExpr: "(l)=>l.filter(r=>r.status===\"已完结\").length"
    },
    {
      "id": "stAmt",
      "label": "退款合计",
      valueExpr: "(l)=>l.reduce((s,r)=>s+Number(r.refundAmt||0),0)"
    }
  ],
  getStatusExpr: "r.status===\"已完结\"?{text:r.status,cls:\"status-on\"}:r.status===\"待退货\"?{text:r.status,cls:\"status-warn\"}:{text:r.status,cls:\"status-off\"}",
  "rows": [
    {
      "applyId": "AS26073101",
      "merchant": "春风朝阳门店",
      "decision": "待处理",
      "refundAmt": 0,
      "returnAddr": "—",
      "progress": "—",
      "status": "待处理",
      "rejectReason": ""
    },
    {
      "applyId": "AS26072803",
      "merchant": "心相伴机构",
      "decision": "同意退款",
      "refundAmt": 15,
      "returnAddr": "—",
      "progress": "已完结",
      "status": "已完结",
      "rejectReason": ""
    }
  ]
},
{
  "file": "aftersale-cs.html",
  "sub": "aftersale-cs",
  "title": "人工客服工作台",
  "desc": "集中处理咨询/投诉/进度查询；支持服务记录、附件、备注；含长者快捷入口",
  "addTitle": "新建工单",
  "columns": [
    {
      "key": "ticketId",
      "label": "工单号"
    },
    {
      "key": "user",
      "label": "用户"
    },
    {
      "key": "channel",
      "label": "来源"
    },
    {
      "key": "topic",
      "label": "主题"
    },
    {
      "key": "elder",
      "label": "长者入口"
    },
    {
      "key": "agent",
      "label": "客服"
    },
    {
      "key": "status",
      "label": "状态",
      "status": true
    }
  ],
  "filters": [
    {
      "id": "qKeyword",
      "label": "工单/用户/主题",
      matchExpr: "!v||String(r.ticketId||\"\").includes(v)||String(r.user||\"\").includes(v)||String(r.topic||\"\").includes(v)"
    },
    {
      "id": "qChannel",
      "label": "来源",
      "type": "select",
      "options": [
        "在线客服",
        "电话",
        "长者快捷",
        "投诉升级"
      ],
      matchExpr: "!v||String(r.channel)===v"
    },
    {
      "id": "qStatus",
      "label": "状态",
      "type": "select",
      "options": [
        "待接单",
        "沟通中",
        "已办结"
      ],
      matchExpr: "!v||String(r.status)===v"
    }
  ],
  "formFields": [
    {
      "id": "fTicketId",
      "key": "ticketId",
      "label": "工单号",
      "required": true
    },
    {
      "id": "fUser",
      "key": "user",
      "label": "用户",
      "required": true
    },
    {
      "id": "fChannel",
      "key": "channel",
      "label": "来源",
      "type": "select",
      "options": [
        "在线客服",
        "电话",
        "长者快捷",
        "投诉升级"
      ]
    },
    {
      "id": "fTopic",
      "key": "topic",
      "label": "主题",
      "required": true
    },
    {
      "id": "fElder",
      "key": "elder",
      "label": "长者入口",
      "type": "select",
      "options": [
        "是",
        "否"
      ]
    },
    {
      "id": "fAgent",
      "key": "agent",
      "label": "客服",
      "required": true
    },
    {
      "id": "fStatus",
      "key": "status",
      "label": "状态",
      "type": "select",
      "options": [
        "待接单",
        "沟通中",
        "已办结"
      ]
    },
    {
      "id": "fNote",
      "key": "note",
      "label": "服务记录/备注",
      "type": "textarea"
    }
  ],
  "stats": [
    {
      "id": "stWait",
      "label": "待接单",
      valueExpr: "(l)=>l.filter(r=>r.status===\"待接单\").length"
    },
    {
      "id": "stTalk",
      "label": "沟通中",
      valueExpr: "(l)=>l.filter(r=>r.status===\"沟通中\").length"
    },
    {
      "id": "stDone",
      "label": "已办结",
      valueExpr: "(l)=>l.filter(r=>r.status===\"已办结\").length"
    },
    {
      "id": "stElder",
      "label": "长者入口",
      valueExpr: "(l)=>l.filter(r=>r.elder===\"是\").length"
    }
  ],
  getStatusExpr: "r.status===\"已办结\"?{text:r.status,cls:\"status-on\"}:r.status===\"沟通中\"?{text:r.status,cls:\"status-warn\"}:{text:r.status,cls:\"status-off\"}",
  "rows": [
    {
      "ticketId": "CS26073101",
      "user": "安辉",
      "channel": "长者快捷",
      "topic": "咨询套餐核销次数",
      "elder": "是",
      "agent": "客服小陈",
      "status": "沟通中",
      "note": "已引导刷新权益码"
    },
    {
      "ticketId": "CS26073008",
      "user": "王敏",
      "channel": "投诉升级",
      "topic": "物流破损",
      "elder": "否",
      "agent": "客服小周",
      "status": "待接单",
      "note": ""
    }
  ]
},
{
  "file": "aftersale-dispute.html",
  "sub": "aftersale-dispute",
  "title": "平台争议介入",
  "desc": "用户与商户争议时平台仲裁；依据订单、履约、核销记录与证据材料",
  "addTitle": "立案仲裁",
  "columns": [
    {
      "key": "disputeId",
      "label": "争议单"
    },
    {
      "key": "applyId",
      "label": "关联售后"
    },
    {
      "key": "user",
      "label": "用户"
    },
    {
      "key": "merchant",
      "label": "商户"
    },
    {
      "key": "focus",
      "label": "争议焦点"
    },
    {
      "key": "arbiter",
      "label": "仲裁人"
    },
    {
      "key": "status",
      "label": "状态",
      "status": true
    }
  ],
  "filters": [
    {
      "id": "qKeyword",
      "label": "争议/售后/用户",
      matchExpr: "!v||String(r.disputeId||\"\").includes(v)||String(r.applyId||\"\").includes(v)||String(r.user||\"\").includes(v)"
    },
    {
      "id": "qStatus",
      "label": "状态",
      "type": "select",
      "options": [
        "取证中",
        "待裁决",
        "已裁决"
      ],
      matchExpr: "!v||String(r.status)===v"
    },
    {
      "id": "q",
      "label": "商户",
      "field": "merchant"
    }
  ],
  "formFields": [
    {
      "id": "fDisputeId",
      "key": "disputeId",
      "label": "争议单",
      "required": true
    },
    {
      "id": "fApplyId",
      "key": "applyId",
      "label": "关联售后",
      "required": true
    },
    {
      "id": "fUser",
      "key": "user",
      "label": "用户",
      "required": true
    },
    {
      "id": "fMerchant",
      "key": "merchant",
      "label": "商户",
      "required": true
    },
    {
      "id": "fFocus",
      "key": "focus",
      "label": "争议焦点",
      "required": true
    },
    {
      "id": "fArbiter",
      "key": "arbiter",
      "label": "仲裁人"
    },
    {
      "id": "fStatus",
      "key": "status",
      "label": "状态",
      "type": "select",
      "options": [
        "取证中",
        "待裁决",
        "已裁决"
      ]
    },
    {
      "id": "fEvidence",
      "key": "evidence",
      "label": "证据/结论",
      "type": "textarea"
    }
  ],
  "stats": [
    {
      "id": "stEv",
      "label": "取证中",
      valueExpr: "(l)=>l.filter(r=>r.status===\"取证中\").length"
    },
    {
      "id": "stJudge",
      "label": "待裁决",
      valueExpr: "(l)=>l.filter(r=>r.status===\"待裁决\").length"
    },
    {
      "id": "stDone",
      "label": "已裁决",
      valueExpr: "(l)=>l.filter(r=>r.status===\"已裁决\").length"
    },
    {
      "id": "stAll",
      "label": "争议单",
      valueExpr: "(l)=>l.length"
    }
  ],
  getStatusExpr: "r.status===\"已裁决\"?{text:r.status,cls:\"status-on\"}:r.status===\"待裁决\"?{text:r.status,cls:\"status-warn\"}:{text:r.status,cls:\"status-off\"}",
  "rows": [
    {
      "disputeId": "DS26073101",
      "applyId": "AS26073002",
      "user": "张伟",
      "merchant": "春风朝阳门店",
      "focus": "押金扣减是否合理",
      "arbiter": "平台专员A",
      "status": "取证中",
      "evidence": "已调取验收照片与履约日志"
    }
  ]
},
{
  "file": "aftersale-stat.html",
  "sub": "aftersale-stat",
  "title": "售后统计与整改",
  "desc": "按商户/品类/服务类型统计退款率、投诉率、处理时效，生成整改台账",
  "addTitle": "新增台账",
  "columns": [
    {
      "key": "period",
      "label": "周期"
    },
    {
      "key": "merchant",
      "label": "商户"
    },
    {
      "key": "category",
      "label": "品类/服务"
    },
    {
      "key": "refundRate",
      "label": "退款率%"
    },
    {
      "key": "complaintRate",
      "label": "投诉率%"
    },
    {
      "key": "avgHours",
      "label": "均处理(h)"
    },
    {
      "key": "status",
      "label": "整改状态",
      "status": true
    }
  ],
  "filters": [
    {
      "id": "qKeyword",
      "label": "商户/品类",
      matchExpr: "!v||String(r.merchant||\"\").includes(v)||String(r.category||\"\").includes(v)"
    },
    {
      "id": "qStatus",
      "label": "整改状态",
      "type": "select",
      "options": [
        "正常",
        "预警",
        "整改中",
        "已验收"
      ],
      matchExpr: "!v||String(r.status)===v"
    },
    {
      "id": "q",
      "label": "周期",
      "field": "period"
    }
  ],
  "formFields": [
    {
      "id": "fPeriod",
      "key": "period",
      "label": "周期",
      "required": true,
      "placeholder": "2026-07"
    },
    {
      "id": "fMerchant",
      "key": "merchant",
      "label": "商户",
      "required": true
    },
    {
      "id": "fCategory",
      "key": "category",
      "label": "品类/服务",
      "required": true
    },
    {
      "id": "fRefundRate",
      "key": "refundRate",
      "label": "退款率%",
      "type": "number",
      "default": 0
    },
    {
      "id": "fComplaintRate",
      "key": "complaintRate",
      "label": "投诉率%",
      "type": "number",
      "default": 0
    },
    {
      "id": "fAvgHours",
      "key": "avgHours",
      "label": "均处理(h)",
      "type": "number",
      "default": 0
    },
    {
      "id": "fStatus",
      "key": "status",
      "label": "整改状态",
      "type": "select",
      "options": [
        "正常",
        "预警",
        "整改中",
        "已验收"
      ]
    },
    {
      "id": "fAction",
      "key": "action",
      "label": "整改措施",
      "type": "textarea"
    }
  ],
  "stats": [
    {
      "id": "stWarn",
      "label": "预警",
      valueExpr: "(l)=>l.filter(r=>r.status===\"预警\").length"
    },
    {
      "id": "stFix",
      "label": "整改中",
      valueExpr: "(l)=>l.filter(r=>r.status===\"整改中\").length"
    },
    {
      "id": "stOk",
      "label": "已验收",
      valueExpr: "(l)=>l.filter(r=>r.status===\"已验收\").length"
    },
    {
      "id": "stAvg",
      "label": "均时效(h)",
      valueExpr: "(l)=>{const a=l.filter(r=>r.avgHours);return a.length?Math.round(a.reduce((s,r)=>s+Number(r.avgHours),0)/a.length):0}"
    }
  ],
  getStatusExpr: "r.status===\"正常\"||r.status===\"已验收\"?{text:r.status,cls:\"status-on\"}:r.status===\"整改中\"?{text:r.status,cls:\"status-warn\"}:{text:r.status,cls:\"status-off\"}",
  "rows": [
    {
      "period": "2026-07",
      "merchant": "春风朝阳门店",
      "category": "实物商品",
      "refundRate": 2.1,
      "complaintRate": 0.8,
      "avgHours": 18,
      "status": "正常",
      "action": ""
    },
    {
      "period": "2026-07",
      "merchant": "心相伴机构",
      "category": "服务套餐",
      "refundRate": 5.6,
      "complaintRate": 2.4,
      "avgHours": 36,
      "status": "预警",
      "action": "加强核销培训"
    }
  ]
},
{
  "file": "api-dispatch.html",
  "sub": "api-dispatch",
  "title": "服务任务下发与查询",
  "desc": "向第三方下发预约时间、服务对象、地址、联系人、服务项目；支持任务状态同步查询",
  "addTitle": "下发任务",
  "columns": [
    {
      "key": "taskId",
      "label": "任务号"
    },
    {
      "key": "provider",
      "label": "第三方"
    },
    {
      "key": "subject",
      "label": "服务对象"
    },
    {
      "key": "appointAt",
      "label": "预约时间"
    },
    {
      "key": "address",
      "label": "地址"
    },
    {
      "key": "item",
      "label": "服务项目"
    },
    {
      "key": "status",
      "label": "状态",
      "status": true
    }
  ],
  "filters": [
    {
      "id": "qKeyword",
      "label": "任务/对象/项目",
      matchExpr: "!v||String(r.taskId||\"\").includes(v)||String(r.subject||\"\").includes(v)||String(r.item||\"\").includes(v)"
    },
    {
      "id": "qStatus",
      "label": "状态",
      "type": "select",
      "options": [
        "已下发",
        "已接单",
        "服务中",
        "已完成",
        "失败"
      ],
      matchExpr: "!v||String(r.status)===v"
    },
    {
      "id": "qProvider",
      "label": "第三方",
      "field": "provider"
    }
  ],
  "formFields": [
    {
      "id": "fTaskId",
      "key": "taskId",
      "label": "任务号",
      "required": true
    },
    {
      "id": "fProvider",
      "key": "provider",
      "label": "第三方",
      "required": true
    },
    {
      "id": "fSubject",
      "key": "subject",
      "label": "服务对象",
      "required": true
    },
    {
      "id": "fAppointAt",
      "key": "appointAt",
      "label": "预约时间",
      "required": true
    },
    {
      "id": "fContact",
      "key": "contact",
      "label": "联系人/电话",
      "required": true
    },
    {
      "id": "fAddress",
      "key": "address",
      "label": "地址",
      "required": true
    },
    {
      "id": "fItem",
      "key": "item",
      "label": "服务项目",
      "required": true
    },
    {
      "id": "fStatus",
      "key": "status",
      "label": "状态",
      "type": "select",
      "options": [
        "已下发",
        "已接单",
        "服务中",
        "已完成",
        "失败"
      ]
    },
    {
      "id": "fNote",
      "key": "note",
      "label": "服务说明",
      "type": "textarea"
    }
  ],
  "stats": [
    {
      "id": "stSend",
      "label": "已下发",
      valueExpr: "(l)=>l.filter(r=>r.status===\"已下发\").length"
    },
    {
      "id": "stDoing",
      "label": "服务中",
      valueExpr: "(l)=>l.filter(r=>r.status===\"服务中\"||r.status===\"已接单\").length"
    },
    {
      "id": "stDone",
      "label": "已完成",
      valueExpr: "(l)=>l.filter(r=>r.status===\"已完成\").length"
    },
    {
      "id": "stFail",
      "label": "失败",
      valueExpr: "(l)=>l.filter(r=>r.status===\"失败\").length"
    }
  ],
  getStatusExpr: "r.status===\"已完成\"?{text:r.status,cls:\"status-on\"}:r.status===\"失败\"?{text:r.status,cls:\"status-off\"}:{text:r.status,cls:\"status-warn\"}",
  "rows": [
    {
      "taskId": "TP26073101",
      "provider": "安心到家",
      "subject": "安辉父亲",
      "appointAt": "2026-08-01 10:00",
      "contact": "安辉/13800001234",
      "address": "朝阳门内大街100号",
      "item": "上门保洁",
      "status": "已接单",
      "note": "需带适老化工具"
    },
    {
      "taskId": "TP26073002",
      "provider": "康护通",
      "subject": "李娜",
      "appointAt": "2026-07-30 15:00",
      "contact": "李娜/13700009876",
      "address": "望京街10号",
      "item": "上门护理",
      "status": "已完成",
      "note": ""
    }
  ]
},
{
  "file": "api-record.html",
  "sub": "api-record",
  "title": "服务记录回传",
  "desc": "接收第三方回传：到达、开始、完成时间、服务照片/附件、长者或家属确认",
  "addTitle": "录入回传",
  "columns": [
    {
      "key": "recordId",
      "label": "回传编号"
    },
    {
      "key": "taskId",
      "label": "任务号"
    },
    {
      "key": "arriveAt",
      "label": "到达"
    },
    {
      "key": "startAt",
      "label": "开始"
    },
    {
      "key": "endAt",
      "label": "完成"
    },
    {
      "key": "confirmBy",
      "label": "确认人"
    },
    {
      "key": "status",
      "label": "状态",
      "status": true
    }
  ],
  "filters": [
    {
      "id": "qKeyword",
      "label": "回传/任务",
      matchExpr: "!v||String(r.recordId||\"\").includes(v)||String(r.taskId||\"\").includes(v)"
    },
    {
      "id": "qStatus",
      "label": "状态",
      "type": "select",
      "options": [
        "已回传",
        "缺附件",
        "已归档"
      ],
      matchExpr: "!v||String(r.status)===v"
    },
    {
      "id": "q",
      "label": "确认人",
      "field": "confirmBy"
    }
  ],
  "formFields": [
    {
      "id": "fRecordId",
      "key": "recordId",
      "label": "回传编号",
      "required": true
    },
    {
      "id": "fTaskId",
      "key": "taskId",
      "label": "任务号",
      "required": true
    },
    {
      "id": "fArriveAt",
      "key": "arriveAt",
      "label": "到达时间"
    },
    {
      "id": "fStartAt",
      "key": "startAt",
      "label": "开始时间"
    },
    {
      "id": "fEndAt",
      "key": "endAt",
      "label": "完成时间"
    },
    {
      "id": "fConfirmBy",
      "key": "confirmBy",
      "label": "确认人"
    },
    {
      "id": "fStatus",
      "key": "status",
      "label": "状态",
      "type": "select",
      "options": [
        "已回传",
        "缺附件",
        "已归档"
      ]
    },
    {
      "id": "fAttach",
      "key": "attach",
      "label": "照片/附件",
      "type": "textarea"
    }
  ],
  "stats": [
    {
      "id": "stOk",
      "label": "已回传",
      valueExpr: "(l)=>l.filter(r=>r.status===\"已回传\").length"
    },
    {
      "id": "stMiss",
      "label": "缺附件",
      valueExpr: "(l)=>l.filter(r=>r.status===\"缺附件\").length"
    },
    {
      "id": "stArch",
      "label": "已归档",
      valueExpr: "(l)=>l.filter(r=>r.status===\"已归档\").length"
    },
    {
      "id": "stAll",
      "label": "回传数",
      valueExpr: "(l)=>l.length"
    }
  ],
  getStatusExpr: "r.status===\"已归档\"?{text:r.status,cls:\"status-on\"}:r.status===\"缺附件\"?{text:r.status,cls:\"status-warn\"}:{text:r.status,cls:\"status-warn\"}",
  "rows": [
    {
      "recordId": "RC26073002",
      "taskId": "TP26073002",
      "arriveAt": "14:55",
      "startAt": "15:05",
      "endAt": "16:20",
      "confirmBy": "家属李娜",
      "status": "已归档",
      "attach": "服务照片3张"
    },
    {
      "recordId": "RC26073101",
      "taskId": "TP26073101",
      "arriveAt": "—",
      "startAt": "—",
      "endAt": "—",
      "confirmBy": "—",
      "status": "缺附件",
      "attach": ""
    }
  ]
},
{
  "file": "api-sync.html",
  "sub": "api-sync",
  "title": "核销交付归还同步",
  "desc": "同步第三方回传的到店核销、设备交付与归还验收结果，形成履约记录",
  "addTitle": "同步记录",
  "columns": [
    {
      "key": "syncId",
      "label": "同步号"
    },
    {
      "key": "bizType",
      "label": "业务类型"
    },
    {
      "key": "refId",
      "label": "业务单号"
    },
    {
      "key": "provider",
      "label": "第三方"
    },
    {
      "key": "result",
      "label": "结果"
    },
    {
      "key": "syncedAt",
      "label": "同步时间"
    },
    {
      "key": "status",
      "label": "状态",
      "status": true
    }
  ],
  "filters": [
    {
      "id": "qKeyword",
      "label": "同步/业务单",
      matchExpr: "!v||String(r.syncId||\"\").includes(v)||String(r.refId||\"\").includes(v)"
    },
    {
      "id": "qBiz",
      "label": "业务类型",
      "type": "select",
      "options": [
        "到店核销",
        "设备交付",
        "归还验收"
      ],
      matchExpr: "!v||String(r.bizType)===v"
    },
    {
      "id": "qStatus",
      "label": "状态",
      "type": "select",
      "options": [
        "成功",
        "失败",
        "重试中"
      ],
      matchExpr: "!v||String(r.status)===v"
    }
  ],
  "formFields": [
    {
      "id": "fSyncId",
      "key": "syncId",
      "label": "同步号",
      "required": true
    },
    {
      "id": "fBizType",
      "key": "bizType",
      "label": "业务类型",
      "type": "select",
      "options": [
        "到店核销",
        "设备交付",
        "归还验收"
      ],
      "required": true
    },
    {
      "id": "fRefId",
      "key": "refId",
      "label": "业务单号",
      "required": true
    },
    {
      "id": "fProvider",
      "key": "provider",
      "label": "第三方",
      "required": true
    },
    {
      "id": "fResult",
      "key": "result",
      "label": "结果",
      "required": true
    },
    {
      "id": "fSyncedAt",
      "key": "syncedAt",
      "label": "同步时间",
      "type": "date",
      "required": true
    },
    {
      "id": "fStatus",
      "key": "status",
      "label": "状态",
      "type": "select",
      "options": [
        "成功",
        "失败",
        "重试中"
      ]
    },
    {
      "id": "fPayload",
      "key": "payload",
      "label": "报文摘要",
      "type": "textarea"
    }
  ],
  "stats": [
    {
      "id": "stOk",
      "label": "成功",
      valueExpr: "(l)=>l.filter(r=>r.status===\"成功\").length"
    },
    {
      "id": "stFail",
      "label": "失败",
      valueExpr: "(l)=>l.filter(r=>r.status===\"失败\").length"
    },
    {
      "id": "stRetry",
      "label": "重试中",
      valueExpr: "(l)=>l.filter(r=>r.status===\"重试中\").length"
    },
    {
      "id": "stAll",
      "label": "同步数",
      valueExpr: "(l)=>l.length"
    }
  ],
  getStatusExpr: "r.status===\"成功\"?{text:r.status,cls:\"status-on\"}:r.status===\"重试中\"?{text:r.status,cls:\"status-warn\"}:{text:r.status,cls:\"status-off\"}",
  "rows": [
    {
      "syncId": "SY26073101",
      "bizType": "到店核销",
      "refId": "O1785462472361",
      "provider": "站点核销网关",
      "result": "扣次成功-2",
      "syncedAt": "2026-07-31",
      "status": "成功",
      "payload": "PK1 redeem lunch"
    },
    {
      "syncId": "SY26073008",
      "bizType": "设备交付",
      "refId": "DL26073101",
      "provider": "安心到家",
      "result": "用户已确认交付",
      "syncedAt": "2026-07-30",
      "status": "成功",
      "payload": ""
    }
  ]
},
{
  "file": "api-exception.html",
  "sub": "api-exception",
  "title": "异常上报与协同",
  "desc": "第三方上报无法联系用户、地址错误、临时取消、设备损坏、突发情况等，协同商户/平台处理",
  "addTitle": "登记异常",
  "columns": [
    {
      "key": "exId",
      "label": "异常号"
    },
    {
      "key": "taskId",
      "label": "任务号"
    },
    {
      "key": "provider",
      "label": "第三方"
    },
    {
      "key": "type",
      "label": "异常类型"
    },
    {
      "key": "owner",
      "label": "协同方"
    },
    {
      "key": "createdAt",
      "label": "上报时间"
    },
    {
      "key": "status",
      "label": "状态",
      "status": true
    }
  ],
  "filters": [
    {
      "id": "qKeyword",
      "label": "异常/任务",
      matchExpr: "!v||String(r.exId||\"\").includes(v)||String(r.taskId||\"\").includes(v)"
    },
    {
      "id": "qType",
      "label": "异常类型",
      "type": "select",
      "options": [
        "无法联系用户",
        "地址错误",
        "临时取消",
        "设备损坏",
        "突发情况"
      ],
      matchExpr: "!v||String(r.type)===v"
    },
    {
      "id": "qStatus",
      "label": "状态",
      "type": "select",
      "options": [
        "待协同",
        "处理中",
        "已闭环"
      ],
      matchExpr: "!v||String(r.status)===v"
    }
  ],
  "formFields": [
    {
      "id": "fExId",
      "key": "exId",
      "label": "异常号",
      "required": true
    },
    {
      "id": "fTaskId",
      "key": "taskId",
      "label": "任务号",
      "required": true
    },
    {
      "id": "fProvider",
      "key": "provider",
      "label": "第三方",
      "required": true
    },
    {
      "id": "fType",
      "key": "type",
      "label": "异常类型",
      "type": "select",
      "options": [
        "无法联系用户",
        "地址错误",
        "临时取消",
        "设备损坏",
        "突发情况"
      ],
      "required": true
    },
    {
      "id": "fOwner",
      "key": "owner",
      "label": "协同方",
      "type": "select",
      "options": [
        "商户",
        "平台",
        "商户+平台"
      ]
    },
    {
      "id": "fCreatedAt",
      "key": "createdAt",
      "label": "上报时间",
      "type": "date",
      "required": true
    },
    {
      "id": "fStatus",
      "key": "status",
      "label": "状态",
      "type": "select",
      "options": [
        "待协同",
        "处理中",
        "已闭环"
      ]
    },
    {
      "id": "fDetail",
      "key": "detail",
      "label": "详情",
      "type": "textarea"
    }
  ],
  "stats": [
    {
      "id": "stWait",
      "label": "待协同",
      valueExpr: "(l)=>l.filter(r=>r.status===\"待协同\").length"
    },
    {
      "id": "stDoing",
      "label": "处理中",
      valueExpr: "(l)=>l.filter(r=>r.status===\"处理中\").length"
    },
    {
      "id": "stDone",
      "label": "已闭环",
      valueExpr: "(l)=>l.filter(r=>r.status===\"已闭环\").length"
    },
    {
      "id": "stAll",
      "label": "异常数",
      valueExpr: "(l)=>l.length"
    }
  ],
  getStatusExpr: "r.status===\"已闭环\"?{text:r.status,cls:\"status-on\"}:r.status===\"处理中\"?{text:r.status,cls:\"status-warn\"}:{text:r.status,cls:\"status-off\"}",
  "rows": [
    {
      "exId": "AX26073101",
      "taskId": "TP26073101",
      "provider": "安心到家",
      "type": "无法联系用户",
      "owner": "商户+平台",
      "createdAt": "2026-07-31",
      "status": "待协同",
      "detail": "电话无人接听3次"
    },
    {
      "exId": "AX26072902",
      "taskId": "TP26072811",
      "provider": "康护通",
      "type": "地址错误",
      "owner": "商户",
      "createdAt": "2026-07-29",
      "status": "已闭环",
      "detail": "已更正门牌号并改约"
    }
  ]
}
]};