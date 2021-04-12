// 云函数入口文件
const cloud = require('wx-server-sdk')

// 云函数初始化
cloud.init({
  // env: 'cloud1-0gbwed2xdbe13cb4' 固定云开发环境
  env: cloud.DYNAMIC_CURRENT_ENV //动态获取当前云开发环境
})
// 云函数入口函数
exports.main = async (event, context) => {
  return cloud.database().collection('address-book').get()
}