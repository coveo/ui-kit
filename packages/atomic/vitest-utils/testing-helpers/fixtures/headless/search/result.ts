import type {Result} from '@coveo/headless';

type DeepPartialResult = Partial<Omit<Result, 'raw'>> & {
  raw?: Record<string, unknown>;
  [key: string]: unknown;
};

export const buildFakeResult = (result?: DeepPartialResult): Result => {
  const {raw, ...restResult} = result ?? {};
  return {
    title: 'title',
    uri: 'https://example.com/uri',
    printableUri: 'https://example.com/printableUri',
    clickUri: '',
    uniqueId: 'uniqueId',
    excerpt: 'excerpt',
    firstSentences: 'firstSentences',
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
    isUserActionView: false,
    searchUid: 'searchUid',
    ...restResult,
    raw: {
      urihash: 'urihash',
      ...raw,
    },
  } satisfies Result;
};
