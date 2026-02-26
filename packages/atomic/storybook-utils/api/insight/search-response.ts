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

export interface InsightResponse {
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
      facetId: 'objecttype',
      field: 'objecttype',
      moreValuesAvailable: false,
      values: [
        {
          value: 'Case',
          state: 'idle',
          numberOfResults: 12,
        },
        {
          value: 'Article',
          state: 'idle',
          numberOfResults: 8,
        },
        {
          value: 'Ticket',
          state: 'idle',
          numberOfResults: 3,
        },
        {
          value: 'FAQ',
          state: 'idle',
          numberOfResults: 2,
        },
      ],
      indexScore: 0.1,
    },
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

export const smartSnippetSuggestionsResponse: InsightResponse = {
  ...baseResponse,
  results: [
    {
      ...getNthResult(0),
      title: 'Nurse Sharks',
      raw: {
        ...getNthResult(0).raw,
        urihash: 'hLSngTdxUj5Upy7r',
      },
    },
    {
      ...getNthResult(1),
      title: 'Brine Shrimp',
      raw: {
        ...getNthResult(1).raw,
        urihash: '4L6GEE1jMUNYhoC',
      },
    },
    {
      ...getNthResult(2),
      title: 'Dove Snails',
      raw: {
        ...getNthResult(2).raw,
        urihash: 'vrTSILq8VzJAItOq',
      },
    },
  ],
  questionAnswer: {
    documentId: {
      contentIdKey: 'urihash',
      contentIdValue: 'hLSngTdxUj5Upy7r',
    },
    question: 'What are nurse sharks?',
    answerSnippet:
      'Nurse sharks are slow-moving bottom-dwellers known for their docile nature.',
    score: 1337,
    relatedQuestions: [
      {
        question: 'Where does the name "Nurse Sharks" come from?',
        answerSnippet: `
              <p>
                The name nurse shark is thought to be a corruption of <b>nusse</b>, a name which once referred to the <a href="https://fake.local/glossary/catsharks">catsharks</a> of the family Scyliorhinidae.
              </p>
              <p>
                The nurse shark family name, <b>Ginglymostomatidae</b>, derives from old naming roots for "<b>hinge</b>" and "<b>mouth</b>".
              </p>
            `,
        documentId: {
          contentIdKey: 'urihash',
          contentIdValue: 'hLSngTdxUj5Upy7r',
        },
        score: 100,
      },
      {
        question: 'What are sea monkeys?',
        answerSnippet: `
              <p>
                Breeds of Artemia are sold as novelty gifts under the marketing name <a href="https://fake.local/glossary/sea-monkeys">Sea-Monkeys</a>.
              </p>
              <p>
                <b>Artemia</b> is a genus of aquatic crustaceans also known as <b>brine shrimp</b>.
              </p>
            `,
        documentId: {
          contentIdKey: 'urihash',
          contentIdValue: '4L6GEE1jMUNYhoC',
        },
        score: 50,
      },
      {
        question: 'What is a dove snail?',
        answerSnippet: `
              <p>
                The <b>Columbellidae</b>, the dove snails or dove shells, are a family of small sea snails in the order <a href="https://fake.local/glossary/neogastropoda">Neogastropoda</a>.
              </p>
            `,
        documentId: {
          contentIdKey: 'urihash',
          contentIdValue: 'vrTSILq8VzJAItOq',
        },
        score: 25,
      },
    ],
  },
};

const insightChildResult1 = {
  title: 'Related Article: Network Setup',
  excerpt: 'Guide for network configuration',
  clickUri: 'https://support.example.com/article/network',
  uniqueId: 'insight-child-1',
  raw: {
    foldingcollection: 'ConnectionIssues',
    foldingchild: ['network-setup'],
    foldingparent: 'connection-parent',
  },
};

const insightChildResult2 = {
  title: 'Related Article: Firewall Settings',
  excerpt: 'Guide for firewall configuration',
  clickUri: 'https://support.example.com/article/firewall',
  uniqueId: 'insight-child-2',
  raw: {
    foldingcollection: 'ConnectionIssues',
    foldingchild: ['firewall-settings'],
    foldingparent: 'connection-parent',
  },
};

export const baseFoldedResponse: InsightResponse = {
  ...baseResponse,
  totalCount: 2,
  totalCountFiltered: 2,
  results: [
    {
      title: 'Parent Case: Connection Issues',
      excerpt: 'Main case about connection troubleshooting',
      clickUri: 'https://support.example.com/case/parent',
      printableUri: 'https://support.example.com/case/parent',
      uri: 'support://case/parent',
      uniqueId: 'insight-parent-1',
      flags: 'HasHtmlVersion',
      hasHtmlVersion: true,
      hasMobileHtmlVersion: false,
      score: 100,
      percentScore: 95,
      rankingInfo: null,
      rating: 0.0,
      isTopResult: true,
      isRecommendation: false,
      titleHighlights: [],
      firstSentencesHighlights: [],
      excerptHighlights: [],
      printableUriHighlights: [],
      summaryHighlights: [],
      parentResult: null,
      childResults: [insightChildResult1, insightChildResult2],
      totalNumberOfChildResults: 2,
      absentTerms: [],
      raw: {
        systitle: 'Parent Case: Connection Issues',
        sysdescription: 'Main case about connection troubleshooting',
        sysuri: 'https://support.example.com/case/parent',
        foldingcollection: 'ConnectionIssues',
        foldingchild: ['connection-parent'],
      },
      Title: 'Parent Case: Connection Issues',
      Uri: 'support://case/parent',
      PrintableUri: 'https://support.example.com/case/parent',
      ClickUri: 'https://support.example.com/case/parent',
      UniqueId: 'insight-parent-1',
      Excerpt: 'Main case about connection troubleshooting',
      FirstSentences: null,
    },
    {
      title: 'Standalone Article: Quick Tips',
      excerpt: 'Collection of quick troubleshooting tips',
      clickUri: 'https://support.example.com/article/tips',
      printableUri: 'https://support.example.com/article/tips',
      uri: 'support://article/tips',
      uniqueId: 'insight-standalone-1',
      flags: 'HasHtmlVersion',
      hasHtmlVersion: true,
      hasMobileHtmlVersion: false,
      score: 80,
      percentScore: 75,
      rankingInfo: null,
      rating: 0.0,
      isTopResult: false,
      isRecommendation: false,
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
        systitle: 'Standalone Article: Quick Tips',
        sysdescription: 'Collection of quick troubleshooting tips',
        sysuri: 'https://support.example.com/article/tips',
        foldingcollection: 'QuickTips',
        foldingchild: ['quick-tips'],
      },
      Title: 'Standalone Article: Quick Tips',
      Uri: 'support://article/tips',
      PrintableUri: 'https://support.example.com/article/tips',
      ClickUri: 'https://support.example.com/article/tips',
      UniqueId: 'insight-standalone-1',
      Excerpt: 'Collection of quick troubleshooting tips',
      FirstSentences: null,
    },
  ],
};

export const nestedFoldedResponse: InsightResponse = {
  ...baseFoldedResponse,
  results: [
    {
      ...baseFoldedResponse.results[0]!,
      childResults: [
        {
          ...insightChildResult1,
          childResults: [
            {
              title: 'Grandchild: Router Configuration',
              excerpt: 'Detailed router setup instructions',
              clickUri: 'https://support.example.com/article/router',
              uniqueId: 'insight-grandchild-1',
              raw: {
                foldingcollection: 'ConnectionIssues',
                foldingchild: ['router-config'],
                foldingparent: 'network-setup',
              },
            },
          ],
          totalNumberOfChildResults: 1,
        },
        insightChildResult2,
      ],
    },
    baseFoldedResponse.results[1]!,
  ],
};
