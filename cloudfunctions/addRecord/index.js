// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 该云函数用于 对新建的活动 导入成员的信息，以便之后人员签到
// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

}