"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Required packages
 */
const fs = require('fs'); // File System
const sw = require('stopword'); // Stopwords Package
const stemmer = require('porter-stemmer-english'); // Porter Stemmer English Package
/*
 * Index Search
 *
 * Involves finding and storing document id, frequency and word index of a specific keyword.
 */
const cacm = fs.readFileSync('./static/cacm.all').toString('utf-8').split('.I');
const stopWords = fs.readFileSync('./static/common_words').toString('utf-8').split('\n');
// Retrieve Dictionary and Postings Map
class Invert {
    static runScript() {
        let dictionary = {};
        let postings = {};
        for (let i = 1; i < cacm.length; i++) {
            const documentKeywords = new Set();
            // Get Document Data from CACM
            const documentArr = cacm[i].split('\n');
            // Retrieve Document ID
            const documentId = documentArr[0].trim();
            // Retrieve Title
            const title = this.cleanText(documentArr[2]);
            // Gets keywords from Title
            let titleArr = sw.removeStopwords(title.split(' '), stopWords);
            for (let i = 0; i < titleArr.length; i++) {
                titleArr[i] = stemmer(titleArr[i]);
                if (!documentKeywords.has(titleArr[i])) {
                    let dictionaryEntry = dictionary[titleArr[i]];
                    if (dictionaryEntry) {
                        dictionary[titleArr[i]] = ++dictionaryEntry;
                    }
                    else {
                        dictionary[titleArr[i]] = 1;
                    }
                }
                let postingKeyWord = postings[titleArr[i]];
                if (postingKeyWord) {
                    let postingEntry = postings[titleArr[i]][documentId];
                    if (postingEntry) {
                        postings[titleArr[i]][documentId] = {
                            documentId: postingEntry.documentId,
                            termFrequency: ++postingEntry.termFrequency,
                            positions: postingEntry.positions.concat(i + 1),
                        };
                    }
                    else {
                        postings[titleArr[i]][documentId] = {
                            documentId: documentId,
                            termFrequency: 1,
                            positions: [i + 1],
                        };
                    }
                }
                else {
                    postings[titleArr[i]] = {
                        [documentId]: {
                            documentId: documentId,
                            termFrequency: 1,
                            positions: [i + 1],
                        },
                    };
                }
            }
            // Gets keywords from Abstract Data
            let hasAbstract = cacm[i].includes('.W');
            if (hasAbstract) {
                let abstract = this.cleanText(cacm[i].substring(cacm[i].indexOf('.W') + 3, cacm[i].indexOf('.B')));
                let abstractArr = sw.removeStopwords(abstract.split(' '), stopWords);
                for (let i = 0; i < abstractArr.length; i++) {
                    abstractArr[i] = stemmer(abstractArr[i]);
                    if (!documentKeywords.has(abstractArr[i])) {
                        let dictionaryEntry = dictionary[abstractArr[i]];
                        if (dictionaryEntry) {
                            dictionary[abstractArr[i]] = ++dictionaryEntry;
                        }
                        else {
                            dictionary[abstractArr[i]] = 1;
                        }
                    }
                    let postingKeyWord = postings[abstractArr[i]];
                    if (postingKeyWord) {
                        let postingEntry = postings[abstractArr[i]][documentId];
                        if (postingEntry) {
                            postings[abstractArr[i]][documentId] = {
                                documentId: postingEntry.documentId,
                                termFrequency: ++postingEntry.termFrequency,
                                positions: postingEntry.positions.concat(i + 1),
                            };
                        }
                        else {
                            postings[abstractArr[i]][documentId] = {
                                documentId: documentId,
                                termFrequency: 1,
                                positions: [i + 1],
                            };
                        }
                    }
                    else {
                        postings[abstractArr[i]] = {
                            [documentId]: {
                                documentId: documentId,
                                termFrequency: 1,
                                positions: [i + 1],
                            },
                        };
                    }
                }
            }
        }
        console.info('Finished Gathering Data');
        // Writes dictionary and postings data to their corresponding files.
        this.generateDictionary(dictionary);
        this.generatePostings(postings);
    }
    static cleanText(text) {
        return (text
            .replace(/(?!-)[^\w\s]|_/g, '')
            .replace(/\s+/g, ' ')
            // .replace(/\d+(\.\d+)?\w+/, 'TEST23423')
            .replace(/-/g, ' ')
            .toLowerCase());
    }
    /**
     * Generates Dictionary File
     *
     * @param dictionary
     */
    static generateDictionary(dictionary) {
        try {
            let dictionaryWriteStream = fs.createWriteStream('./generated/dictionary');
            for (const [key, value] of Object.entries(dictionary).sort()) {
                dictionaryWriteStream.write(`${key} \t  ${value} \n`);
            }
            dictionaryWriteStream.close();
            console.info('Successfully Generated Dictionary');
        }
        catch (_a) {
            console.error('Failed to Generate Dictionary');
        }
    }
    /**
     * Generates the Postings File
     *
     * @param postings
     */
    static generatePostings(postings) {
        try {
            let postingsWriteStream = fs.createWriteStream('./generated/postings');
            for (const [key, value] of Object.entries(postings).sort()) {
                let str = '';
                for (const [postingKey, postingValue] of Object.entries(postings[key]).sort()) {
                    str +=
                        postingValue.documentId +
                            '\t' +
                            postingValue.termFrequency +
                            '\t' +
                            postingValue.positions +
                            ';\t';
                }
                postingsWriteStream.write(`${key}\t${str}\n`);
            }
            postingsWriteStream.close();
            console.info('Successfully Generated Postings');
        }
        catch (_a) {
            console.error('Failed to Generate Postings');
        }
    }
}
exports.default = Invert;
Invert.runScript();
//# sourceMappingURL=script.js.map