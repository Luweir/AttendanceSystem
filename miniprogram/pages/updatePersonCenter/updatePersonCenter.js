var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    have_info: false, // 如果存在用户信息，那么限制 工会num修改
    new_info: {
      num: "",
      name: "",
      tel: ""
    }

  },
  // 输入工号
  formNum: function (e) {
    // console.log(e);
    let new_info = this.data.new_info
    new_info.num = e.detail.value
    this.setData({
      new_info
    })
    // console.log(this.data.new_info);
  },
  // 输入姓名
  formName: function (e) {
    let new_info = this.data.new_info
    new_info.name = e.detail.value
    this.setData({
      new_info
    })
    // console.log(this.data.new_info);
  },
  // 输入电话
  formTel: function (e) {
    let new_info = this.data.new_info
    new_info.tel = e.detail.value
    this.setData({
      new_info
    })
    // console.log(this.data.new_info);
  },
  // 修改信息完成，提交
  confirm: function () {

    // 如果数据库没有该用户，则新建
    if (this.data.have_info == true) {
      this.updateUserInfo()
    } else {
      // 先看看数据有有没有这个工号
      wx.cloud.database().collection('address-book').where({
          num: this.data.new_info.num
        }).get()
        .then(res => {
          // 如果有该工号，则不能创建
          if (rea.data) {
            wx.showModal({
              title: "提示",
              content: "工号：" + this.data.new_info.num + " 已存在，请重新输入"
            })
          } else {
            // 如果没有这个工号，则新建该用户信息
            var that = this
            wx.showModal({
                title: "提示",
                content: "工号一经提交，不可修改"
              })
              .then(res => {
                if (res.confirm) {
                  wx.cloud.database().collection('address-book').add({
                      data: {
                        _id: app.globalData.openId,
                        name: "",
                        num: "",
                        tel: ""
                      }
                    })
                    .then(res => {
                      that.updateUserInfo()
                    })
                } else {
                  return
                } //else括号
              })
          }
        })
    }
  },
  updateUserInfo: function () {
    // 然后再更新改用户信息
    wx.cloud.database().collection('address-book').doc(app.globalData.openId)
      .update({
        data: {
          name: this.data.new_info.name,
          num: this.data.new_info.num,
          tel: this.data.new_info.tel
        }
      })
      .then(res => {
        wx.showModal({
          title: "提示",
          content: "提交成功",
          showCancel: false
        })
      })
      .catch(err => {
        wx.showModal({
          title: "提示",
          content: "提交失败，请联系客服处理！",
          showCancel: false
        })
      })
  },
  onLoad: function (options) {
    // 页面加载时 读取数据库中用户信息
    wx.cloud.database().collection('address-book').doc(app.globalData.openId)
      .get()
      .then(res => {
        // console.log(res);
        this.setData({
          new_info: {
            name: res.data.name,
            num: res.data.num,
            tel: res.data.tel
          },
          have_info: true
        })
        // log(this.data)
      })
      .catch(res => {
        console.log("获取数据库用户信息失败");
      })
  },
})