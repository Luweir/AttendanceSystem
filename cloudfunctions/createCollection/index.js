// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event, context) => {
  // 创建对应集合 名字为index 注意这里要把index转换成字符串
  // console.log(event);
  // console.log("" + event.index);
  let collection_name = "" + event.index;
  let db = cloud.database();
  await db.createCollection(collection_name)
  // 把通讯录人员导入到该集合中
  

}