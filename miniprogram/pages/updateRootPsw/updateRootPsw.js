// pages/updateRootPsw/updateRootPsw.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    original_password: "",
    new_password: "",
    rootPassword: ""
  },

  /**
   * 生命周期函数--监听页面加载
   */
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
  getOriginalPassword: function (e) {
    // console.log(e);
    this.setData({
      original_password: e.detail.value
    })
  },
  getNewPassword: function (e) {
    this.setData({
      new_password: e.detail.value
    })
  },
  confirmChange: function () {
    // 判断原密码是否与当前管理员密码一致
    // console.log(this.data.original_password);
    // console.log(this.data.new_password);
    if (this.data.original_password != this.data.rootPassword) {
      wx.showToast({
        icon: 'none',
        title: '原始密码输入错误，请重新输入',
      })
    } else if (this.data.original_password == this.data.new_password) {
      wx.showToast({
        icon: 'none',
        title: '新密码不能与原始密码一致，请重新输入',
      })
    } else {
      this.setData({
        rootPassword: this.data.new_password
      })
      wx.cloud.database().collection('global-variable').where({
          name: "rootPassword"
        })
        .update({
          data: {
            name: "rootPassword",
            value: this.data.rootPassword
          }
        })
        .then(res => {
          wx.showToast({
            title: '修改成功',
          })
        })
        .catch(ser => {
          wx.showToast({
            title: '修改失败，请联系客服处理！',
          })
        })
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  }
})