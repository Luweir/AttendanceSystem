// pages/pswVerify/pswVerify.js
Page({

  data: {
    // 这是用户输入的待确认的
    root_psw: "",
    // 这是数据库存放的正确的管理员密码
    rootPassword: ""
  },

  onLoad: function (options) {
    // 从云端获取管理员密码
    wx.cloud.database().collection('global-variable')
      .where({
        name: "rootPassword"
      })
      .get()
      .then(res => {
        // console.log(res);
        this.setData({
          rootPassword: res.data[0].value
        })
        // console.log(this.data.rootPassword);
      })
  },
  getRootPassword: function (e) {
    this.setData({
      root_psw: e.detail.value
    })
  },
  confirm: function () {
    if (this.data.root_psw != this.data.rootPassword) {
      wx.showToast({
        icon: "none",
        title: '密码错误，请重新输入',
      })
    } else {
      wx.redirectTo({
        url: '../root/root',
      })
    }
  }
})