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
  generateAutomaticFacets?: {
    facets: unknown[];
  };
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
  facets: [
    {
      facetId: 'objecttype',
      field: 'objecttype',
      moreValuesAvailable: true,
      values: [
        {
          value: 'People',
          state: 'idle',
          numberOfResults: 126786,
        },
        {
          value: 'Contact',
          state: 'idle',
          numberOfResults: 179426,
        },
        {
          value: 'Variant',
          state: 'idle',
          numberOfResults: 30827,
        },
        {
          value: 'Message',
          state: 'idle',
          numberOfResults: 26868,
        },
        {
          value: 'Thread',
          state: 'idle',
          numberOfResults: 7112,
        },
        {
          value: 'Account',
          state: 'idle',
          numberOfResults: 4721,
        },
      ],
      indexScore: 0.08949005905806505,
      label: 'Object type',
    },
  ],
  suggestedFacets: [],
  generateAutomaticFacets: {
    facets: [
      {
        field: 'documenttype',
        label: 'Document Type',
        moreValuesAvailable: true,
        values: [
          {
            value: 'Article',
            state: 'idle',
            numberOfResults: 45,
          },
          {
            value: 'Document',
            state: 'idle',
            numberOfResults: 38,
          },
          {
            value: 'Report',
            state: 'idle',
            numberOfResults: 22,
          },
          {
            value: 'Presentation',
            state: 'idle',
            numberOfResults: 15,
          },
        ],
        indexScore: 0.28,
      },
      {
        field: 'category',
        label: 'Category',
        moreValuesAvailable: true,
        values: [
          {
            value: 'Technology',
            state: 'idle',
            numberOfResults: 52,
          },
          {
            value: 'Business',
            state: 'idle',
            numberOfResults: 41,
          },
          {
            value: 'Science',
            state: 'idle',
            numberOfResults: 27,
          },
        ],
        indexScore: 0.23,
      },
    ],
  },
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
