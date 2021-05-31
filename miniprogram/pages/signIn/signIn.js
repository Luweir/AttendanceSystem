var util = require('../../utils/util.js')
var app = getApp()
var date = []
var time = []
var state = []
Page({
  data: {
    // 是否有出勤活动
    have_activity: false,
    // 是否完成签到
    done_activity: false,
    // 距离范围
    distance: 0,
    // 时间范围
    start_time: "",
    end_time: "",
    // 目标位置信息
    m_address: "",
    m_name: "",
    m_latitude: 0,
    m_longitude: 0,
    // 当前位置信息
    // c_address: "",
    c_latitude: 0,
    c_longitude: 0,
  },

  onShow: function () {
    // 调用接口 进行定位
    wx.getLocation({
        type: 'gcj02',
      })
      .then(res => {
        // console.log(res);
        this.setData({
          c_latitude: res.latitude,
          c_longitude: res.longitude
        })
      })
      .catch(err => {
        wx.showModal({
          title: "提示",
          content: "获取定位信息失败",
          showCancel: false
        })
      })

    // 拿到数据库中关于管理员设定的签到信息数据
    wx.cloud.database().collection('global-variable').where({
        name: "signInInformation"
      })
      .get()
      .then(res => {
        let result = res.data[0]
        if (result) {
          this.setData({
            // 距离范围
            distance: result.distance,
            // 时间选择
            start_time: result.start_time,
            end_time: result.end_time,
            // 位置信息
            m_address: result.address,
            m_name: result.targetSite,
            m_latitude: result.latitude,
            m_longitude: result.longitude,
            have_activity: true
          })
        }
      })

    // 拿到数据库中 该用户的签到数据
    wx.cloud.database().collection('address-book').doc(app.globalData.openId)
      .get()
      .then(res => {
        // 没登陆,提示登录  （此时是有信息 但没登陆，一样不能签到）
        if (app.globalData.isLogin === false) {
          wx.showModal({
              title: "提示",
              content: "请先登录"
            })
            .then(res => {
              if (res.confirm) {
                wx.reLaunch({
                  url: '../personCenter/personCenter?concel_modual=1',
                })
              }
            })
        }
        // 如果已有当前日期
        if (res.data.date) {
          date = res.data.date
          time = res.data.time
          state = res.data.state
          // 如果在date数组中 找到了今天的日期 说明用户已完成签到
          if (date.includes(String(util.formatTime(new Date())).replace(/\//g, '-').substring(0, 10))) {
            this.setData({
              done_activity: true
            })
          }
        }

      })
      .catch(err => {
        // 如果登录了
        if (app.globalData.isLogin) {
          wx.cloud.database().collection('address-book').doc(app.globalData.openId).get()
            .then(res => {})
            .catch(err => {
              //
              wx.showModal({
                  title: "提示",
                  content: "请先完善个人信息再进行签到"
                })
                .then(res => {
                  if (res.confirm) {
                    wx.navigateTo({
                      url: '../updatePersonCenter/updatePersonCenter',
                    })
                  }
                })
            })
        } else {
          // 没登陆
          wx.showModal({
              title: "提示",
              content: "请先登录"
            })
            .then(res => {
              if (res.confirm) {
                wx.reLaunch({
                  url: '../personCenter/personCenter?concel_modual=1',
                })
              }
            })
        }
      })
  },
  // 点击位置签到
  handleLocationSignIn: function () {
    let {
      c_longitude
    } = this.data;
    let {
      c_latitude
    } = this.data;
    let {
      m_longitude
    } = this.data;
    let {
      m_latitude
    } = this.data;
    // 如果当前有考勤签到活动
    if (this.data.have_activity) {
      // 如果用户已完成签到
      if (this.data.done_activity) {
        wx.showModal({
          title: '提示',
          content: "你已经签过到啦",
          showCancel: false
        })
      }
      // 如果用户未完成当前签到活动 
      else {
        var that = this
        // 用户当前距离和目标点距离
        var distance = this.getDistance(c_latitude, c_longitude, m_latitude, m_longitude);
        // 在规定距离内，签到成功无论是否迟到，都会存入数据库
        if (distance <= this.data.distance) {
          // 判断时间是否超出 end_time, state为1表示未超出 state2表示迟到
          let c_state = this.checkTime();
          let c_time = String(util.formatTime(new Date())).replace(/\//g, '-');

          // 加入今天的签到数据
          if (!date) {
            date = [c_time.substring(0, 10)]
          } else {
            date.push(c_time.substring(0, 10))
          }
          if (!time) {
            time = [c_time.substring(11, 16)]
          } else {
            time.push(c_time.substring(11, 16))
          }
          console.log(time);
          if (!state) {
            state = [c_state]
          } else {
            state.push(c_state)
          }
          console.log(state);
          that.setData({
            date: date,
            time: time,
            state: state
          })
          // 向address-book表中更新用户的签到数据
          wx.cloud.database().collection('address-book').doc(app.globalData.openId)
            .update({
              data: {
                date: date,
                time: time,
                // 直接存入用户 对于当前设定的签到 的签到状态，而不是到时候查看出勤时实时的状态
                state: state
              }
            })
            .then(res => {

              // 向 time-person 表中更新数据
              this.updateTimePerson(c_time, c_state)
              // 判断当前签到状态 并输出
              if (c_state == 1) {
                wx.showModal({
                  title: "签到成功",
                  content: "距离签到点约" + distance + "m",
                  showCancel: false
                })
                this.setData({
                  done_activity: true
                })
              }
              // 出勤迟到
              else {
                wx.showModal({
                  title: "签到成功",
                  content: "距离签到点约" + distance + "m" + "，已超过指定考勤时间",
                  showCancel: false,
                  confirmColor: "#bfbfbf"
                })
              }
            })
        }
        // 不在规定距离内，不写入数据库，查看出勤状态时自动视为未签到
        else {
          wx.showModal({
            title: "签到失败",
            content: "距离签到点约" + distance + "m，已超过规定距离：" + this.data.distance + 'm',
            showCancel: false
          })
        }
      }
    }
    // 如果当前没有签到活动
    else {
      wx.showModal({
        title: '提示',
        content: '暂无签到活动，请先进入管理员模式创建签到活动',
        success: function (res) {
          if (res.confirm) {
            wx.navigateTo({
              url: '../personCenter/personCenter',
            })
          } else {
            // console.log('点击取消回调')
          }
        }
      })
    }


  },
  Rad(d) {
    //根据经纬度判断距离
    return d * Math.PI / 180.0;
  },
  // 计算与目标点的距离
  getDistance(lat1, lng1, lat2, lng2) {
    var radLat1 = this.Rad(lat1);
    var radLat2 = this.Rad(lat2);
    var a = radLat1 - radLat2;
    var b = this.Rad(lng1) - this.Rad(lng2);
    var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) + Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)));
    s = s * 6378.137;
    s = Math.round(s * 10000) / 10000;
    //保留3位小数
    s = s.toFixed(3)
    // 将km转换成m
    s = s * 1000
    return s
  },
  // 检验是否在规定时间内签到
  checkTime: function () {
    // 当前日期
    let date = new Date().toLocaleDateString()
    // 得到当前日期 时间并格式化
    var TIME = util.formatTime(new Date())
    let time = new Date(String(TIME))
    // console.log(time);

    // 先把-用/代替
    var start_time = (date + " " + this.data.start_time).replace(/-/g, '/')
    var end_time = (date + " " + this.data.end_time).replace(/-/g, '/')
    // 转换成时间格式
    start_time = new Date(start_time)
    end_time = new Date(end_time)
    //1 为正常出勤，0为迟到
    return time < end_time ? 1 : 0
  },
  goToSignInCalendar: function () {
    wx.navigateTo({
      url: '../signInCalendar/signInCalendar',
    })
  },
  updateTimePerson: function (c_time, state) {
    let date = c_time.substring(0, 10)
    let time = c_time.substring(11, 16)

    // 先获得我的工号和姓名，方便存储；
    wx.cloud.database().collection('address-book').doc(app.globalData.openId).get()
      .then(res => {
        let my_num = res.data.num
        let my_name = res.data.name
        let num_list = []
        let name_list = []
        let time_list = []
        let state_list = []
        // 拿到 time-person 中当前日子已有数据
        console.log(date);
        wx.cloud.database().collection('time-person').doc(date).get()
          .then(res => {
            num_list = res.data.num
            name_list = res.data.name
            time_list = res.data.time
            state_list = res.data.state
            // 新增数据
            num_list.push(my_num)
            name_list.push(my_name)
            time_list.push(time)
            state_list.push(state)
            // 再放入 time-person中
            wx.cloud.database().collection('time-person').doc(date).update({
                data: {
                  num: num_list,
                  name: name_list,
                  time: time_list,
                  state: state_list
                }
              })
              .then(res => {
                console.log("添加完成")
              })
          })
          .catch(err => {
            console.log(err);
            console.log("不存在日期，新建并放入");
            // 新增数据
            num_list.push(my_num)
            name_list.push(my_name)
            time_list.push(time)
            state_list.push(state)
            // 再放入 time-person 中
            wx.cloud.database().collection('time-person').doc(date).set({
                data: {
                  num: num_list,
                  name: name_list,
                  time: time_list,
                  state: state_list
                }
              })
              .then(res => {
                console.log("添加完成")
              })
          })

      })
  }
})