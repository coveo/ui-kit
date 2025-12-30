import type {Result as InsightResult} from '@coveo/headless/insight';

type DeepPartialResult = Partial<Omit<InsightResult, 'raw'>> & {
  raw?: Record<string, unknown>;
  [key: string]: unknown;
};

export const buildFakeInsightResult = (
  result?: DeepPartialResult
): InsightResult => {
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
  } satisfies InsightResult;
};
