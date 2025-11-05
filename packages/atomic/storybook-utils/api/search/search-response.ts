const getNthResult = (n: number) => ({
  title: `Sample Result ${n}`,
  excerpt: 'This is a sample result excerpt for testing.',
  clickUri: `https://example.com/search/${n}`,
  uniqueId: `rec-${n}`,
  raw: {
    systitle: `Sample Result ${n}`,
    sysdescription: 'This is a sample result excerpt for testing.',
    sysuri: `https://example.com/search/${n}`,
  },
});

interface Response {
  totalCount: number;
  totalCountFiltered: number;
  duration: number;
  indexDuration: number;
  requestDuration: number;
  searchUid: string;
  pipeline: string;
  index?: string;
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

export const baseResponse: Response = {
  totalCount: 120,
  totalCountFiltered: 120,
  duration: 175,
  indexDuration: 18,
  requestDuration: 41,
  searchUid: '2971cca7-90b4-4b64-97dd-5dac45c1cc43',
  pipeline: 'genqatest',
  apiVersion: 2,
  queryCorrections: [],
  basicExpression: 'how to resolve netflix connection with tivo',
  advancedExpression: null,
  largeExpression: null,
  constantExpression: null,
  disjunctionExpression: null,
  mandatoryExpression: null,
  userIdentities: [
    {
      name: 'anonymous_user@anonymous.coveo.com',
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
  facets: [],
  suggestedFacets: [],
  categoryFacets: [],
  results: Array.from({length: 120}, (_, n) => getNthResult(n)),
  questionAnswer: {
    answerFound: false,
    question: '',
    answerSnippet: '',
    documentId: {
      contentIdKey: '',
      contentIdValue: '',
    },
    score: 0.0,
    relatedQuestions: [],
  },
};

// Ultra-minimal folded response inspired by getNthResult
export const baseFoldedResponse: Response = {
  totalCount: 2,
  totalCountFiltered: 2,
  duration: 15,
  indexDuration: 5,
  requestDuration: 3,
  searchUid: 'minimal-folded-response',
  pipeline: 'default',
  apiVersion: 2,
  queryCorrections: [],
  basicExpression: null,
  advancedExpression: null,
  largeExpression: null,
  constantExpression: null,
  disjunctionExpression: null,
  mandatoryExpression: null,
  userIdentities: [],
  rankingExpressions: [],
  topResults: [],
  executionReport: {},
  refinedKeywords: [],
  triggers: [],
  termsToHighlight: {},
  phrasesToHighlight: {},
  groupByResults: [],
  facets: [],
  suggestedFacets: [],
  categoryFacets: [],
  results: [
    // Parent result with children - minimal fields only
    {
      title: 'Animals',
      excerpt: 'Collection of animals',
      clickUri: 'https://example.com/animals',
      uniqueId: 'animals-parent',
      childResults: [
        {
          title: 'Cats',
          excerpt: 'Cat species',
          clickUri: 'https://example.com/cats',
          uniqueId: 'cats-child',
          raw: {
            foldingcollection: 'Animals',
            foldingchild: ['cats'],
            foldingparent: 'animals',
          },
        },
        {
          title: 'Dogs',
          excerpt: 'Dog species',
          clickUri: 'https://example.com/dogs',
          uniqueId: 'dogs-child',
          raw: {
            foldingcollection: 'Animals',
            foldingchild: ['dogs'],
            foldingparent: 'animals',
          },
        },
      ],
      totalNumberOfChildResults: 2,
      raw: {
        foldingcollection: 'Animals',
        foldingchild: ['animals'],
      },
    },
    // Standalone result - minimal fields only
    {
      title: 'Plants',
      excerpt: 'Plant collection',
      clickUri: 'https://example.com/plants',
      uniqueId: 'plants-standalone',
      childResults: [],
      totalNumberOfChildResults: 0,
      raw: {
        foldingcollection: 'Plants',
        foldingchild: ['plants'],
      },
    },
  ],
  questionAnswer: {
    answerFound: false,
    question: '',
    answerSnippet: '',
    documentId: {
      contentIdKey: '',
      contentIdValue: '',
    },
    score: 0.0,
    relatedQuestions: [],
  },
  extendedResults: {},
};
