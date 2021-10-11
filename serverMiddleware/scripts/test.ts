import fs from 'fs'
import * as sw from 'stopword'
import ResultEntry from '~/interfaces/ResultEntry'

const natural = require('natural')

const stopwords = fs.readFileSync('./static/common_words').toString('utf-8').split('\n')

export default class Test {
  public static searchKeyword(keyword: string, invertResult: any): any {
    let word = keyword.trim().toLowerCase()
    const results: ResultEntry[] = []

    // Check through settings to see if adjustments are required
    if (invertResult.settings.removeStopWords || invertResult.settings.stemWords) {
      let tempArr = []
      if (invertResult.settings.removeStopWords) {
        tempArr = sw.removeStopwords([word], stopwords)
        word = tempArr[0]
      }

      if (invertResult.settings.stemWords) {
        word = natural.PorterStemmer.stem(word)
      }
    }

    if (invertResult.dictionary[word]) {
      // Check to see if term exists in the dictionary
      Object.keys(invertResult.postings[word]).forEach((documentId) => {
        const entry: ResultEntry = {
          documentId,
          title: invertResult.documents[documentId].title,
          termFrequency: invertResult.postings[word][documentId].termFrequency,
          results: invertResult.postings[word][documentId].positions,
          summary: ''
        }
        if (invertResult.settings.removeStopWords || invertResult.settings.stemWords) {
          entry.summary = invertResult.documents[documentId].keywordsArr.slice(entry.results[0] - 1, entry.results[0] + 10)
        } else {
          entry.summary = invertResult.documents[documentId].keywords.split(' ').slice
          (entry.results[0] - 1, entry.results[0] + 10)
        }
        results.push(entry)
      })
      console.info('Results Found!')
      return { results }
    } else {
      console.info('No Results Found!');
      return { results: [] }
    }
  }
}
