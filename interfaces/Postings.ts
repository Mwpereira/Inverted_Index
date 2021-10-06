import PostingEntry from './PostingEntry';

export interface Postings {
    [key: string]: {
        [key: string]: PostingEntry;
    };
}
