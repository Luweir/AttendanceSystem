//app.js
App({
  onLaunch: function () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        env: 'cloud1-0gbwed2xdbe13cb4',
        traceUser: true,
      })
    }
    this.globalData = {
      // 获得用户openid
      openId: "",
      // 判断用户是否已登录
      isLogin: false
    }
    // 读取openid 本地缓存
    let open_id = wx.getStorageSync('openId')
    let user = wx.getStorageSync('user')
    //从这个缓存就可以判断用户有没有登录
    if (user) {
      this.globalData.isLogin = true
    }
    if (open_id) {
      this.globalData.openId = open_id
    } else {
      // 如果本地缓存没有 那就通过云函数获取
      wx.cloud.callFunction({
          name: "getOpenId",
        })
        .then(res => {
          // console.log(res.result.openid);
          this.globalData.openId = res.result.openid
          wx.setStorageSync('openId', res.result.openid)
        })
        .catch(err => {
          console.log("openId获取失败");
        })
    }
  }
})