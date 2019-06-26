const express = require('express')
const bodyParser = require('body-parser')
const fs = require('fs')
const { prisma } = require('./prisma-client')
const Jwt = require('./jwt')
const jwt = new Jwt()

const app = express()

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

async function verifyToken(token) {
  const tokenVer = jwt.verifyToken(token)
  const result = await prisma.user({
    username: tokenVer.username
  })
  if (!result) throw Error('用户不存在')
  const { id } = result
  return { id }
}

app.post('/api/login', async (req, res) => {
  try {
    const { username: reqUser, password: reqPsw } = req.body
    const result = await prisma.user({
      username: reqUser
    })
    if (!result) throw Error('用户不存在')
    const { id, username, password, realname } = result
    if (password !== reqPsw) throw Error('密码错误')
    const token = jwt.generateToken({ username })
    res.json({
      code: 0,
      msg: '登录成功',
      data: { token, user: { username, realname, id } }
    })
  } catch (e) {
    res.json({ code: 1, msg: '用户名或密码错误' })
  }
})

app.get('/api/balance', async (req, res) => {
  try {
    await verifyToken(req.headers.authorization)
    const result = await prisma.balances()
    if (result.length < 1) throw Error('无数据')
    res.json({ code: 0, msg: '查询成功', data: { balance: result[0] } })
  } catch (e) {
    res.json({ code: 1, msg: '查询错误' })
  }
})

app.get('/api/webAmountDiscount', async (req, res) => {
  try {
    await verifyToken(req.headers.authorization)
    const result = await prisma.webAmountDiscounts()
    if (result.length < 1) throw Error('无数据')
    res.json({
      code: 0,
      msg: '查询成功',
      data: { webAmountDiscount: result[0] }
    })
  } catch (e) {
    res.json({ code: 1, msg: '查询错误' })
  }
})

app.post('/api/queryOrder', async (req, res) => {
  try {
    await verifyToken(req.headers.authorization)
    const result = await prisma.queryOrders()
    res.json({
      code: 0,
      msg: '查询成功',
      data: { queryOrder: result }
    })
  } catch (e) {
    res.json({ code: 1, msg: e })
  }
})

app.post('/api/webAddBalance', async (req, res) => {
  const query = `
  query {
    webAddBalances{
      id,
      Amount,
      Createtime,
      User{realname}
    }
  }
  `
  try {
    await verifyToken(req.headers.authorization)
    const result = await prisma.$graphql(query)
    res.json({
      code: 0,
      msg: '查询成功',
      data: result
    })
  } catch (e) {
    res.json({ code: 1, msg: e })
  }
})

app.post('/file/list', (req, res) => {
  fs.readdir(`./file/${req.body.name}`, function(err, files) {
    if (err) {
      res.json({ code: 1, data: err, message: '查询失败' })
    }
    res.json({ code: 0, data: files, message: '查询成功' })
  })
})
app.get('/file/download', (req, res) => {
  const filePath = `./file/${req.query.name}/${req.query.file}`
  const stats = fs.statSync(filePath)
  if (stats.isFile()) {
    res.set({
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': 'attachment; filename=' + req.query.file,
      'Content-Length': stats.size
    })
    fs.createReadStream(filePath).pipe(res)
  } else {
    res.end(404)
  }
})

app.listen(3333, () =>
  console.log('Server is running on http://localhost:3333')
)
