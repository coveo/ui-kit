import {Result} from '../api/search/search/result';
import {buildMockRaw} from './mock-raw';

interface ResultWithFolding extends Result {
  parentResult?: ResultWithFolding;
  childResults?: ResultWithFolding[];
}

export function buildMockResult(
  config: Partial<ResultWithFolding> = {}
): ResultWithFolding {
  return {
    title: '',
    uri: '',
    printableUri: '',
    clickUri: '',
    uniqueId: '',
    excerpt: '',
    firstSentences: '',
    summary: null,
    flags: '',
    hasHtmlVersion: false,
    score: 0,
    percentScore: 0,
    rankingInfo: null,
    isTopResult: false,
    isRecommendation: false,
    titleHighlights: [],
    firstSentencesHighlights: [],
    excerptHighlights: [],
    printableUriHighlights: [],
    summaryHighlights: [],
    absentTerms: [],
    raw: buildMockRaw(),
    ...config,
  };
}
