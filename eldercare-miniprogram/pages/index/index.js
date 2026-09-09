Page({
  data: {
    problem: "想做一种适合老年人的居家跌倒检测设备，降低误报并保护隐私",
    analyzed: false,
    loading: false,
    unlocked: false
  },

  onInput(event) {
    this.setData({ problem: event.detail.value })
  },

  useExample(event) {
    this.setData({ problem: event.currentTarget.dataset.value })
  },

  openMarket() {
    wx.navigateTo({ url: "/pages/market/market" })
  },

  analyze() {
    if (!this.data.problem.trim()) {
      wx.showToast({ title: "请先输入技术痛点", icon: "none" })
      return
    }
    this.setData({ loading: true })
    setTimeout(() => {
      this.setData({ loading: false, analyzed: true })
      wx.pageScrollTo({ scrollTop: 1, duration: 300 })
    }, 900)
  },

  save() {
    const projects = wx.getStorageSync("patentRadarProjects") || []
    if (!projects.some(item => item.problem === this.data.problem)) {
      projects.unshift({ problem: this.data.problem, createdAt: new Date().toISOString() })
      wx.setStorageSync("patentRadarProjects", projects)
      wx.showToast({ title: "已收藏", icon: "success" })
    } else {
      wx.showToast({ title: "已收藏过", icon: "none" })
    }
  },

  unlock() {
    this.setData({ unlocked: true })
    wx.showToast({ title: "报告已解锁（演示）", icon: "success" })
  },

  downloadReport() {
    wx.showModal({
      title: "生成报告",
      content: "正式版将在后端生成 PDF。当前 MVP 展示报告生成入口。",
      showCancel: false
    })
  },

  consult() {
    wx.showModal({
      title: "提交咨询",
      editable: true,
      placeholderText: "请输入想咨询的技术路线或机构",
      success: result => {
        if (result.confirm && result.content.trim()) {
          wx.setStorageSync("patentRadarConsult", {
            content: result.content,
            createdAt: new Date().toISOString()
          })
          wx.showToast({ title: "留言已提交", icon: "success" })
        }
      }
    })
  },

  share() {
    wx.setClipboardData({
      data: "智能养老跌倒检测技术机会：热度高、竞争中，推荐毫米波雷达 + 边缘计算。",
      success: () => wx.showToast({ title: "分享文案已复制", icon: "success" })
    })
  },

  onShareAppMessage() {
    return {
      title: "从一个技术痛点，找到下一步",
      path: "/pages/index/index"
    }
  }
})
