
Page({

  data: {
    list: [],
    page_num: 1,
    show_get_more: true
  },

  onLoad: function (options) {
    wx.cloud.database().collection('address-book').get()
      .then(res => { //请求成功
        this.setData({
          list: res.data
        })
      })
      .catch(err => { //请求失败

      })
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    // 滑动页面加载
    // console.log("加载更多");
    wx.cloud.database().collection('address-book')
      .skip(this.data.page_num * 20)
      .get()
      .then(res => { //请求成功
        this.setData({
          list: this.data.list.concat(res.data),
          page_num: this.data.page_num + 1
        })
        if (res.data.length == 0) {
          this.setData({
            show_get_more: false
          })
          wx.showToast({
            title: '已全部加载完成',
          })
        }
      })
      .catch(err => { //请求失败
        console.log("请求失败");
      })
  },
  toLoadMore: function () {
    this.onReachBottom()
  }
})