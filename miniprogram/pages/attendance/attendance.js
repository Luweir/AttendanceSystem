// pages/attendance/attendance.js
var util = require('../../utils/util.js')
Page({
  data: {
    date: "",
    end_date: "",
    person_list: [],
    fileUrl: "",
    show_excel_button: false
  },

  onLoad: function (options) {
    let date = util.formatTime(new Date()).substring(0, 10).replace(/\//g, '-')
    // console.log(date);
    this.setData({
      date: date,
      end_date: date
    })
    // 加载框
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    // 加载框持续时间
    setTimeout(function () {
      wx.hideLoading()
    }, 1000)
    // 在 address-book 中拿到人员信息
    wx.cloud.database().collection('address-book').count()
      .then(async res => {
        // console.log(res.total);
        let page = Math.ceil(res.total / 20)
        let person_list = []
        for (let i = 0; i < page; i++) {
          await wx.cloud.database().collection('address-book').skip(i * 20).get()
            .then(async res => {
              // console.log(res);
              // console.log(res.data.length);
              let data = res.data
              let len = data.length
              for (let j = 0; j < len; j++) {
                let person = {}
                person.name = data[j].name
                person.num = data[j].num
                person.state = -1
                person_list.push(person)
              }
            })
        }
        // console.log(person_list);
        this.setData({
          person_list: person_list,
        })
        this.showAttendance()
      })
  },
  bindDateChange: function (e) {
    // 更换日期后 避免浅拷贝带来影响  把所有人员的出勤状态置为-1
    let person_list = this.data.person_list
    let len = person_list.length
    for (let i = 0; i < len; i++) {
      person_list[i].state = -1
    }
    this.setData({
      date: e.detail.value,
      person_list: person_list,
      show_excel_button: false
    })
    // 修改对应日期 人员的状态
    this.showAttendance()
  },
  showAttendance: function () {
    // 在time-person中拿到对应日期的数据
    wx.cloud.database().collection('time-person').doc(this.data.date).get()
      .then(res => {
        // console.log(res);
        let person_list = this.data.person_list
        let data = res.data
        let len = data.num.length
        // console.log(data);
        for (let i = 0; i < len; i++) {
          // 找到已经签到的人 并 修改他们的 state，这里以唯一值 num 为索引
          person_list.filter(function (fp) {
            return fp.num === data.num[i]
          })[0].state = data.state[i]
        }
        // console.log(person_list);
        this.setData({
          person_list: person_list,
          show_excel_button: true
        })
      })
      .catch(err => {
        // console.log("无记录");
      })
  },
  toExcel: function () {
    // console.log(this.data.person_list);
    wx.cloud.callFunction({
        name: "toExcel",
        data: {
          userdata: this.data.person_list
        }
      })
      .then(res => {
        console.log("保存成功", res);
        this.getFileUrl(res.result.fileID)
      })
      .catch(err => {

      })
  },
  //获取云存储文件下载地址，这个地址有效期一天
  getFileUrl: function (fileID) {
    wx.cloud.getTempFileURL({
        fileList: [fileID]
      })
      .then(res => {
        console.log("文件下载链接", res.fileList[0].tempFileURL);
        this.setData({
          fileUrl: res.fileList[0].tempFileURL
        })
        wx.showModal({
            title: "提示",
            content: "excel文件下载链接：" + this.data.fileUrl,
            confirmText: "复制链接"
          })
          .then(res => {
            if (res.confirm) {
              // 点击确定，复制下载链接
              this.copyFileUrl()
            } else {
              console.log("用户取消");
            }
          })
      })
      .catch(err => [])
  },
  //复制excel文件下载链接
  copyFileUrl: function () {
    wx.setClipboardData({
        data: this.data.fileUrl,
      })
      .then(res => {
        wx.getClipboardData({
          success: (option) => {
            console.log("复制成功", res.data);
          },
        })
      })
  }
})