Page({
  data: {
    mode: "supply",
    sourceTypes: ["本人填写", "群消息转发", "聊天截图识别", "群主/组织导入"],
    message: "",
    parsed: false,
    published: false,
    form: {
      type: "供应",
      category: "",
      quantity: "",
      location: "",
      time: "",
      contact: "",
      sourceType: "本人填写",
      sourceName: ""
    },
    matches: [],
    sourceAuthorized: false,
    ownerInviteCode: ""
  },

  changeMode(event) {
    const mode = event.currentTarget.dataset.mode
    this.setData({
      mode,
      "form.type": mode === "supply" ? "供应" : "求购"
    })
  },

  onMessageInput(event) {
    this.setData({ message: event.detail.value })
  },

  onFieldInput(event) {
    this.setData({
      ["form." + event.currentTarget.dataset.key]: event.detail.value
    })
  },

  onSourceTypeChange(event) {
    this.setData({ "form.sourceType": this.data.sourceTypes[event.detail.value] })
  },

  onSourceNameInput(event) {
    this.setData({ "form.sourceName": event.detail.value })
  },

  onAuthorizationChange(event) {
    this.setData({ sourceAuthorized: event.detail.value.length > 0 })
  },

  parseMessage() {
    const text = this.data.message.trim()
    if (!text) {
      wx.showToast({ title: "请先粘贴一条群消息", icon: "none" })
      return
    }
    const isDemand = /收购|求购|采购|需要|寻找/.test(text)
    const quantityMatch = text.match(/(\d+(?:\.\d+)?\s*(?:万)?\s*(?:吨|斤|公斤|箱|件))/)
    const locationMatch = text.match(/(山东|陕西|江西|河南|河北|广东|广西|云南|四川|福建|浙江|江苏)[\u4e00-\u9fa5]{0,6}/)
    const category = text.match(/(苹果|脐橙|柑橘|梨|葡萄|土豆|生姜|大蒜|玉米|鸡蛋|茶叶)/)
    this.setData({
      parsed: true,
      mode: isDemand ? "demand" : "supply",
      "form.type": isDemand ? "求购" : "供应",
      "form.category": category ? category[1] : "农产品",
      "form.quantity": quantityMatch ? quantityMatch[1] : "待确认",
      "form.location": locationMatch ? locationMatch[1] : "待确认",
      "form.time": /近期|马上|本月|下月|11月|12月/.test(text) ? "近期" : "待确认"
    })
  },

  publish() {
    const form = this.data.form
    if (!form.category || !form.quantity || !form.location) {
      wx.showToast({ title: "请补充品类、数量和地区", icon: "none" })
      return
    }
    if (!this.data.sourceAuthorized) {
      wx.showToast({ title: "请确认你有权提交这条商情", icon: "none" })
      return
    }
    const matches = form.type === "供应"
      ? [
          { id: "d1", title: "采购商：华东水果批发档口", score: 92, detail: "求购同品类，规格相近，近期交货" },
          { id: "d2", title: "采购商：社区团购供应链", score: 84, detail: "需求稳定，可进一步确认价格和包装" }
        ]
      : [
          { id: "s1", title: "供应商：山东合作农场", score: 91, detail: "同品类有货，数量和交货时间接近" },
          { id: "s2", title: "供应商：区域农产品合作社", score: 82, detail: "可提供批量货源，等待确认规格" }
        ]
    const records = wx.getStorageSync("marketRecords") || []
    records.unshift({
      form,
      source: {
        type: form.sourceType,
        name: form.sourceName ? "已填写来源" : "未填写具体名称",
        authorized: true
      },
      createdAt: new Date().toISOString()
    })
    wx.setStorageSync("marketRecords", records)
    this.setData({ published: true, matches })
    wx.showToast({ title: "已发布并完成匹配", icon: "success" })
  },

  copyShare() {
    const form = this.data.form
    wx.setClipboardData({
      data: `【${form.type}】${form.category} ${form.quantity}，${form.location}，${form.time}。点击小程序提交合作信息。`,
      success: () => wx.showToast({ title: "分享文案已复制", icon: "success" })
    })
  },

  requestContact(event) {
    wx.showModal({
      title: "申请联系",
      content: "MVP 仅记录合作意向。正式版将先展示来源与信任信息，由对方确认后再交换联系方式；信息服务费需单独明示，不承诺成交。",
      success: result => {
        if (result.confirm) {
          const requests = wx.getStorageSync("contactRequests") || []
          requests.unshift({
            matchId: event.currentTarget.dataset.id,
            createdAt: new Date().toISOString(),
            status: "待对方确认"
          })
          wx.setStorageSync("contactRequests", requests)
          wx.showToast({ title: "合作意向已发送", icon: "success" })
        }
      }
    })
  },

  createOwnerEntry() {
    const code = "GROUP-" + Math.random().toString(36).slice(2, 8).toUpperCase()
    this.setData({ ownerInviteCode: code })
    wx.setClipboardData({
      data: `加入商情协作入口：${code}。请仅提交本人有权分享的供需信息。`,
      success: () => wx.showToast({ title: "群主入口已复制", icon: "success" })
    })
  }
})
