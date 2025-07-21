import type {Result} from '../api/search/search/result.js';
import {buildMockRaw} from './mock-raw.js';

/**
 * For internal use only.
 *
 * Returns a `Result`, with non-empty data, for testing purposes.
 * @param config  - A partial `Result` from which to build the target `Result`.
 * @returns The new `Result`.
 */
export function buildMockResult(config: Partial<Result> = {}): Result {
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
    isUserActionView: false,
    searchUid: '',
    ...config,
  };
}

const resultParams = {
  title: 'example documentTitle',
  uri: 'example documentUri',
  printableUri: 'printable-uri',
  clickUri: 'example documentUrl',
  uniqueId: 'unique-id',
  excerpt: 'excerpt',
  firstSentences: 'first-sentences',
  flags: 'flags',
  rankingModifier: 'example rankingModifier',
  raw: buildMockRaw({
    urihash: 'example documentUriHash',
    source: 'example sourceName',
    collection: 'example collectionName',
    permanentid: 'example contentIDValue',
  }),
};

/**
 * For internal use only.
 *
 * Returns a `Result` for testing purposes.
 * @param config  - A partial `Result` from which to build the target `Result`.
 * @returns The new `Result`.
 */
export function buildMockNonEmptyResult(config: Partial<Result> = {}): Result {
  return buildMockResult({
    ...resultParams,
    ...config,
  });
}
