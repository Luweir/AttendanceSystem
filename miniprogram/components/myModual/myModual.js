// components/myModual/myModual.js
// 为后面进入模式提供验证功能，即输入密码：
//  1 密码正确，进入root页
//  2 密码错误，提示重新输入！
//  3 下面两个按钮
//       1 返回
//       2 确认
var app = getApp();
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    psw: {
      type: String,
      value: ""
    }
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 获得输入的值,并把内部变量psw设置为当前的值
    getValue: function (res) {
      // console.log(res.detail.value)
      let input_psw = res.detail.value;
      this.setData(
        {
          psw: input_psw
        }
      )
    },
    // 比较psw和全局变量rootPsw是否相同，相同则进入管理员模式
    modalConfirm: function (res) {
      // 输出当前输入的密码
      // console.log(this.properties.psw);
      let input_psw = this.properties.psw;
      // 进行判断
      if (input_psw != app.globalData.rootPwd) {
        // 密码错误，弹窗提示
        wx.showModal({
          title: "提示",
          content: '密码错误，请重新输入!',
          icon: 'none',
          duration: 2000
        });
      }
      // 密码正确，跳转
      else {
        wx.redirectTo({
          url: '../../pages/root/root',
          success: (result) => {

          },
          fail: () => { }
        });
      }


    }
  }
})