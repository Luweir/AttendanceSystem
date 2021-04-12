// pages/trend/trend.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    title: null,
    content: null,
    SendTime: null,
    imageUrl: null,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      title: options.title,
      content: options.content,
      sendTime: options.sendTime,
      imageUrl: options.imageUrl
    })
    // console.log(options)
  }

})