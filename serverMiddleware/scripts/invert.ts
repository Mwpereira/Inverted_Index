import * as fs from 'fs'
import * as sw from 'stopword'
import Dictionary from '~/interfaces/Dictionary'
import Postings from '~/interfaces/Postings'
import PostingEntry from '~/interfaces/PostingEntry'
import UserSettings from '~/interfaces/UserSettings'
import Documents from '~/interfaces/Documents'

const stemmer = require('porter-stemmer-english')

/*
 * Index Search
 *
 * Involves finding and storing document id, frequency and word index of a specific keyword.
 */
const cacm = fs.readFileSync('./static/cacm.all').toString('utf-8').split('\n')
const stopWords = fs.readFileSync('./static/common_words').toString('utf-8').split('\n')

// Retrieve Dictionary and Postings Map
export default class Invert {
  private static settings = {
    removeStopWords: false,
    stemWords: false
  };

  public static runScript(settings: UserSettings) {
    this.settings = settings;

    // Parse data from cacm to documents object
    const documents = this.parseDataToDocuments({})
    console.info('Finished Parsing Data')

    // Preprocess document data into dictionary and postings objects
    const data = this.precprocess(documents);
    const dictionary = data.dictionary;
    const postings = data.postings;
    console.info('Finished Preprocessing Data')

    // Generate Files
    // Writes dictionary and postings data to their corresponding files.
    this.generateDictionary(dictionary)
    this.generatePostings(postings)

    return {
      dictionary,
      postings,
      documents,
      settings
    }
  }

  /**
   * Parsing data from CACM to a documents object
   */
  private static parseDataToDocuments(docs: Documents): Documents {
    let documentId = ''
    let action = ''
    for (let i = 0; i < cacm.length; i++) {
      const text = cacm[i]
      switch (cacm[i].substring(0, 2)) {
        case('.I'):
          action = 'I'
          documentId = text.split(' ')[1]
          docs[documentId] = {
              title: '',
              abstract: '',
              date: '',
              authors: '',
              citation: ''
          }
          break
        case('.T'):
          action = 'T'
          break
        case('.W'):
          action = 'W'
          break
        case('.B'):
          action = 'B'
          break
        case('.A'):
          action = 'A'
          break
        case('.X'):
          action = 'X'
          break
        default:
          switch (action) {
            case('T'):
              docs[documentId].title = text
              break
            case('W'):
              docs[documentId].abstract += ` ${text}`
              break
            case('B'):
              docs[documentId].date = text.trim()
              break
            case('A'):
              docs[documentId].authors += text.trim()
              break
            case('X'):
              docs[documentId].citation += text.replace(/\t/g, ' ').trim()
              break
          }
      }
    }
    return docs;
  }

  /**
   * Preprocesses text before inserting into dictionary and keywords
   */
  private static precprocess(docs: Documents) {
    let dictionary = {}
    let postings = {}

    for (const key in docs) {
      // Unique keywords in a document
      let data = this.getKeywords(key, this.cleanText(docs[key].title), dictionary, postings, new Set())
      data = this.getKeywords(key, this.cleanText(docs[key].abstract), data.dictionary, data.postings, data.documentKeywords)
      dictionary = data.dictionary;
      postings = data.postings;
    }
    return {
      dictionary,
      postings,
    }
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
        .split(' ')
    )
  }

  /**
   * Obtains keywords from text
   *
   * @param documentId
   * @param text
   * @param dictionary
   * @param postings
   * @param documentKeywords
   */
  private static getKeywords(documentId: string, text: string[], dictionary: Dictionary, postings: Postings, documentKeywords: Set<string>) {
    if (this.settings.removeStopWords) {
      text = sw.removeStopwords(text, stopWords)
    }

    for (let i = 0; i < text.length; i++) {
      if (this.settings.stemWords) {
        text[i] = stemmer(text[i])
      }

      text[i] = text[i].trim()

      if (!documentKeywords.has(text[i])) {
        let dictionaryEntry = dictionary[text[i]]

        if (dictionaryEntry) {
          dictionary[text[i]] = ++dictionaryEntry
        } else {
          dictionary[text[i]] = 1
        }

        documentKeywords.add(text[i])
      }

      const postingKeyWord = postings[text[i]]

      if (postingKeyWord) {
        const postingEntry: PostingEntry = postings[text[i]][documentId]
        if (postingEntry) {
          postings[text[i]][documentId] = {
            documentId: postingEntry.documentId,
            termFrequency: ++postingEntry.termFrequency,
            positions: postingEntry.positions.concat(i + 1)
          }
        } else {
          postings[text[i]][documentId] = {
            documentId,
            termFrequency: 1,
            positions: [i + 1]
          }
        }
      } else {
        postings[text[i]] = {
          [documentId]: {
            documentId,
            termFrequency: 1,
            positions: [i + 1]
          }
        }
      }
    }
    return {
      dictionary,
      postings,
      documentKeywords
    }
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
        dictionaryWriteStream.write(`${key}\t${value}\n`)
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

      for (const [key,] of Object.entries(postings).sort()) {
        let str = ''
        for (const [, postingValue] of Object.entries(postings[key]).sort()) {
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
