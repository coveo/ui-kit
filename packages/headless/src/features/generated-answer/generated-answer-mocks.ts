/** biome-ignore-all lint/suspicious/noExplicitAny: <mock> */
/* eslint-disable @cspell/spellchecker */
import type {StreamAnswerAPIState} from '../../api/knowledge/stream-answer-api-state.js';

const atomicVersion = '2.77.0';

export const streamAnswerAPIStateMock: StreamAnswerAPIState = {
  configuration: {
    organizationId: 'lbergeronsfdevt1z2624x',
    environment: 'dev',
    accessToken: 'x7d408c4b-5b56-40b0-9cc5-eb6e9bf7a7f8',
    search: {
      locale: 'en',
      timezone: 'America/New_York',
      authenticationProviders: [],
    },
    analytics: {
      enabled: false,
      originContext: 'Search',
      originLevel2: 'default',
      originLevel3: 'http://localhost:3333/examples/genqa.html',
      anonymous: false,
      deviceId: '',
      userDisplayName: '',
      documentLocation:
        'http://localhost:3333/examples/genqa.html#q=what%20is%20the%20hardest%20wood',
      trackingId: '',
      analyticsMode: 'next',
      source: {
        '@coveo/atomic': atomicVersion,
      },
    },
    knowledge: {
      answerConfigurationId: '',
    },
  },
  insightConfiguration: {
    insightId: 'insight-id',
  },
  version: atomicVersion,
  debug: false,
  pipeline: '',
  searchHub: 'jstpierre2 test - Woods test',
  search: {
    response: {
      results: [],
      searchUid: '',
      totalCountFiltered: 0,
      facets: [],
      generateAutomaticFacets: {
        facets: [],
      },
      queryCorrections: [],
      triggers: [],
      questionAnswer: {
        answerSnippet: '',
        documentId: {
          contentIdKey: '',
          contentIdValue: '',
        },
        question: '',
        relatedQuestions: [],
        score: 0,
      },
      pipeline: '',
      splitTestRun: '',
      termsToHighlight: {},
      phrasesToHighlight: {},
      extendedResults: {},
    },
    duration: 0,
    queryExecuted: '',
    error: null,
    automaticallyCorrected: false,
    isLoading: true,
    results: [],
    searchResponseId: '',
    requestId: 'uyb6Ti2pkk5whKHzOiX58',
    questionAnswer: {
      answerSnippet: '',
      documentId: {
        contentIdKey: '',
        contentIdValue: '',
      },
      question: '',
      relatedQuestions: [],
      score: 0,
    },
    extendedResults: {},
    searchAction: {actionCause: 'searchboxSubmit'},
  },
  fields: {
    fieldsToInclude: [
      'author',
      'language',
      'urihash',
      'objecttype',
      'collection',
      'source',
      'permanentid',
      'date',
      'filetype',
      'parents',
      'ec_price',
      'ec_name',
      'ec_description',
      'ec_brand',
      'ec_category',
      'ec_item_group_id',
      'ec_shortdesc',
      'ec_thumbnails',
      'ec_images',
      'ec_promo_price',
      'ec_in_stock',
      'ec_rating',
      'snrating',
      'sncost',
    ],
    fetchAllFields: false,
    fieldsDescription: [],
  },
  facetOptions: {
    freezeFacetOrder: false,
    facets: {
      ytviewcount_input_range: {
        enabled: true,
      },
      ytviewcount: {
        enabled: false,
      },
      ytviewcount_input: {
        enabled: true,
      },
      sncost: {
        enabled: true,
      },
      ytlikecount: {
        enabled: false,
      },
      geographicalhierarchy: {
        enabled: true,
      },
      filetype: {
        enabled: true,
      },
      author: {
        enabled: true,
      },
      source: {
        enabled: true,
      },
      year: {
        enabled: true,
      },
      snrating_range: {
        enabled: true,
      },
      snrating: {
        enabled: true,
      },
      date: {
        enabled: true,
      },
      date_input_range: {
        enabled: true,
      },
      date_input: {
        enabled: true,
      },
    },
  },
  pagination: {
    firstResult: 0,
    defaultNumberOfResults: 10,
    numberOfResults: 10,
    totalCountFiltered: 0,
  },
  triggers: {
    redirectTo: '',
    query: '',
    executions: [],
    notifications: [],
    queryModification: {
      originalQuery: '',
      newQuery: '',
      queryToIgnore: '',
    },
  },
  query: {
    q: 'what is the hardest wood',
    enableQuerySyntax: false,
  },
  advancedSearchQueries: {
    aq: 'aq-test-query',
    aqWasSet: true,
    cq: 'cq-test-query',
    cqWasSet: true,
    dq: 'dq-test-query',
    dqWasSet: true,
    lq: 'lq-test-query',
    lqWasSet: true,
    defaultFilters: {
      cq: '',
      aq: '',
      lq: '',
      dq: '',
    },
  },
  context: {
    contextValues: {
      testKey: 'testValue',
    },
  },
  querySuggest: {},
  querySet: {
    'atomic-search-box-ie7ah': 'what is the hardest wood',
  },
  facetSet: {
    filetype: {
      request: {
        filterFacetCount: true,
        injectionDepth: 1000,
        numberOfValues: 6,
        sortCriteria: 'occurrences',
        resultsMustMatch: 'atLeastOneValue',
        type: 'specific',
        currentValues: [],
        freezeCurrentValues: false,
        isFieldExpanded: false,
        preventAutoSelect: false,
        facetId: 'filetype',
        field: 'filetype',
      },
      hasBreadcrumbs: true,
    },
    author: {
      request: {
        filterFacetCount: true,
        injectionDepth: 1000,
        numberOfValues: 8,
        sortCriteria: 'automatic',
        resultsMustMatch: 'atLeastOneValue',
        type: 'specific',
        currentValues: [],
        freezeCurrentValues: false,
        isFieldExpanded: false,
        preventAutoSelect: false,
        facetId: 'author',
        field: 'author',
      },
      hasBreadcrumbs: true,
    },
    source: {
      request: {
        filterFacetCount: true,
        injectionDepth: 1000,
        numberOfValues: 8,
        sortCriteria: 'automatic',
        resultsMustMatch: 'atLeastOneValue',
        type: 'specific',
        currentValues: [],
        freezeCurrentValues: false,
        isFieldExpanded: false,
        preventAutoSelect: false,
        facetId: 'source',
        field: 'source',
      },
      hasBreadcrumbs: true,
    },
    year: {
      request: {
        filterFacetCount: true,
        injectionDepth: 1000,
        numberOfValues: 8,
        sortCriteria: 'automatic',
        resultsMustMatch: 'atLeastOneValue',
        type: 'specific',
        currentValues: [],
        freezeCurrentValues: false,
        isFieldExpanded: false,
        preventAutoSelect: false,
        facetId: 'year',
        field: 'year',
      },
      hasBreadcrumbs: true,
    },
  },
  numericFacetSet: {
    ytviewcount_input_range: {
      request: {
        filterFacetCount: true,
        injectionDepth: 1000,
        numberOfValues: 1,
        sortCriteria: 'ascending',
        rangeAlgorithm: 'equiprobable',
        resultsMustMatch: 'atLeastOneValue',
        currentValues: [],
        preventAutoSelect: false,
        type: 'numericalRange',
        generateAutomaticRanges: true,
        facetId: 'ytviewcount_input_range',
        field: 'ytviewcount',
      },
    },
    ytviewcount: {
      request: {
        filterFacetCount: true,
        injectionDepth: 1000,
        numberOfValues: 8,
        sortCriteria: 'ascending',
        rangeAlgorithm: 'equiprobable',
        resultsMustMatch: 'atLeastOneValue',
        currentValues: [],
        preventAutoSelect: false,
        type: 'numericalRange',
        facetId: 'ytviewcount',
        field: 'ytviewcount',
        generateAutomaticRanges: true,
      },
    },
    ytviewcount_input: {
      request: {
        filterFacetCount: true,
        injectionDepth: 1000,
        numberOfValues: 0,
        sortCriteria: 'ascending',
        rangeAlgorithm: 'even',
        resultsMustMatch: 'atLeastOneValue',
        currentValues: [],
        preventAutoSelect: false,
        type: 'numericalRange',
        facetId: 'ytviewcount_input',
        field: 'ytviewcount',
        generateAutomaticRanges: false,
      },
    },
    sncost: {
      request: {
        filterFacetCount: true,
        injectionDepth: 1000,
        numberOfValues: 8,
        sortCriteria: 'ascending',
        rangeAlgorithm: 'equiprobable',
        resultsMustMatch: 'atLeastOneValue',
        currentValues: [],
        preventAutoSelect: false,
        type: 'numericalRange',
        facetId: 'sncost',
        field: 'sncost',
        generateAutomaticRanges: true,
      },
    },
    ytlikecount: {
      request: {
        filterFacetCount: true,
        injectionDepth: 1000,
        numberOfValues: 4,
        sortCriteria: 'ascending',
        rangeAlgorithm: 'equiprobable',
        resultsMustMatch: 'atLeastOneValue',
        currentValues: [
          {
            endInclusive: false,
            state: 'idle',
            start: 0,
            end: 1000,
          },
          {
            endInclusive: false,
            state: 'idle',
            start: 1000,
            end: 8000,
          },
          {
            endInclusive: false,
            state: 'idle',
            start: 8000,
            end: 100000,
          },
          {
            endInclusive: false,
            state: 'idle',
            start: 100000,
            end: 999999999,
          },
        ],
        preventAutoSelect: false,
        type: 'numericalRange',
        facetId: 'ytlikecount',
        field: 'ytlikecount',
        generateAutomaticRanges: false,
      },
    },
    snrating_range: {
      request: {
        filterFacetCount: true,
        injectionDepth: 1000,
        numberOfValues: 5,
        sortCriteria: 'descending',
        rangeAlgorithm: 'even',
        resultsMustMatch: 'atLeastOneValue',
        currentValues: [
          {
            endInclusive: true,
            state: 'idle',
            start: 1,
            end: 5,
          },
          {
            endInclusive: true,
            state: 'idle',
            start: 2,
            end: 5,
          },
          {
            endInclusive: true,
            state: 'idle',
            start: 3,
            end: 5,
          },
          {
            endInclusive: true,
            state: 'idle',
            start: 4,
            end: 5,
          },
          {
            endInclusive: true,
            state: 'idle',
            start: 5,
            end: 5,
          },
        ],
        preventAutoSelect: false,
        type: 'numericalRange',
        facetId: 'snrating_range',
        field: 'snrating',
        generateAutomaticRanges: false,
      },
    },
    snrating: {
      request: {
        filterFacetCount: true,
        injectionDepth: 1000,
        numberOfValues: 5,
        sortCriteria: 'descending',
        rangeAlgorithm: 'even',
        resultsMustMatch: 'atLeastOneValue',
        currentValues: [
          {
            endInclusive: false,
            state: 'idle',
            start: 1,
            end: 2,
          },
          {
            endInclusive: false,
            state: 'idle',
            start: 2,
            end: 3,
          },
          {
            endInclusive: false,
            state: 'idle',
            start: 3,
            end: 4,
          },
          {
            endInclusive: false,
            state: 'idle',
            start: 4,
            end: 5,
          },
          {
            endInclusive: false,
            state: 'idle',
            start: 5,
            end: 6,
          },
        ],
        preventAutoSelect: false,
        type: 'numericalRange',
        facetId: 'snrating',
        field: 'snrating',
        generateAutomaticRanges: false,
      },
    },
  },
  dateFacetSet: {
    date: {
      request: {
        filterFacetCount: true,
        injectionDepth: 1000,
        numberOfValues: 7,
        sortCriteria: 'descending',
        rangeAlgorithm: 'even',
        resultsMustMatch: 'atLeastOneValue',
        currentValues: [
          {
            start: 'past-1-hour',
            end: 'now',
            endInclusive: false,
            state: 'idle',
          },
          {
            start: 'past-1-day',
            end: 'now',
            endInclusive: false,
            state: 'idle',
          },
          {
            start: 'past-1-week',
            end: 'now',
            endInclusive: false,
            state: 'idle',
          },
          {
            start: 'past-1-month',
            end: 'now',
            endInclusive: false,
            state: 'idle',
          },
          {
            start: 'past-1-quarter',
            end: 'now',
            endInclusive: false,
            state: 'idle',
          },
          {
            start: 'past-1-year',
            end: 'now',
            endInclusive: false,
            state: 'idle',
          },
          {
            start: 'now',
            end: 'next-10-year',
            endInclusive: false,
            state: 'idle',
          },
        ],
        preventAutoSelect: false,
        type: 'dateRange',
        facetId: 'date',
        field: 'date',
        generateAutomaticRanges: false,
      },
    },
    date_input_range: {
      request: {
        filterFacetCount: true,
        injectionDepth: 1000,
        numberOfValues: 1,
        sortCriteria: 'ascending',
        rangeAlgorithm: 'even',
        resultsMustMatch: 'atLeastOneValue',
        currentValues: [],
        preventAutoSelect: false,
        type: 'dateRange',
        facetId: 'date_input_range',
        generateAutomaticRanges: true,
        field: 'date',
      },
    },
    date_input: {
      request: {
        filterFacetCount: true,
        injectionDepth: 1000,
        numberOfValues: 0,
        sortCriteria: 'ascending',
        rangeAlgorithm: 'even',
        resultsMustMatch: 'atLeastOneValue',
        currentValues: [],
        preventAutoSelect: false,
        type: 'dateRange',
        facetId: 'date_input',
        field: 'date',
        generateAutomaticRanges: false,
      },
    },
  },
  categoryFacetSet: {
    geographicalhierarchy: {
      request: {
        delimitingCharacter: ';',
        filterFacetCount: true,
        injectionDepth: 1000,
        numberOfValues: 8,
        sortCriteria: 'occurrences',
        basePath: [],
        filterByBasePath: true,
        resultsMustMatch: 'atLeastOneValue',
        currentValues: [],
        preventAutoSelect: false,
        type: 'hierarchical',
        facetId: 'geographicalhierarchy',
        field: 'geographicalhierarchy',
      },
      initialNumberOfValues: 8,
    },
  },
  tabSet: {
    default: {
      id: 'default',
      expression: '',
      isActive: true,
    },
  },
  categoryFacetSearchSet: {
    geographicalhierarchy: {
      options: {
        captions: {},
        numberOfValues: 8,
        query: '',
      },
      isLoading: false,
      response: {
        moreValuesAvailable: false,
        values: [],
      },
      initialNumberOfValues: 8,
      requestId: '',
    },
  },
  facetSearchSet: {
    filetype: {
      options: {
        captions: {},
        numberOfValues: 6,
        query: '',
      },
      isLoading: false,
      response: {
        moreValuesAvailable: false,
        values: [],
      },
      initialNumberOfValues: 6,
      requestId: '',
    },
    author: {
      options: {
        captions: {},
        numberOfValues: 8,
        query: '',
      },
      isLoading: false,
      response: {
        moreValuesAvailable: false,
        values: [],
      },
      initialNumberOfValues: 8,
      requestId: '',
    },
    source: {
      options: {
        captions: {},
        numberOfValues: 8,
        query: '',
      },
      isLoading: false,
      response: {
        moreValuesAvailable: false,
        values: [],
      },
      initialNumberOfValues: 8,
      requestId: '',
    },
    year: {
      options: {
        captions: {},
        numberOfValues: 8,
        query: '',
      },
      isLoading: false,
      response: {
        moreValuesAvailable: false,
        values: [],
      },
      initialNumberOfValues: 8,
      requestId: '',
    },
  },
  history: {
    past: [],
    future: [],
  },
  facetOrder: [],
  sortCriteria: 'relevancy',
  didYouMean: {
    enableDidYouMean: true,
    wasCorrectedTo: '',
    wasAutomaticallyCorrected: false,
    queryCorrection: {
      correctedQuery: '',
      wordCorrections: [],
    },
    originalQuery: '',
    automaticallyCorrectQuery: true,
    queryCorrectionMode: 'legacy',
  },
  answer: {
    queries: {
      'getAnswer({"enableDidYouMean":true,"facets":[{"currentValues":[],"facetId":"author","field":"author","filterFacetCount":true,"freezeCurrentValues":false,"injectionDepth":1000,"isFieldExpanded":false,"numberOfValues":8,"preventAutoSelect":false,"resultsMustMatch":"atLeastOneValue","sortCriteria":"automatic","type":"specific"},{"currentValues":[{"end":"2024/08/16@14:55:59","endInclusive":false,"start":"2024/08/16@13:55:59","state":"idle"},{"end":"2024/08/16@14:55:59","endInclusive":false,"start":"2024/08/15@14:55:59","state":"idle"},{"end":"2024/08/16@14:55:59","endInclusive":false,"start":"2024/08/09@14:55:59","state":"idle"},{"end":"2024/08/16@14:55:59","endInclusive":false,"start":"2024/07/16@14:55:59","state":"idle"},{"end":"2024/08/16@14:55:59","endInclusive":false,"start":"2024/05/16@14:55:59","state":"idle"},{"end":"2024/08/16@14:55:59","endInclusive":false,"start":"2023/08/16@14:55:59","state":"idle"},{"end":"2034/08/16@14:55:59","endInclusive":false,"start":"2024/08/16@14:55:59","state":"idle"}],"facetId":"date","field":"date","filterFacetCount":true,"generateAutomaticRanges":false,"injectionDepth":1000,"numberOfValues":7,"preventAutoSelect":false,"rangeAlgorithm":"even","resultsMustMatch":"atLeastOneValue","sortCriteria":"descending","type":"dateRange"},{"currentValues":[],"facetId":"date_input","field":"date","filterFacetCount":true,"generateAutomaticRanges":false,"injectionDepth":1000,"numberOfValues":0,"preventAutoSelect":false,"rangeAlgorithm":"even","resultsMustMatch":"atLeastOneValue","sortCriteria":"ascending","type":"dateRange"},{"currentValues":[],"facetId":"date_input_range","field":"date","filterFacetCount":true,"generateAutomaticRanges":true,"injectionDepth":1000,"numberOfValues":1,"preventAutoSelect":false,"rangeAlgorithm":"even","resultsMustMatch":"atLeastOneValue","sortCriteria":"ascending","type":"dateRange"},{"currentValues":[],"facetId":"filetype","field":"filetype","filterFacetCount":true,"freezeCurrentValues":false,"injectionDepth":1000,"isFieldExpanded":false,"numberOfValues":6,"preventAutoSelect":false,"resultsMustMatch":"atLeastOneValue","sortCriteria":"occurrences","type":"specific"},{"basePath":[],"currentValues":[],"delimitingCharacter":";","facetId":"geographicalhierarchy","field":"geographicalhierarchy","filterByBasePath":true,"filterFacetCount":true,"injectionDepth":1000,"numberOfValues":8,"preventAutoSelect":false,"resultsMustMatch":"atLeastOneValue","sortCriteria":"occurrences","type":"hierarchical"},{"currentValues":[],"facetId":"sncost","field":"sncost","filterFacetCount":true,"generateAutomaticRanges":true,"injectionDepth":1000,"numberOfValues":8,"preventAutoSelect":false,"rangeAlgorithm":"equiprobable","resultsMustMatch":"atLeastOneValue","sortCriteria":"ascending","type":"numericalRange"},{"currentValues":[{"end":2,"endInclusive":false,"start":1,"state":"idle"},{"end":3,"endInclusive":false,"start":2,"state":"idle"},{"end":4,"endInclusive":false,"start":3,"state":"idle"},{"end":5,"endInclusive":false,"start":4,"state":"idle"},{"end":6,"endInclusive":false,"start":5,"state":"idle"}],"facetId":"snrating","field":"snrating","filterFacetCount":true,"generateAutomaticRanges":false,"injectionDepth":1000,"numberOfValues":5,"preventAutoSelect":false,"rangeAlgorithm":"even","resultsMustMatch":"atLeastOneValue","sortCriteria":"descending","type":"numericalRange"},{"currentValues":[{"end":5,"endInclusive":true,"start":1,"state":"idle"},{"end":5,"endInclusive":true,"start":2,"state":"idle"},{"end":5,"endInclusive":true,"start":3,"state":"idle"},{"end":5,"endInclusive":true,"start":4,"state":"idle"},{"end":5,"endInclusive":true,"start":5,"state":"idle"}],"facetId":"snrating_range","field":"snrating","filterFacetCount":true,"generateAutomaticRanges":false,"injectionDepth":1000,"numberOfValues":5,"preventAutoSelect":false,"rangeAlgorithm":"even","resultsMustMatch":"atLeastOneValue","sortCriteria":"descending","type":"numericalRange"},{"currentValues":[],"facetId":"source","field":"source","filterFacetCount":true,"freezeCurrentValues":false,"injectionDepth":1000,"isFieldExpanded":false,"numberOfValues":8,"preventAutoSelect":false,"resultsMustMatch":"atLeastOneValue","sortCriteria":"automatic","type":"specific"},{"currentValues":[],"facetId":"year","field":"year","filterFacetCount":true,"freezeCurrentValues":false,"injectionDepth":1000,"isFieldExpanded":false,"numberOfValues":8,"preventAutoSelect":false,"resultsMustMatch":"atLeastOneValue","sortCriteria":"automatic","type":"specific"},{"currentValues":[],"facetId":"ytviewcount_input","field":"ytviewcount","filterFacetCount":true,"generateAutomaticRanges":false,"injectionDepth":1000,"numberOfValues":0,"preventAutoSelect":false,"rangeAlgorithm":"even","resultsMustMatch":"atLeastOneValue","sortCriteria":"ascending","type":"numericalRange"},{"currentValues":[],"facetId":"ytviewcount_input_range","field":"ytviewcount","filterFacetCount":true,"generateAutomaticRanges":true,"injectionDepth":1000,"numberOfValues":1,"preventAutoSelect":false,"rangeAlgorithm":"equiprobable","resultsMustMatch":"atLeastOneValue","sortCriteria":"ascending","type":"numericalRange"}],"fieldsToInclude":["author","language","urihash","objecttype","collection","source","permanentid","date","filetype","parents","ec_price","ec_name","ec_description","ec_brand","ec_category","ec_item_group_id","ec_shortdesc","ec_thumbnails","ec_images","ec_promo_price","ec_in_stock","ec_rating","snrating","sncost"],"firstResult":0,"numberOfResults":10,"pipelineRuleParameters":{"mlGenerativeQuestionAnswering":{"citationsFieldToInclude":[],"responseFormat":{"contentFormat":["text/markdown","text/plain"]}}},"q":"what is the hardest wood","queryCorrection":{"enabled":false,"options":{"automaticallyCorrect":"whenNoResults"}},"searchHub":"jstpierre2 test - Woods test","tab":"default"})':
        {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          status: 'pending' as any,
          endpointName: 'getAnswer',
          requestId: 'ePS46iWmVlz23hfyR8TVQ',
          data: {
            answerId: 'answerId1234',
          },
          //@ts-expect-error - This is a mock
          originalArgs: {
            q: 'what is the hardest wood',
            pipelineRuleParameters: {
              mlGenerativeQuestionAnswering: {
                responseFormat: {
                  contentFormat: ['text/markdown', 'text/plain'],
                },
                citationsFieldToInclude: [],
              },
            },
            searchHub: 'jstpierre2 test - Woods test',
            facets: [
              {
                filterFacetCount: true,
                injectionDepth: 1000,
                numberOfValues: 8,
                sortCriteria: 'automatic',
                resultsMustMatch: 'atLeastOneValue',
                type: 'specific',
                currentValues: [],
                freezeCurrentValues: false,
                isFieldExpanded: false,
                preventAutoSelect: false,
                facetId: 'author',
                field: 'author',
              },
              {
                filterFacetCount: true,
                injectionDepth: 1000,
                numberOfValues: 7,
                sortCriteria: 'descending',
                rangeAlgorithm: 'even',
                resultsMustMatch: 'atLeastOneValue',
                currentValues: [
                  {
                    start: '2024/08/16@13:55:59',
                    end: '2024/08/16@14:55:59',
                    endInclusive: false,
                    state: 'idle',
                  },
                  {
                    start: '2024/08/15@14:55:59',
                    end: '2024/08/16@14:55:59',
                    endInclusive: false,
                    state: 'idle',
                  },
                  {
                    start: '2024/08/09@14:55:59',
                    end: '2024/08/16@14:55:59',
                    endInclusive: false,
                    state: 'idle',
                  },
                  {
                    start: '2024/07/16@14:55:59',
                    end: '2024/08/16@14:55:59',
                    endInclusive: false,
                    state: 'idle',
                  },
                  {
                    start: '2024/05/16@14:55:59',
                    end: '2024/08/16@14:55:59',
                    endInclusive: false,
                    state: 'idle',
                  },
                  {
                    start: '2023/08/16@14:55:59',
                    end: '2024/08/16@14:55:59',
                    endInclusive: false,
                    state: 'idle',
                  },
                  {
                    start: '2024/08/16@14:55:59',
                    end: '2034/08/16@14:55:59',
                    endInclusive: false,
                    state: 'idle',
                  },
                ],
                preventAutoSelect: false,
                type: 'dateRange',
                facetId: 'date',
                field: 'date',
                generateAutomaticRanges: false,
              },
              {
                filterFacetCount: true,
                injectionDepth: 1000,
                numberOfValues: 0,
                sortCriteria: 'ascending',
                rangeAlgorithm: 'even',
                resultsMustMatch: 'atLeastOneValue',
                currentValues: [],
                preventAutoSelect: false,
                type: 'dateRange',
                facetId: 'date_input',
                field: 'date',
                generateAutomaticRanges: false,
              },
              {
                filterFacetCount: true,
                injectionDepth: 1000,
                numberOfValues: 1,
                sortCriteria: 'ascending',
                rangeAlgorithm: 'even',
                resultsMustMatch: 'atLeastOneValue',
                currentValues: [],
                preventAutoSelect: false,
                type: 'dateRange',
                facetId: 'date_input_range',
                generateAutomaticRanges: true,
                field: 'date',
              },
              {
                filterFacetCount: true,
                injectionDepth: 1000,
                numberOfValues: 6,
                sortCriteria: 'occurrences',
                resultsMustMatch: 'atLeastOneValue',
                type: 'specific',
                currentValues: [],
                freezeCurrentValues: false,
                isFieldExpanded: false,
                preventAutoSelect: false,
                facetId: 'filetype',
                field: 'filetype',
              },
              {
                delimitingCharacter: ';',
                filterFacetCount: true,
                injectionDepth: 1000,
                numberOfValues: 8,
                sortCriteria: 'occurrences',
                basePath: [],
                filterByBasePath: true,
                resultsMustMatch: 'atLeastOneValue',
                currentValues: [],
                preventAutoSelect: false,
                type: 'hierarchical',
                facetId: 'geographicalhierarchy',
                field: 'geographicalhierarchy',
              },
              {
                filterFacetCount: true,
                injectionDepth: 1000,
                numberOfValues: 8,
                sortCriteria: 'ascending',
                rangeAlgorithm: 'equiprobable',
                resultsMustMatch: 'atLeastOneValue',
                currentValues: [],
                preventAutoSelect: false,
                type: 'numericalRange',
                facetId: 'sncost',
                field: 'sncost',
                generateAutomaticRanges: true,
              },
              {
                filterFacetCount: true,
                injectionDepth: 1000,
                numberOfValues: 5,
                sortCriteria: 'descending',
                rangeAlgorithm: 'even',
                resultsMustMatch: 'atLeastOneValue',
                currentValues: [
                  {
                    endInclusive: false,
                    state: 'idle',
                    start: 1,
                    end: 2,
                  },
                  {
                    endInclusive: false,
                    state: 'idle',
                    start: 2,
                    end: 3,
                  },
                  {
                    endInclusive: false,
                    state: 'idle',
                    start: 3,
                    end: 4,
                  },
                  {
                    endInclusive: false,
                    state: 'idle',
                    start: 4,
                    end: 5,
                  },
                  {
                    endInclusive: false,
                    state: 'idle',
                    start: 5,
                    end: 6,
                  },
                ],
                preventAutoSelect: false,
                type: 'numericalRange',
                facetId: 'snrating',
                field: 'snrating',
                generateAutomaticRanges: false,
              },
              {
                filterFacetCount: true,
                injectionDepth: 1000,
                numberOfValues: 5,
                sortCriteria: 'descending',
                rangeAlgorithm: 'even',
                resultsMustMatch: 'atLeastOneValue',
                currentValues: [
                  {
                    endInclusive: true,
                    state: 'idle',
                    start: 1,
                    end: 5,
                  },
                  {
                    endInclusive: true,
                    state: 'idle',
                    start: 2,
                    end: 5,
                  },
                  {
                    endInclusive: true,
                    state: 'idle',
                    start: 3,
                    end: 5,
                  },
                  {
                    endInclusive: true,
                    state: 'idle',
                    start: 4,
                    end: 5,
                  },
                  {
                    endInclusive: true,
                    state: 'idle',
                    start: 5,
                    end: 5,
                  },
                ],
                preventAutoSelect: false,
                type: 'numericalRange',
                facetId: 'snrating_range',
                field: 'snrating',
                generateAutomaticRanges: false,
              },
              {
                filterFacetCount: true,
                injectionDepth: 1000,
                numberOfValues: 8,
                sortCriteria: 'automatic',
                resultsMustMatch: 'atLeastOneValue',
                type: 'specific',
                currentValues: [],
                freezeCurrentValues: false,
                isFieldExpanded: false,
                preventAutoSelect: false,
                facetId: 'source',
                field: 'source',
              },
              {
                filterFacetCount: true,
                injectionDepth: 1000,
                numberOfValues: 8,
                sortCriteria: 'automatic',
                resultsMustMatch: 'atLeastOneValue',
                type: 'specific',
                currentValues: [],
                freezeCurrentValues: false,
                isFieldExpanded: false,
                preventAutoSelect: false,
                facetId: 'year',
                field: 'year',
              },
              {
                filterFacetCount: true,
                injectionDepth: 1000,
                numberOfValues: 0,
                sortCriteria: 'ascending',
                rangeAlgorithm: 'even',
                resultsMustMatch: 'atLeastOneValue',
                currentValues: [],
                preventAutoSelect: false,
                type: 'numericalRange',
                facetId: 'ytviewcount_input',
                field: 'ytviewcount',
                generateAutomaticRanges: false,
              },
              {
                filterFacetCount: true,
                injectionDepth: 1000,
                numberOfValues: 1,
                sortCriteria: 'ascending',
                rangeAlgorithm: 'equiprobable',
                resultsMustMatch: 'atLeastOneValue',
                currentValues: [],
                preventAutoSelect: false,
                type: 'numericalRange',
                generateAutomaticRanges: true,
                facetId: 'ytviewcount_input_range',
                field: 'ytviewcount',
              },
            ],
            fieldsToInclude: [
              'author',
              'language',
              'urihash',
              'objecttype',
              'collection',
              'source',
              'permanentid',
              'date',
              'filetype',
              'parents',
              'ec_price',
              'ec_name',
              'ec_description',
              'ec_brand',
              'ec_category',
              'ec_item_group_id',
              'ec_shortdesc',
              'ec_thumbnails',
              'ec_images',
              'ec_promo_price',
              'ec_in_stock',
              'ec_rating',
              'snrating',
              'sncost',
            ],
            queryCorrection: {
              enabled: false,
              options: {
                automaticallyCorrect: 'whenNoResults',
              },
            },
            enableDidYouMean: true,
            numberOfResults: 10,
            firstResult: 0,
            tab: 'default',
          },
          startedTimeStamp: 1723834559240,
        },
    },
    mutations: {},
    provided: {},
    subscriptions: {},
    config: {
      online: true,
      focused: true,
      middlewareRegistered: false,
      refetchOnFocus: false,
      refetchOnReconnect: false,
      refetchOnMountOrArgChange: false,
      keepUnusedDataFor: 60,
      reducerPath: 'answer',
      invalidationBehavior: 'delayed',
    },
  },
  generatedAnswer: {
    id: '',
    isVisible: true,
    isEnabled: true,
    isLoading: false,
    isStreaming: false,
    citations: [],
    liked: false,
    disliked: false,
    responseFormat: {
      contentFormat: ['text/markdown', 'text/plain'],
    },
    feedbackModalOpen: false,
    feedbackSubmitted: false,
    fieldsToIncludeInCitations: [],
    isAnswerGenerated: false,
    expanded: false,
    answerConfigurationId: 'c36fd994-3eb7-4aaf-bfce-2dad4b15a622',
    cannotAnswer: false,
    answerGenerationMode: 'automatic',
  },
};

const dateRangeCurrentValues = [
  {
    start: '2020/01/01@07:45:00',
    end: '2020/01/01@08:45:00',
    endInclusive: false,
    state: 'idle',
  },
  {
    start: '2019/12/31@08:45:00',
    end: '2020/01/01@08:45:00',
    endInclusive: false,
    state: 'idle',
  },
  {
    start: '2019/12/25@08:45:00',
    end: '2020/01/01@08:45:00',
    endInclusive: false,
    state: 'idle',
  },
  {
    start: '2019/12/01@08:45:00',
    end: '2020/01/01@08:45:00',
    endInclusive: false,
    state: 'idle',
  },
  {
    start: '2019/10/01@08:45:00',
    end: '2020/01/01@08:45:00',
    endInclusive: false,
    state: 'idle',
  },
  {
    start: '2019/01/01@08:45:00',
    end: '2020/01/01@08:45:00',
    endInclusive: false,
    state: 'idle',
  },
  {
    start: '2020/01/01@08:45:00',
    end: '2030/01/01@08:45:00',
    endInclusive: false,
    state: 'idle',
  },
];

export const streamAnswerAPIStateMockWithATabWithAnExpression: StreamAnswerAPIState =
  {
    ...streamAnswerAPIStateMock,
    tabSet: {
      ...streamAnswerAPIStateMock.tabSet,
      default: {
        id: 'default',
        expression: '@fileType=html',
        isActive: true,
      },
    },
  };

export const streamAnswerAPIStateMockWithoutAnyTab: StreamAnswerAPIState = {
  ...streamAnswerAPIStateMock,
  tabSet: {},
  configuration: {
    ...streamAnswerAPIStateMock.configuration,
    analytics: {
      ...streamAnswerAPIStateMock.configuration.analytics,
      originLevel2: '',
    },
  },
};

export const streamAnswerAPIStateMockWithStaticFiltersSelected: StreamAnswerAPIState =
  {
    ...streamAnswerAPIStateMock,
    staticFilterSet: {
      youtube: {
        id: 'test-static-filter',
        values: [
          {
            caption: 'youtube',
            expression: '@filetype=="youtubevideo"',
            state: 'selected',
          },
        ],
      },
    },
  };

export const streamAnswerAPIStateMockWithNonValidFilters: StreamAnswerAPIState =
  {
    ...streamAnswerAPIStateMock,
    staticFilterSet: {
      idle: {
        id: 'test-idle-filter',
        values: [
          {
            caption: 'idle',
            expression: '@filetype=="youtubevideo"',
            state: 'idle',
          },
        ],
      },
      exlcuded: {
        id: 'test-excluded-filter',
        values: [
          {
            caption: 'excluded',
            expression: '@filetype=="youtubevideo"',
            state: 'excluded',
          },
        ],
      },
      empty: {
        id: 'test-empty-filter',
        values: [
          {
            caption: 'empty',
            expression: '',
            state: 'selected',
          },
        ],
      },
    },
  };

export const streamAnswerAPIStateMockWithoutAnyFilters: StreamAnswerAPIState = {
  ...streamAnswerAPIStateMock,
  staticFilterSet: {},
};

export const streamAnswerAPIStateMockWithStaticFiltersAndTabExpression: StreamAnswerAPIState =
  {
    ...streamAnswerAPIStateMockWithATabWithAnExpression,
    staticFilterSet: {
      firstFilter: {
        id: 'test-static-filter-1',
        values: [
          {
            caption: 'youtube',
            expression: '@filetype=="youtubevideo"',
            state: 'selected',
          },
          {
            caption: 'dropbox',
            expression: '@filetype=="dropbox"',
            state: 'selected',
          },
        ],
      },
      secondFilter: {
        id: 'test-static-filter-2',
        values: [
          {
            caption: 'html',
            expression: '@filetype=="tsx"',
            state: 'selected',
          },
        ],
      },
    },
  };

export const streamAnswerAPIStateMockWithStaticFiltersAndTabExpressionWithEmptyCQ =
  {
    ...streamAnswerAPIStateMockWithStaticFiltersAndTabExpression,
    advancedSearchQueries: {
      ...streamAnswerAPIStateMockWithStaticFiltersAndTabExpression.advancedSearchQueries!,
      cq: '',
    },
  };

export const streamAnswerAPIStateMockWithoutSearchAction: StreamAnswerAPIState =
  {
    ...streamAnswerAPIStateMock,
    search: {
      ...streamAnswerAPIStateMock.search!,
      searchAction: undefined,
    },
  };

export const streamAnswerAPIStateMockWithAnalyticsEnabled: StreamAnswerAPIState =
  {
    ...streamAnswerAPIStateMock,
    configuration: {
      ...streamAnswerAPIStateMock.configuration,
      analytics: {
        ...streamAnswerAPIStateMock.configuration.analytics,
        enabled: true,
      },
    },
  };

export const streamAnswerAPIStateMockWithFoldingDisabled: StreamAnswerAPIState =
  {
    ...streamAnswerAPIStateMock,
    folding: {
      ...streamAnswerAPIStateMock.folding,
      enabled: false,
      fields: {
        collection: '',
        parent: '',
        child: '',
      },
      filterFieldRange: 0,
      collections: {},
    },
  };

export const streamAnswerAPIStateMockWithFoldingEnabled: StreamAnswerAPIState =
  {
    ...streamAnswerAPIStateMock,
    folding: {
      ...streamAnswerAPIStateMock.folding,
      enabled: true,
      fields: {
        collection: 'testCollection',
        parent: 'testParent',
        child: 'testChild',
      },
      filterFieldRange: 1,
      collections: {},
    },
  };

export const streamAnswerAPIStateMockWithDictionaryFieldContext: StreamAnswerAPIState =
  {
    ...streamAnswerAPIStateMock,
    dictionaryFieldContext: {
      contextValues: {
        key1: 'value1',
        key2: 'value2',
      },
    },
  };

export const streamAnswerAPIStateMockWithExcerptLength: StreamAnswerAPIState = {
  ...streamAnswerAPIStateMock,
  excerptLength: {
    length: 300,
  },
};

export const streamAnswerAPIStateMockWithQuerySyntaxEnabled: StreamAnswerAPIState =
  {
    ...streamAnswerAPIStateMock,
    query: {
      q: 'what is the hardest wood',
      enableQuerySyntax: true,
    },
  };

export const streamAnswerAPIStateMockWithCaseContextIncluded: StreamAnswerAPIState =
  {
    ...streamAnswerAPIStateMock,
    insightCaseContext: {
      caseContext: {caseSubject: 'foo', caseDescription: 'bar'},
      caseId: '123',
      caseNumber: '456',
    },
  };

export const streamAnswerAPIStateMockWithoutContext: StreamAnswerAPIState = {
  ...streamAnswerAPIStateMock,
  context: undefined,
};

export const streamAnswerAPIStateMockWithLegacyDidYouMean: StreamAnswerAPIState =
  {
    ...streamAnswerAPIStateMock,
    didYouMean: {
      enableDidYouMean: true,
      wasCorrectedTo: '',
      wasAutomaticallyCorrected: false,
      queryCorrection: {
        correctedQuery: '',
        wordCorrections: [],
      },
      originalQuery: '',
      automaticallyCorrectQuery: false,
      queryCorrectionMode: 'legacy',
    },
  };

export const streamAnswerAPIStateMockWithNextDidYouMeanAutoCorrect: StreamAnswerAPIState =
  {
    ...streamAnswerAPIStateMock,
    didYouMean: {
      enableDidYouMean: true,
      wasCorrectedTo: '',
      wasAutomaticallyCorrected: false,
      queryCorrection: {
        correctedQuery: '',
        wordCorrections: [],
      },
      originalQuery: '',
      automaticallyCorrectQuery: true,
      queryCorrectionMode: 'next',
    },
  };

export const streamAnswerAPIStateMockWithNextDidYouMeanNoAutoCorrect: StreamAnswerAPIState =
  {
    ...streamAnswerAPIStateMock,
    didYouMean: {
      enableDidYouMean: true,
      wasCorrectedTo: '',
      wasAutomaticallyCorrected: false,
      queryCorrection: {
        correctedQuery: '',
        wordCorrections: [],
      },
      originalQuery: '',
      automaticallyCorrectQuery: false,
      queryCorrectionMode: 'next',
    },
  };

export const streamAnswerAPIStateMockWithFieldsToInclude: StreamAnswerAPIState =
  {
    ...streamAnswerAPIStateMock,
    fields: {
      fieldsToInclude: ['title', 'summary', 'uri', 'author'],
      fetchAllFields: false,
      fieldsDescription: [],
    },
  };

export const streamAnswerAPIStateMockWithoutFields: StreamAnswerAPIState = {
  ...streamAnswerAPIStateMock,
  fields: undefined,
};

export const streamAnswerAPIStateMockWithDebugTrue: StreamAnswerAPIState = {
  ...streamAnswerAPIStateMock,
  debug: true,
};

export const streamAnswerAPIStateMockWithDebugFalse: StreamAnswerAPIState = {
  ...streamAnswerAPIStateMock,
  debug: false,
};

export const streamAnswerAPIStateMockWithDebugUndefined: StreamAnswerAPIState =
  {
    ...streamAnswerAPIStateMock,
    debug: undefined,
  };

export const streamAnswerAPIStateMockWithSortableFacets: StreamAnswerAPIState =
  {
    ...streamAnswerAPIStateMock,
    facetSet: {
      'zebra-facet': {
        request: {
          filterFacetCount: true,
          injectionDepth: 1000,
          numberOfValues: 8,
          sortCriteria: 'automatic',
          resultsMustMatch: 'atLeastOneValue',
          type: 'specific',
          currentValues: [],
          freezeCurrentValues: false,
          isFieldExpanded: false,
          preventAutoSelect: false,
          facetId: 'zebra-facet',
          field: 'zebra',
        },
        hasBreadcrumbs: true,
      },
      'alpha-facet': {
        request: {
          filterFacetCount: true,
          injectionDepth: 1000,
          numberOfValues: 8,
          sortCriteria: 'automatic',
          resultsMustMatch: 'atLeastOneValue',
          type: 'specific',
          currentValues: [],
          freezeCurrentValues: false,
          isFieldExpanded: false,
          preventAutoSelect: false,
          facetId: 'alpha-facet',
          field: 'alpha',
        },
        hasBreadcrumbs: true,
      },
      'beta-facet': {
        request: {
          filterFacetCount: true,
          injectionDepth: 1000,
          numberOfValues: 8,
          sortCriteria: 'automatic',
          resultsMustMatch: 'atLeastOneValue',
          type: 'specific',
          currentValues: [],
          freezeCurrentValues: false,
          isFieldExpanded: false,
          preventAutoSelect: false,
          facetId: 'beta-facet',
          field: 'beta',
        },
        hasBreadcrumbs: true,
      },
    },
    numericFacetSet: {},
    dateFacetSet: {},
    categoryFacetSet: {},
  };

export const streamAnswerAPIStateMockWithoutAnyFacets: StreamAnswerAPIState = {
  ...streamAnswerAPIStateMock,
  facetSet: {},
  numericFacetSet: {},
  dateFacetSet: {},
  categoryFacetSet: {},
};

export const expectedStreamAnswerAPIParam = {
  q: 'what is the hardest wood',
  aq: 'aq-test-query',
  cq: 'cq-test-query',
  dq: 'dq-test-query',
  lq: 'lq-test-query',
  enableQuerySyntax: false,
  context: {
    testKey: 'testValue',
  },
  pipelineRuleParameters: {
    mlGenerativeQuestionAnswering: {
      responseFormat: {
        contentFormat: ['text/markdown', 'text/plain'],
      },
      citationsFieldToInclude: [],
    },
  },
  searchHub: 'jstpierre2 test - Woods test',
  facets: [
    {
      filterFacetCount: true,
      injectionDepth: 1000,
      numberOfValues: 8,
      sortCriteria: 'automatic',
      resultsMustMatch: 'atLeastOneValue',
      type: 'specific',
      currentValues: [],
      freezeCurrentValues: false,
      isFieldExpanded: false,
      preventAutoSelect: false,
      facetId: 'author',
      field: 'author',
    },
    {
      filterFacetCount: true,
      injectionDepth: 1000,
      numberOfValues: 7,
      sortCriteria: 'descending',
      rangeAlgorithm: 'even',
      resultsMustMatch: 'atLeastOneValue',
      currentValues: dateRangeCurrentValues,
      preventAutoSelect: false,
      type: 'dateRange',
      facetId: 'date',
      field: 'date',
      generateAutomaticRanges: false,
    },
    {
      filterFacetCount: true,
      injectionDepth: 1000,
      numberOfValues: 0,
      sortCriteria: 'ascending',
      rangeAlgorithm: 'even',
      resultsMustMatch: 'atLeastOneValue',
      currentValues: [],
      preventAutoSelect: false,
      type: 'dateRange',
      facetId: 'date_input',
      field: 'date',
      generateAutomaticRanges: false,
    },
    {
      filterFacetCount: true,
      injectionDepth: 1000,
      numberOfValues: 1,
      sortCriteria: 'ascending',
      rangeAlgorithm: 'even',
      resultsMustMatch: 'atLeastOneValue',
      currentValues: [],
      preventAutoSelect: false,
      type: 'dateRange',
      facetId: 'date_input_range',
      generateAutomaticRanges: true,
      field: 'date',
    },
    {
      filterFacetCount: true,
      injectionDepth: 1000,
      numberOfValues: 6,
      sortCriteria: 'occurrences',
      resultsMustMatch: 'atLeastOneValue',
      type: 'specific',
      currentValues: [],
      freezeCurrentValues: false,
      isFieldExpanded: false,
      preventAutoSelect: false,
      facetId: 'filetype',
      field: 'filetype',
    },
    {
      delimitingCharacter: ';',
      filterFacetCount: true,
      injectionDepth: 1000,
      numberOfValues: 8,
      sortCriteria: 'occurrences',
      basePath: [],
      filterByBasePath: true,
      resultsMustMatch: 'atLeastOneValue',
      currentValues: [],
      preventAutoSelect: false,
      type: 'hierarchical',
      facetId: 'geographicalhierarchy',
      field: 'geographicalhierarchy',
    },
    {
      filterFacetCount: true,
      injectionDepth: 1000,
      numberOfValues: 8,
      sortCriteria: 'ascending',
      rangeAlgorithm: 'equiprobable',
      resultsMustMatch: 'atLeastOneValue',
      currentValues: [],
      preventAutoSelect: false,
      type: 'numericalRange',
      facetId: 'sncost',
      field: 'sncost',
      generateAutomaticRanges: true,
    },
    {
      filterFacetCount: true,
      injectionDepth: 1000,
      numberOfValues: 5,
      sortCriteria: 'descending',
      rangeAlgorithm: 'even',
      resultsMustMatch: 'atLeastOneValue',
      currentValues: [
        {
          endInclusive: false,
          state: 'idle',
          start: 1,
          end: 2,
        },
        {
          endInclusive: false,
          state: 'idle',
          start: 2,
          end: 3,
        },
        {
          endInclusive: false,
          state: 'idle',
          start: 3,
          end: 4,
        },
        {
          endInclusive: false,
          state: 'idle',
          start: 4,
          end: 5,
        },
        {
          endInclusive: false,
          state: 'idle',
          start: 5,
          end: 6,
        },
      ],
      preventAutoSelect: false,
      type: 'numericalRange',
      facetId: 'snrating',
      field: 'snrating',
      generateAutomaticRanges: false,
    },
    {
      filterFacetCount: true,
      injectionDepth: 1000,
      numberOfValues: 5,
      sortCriteria: 'descending',
      rangeAlgorithm: 'even',
      resultsMustMatch: 'atLeastOneValue',
      currentValues: [
        {
          endInclusive: true,
          state: 'idle',
          start: 1,
          end: 5,
        },
        {
          endInclusive: true,
          state: 'idle',
          start: 2,
          end: 5,
        },
        {
          endInclusive: true,
          state: 'idle',
          start: 3,
          end: 5,
        },
        {
          endInclusive: true,
          state: 'idle',
          start: 4,
          end: 5,
        },
        {
          endInclusive: true,
          state: 'idle',
          start: 5,
          end: 5,
        },
      ],
      preventAutoSelect: false,
      type: 'numericalRange',
      facetId: 'snrating_range',
      field: 'snrating',
      generateAutomaticRanges: false,
    },
    {
      filterFacetCount: true,
      injectionDepth: 1000,
      numberOfValues: 8,
      sortCriteria: 'automatic',
      resultsMustMatch: 'atLeastOneValue',
      type: 'specific',
      currentValues: [],
      freezeCurrentValues: false,
      isFieldExpanded: false,
      preventAutoSelect: false,
      facetId: 'source',
      field: 'source',
    },
    {
      filterFacetCount: true,
      injectionDepth: 1000,
      numberOfValues: 8,
      sortCriteria: 'automatic',
      resultsMustMatch: 'atLeastOneValue',
      type: 'specific',
      currentValues: [],
      freezeCurrentValues: false,
      isFieldExpanded: false,
      preventAutoSelect: false,
      facetId: 'year',
      field: 'year',
    },
    {
      filterFacetCount: true,
      injectionDepth: 1000,
      numberOfValues: 0,
      sortCriteria: 'ascending',
      rangeAlgorithm: 'even',
      resultsMustMatch: 'atLeastOneValue',
      currentValues: [],
      preventAutoSelect: false,
      type: 'numericalRange',
      facetId: 'ytviewcount_input',
      field: 'ytviewcount',
      generateAutomaticRanges: false,
    },
    {
      filterFacetCount: true,
      injectionDepth: 1000,
      numberOfValues: 1,
      sortCriteria: 'ascending',
      rangeAlgorithm: 'equiprobable',
      resultsMustMatch: 'atLeastOneValue',
      currentValues: [],
      preventAutoSelect: false,
      type: 'numericalRange',
      generateAutomaticRanges: true,
      facetId: 'ytviewcount_input_range',
      field: 'ytviewcount',
    },
  ],
  fieldsToInclude: [
    'author',
    'language',
    'urihash',
    'objecttype',
    'collection',
    'source',
    'permanentid',
    'date',
    'filetype',
    'parents',
    'ec_price',
    'ec_name',
    'ec_description',
    'ec_brand',
    'ec_category',
    'ec_item_group_id',
    'ec_shortdesc',
    'ec_thumbnails',
    'ec_images',
    'ec_promo_price',
    'ec_in_stock',
    'ec_rating',
    'snrating',
    'sncost',
  ],
  queryCorrection: {
    enabled: false,
    options: {
      automaticallyCorrect: 'whenNoResults',
    },
  },
  enableDidYouMean: true,
  numberOfResults: 10,
  firstResult: 0,
  tab: 'default',
  locale: 'en',
  timezone: 'America/New_York',
  referrer: 'some-test-referrer',
  debug: false,
  actionsHistory: [],
  sortCriteria: 'relevancy',
  facetOptions: {
    freezeFacetOrder: false,
  },
  analytics: {
    actionCause: 'searchboxSubmit',
    capture: false,
    clientId: '',
    clientTimestamp: '2020-01-01T00:00:00.000Z',
    customData: undefined,
    documentLocation: '',
    documentReferrer: 'some-test-referrer',
    originContext: 'Search',
    source: [`@coveo/atomic@${atomicVersion}`, '@coveo/headless@Test version'],
  },
};
