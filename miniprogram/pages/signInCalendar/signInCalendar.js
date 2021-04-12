// pages/Calendar/Calendar.js
//打卡日历页面
var util = require('../../utils/util.js');
var app = getApp()
Page({
  data: {
    // objectId: '',
    days: [], // 把days放1-31（当前月份 日子数），days_sign_up放对应个数的-1，如果有日期签到，就把对应的days_sign_up置0 or 1，根据数据库中我存储的 state而修改
    days_sign_up: [],
    signUp: [],
    cur_year: 0,
    cur_month: 0,
    count: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //获取当前年月  
    const date = new Date();
    const cur_year = date.getFullYear();
    const cur_month = date.getMonth() + 1;
    console.log(cur_year);
    console.log(cur_month);
    const weeks_ch = ['日', '一', '二', '三', '四', '五', '六'];
    this.setData({
      cur_year: cur_year,
      cur_month: cur_month,
      weeks_ch
    })
    // 计算当月1号前面应该空的格子数
    this.calculateEmptyGrids(cur_year, cur_month);
    // 计算天数
    this.calculateDays(cur_year, cur_month);
    // //获取当前用户当前任务的签到状态
    this.onGetSignUp();
  },
  // 获取当月共多少天
  getThisMonthDays: function (year, month) {
    return new Date(year, month, 0).getDate()
  },

  // 获取当月第一天星期几
  getFirstDayOfWeek: function (year, month) {
    return new Date(Date.UTC(year, month - 1, 1)).getDay();
  },

  // 计算当月1号前空了几个格子，把它填充在days数组的前面
  calculateEmptyGrids: function (year, month) {
    var that = this;
    //计算每个月时要清零
    that.setData({
      days: [],
      days_sign_up: []
    });
    const firstDayOfWeek = this.getFirstDayOfWeek(year, month);
    let days = that.data.days
    let days_sign_up = that.data.days_sign_up
    if (firstDayOfWeek > 0) {
      for (let i = 0; i < firstDayOfWeek; i++) {
        days.push(0);
        days_sign_up.push(-1)
      }
      this.setData({
        days: days,
        days_sign_up: days_sign_up
      });
      //清空
    } else {
      this.setData({
        days: [],
        days_sign_up: []
      });
    }
  },

  // 绘制当月天数占的格子，并把它放到days数组中
  calculateDays: function (year, month) {
    var that = this;
    const thisMonthDays = this.getThisMonthDays(year, month);
    let days = that.data.days
    let days_sign_up = that.data.days_sign_up
    for (let i = 1; i <= thisMonthDays; i++) {
      days.push(i);
      days_sign_up.push(-1)
    }
    this.setData({
      days: days,
      days_sign_up: days_sign_up
    });
  },

  // 切换控制年月，上一个月，下一个月
  handleCalendar: function (e) {
    const handle = e.currentTarget.dataset.handle;
    const cur_year = this.data.cur_year;
    const cur_month = this.data.cur_month;
    if (handle === 'prev') {
      let newMonth = cur_month - 1;
      let newYear = cur_year;
      if (newMonth < 1) {
        newYear = cur_year - 1;
        newMonth = 12;
      }
      this.setData({
        cur_year: newYear,
        cur_month: newMonth
      })
      this.calculateEmptyGrids(newYear, newMonth);
      this.calculateDays(newYear, newMonth);
      this.onGetSignUp();
    } else {
      let newMonth = cur_month + 1;
      let newYear = cur_year;
      if (newMonth > 12) {
        newYear = cur_year + 1;
        newMonth = 1;
      }
      this.setData({
        cur_year: newYear,
        cur_month: newMonth
      })
      this.calculateEmptyGrids(newYear, newMonth);
      this.calculateDays(newYear, newMonth);
      this.onGetSignUp();
    }
  },
  //获取当前用户的考勤数组并匹配那些日子打卡
  onGetSignUp: function () {
    var days = this.data.days
    var days_sign_up = this.data.days_sign_up
    var cur_year = this.data.cur_year
    var cur_month = this.data.cur_month
    var count = 0
    wx.cloud.database().collection('address-book').doc(app.globalData.openId)
      .get()
      .then(res => {
        // 拿到数据库中已签到的日期和签到状态
        let t_date = res.data.date
        let t_state = res.data.state
        // 对于已经签到的每一个日期
        for (let i = 0; i < t_date.length; i++) {
          // 如果是当前年份当前月份，就置days_sign_up为true  //2017-04-03 
          let year = parseInt(t_date[i].substring(0, 4))
          let month = parseInt(t_date[i].substring(5, 7))
          let day = parseInt(t_date[i].substring(8, 10))
          // console.log(year);
          // console.log(month);
          // console.log(day);
          for (let j = 0; j < days.length; j++) {
            if (year == cur_year && month == cur_month && day == days[j]) {
              days_sign_up[j] = t_state[i]
              count = count + 1
            }
          }
        }
        this.setData({
          days: days,
          days_sign_up: days_sign_up,
          count: count
        })
      })
      .catch(err => {
        wx.showModal({
          title: "提示",
          content: "考勤信息获取失败，请联系客户处理！",
          showCancel: false,

        })
      })
  }
})