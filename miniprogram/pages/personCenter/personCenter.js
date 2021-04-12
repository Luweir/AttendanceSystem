var app = getApp()
Page({
  data: {
    show_button: true,
    user_name: "游客",
    user_avator_url: "../../icons/youke.png"
  },
  /*
  功能实现：
  1. 进去个人中心 先显示 未登录的图像和游客；
  2. 提示用户尚未登录是否立即登录；
      1.如果用户确定，就给他登录；
      2.如果用户点取消，就给它停留在当前界面，保留登录按钮；
  3. 登录按钮直到用户点击登录后消失；
  4. 管理员模式
  5. 联系客服
  6. 用户反馈
  */
  onLoad: function (options) {
    // 拿到本地缓存的用户信息
    let user = wx.getStorageSync('user')
    // 如果从签到页来，就不显示提示登录的窗口
    if (options) {
      if (options.concel_modual) {
        return
      }
    }
    if (user) {
      this.setData({
        user_name: user.nickName,
        user_avator_url: user.avatarUrl,
        show_button: false
      })
      app.globalData.isLogin = true
    }
    // 如果没有本地缓存，则要用户登录，并缓存至本地
    else {
      var that = this;
      wx.showModal({
        title: '提示',
        content: '您尚未登录，请问是否立即登录',
        success: function (res) {
          if (res.confirm) {
            // 点击确定，调用获取信息函数
            that.getUserProfile()
          } else {
            // console.log('点击取消回调')
          }
        }
      })
    }
  },
  // 该函数获取用户信息
  getUserProfile: function () {
    wx.getUserProfile({
        desc: '授权登录以使用签到功能'
      })
      .then(res => {
        // 添加至本地缓存，在Storage中可查看
        wx.setStorageSync('user', res.userInfo),
          this.setData({
            show_button: false,
            user_name: res.userInfo.nickName,
            user_avator_url: res.userInfo.avatarUrl
          })
        app.globalData.isLogin = true
        wx.cloud.database().collection('address-book').doc(app.globalData.openId)
          .get()
          .then(res => {
            this.onLoad()
          })
          .catch(err => {
            console.log("1111");
            wx.showModal({
                title: "提示",
                content: "请完善个人信息"
              })
              .then(res => {
                if (res.confirm) {
                  wx.navigateTo({
                    url: '../updatePersonCenter/updatePersonCenter',
                  })
                }
              })
          })

      })
  },
  // 进入管理员模式
  enterRootModel: function () {
    var that = this;
    // show_button登录按钮如果显示（为true），说明用户没登录，则需要提示先登录
    if (this.data.show_button) {
      wx.showModal({
        title: '提示',
        content: '请先登录',
        success: function (res) {
          if (res.confirm) {
            that.getUserProfile()
          } else {
            console.log("用户取消登录");
          }
        }
      })
    } else {
      wx.navigateTo({
        url: '../pswVerify/pswVerify',
      })
    }
  },
  enterAddressBook: function () {
    wx.navigateTo({
      url: '../addressBook/addressBook',
    })
  },
  enterUpdate: function () {
    wx.navigateTo({
      url: '../updatePersonCenter/updatePersonCenter',
    })
  }
})