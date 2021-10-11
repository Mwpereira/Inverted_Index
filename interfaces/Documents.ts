export default interface Documents {
  [key: string]: {
    title: string,
    abstract: string,
    date: string,
    authors: string,
    citation: string,
    keywords: string,
    keywordsArr: string[]
  };
}
