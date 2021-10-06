import express from 'express'
import Invert from './scripts/invert'
import Test from './scripts/test'

const app = express()
const bodyParser = require('body-parser')

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.post('/invert', (req, res) => {
  Invert.runScript(req.body.removeStopWords, req.body.stemWords)
  Test.searchKeyword(req.body.keyword, req.body.removeStopWords, req.body.stemWords)
  console.log(new Date().toISOString())
  res.json({ data: 'test1' })
  console.log(new Date().toISOString())
})

module.exports = app
