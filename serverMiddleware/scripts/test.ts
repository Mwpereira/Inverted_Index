export default class Test {
  public static searchKeyword(keyword: string, invertResult: any): any {
    const word = keyword.trim().toLowerCase()
    let results = []
    // Check to see if term exists in the dictionary
    if (invertResult.dictionary[word]) {
      for (let i = 0; i < invertResult.dictionary[word]; i++) {

      }
    } else {
      return { results: [] }
    }
  }
}
