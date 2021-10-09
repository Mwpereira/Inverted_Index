import ResultEntry from '~/interfaces/ResultEntry'

export default class Test {
  public static searchKeyword(keyword: string, invertResult: any): any {
    const word = keyword.trim().toLowerCase()
    const results: ResultEntry[] = []

    // Check to see if term exists in the dictionary
    if (invertResult.dictionary[word]) {
      Object.keys(invertResult.postings[word]).forEach((documentId) => {
        const entry: ResultEntry = {
          documentId,
          title: invertResult.documents[documentId].title,
          termFrequency: invertResult.postings[word][documentId].termFrequency,
          results: invertResult.postings[word][documentId].positions,
          summary: ''
        }
        entry.summary = invertResult.documents[documentId].keywords.split(' ').slice
        (entry.results[0], entry.results[0] + 10)
        results.push(entry)
      });
      return { results }
    } else {
      return { results: [] }
    }
  }
}
