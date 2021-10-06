import * as fs from "fs";
import * as sw from 'stopword'
import { Payload } from '~/interfaces/Payload'
import { Dictionary } from '~/interfaces/Dictionary'
import { Postings } from '~/interfaces/Postings'
import PostingEntry from '~/interfaces/PostingEntry'

const stemmer = require('porter-stemmer-english')

/*
 * Index Search
 *
 * Involves finding and storing document id, frequency and word index of a specific keyword.
 */
const cacm = fs.readFileSync('./static/cacm.all').toString('utf-8').split('.I')
const stopWords = fs.readFileSync('./static/common_words').toString('utf-8').split('\n')

// Retrieve Dictionary and Postings Map
export default class Invert {
  public static runScript(removeStopWords: boolean, stemWords: boolean) {
    let payload: Payload = {
      documentId: '',
      text: [''],
      dictionary: {},
      postings: {},
      documentKeywords: new Set(),
      removeStopWords,
      stemWords
    }

    for (let i = 1; i < cacm.length; i++) {
      // Unique keywords in a document
      payload.documentKeywords = new Set()

      // Get Document Data from CACM
      const documentArr = cacm[i].split('\n')

      // Retrieve Document ID
      payload.documentId = documentArr[0].trim()

      // Retrieve Title
      const title = this.cleanText(documentArr[2])

      // Gets keywords from Title
      payload.text = title.split(' ')
      payload = this.getKeywords(payload)

      // Gets keywords from Abstract Data
      const hasAbstract = cacm[i].includes('.W')

      if (hasAbstract) {
        const abstract = this.cleanText(
          cacm[i].substring(cacm[i].indexOf('.W') + 3, cacm[i].indexOf('.B'))
        )

        payload.text = abstract.split(' ')
        payload = this.getKeywords(payload)
      }
    }

    console.info('Finished Gathering Data')

    // Writes dictionary and postings data to their corresponding files.
    this.generateDictionary(payload.dictionary)
    this.generatePostings(payload.postings)

    return {
      ...payload.dictionary,
      ...payload.postings,
    };
  }

  /**
   * Sanitizes text
   *
   * @param text
   */
  private static cleanText(text: string) {
    return (
      text
        .replace(/(?=[A-Z])|([+-]?\d+(?:\.\d+)?)/g, ' $1') // Combined Words
        .replace(/-/g, ' ') // Hyphen Characters
        .replace(/(?!-)[^\w\s]|_/g, ' ') // Grammatical Characters
        .replace(/\s+/g, ' ') // Additional Space
        .toLowerCase()
        .trim()
    )
  }

  /**
   * Obtains keywords from text
   *
   * @param payload
   */
  private static getKeywords(payload: Payload): Payload {
    if (payload.removeStopWords) {
      payload.text = sw.removeStopwords(payload.text, stopWords)
    }

    for (let i = 0; i < payload.text.length; i++) {
      if (payload.stemWords) {
        payload.text[i] = stemmer(payload.text[i])
      }

      payload.text[i] = payload.text[i].trim();

      if (!payload.documentKeywords.has(payload.text[i])) {
        let dictionaryEntry = payload.dictionary[payload.text[i]]

        if (dictionaryEntry) {
          payload.dictionary[payload.text[i]] = ++dictionaryEntry
        } else {
          payload.dictionary[payload.text[i]] = 1
        }

        payload.documentKeywords.add(payload.text[i])
      }

      const postingKeyWord = payload.postings[payload.text[i]]

      if (postingKeyWord) {
        const postingEntry: PostingEntry = payload.postings[payload.text[i]][payload.documentId]
        if (postingEntry) {
          payload.postings[payload.text[i]][payload.documentId] = {
            documentId: postingEntry.documentId,
            termFrequency: ++postingEntry.termFrequency,
            positions: postingEntry.positions.concat(i + 1)
          }
        } else {
          payload.postings[payload.text[i]][payload.documentId] = {
            documentId: payload.documentId,
            termFrequency: 1,
            positions: [i + 1]
          }
        }
      } else {
        payload.postings[payload.text[i]] = {
          [payload.documentId]: {
            documentId: payload.documentId,
            termFrequency: 1,
            positions: [i + 1]
          }
        }
      }
    }

    return payload
  }

  /**
   * Generates Dictionary File
   *
   * @param dictionary
   */
  private static generateDictionary(dictionary: Dictionary) {
    try {
      const dictionaryWriteStream = fs.createWriteStream('./generated/dictionary')

      for (const [key, value] of Object.entries(dictionary).sort()) {
        dictionaryWriteStream.write(`${key},${value};\n`)
      }

      dictionaryWriteStream.close()

      console.info('Successfully Generated Dictionary')
    } catch {
      console.error('Failed to Generate Dictionary')
    }
  }

  /**
   * Generates the Postings File
   *
   * @param postings
   */
  private static generatePostings(postings: Postings) {
    try {
      const postingsWriteStream = fs.createWriteStream('./generated/postings')

      for (const [key, value] of Object.entries(postings).sort()) {
        let str = ''
        for (const [postingKey, postingValue] of Object.entries(postings[key]).sort()) {
          str +=
            postingValue.documentId +
            '\t' +
            postingValue.termFrequency +
            '\t' +
            postingValue.positions +
            ';\t'
        }
        postingsWriteStream.write(`${key}\t${str}\n`)
      }

      postingsWriteStream.close()

      console.info('Successfully Generated Postings')
    } catch {
      console.error('Failed to Generate Postings')
    }
  }
}
