import PostingEntry from './PostingEntry';

export default interface Postings {
    [key: string]: {
        [key: string]: PostingEntry;
    };
}
