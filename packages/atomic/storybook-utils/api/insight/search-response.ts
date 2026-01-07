// Fixed reference timestamp (2025-12-18T00:00:00Z) for consistent snapshots
const REFERENCE_TIMESTAMP = 1766054400000;

const getNthResult = (n: number) => ({
  title: `Support Article ${n}: Troubleshooting Guide`,
  excerpt: `This article provides step-by-step instructions for resolving common issues. Follow the guidance below to troubleshoot problem #${n}.`,
  clickUri: `https://support.example.com/article/${n}`,
  printableUri: `https://support.example.com/article/${n}`,
  uri: `support://article/${n}`,
  uniqueId: `insight-rec-${n}`,
  flags: 'HasHtmlVersion;HasAllMetaDataStream',
  hasHtmlVersion: true,
  hasMobileHtmlVersion: false,
  score: 500 - n * 5,
  percentScore: 50 - n * 0.5,
  rankingInfo: null,
  rating: 0.0,
  isTopResult: n === 0,
  isRecommendation: n < 3,
  isUserActionView: n === 1,
  titleHighlights: [],
  firstSentencesHighlights: [],
  excerptHighlights: [],
  printableUriHighlights: [],
  summaryHighlights: [],
  parentResult: null,
  childResults: [],
  totalNumberOfChildResults: 0,
  absentTerms: [],
  raw: {
    systitle: `Support Article ${n}: Troubleshooting Guide`,
    sysdescription: `This article provides step-by-step instructions for resolving common issues.`,
    sysuri: `https://support.example.com/article/${n}`,
    sysauthor: ['Support Team'],
    sysurihash: `insight-hash-${n}`,
    urihash: `insight-hash-${n}`,
    permanentid: `insight-perm-id-${n}`,
    syslanguage: ['English'],
    date: REFERENCE_TIMESTAMP - n * 86400000,
    sourcetype: 'KnowledgeBase',
    syssource: 'Support Knowledge Base',
    sysdate: REFERENCE_TIMESTAMP - n * 86400000,
    author: ['Support Team'],
    source: 'Support Knowledge Base',
    collection: 'default',
    syssourcetype: 'KnowledgeBase',
    filetype: 'html',
    sysfiletype: 'html',
    language: ['English'],
    syscollection: 'default',
    sfid: n < 5 ? `SF-${1000 + n}` : undefined,
  },
  Title: `Support Article ${n}: Troubleshooting Guide`,
  Uri: `support://article/${n}`,
  PrintableUri: `https://support.example.com/article/${n}`,
  ClickUri: `https://support.example.com/article/${n}`,
  UniqueId: `insight-rec-${n}`,
  Excerpt: `This article provides step-by-step instructions for resolving common issues. Follow the guidance below to troubleshoot problem #${n}.`,
  FirstSentences: null,
});

interface InsightResponse {
  totalCount: number;
  totalCountFiltered: number;
  duration: number;
  indexDuration: number;
  requestDuration: number;
  searchUid: string;
  pipeline: string;
  apiVersion: number;
  queryCorrections: unknown[];
  basicExpression: string | null;
  advancedExpression: string | null;
  largeExpression: string | null;
  constantExpression: string | null;
  disjunctionExpression: string | null;
  mandatoryExpression: string | null;
  userIdentities: unknown[];
  rankingExpressions: unknown[];
  topResults: unknown[];
  executionReport: Record<string, unknown>;
  refinedKeywords: unknown[];
  triggers: unknown[];
  termsToHighlight: Record<string, unknown>;
  phrasesToHighlight: Record<string, unknown>;
  groupByResults: unknown[];
  facets: unknown[];
  suggestedFacets: unknown[];
  categoryFacets: unknown[];
  results: unknown[];
  questionAnswer: Record<string, unknown>;
  extendedResults?: Record<string, unknown>;
}

export const baseResponse: InsightResponse = {
  totalCount: 25,
  totalCountFiltered: 25,
  duration: 125,
  indexDuration: 15,
  requestDuration: 35,
  searchUid: 'insight-search-uid-12345',
  pipeline: 'insight-default',
  apiVersion: 2,
  queryCorrections: [],
  basicExpression: null,
  advancedExpression: null,
  largeExpression: null,
  constantExpression: null,
  disjunctionExpression: null,
  mandatoryExpression: null,
  userIdentities: [
    {
      name: 'agent@example.com',
      provider: 'Email Security Provider',
      type: 'User',
    },
  ],
  rankingExpressions: [],
  topResults: [],
  executionReport: {},
  refinedKeywords: [],
  triggers: [],
  termsToHighlight: {},
  phrasesToHighlight: {},
  groupByResults: [],
  facets: [
    {
      facetId: 'source',
      field: 'source',
      moreValuesAvailable: true,
      values: [
        {
          value: 'Support Knowledge Base',
          state: 'idle',
          numberOfResults: 15,
        },
        {
          value: 'Community Forum',
          state: 'idle',
          numberOfResults: 8,
        },
        {
          value: 'Documentation',
          state: 'idle',
          numberOfResults: 2,
        },
      ],
      indexScore: 0.1,
    },
    {
      facetId: 'filetype',
      field: 'filetype',
      moreValuesAvailable: false,
      values: [
        {
          value: 'html',
          state: 'idle',
          numberOfResults: 18,
        },
        {
          value: 'pdf',
          state: 'idle',
          numberOfResults: 5,
        },
        {
          value: 'SalesforceItem',
          state: 'idle',
          numberOfResults: 2,
        },
      ],
      indexScore: 0.1,
    },
    {
      facetId: 'ytlikecount',
      field: 'ytlikecount',
      moreValuesAvailable: false,
      values: [
        {
          start: 0,
          end: 1000,
          endInclusive: false,
          state: 'idle',
          numberOfResults: 10,
        },
        {
          start: 1000,
          end: 8000,
          endInclusive: false,
          state: 'idle',
          numberOfResults: 8,
        },
        {
          start: 8000,
          end: 100000,
          endInclusive: false,
          state: 'idle',
          numberOfResults: 5,
        },
        {
          start: 100000,
          end: 999999999,
          endInclusive: false,
          state: 'idle',
          numberOfResults: 2,
        },
      ],
      indexScore: 0.08,
    },
    {
      facetId: 'date',
      field: 'date',
      moreValuesAvailable: false,
      values: [
        {
          start: '2025/12/11@00:00:00',
          end: '2025/12/18@23:59:59',
          endInclusive: true,
          state: 'idle',
          numberOfResults: 5,
        },
        {
          start: '2025/11/18@00:00:00',
          end: '2025/12/18@23:59:59',
          endInclusive: true,
          state: 'idle',
          numberOfResults: 15,
        },
        {
          start: '2025/09/18@00:00:00',
          end: '2025/12/18@23:59:59',
          endInclusive: true,
          state: 'idle',
          numberOfResults: 20,
        },
      ],
      indexScore: 0.1,
      domain: {
        start: '2024/01/01@00:00:00',
        end: '2025/12/18@23:59:59',
      },
    },
  ],
  suggestedFacets: [],
  categoryFacets: [],
  results: Array.from({length: 10}, (_, n) => getNthResult(n)),
  questionAnswer: {
    answerFound: true,
    question: 'How do I resolve connection issues?',
    answerSnippet:
      'To resolve connection issues, first check your network settings. Then verify that your firewall is not blocking the application. Finally, try restarting the service.',
    documentId: {
      contentIdKey: 'permanentid',
      contentIdValue: 'insight-perm-id-0',
    },
    score: 0.85,
    relatedQuestions: [
      {
        question: 'What are common network problems?',
        answerSnippet:
          'Common network problems include DNS issues, firewall blocks, and bandwidth limitations.',
        title: 'Network Troubleshooting Guide',
        uri: 'https://support.example.com/network-guide',
        documentId: {
          contentIdKey: 'permanentid',
          contentIdValue: 'insight-perm-id-1',
        },
      },
    ],
  },
  extendedResults: {},
};

export const richResponse: InsightResponse = {
  ...baseResponse,
  totalCount: 50,
  totalCountFiltered: 50,
  results: Array.from({length: 10}, (_, n) => ({
    ...getNthResult(n),
    raw: {
      ...getNthResult(n).raw,
      snrating: n < 5 ? 4.5 - n * 0.5 : undefined,
    },
  })),
};
