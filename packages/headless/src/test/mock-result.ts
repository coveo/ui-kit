import {Result} from '../api/search/search/result';
import {buildMockRaw} from './mock-raw';

export function buildMockResult(config: Partial<Result> = {}): Result {
  return {
    title: 'title',
    uri: 'uri',
    printableUri: 'printable-uri',
    clickUri: 'click-uri',
    uniqueId: 'unique-id',
    excerpt: 'exceprt',
    firstSentences: 'first-sentences',
    summary: null,
    flags: 'flags',
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
