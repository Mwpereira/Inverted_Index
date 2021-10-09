import express from 'express'
import Invert from './scripts/invert'
import Test from './scripts/test'

const app = express()
const bodyParser = require('body-parser')

let invertResult = {
  dictionary: {},
  postings: {},
  documents: {},
  settings: {
    removeStopWords: false,
    stemWords: false
  }
}

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.post('/invert', (req, res) => {
  invertResult.settings = {
    removeStopWords: req.body.removeStopWords,
    stemWords: req.body.stemWords,
  }
  const data = Invert.runScript(invertResult.settings)
  invertResult = {
    dictionary: data.dictionary,
    postings: data.postings,
    documents: data.documents,
    settings: data.settings
  }
  res.json({
    data: {
      documents: Object.entries(invertResult.documents).length,
      terms: Object.entries(invertResult.dictionary).length
    }
  })
})

app.post('/test', (req, res) => {
  const startTime = new Date().getDate()
  const response = Test.searchKeyword(req.body.keyword, invertResult)
  const endTime = new Date().getDate()
  response.time = endTime - startTime
  res.json({ data: response })
})

module.exports = app
