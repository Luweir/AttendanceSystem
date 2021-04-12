var QQMapWX = require('../../libs/qqmap-wx-jssdk.js');
var qqmapsdk;
Page({

  data: {
    show_add_button: true,
    // 距离范围
    index: 0,
    array: ['50m', '100m', '200m', '500m', '1000m'],
    distance: "50m",
    // 时间选择
    start_time: '07:00',
    end_time: '09:00',
    // 位置信息
    m_address: "",
    m_name: "",
    m_latitude: null,
    m_longitude: null,
  },

  onLoad: function (options) {
    // 数据库有已经设置好的考勤, 直接赋值
    wx.cloud.database().collection('global-variable').where({
        name: "signInInformation"
      })
      .get()
      .then(res => {
        let result = res.data[0]
        if (result) {
          this.setData({
            show_add_button: false,
            // 距离范围
            distance: result.distance + "m",
            // 时间选择
            start_time: result.start_time,
            end_time: result.end_time,
            // 位置信息
            m_address: result.address,
            m_name: result.targetSite,
            m_latitude: result.latitude,
            m_longitude: result.longitude,
          })
        } else {
          //如果初次加载，此时地址为空，我要获得当前地址
          // 实例化API核心类
          qqmapsdk = new QQMapWX({
            key: 'MC2BZ-AYGLS-ID5OG-6VDXT-CBI5F-KYBOQ'
          });
          var that = this;
          // 调用接口
          qqmapsdk.reverseGeocoder({
            // 这里没有写location选项是因为默认就是当前位置
            success: function (res) {
              that.setData({
                m_address: '( ' + res.result.address + ' )',
                m_name: res.result.formatted_addresses.recommend,
                m_latitude: res.result.location.lat,
                m_longitude: res.result.location.lng
              });
            },
            fail: function (res) {
              // console.log(res);
            },
            complete: function (res) {
              // console.log(res);
            }
          })
        }
      })
  },
  // 点击弹出选择位置框
  onChangeAddress: function (e) {
    wx.chooseLocation()
      .then(res => {
        // res既包含 address信息，也包含经纬度信息（经纬度需要返回以计算距离）
        // console.log(res);
        // res.name为地址名称  
        // console.log(res.name);
        this.setData({
          m_name: res.name,
          m_address: "( " + res.address + " )",
          m_latitude: res.latitude,
          m_longitude: res.longitude
        })
        // console.log(this.data.m_latitude, this.data.m_longitude);
      })
  },

  // 距离范围确定函数
  bindPickerChange: function (e) {
    // console.log('距离范围确定为', e.detail.value)
    this.setData({
      index: e.detail.value,
      distance: this.data.array[e.detail.value]
    })
  },

  // 起止时间确定函数
  bindStartTimeChange: function (e) {
    // console.log("开始时间", e.detail.value);
    this.setData({
      start_time: e.detail.value
    })
  },
  bindEndTimeChange: function (e) {
    // console.log("结束时间", e.detail.value);
    this.setData({
      end_time: e.detail.value
    })
  },
  // 表单提交
  formSubmit(e) {
    // console.log("提交，携带数据为", e.detail.value);
    // 判断是否存在必要字段为空，为空则提示
    if (this.data.address == "") {
      wx.showToast({
        icon: "none",
        title: '未选择/定位签到地点，请重试',
      })
    } else {
      let data = {
        name: "signInInformation",
        latitude: this.data.m_latitude,
        longitude: this.data.m_longitude,
        start_time: this.data.start_time,
        end_time: this.data.end_time,
        distance: parseInt(this.data.distance.substring(0, this.data.distance.length - 1)),
        address: this.data.m_address,
        targetSite: this.data.m_name
      }
      if (this.data.show_add_button == true) {
        // 向数据库中 传递 经纬度、时间等签到信息
        wx.cloud.database().collection('global-variable').add({
            data: data
          })
          .then(res => {
            wx.showToast({
              title: '提交成功',
            })
          })
      } else {
        // 修改数据库中的 经纬度、时间等签到信息
        wx.cloud.database().collection('global-variable').where({
            name: "signInInformation"
          }).update({
            data: data
          })
          .then(res => {
            wx.showToast({
              title: '提交成功',
            })
          })
      }
    }
  },
  formReset(e) {
    // console.log("重置",e.detail.value);
    // 先把数据都设置为初始值
    this.setData({
      // 活动名
      name: "",
      // 距离范围
      index: 0,
      array: ['50m', '100m', '200m', '500m', '1000m'],
      distance: "50m",
      // 周期
      cycle: "",
      isOnce: true,
      //日期选择
      date: new Date().toLocaleDateString(),
      // 时间选择
      start_time: '07:00',
      end_time: '09:00',
      // 位置信息
      address: "",
      m_name: "",
      m_latitude: null,
      m_longitude: null,
    })
    // 然后重新加载
    this.onLoad()
  }
})