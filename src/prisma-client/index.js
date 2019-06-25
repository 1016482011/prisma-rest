'use strict'
Object.defineProperty(exports, '__esModule', { value: true })
var prisma_lib_1 = require('prisma-client-lib')
var typeDefs = require('./prisma-schema').typeDefs

var models = [
  {
    name: 'User',
    embedded: false
  },
  {
    name: 'Balance',
    embedded: false
  },
  {
    name: 'WebAmountDiscount',
    embedded: false
  },
  {
    name: 'QueryOrder',
    embedded: false
  },
  {
    name: 'Finance',
    embedded: false
  },
  {
    name: 'WebAddBalance',
    embedded: false
  }
]
exports.Prisma = prisma_lib_1.makePrismaClientClass({
  typeDefs,
  models,
  endpoint: `http://119.3.107.239:4466`
})
exports.prisma = new exports.Prisma()
