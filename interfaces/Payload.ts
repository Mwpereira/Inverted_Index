import Dictionary from "./Dictionary";
import Postings from "./Postings";

export default interface Payload {
    documentId: string,
    text: string[],
    dictionary: Dictionary,
    postings: Postings,
    documentKeywords: Set<any>,
    removeStopWords: boolean,
    stemWords: boolean,
}
