const jwt = require('jsonwebtoken')
// 创建 token 类
class Jwt {
  //生成token
  generateToken(data) {
    let created = Math.floor(Date.now() / 1000)
    let token = jwt.sign(
      {
        data,
        exp: created + 60 * 300
      },
      'secret'
    )
    return token
  }

  // 校验token
  verifyToken(t) {
    let res
    try {
      const token = t.replace('Bearer ', '')
      let result = jwt.verify(token, 'secret') || {}
      let { exp = 0 } = result,
        current = Math.floor(Date.now() / 1000)
      if (current <= exp) {
        res = result.data || {}
      }
    } catch (e) {
      res = e
    }
    return res
  }
}

module.exports = Jwt
