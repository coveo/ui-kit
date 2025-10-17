import {getSchemaValidator} from './open-api-schema.js';

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

export const baseResponse = {
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

export const validateResponse = getSchemaValidator('RestQueryResponse');
