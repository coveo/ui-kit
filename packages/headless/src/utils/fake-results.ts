import {SearchResult} from '../api/search/search';

export function getFakeResult(
  config: Partial<SearchResult> = {}
): SearchResult {
  return {
    clickUri: 'http://coveo.com',
    excerpt: 'This is an excerpt',
    printableUri: 'www.coveo.com',
    summary: 'This is a summary',
    title: 'Title of the document',
    uniqueId: 'uniqueId',
    uri: 'http://coveo.com',
    flags: 'no-flag',
    ...config,
  };
}

export function getFakeResults(count = 10) {
  const results: SearchResult[] = [];
  for (let index = 0; index < count; index++) {
    results.push(getFakeResult({uniqueId: `${index}`}));
  }
  return results;
}
