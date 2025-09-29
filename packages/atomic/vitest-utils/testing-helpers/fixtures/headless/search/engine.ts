import {
  getSampleSearchEngineConfiguration,
  type SearchEngine,
  type SearchEngineConfiguration,
} from '@coveo/headless';
import {vi} from 'vitest';

export const buildFakeSearchEngine = ({
  implementation,
  state,
}: Partial<{
  implementation?: Partial<SearchEngine>;
  config?: Partial<SearchEngineConfiguration>;
  state?: Record<string, unknown>;
}> = {}): SearchEngine => {
  const defaultState = {
    debug: false,
    pipeline: 'default',
    searchHub: 'default',
    search: {
      isLoading: false,
      error: null,
      response: {
        searchUid: '',
        totalCountFiltered: 0,
        totalCount: 0,
        results: [],
        facets: [],
        queryCorrections: [],
        triggers: [],
        questionAnswer: {
          answerFound: false,
          documentId: {
            contentIdKey: '',
            contentIdValue: '',
          },
          relatedQuestions: [],
          question: '',
          answerSnippet: '',
          score: 0,
        },
        termsToHighlight: {},
        phrasesToHighlight: {},
        pipeline: 'default',
        splitTestRun: '',
        extendedResults: {
          results: [],
          searchResponseId: '',
        },
      },
      duration: 0,
      queryExecuted: '',
      automaticallyCorrected: false,
      results: [],
      requestId: '',
      searchResponseId: '',
      extendedResults: {
        results: [],
        searchResponseId: '',
      },
      questionAnswer: {
        answerFound: false,
        documentId: {
          contentIdKey: '',
          contentIdValue: '',
        },
        relatedQuestions: [],
        question: '',
        answerSnippet: '',
        score: 0,
      },
      searchAction: {
        actionCause: 'interfaceLoad',
        customData: {},
      },
    },
    configuration: {
      ...getSampleSearchEngineConfiguration(),
      organizationId: 'fake-org-id',
      accessToken: 'fake-access-token',
      knowledge: {
        enabled: false,
        answerConfigurationId: 'fake-answer-config-id',
      },
    },
    version: '1.0.0',
  };

  const defaultImplementation = {
    addReducers: vi.fn(),
    dispatch: vi.fn(),
    executeFirstSearch: vi.fn(),
    executeFirstSearchAfterStandaloneSearchBoxRedirect: vi.fn(),
    enableAnalytics: vi.fn(),
    disableAnalytics: vi.fn(),
    navigatorContext: {
      userAgent: 'fake-user-agent',
      location: {
        href: 'https://example.com',
        hostname: 'example.com',
        pathname: '/',
        search: '',
        hash: '',
      },
      referrer: '',
    },
    logger: {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
    },
    subscribe: vi.fn(() => vi.fn()),
    relay: vi.fn(),
    store: {
      dispatch: vi.fn(),
      getState: vi.fn(() => defaultState),
      subscribe: vi.fn(() => vi.fn()),
      replaceReducer: vi.fn(),
    },
    configuration: {
      ...getSampleSearchEngineConfiguration(),
      organizationId: 'fake-org-id',
      accessToken: 'fake-access-token',
      knowledge: {
        enabled: false,
        answerConfigurationId: 'fake-answer-config-id',
      },
    },
  };

  return {
    ...defaultImplementation,
    ...implementation,
    state: {...defaultState, ...state},
  } as SearchEngine;
};
