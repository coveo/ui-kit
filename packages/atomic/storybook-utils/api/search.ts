import {type HttpHandler, HttpResponse, http} from 'msw';
export class SearchApiHarness {
  readonly searchEndpointHandler;
  readonly querySuggestionHandler;
  readonly handlers: HttpHandler[];
  constructor(basePath: string = 'https://:orgId.org.coveo.com') {
    this.searchEndpointHandler = new EndpointHarness(baseSearchResponse);
    this.querySuggestionHandler = new EndpointHarness(baseQuerySuggestResponse);
    this.handlers = [
      http.post(`${basePath}/rest/search/v2`, () =>
        this.searchEndpointHandler.getNextResponse()
      ),
      http.post(`${basePath}/rest/search/v2/querySuggest`, () =>
        this.querySuggestionHandler.getNextResponse()
      ),
    ];
  }
}

class EndpointHarness<TResponse extends {}> {
  private nextResponses: TResponse[] = [];
  constructor(public baseResponse: TResponse) {}

  enqueueNextResponses(...responses: TResponse[]) {
    this.nextResponses.push(...responses);
  }

  flushQueuedResponses() {
    this.nextResponses.length = 0;
  }

  getNextResponse(): HttpResponse<TResponse> {
    return HttpResponse.json(this.nextResponses.shift() ?? this.baseResponse);
  }
}

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

export const baseSearchResponse = {
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

export const baseQuerySuggestResponse = {
  completions: [
    {
      expression: 'coveo',
      score: 100,
      executableConfidence: 1.0,
      highlighted: '[coveo]',
    },
    {
      expression: 'coveo platform',
      score: 95,
      executableConfidence: 0.95,
      highlighted: '[coveo] platform',
    },
    {
      expression: 'coveo search',
      score: 90,
      executableConfidence: 0.9,
      highlighted: '[coveo] search',
    },
    {
      expression: 'coveo ui kit',
      score: 85,
      executableConfidence: 0.85,
      highlighted: '[coveo] ui kit',
    },
    {
      expression: 'coveo headless',
      score: 80,
      executableConfidence: 0.8,
      highlighted: '[coveo] headless',
    },
  ],
};
