// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  let { userInfo, ...data } = event
  try {
    // 内容安全检测
    const msgSecCheckRes = await cloud.callFunction({
      name: 'msgSecCheck',
      data: { text: data.comment_details,openid:cloud.getWXContext().OPENID }
    })
    // console.log(msgSecCheckRes.result)
    console.log(data)
    // 判断文本是否违规
    if(msgSecCheckRes.result.result.suggest != "pass") {
      return {
        code: 1,
        error: '文字內容违规',
        success: false
      }
    }

    let result = {}
    if(data.comment_identity) {
      result = await db.collection('SonComment').add({data})
    } else {
      result = await db.collection('FatherComment').add({data})
    }

    return {
      code: 0,
      data: result._id,
      success: true      
    }
  }
  catch(err) {
    console.error('transaction error')
    return {
      code: 1,
      success: false
    }
  }
}
