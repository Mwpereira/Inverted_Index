/*
 * Index Search
 *
 * Involves finding and storing document id, frequency and word index of a specific keyword.
 */
import fs from 'fs'

const dictionary = fs.readFileSync('./generated/dictionary').toString('utf-8')
// const stopWords = fs.readFileSync('./static/common_words').toString('utf-8').split('\n')

export default class Test {
  public static searchKeyword(keyword: string, removeStopWords: boolean, stemWords: boolean) {

    const word = keyword.trim().toLowerCase();
    // for (let i = 0; i < dictionary.length; i++) {
    //   if (new Set(dictionary.replace(/,.*;/g,'').has(word)) {
    //     const documentCount = dictionary.split()
    //   }
    // }
  }
}
