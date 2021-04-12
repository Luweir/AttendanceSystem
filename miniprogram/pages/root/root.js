// pages/root/root.js
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },
  updateRootPsw: function () {
    wx.navigateTo({
      url: '../updateRootPsw/updateRootPsw',
    })
  },
  addActivity: function () {
    wx.navigateTo({
      url: '../addActivity/addActivity',
    })
  },
  manageActivity: function () {
    wx.navigateTo({
      url: '../manageActivity/manageActivity',
    })
  },
  attendance: function () {
    wx.navigateTo({
      url: '../attendance/attendance',
    })
  }
})