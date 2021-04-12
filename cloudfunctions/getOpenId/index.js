// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  // env: 'cloud1-0gbwed2xdbe13cb4' 固定云开发环境
  env: cloud.DYNAMIC_CURRENT_ENV //动态获取当前云开发环境
})

// 该函数用于获取用户openid
// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  return {
    openid: wxContext.OPENID,
  }
}