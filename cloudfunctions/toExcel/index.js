// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  // env: 'cloud1-0gbwed2xdbe13cb4' 固定云开发环境
  env: cloud.DYNAMIC_CURRENT_ENV //动态获取当前云开发环境
})

//操作excel用的类库
const xlsx = require('node-xlsx');

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    let {
      userdata
    } = event

    //1,定义excel表格名
    let dataCVS = 'attendance.xlsx'
    //2，定义存储数据的
    let alldata = [];
    let row = ['num', 'name', 'state']; //表属性
    alldata.push(row);

    for (let key in userdata) {
      let arr = [];
      arr.push(userdata[key].num);
      arr.push(userdata[key].name);
      if (userdata[key].state == -1) {
        arr.push("未到")
      } else if (userdata[key].state == 0) {
        arr.push("迟到")
      } else {
        arr.push("正常")
      }
      alldata.push(arr)
    }
    //3，把数据保存到excel里
    var buffer = await xlsx.build([{
      name: "mySheetName",
      data: alldata
    }]);
    //4，把excel文件保存到云存储里
    return await cloud.uploadFile({
      cloudPath: dataCVS,
      fileContent: buffer, //excel二进制文件
    })

  } catch (e) {
    console.error(e)
    return e
  }
}