import {
  CyHttpMessages,
  HttpResponseInterceptor,
  RouteMatcher,
  StaticResponse,
} from 'cypress/types/net-stubbing';
import {getAnalyticsBodyFromRequest} from '../e2e/common-expectations';
import {buildMockRaw, buildMockResult} from '../fixtures/mock-result';
import {
  aliasCitationClickEventRequest,
  aliasSubmitFeedbackEventRequest,
  nextAnalyticsAlias,
} from '../utils/analytics-utils';
import {useCaseEnum} from './use-case';

type RequestParams = Record<string, string | number | boolean | undefined>;

function uaAlias(eventName: string) {
  return `@UA-${eventName}`;
}

function paramsInclude(superset: RequestParams, subset: RequestParams) {
  return Object.keys(subset).reduce((isMatching, key) => {
    return isMatching && superset[key] === subset[key];
  }, true);
}

export const baselineAlias = '@baseline';

export const InterceptAliases = {
  UA: {
    Facet: {
      ClearAll: uaAlias('facetClearAll'),
      Search: uaAlias('facetSearch'),
      Select: uaAlias('facetSelect'),
    },
    Load: uaAlias('interfaceLoad'),
    Pager: {
      Previous: uaAlias('pagerPrevious'),
      Next: uaAlias('pagerNext'),
      Number: uaAlias('pagerNumber'),
      Resize: uaAlias('pagerResize'),
    },
    Sort: {
      SortResults: uaAlias('resultsSort'),
    },
    Tab: {
      InterfaceChange: uaAlias('interfaceChange'),
    },
    Breadcrumb: uaAlias('breadcrumbFacet'),
    DocumentOpen: uaAlias('documentOpen'),
    DocumentQuickview: uaAlias('documentQuickview'),
    SearchFromLink: uaAlias('searchFromLink'),
    CopyToClipboard: uaAlias('copyToClipboard'),
    ExpandSmartSnippet: uaAlias('expandSmartSnippet'),
    CollapseSmartSnippet: uaAlias('collapseSmartSnippet'),
    OpenSmartSnippetSource: uaAlias('openSmartSnippetSource'),
    OpenSmartSnippetInlineLink: uaAlias('openSmartSnippetInlineLink'),
    LikeSmartSnippet: uaAlias('likeSmartSnippet'),
    DislikeSmartSnippet: uaAlias('dislikeSmartSnippet'),
    OpenSmartSnippetFeedbackModal: uaAlias('openSmartSnippetFeedbackModal'),
    CloseSmartSnippetFeedbackModal: uaAlias('closeSmartSnippetFeedbackModal'),
    SendSmartSnippetReason: uaAlias('sendSmartSnippetReason'),
    ExpandSmartSnippetSuggestion: uaAlias('expandSmartSnippetSuggestion'),
    CollapseSmartSnippetSuggestion: uaAlias('collapseSmartSnippetSuggestion'),
    OpenSmartSnippetSuggestionSource: uaAlias(
      'openSmartSnippetSuggestionSource'
    ),
    OpenSmartSnippetSuggestionInlineLink: uaAlias(
      'openSmartSnippetSuggestionInlineLink'
    ),
    ShowLessFoldedResults: uaAlias('showLessFoldedResults'),
    ShowMoreFoldedResults: uaAlias('showMoreFoldedResults'),
    RecommendationInterfaceLoad: uaAlias('recommendationInterfaceLoad'),
    RecommendationOpen: uaAlias('recommendationOpen'),
    GeneratedAnswer: {
      LikeGeneratedAnswer: uaAlias('likeGeneratedAnswer'),
      DislikeGeneratedAnswer: uaAlias('dislikeGeneratedAnswer'),
      GeneratedAnswerStreamEnd: uaAlias('generatedAnswerStreamEnd'),
      OpenGeneratedAnswerSource: uaAlias('openGeneratedAnswerSource'),
      RetryGeneratedAnswer: uaAlias('retryGeneratedAnswer'),
      ShowGeneratedAnswer: uaAlias('generatedAnswerShowAnswers'),
      HideGeneratedAnswer: uaAlias('generatedAnswerHideAnswers'),
      GeneratedAnswerFeedbackSubmitV2: uaAlias(
        'generatedAnswerFeedbackSubmitV2'
      ),
      GeneratedAnswerSourceHover: uaAlias('generatedAnswerSourceHover'),
      GeneratedAnswerCopyToClipboard: uaAlias('generatedAnswerCopyToClipboard'),
      GeneratedAnswerCollapse: uaAlias('generatedAnswerCollapse'),
      GeneratedAnswerExpand: uaAlias('generatedAnswerExpand'),
    },
    DidYouMean: uaAlias('didyoumeanAutomatic'),
    DidyoumeanClick: uaAlias('didyoumeanClick'),
    PipelineTriggers: {
      query: uaAlias('query'),
      notify: uaAlias('notify'),
    },
    UndoQuery: uaAlias('undoQuery'),
    SearchboxSubmit: uaAlias('searchboxSubmit'),
    RecentQueries: {
      ClearRecentQueries: uaAlias('clearRecentQueries'),
      ClickRecentQueries: uaAlias('recentQueriesClick'),
    },
    OmniboxAnalytics: uaAlias('omniboxAnalytics'),
  },
  NextAnalytics: {
    Qna: {
      AnswerAction: nextAnalyticsAlias('Qna.AnswerAction'),
      CitationHover: nextAnalyticsAlias('Qna.CitationHover'),
      CitationClick: {
        Source: nextAnalyticsAlias('Qna.CitationClick.Source'),
        InlineLink: nextAnalyticsAlias('Qna.CitationClick.InlineLink'),
      },
      SubmitFeedback: {
        Like: nextAnalyticsAlias('Qna.SubmitFeedback.Like'),
        Dislike: nextAnalyticsAlias('Qna.SubmitFeedback.Dislike'),
        ReasonSubmit: nextAnalyticsAlias('Qna.SubmitFeedback.ReasonSubmit'),
      },
      SubmitRgaFeedback: nextAnalyticsAlias('Qna.SubmitRgaFeedback'),
    },
    CaseAssist: {
      DocumentSuggestionClick: nextAnalyticsAlias(
        'caseAssist.documentSuggestionClick'
      ),
      DocumentSuggestionFeedback: nextAnalyticsAlias(
        'caseAssist.documentSuggestionFeedback'
      ),
      SelectFieldClassification: nextAnalyticsAlias(
        'caseAssist.selectFieldClassification'
      ),
      UpdateField: nextAnalyticsAlias('caseAssist.updateField'),
    },
    ItemClick: nextAnalyticsAlias('itemClick'),
  },
  QuerySuggestions: '@coveoQuerySuggest',
  Search: '@coveoSearch',
  FacetSearch: '@coveoFacetSearch',
  ResultHtml: '@coveoResultHtml',
  Insight: '@CoveoInsight',
  GenQAStream: '@genQAStream',
};

export const routeMatchers = {
  analytics: new RegExp(/\/rest(\/ua)?\/v15\/analytics\//i),
  nextAnalytics: '**/events/v1?*',
  querySuggest: '**/rest/search/v2/querySuggest?*',
  search: '**/rest/search/v2?*',
  facetSearch: '**/rest/search/v2/facet?*',
  insight: '**/rest/organizations/*/insight/v1/configs/*/search',
  html: '**/rest/search/v2/html?*',
};

export function interceptSearch() {
  return cy
    .intercept('POST', routeMatchers.analytics, (req) => {
      const analyticsBody = getAnalyticsBodyFromRequest(req);

      if (analyticsBody.actionCause) {
        req.alias = uaAlias(analyticsBody.actionCause as string).substring(1);
      } else if (req.body.eventType) {
        req.alias = uaAlias(analyticsBody.eventValue as string).substring(1);
      }
    })

    .intercept('POST', routeMatchers.nextAnalytics, (req) => {
      const eventType = req.body?.[0]?.meta.type;
      if (eventType === 'Qna.SubmitFeedback') {
        aliasSubmitFeedbackEventRequest(req);
      } else if (eventType === 'Qna.CitationClick') {
        aliasCitationClickEventRequest(req);
      } else {
        req.alias = nextAnalyticsAlias(eventType).substring(1);
      }
    })

    .intercept('POST', routeMatchers.querySuggest)
    .as(InterceptAliases.QuerySuggestions.substring(1))

    .intercept('POST', routeMatchers.search)
    .as(InterceptAliases.Search.substring(1))

    .intercept('POST', routeMatchers.facetSearch)
    .as(InterceptAliases.FacetSearch.substring(1))

    .intercept('POST', routeMatchers.insight)
    .as(InterceptAliases.Insight.substring(1));
}

export function interceptSearchWithError(
  statusCode = 400,
  message = '',
  type = '',
  executionReport: Array<Record<string, unknown>> = []
) {
  cy.intercept('POST', routeMatchers.search, {
    statusCode,
    body: {
      statusCode,
      message,
      type,
      executionReport,
    },
  }).as(InterceptAliases.Search.substring(1));
}

export function extractResults(
  response: CyHttpMessages.IncomingResponse | undefined
) {
  if (!response || !response.body) {
    throw new Error('A search response was expected');
  }
  return response.body.results;
}

export function mockNoMoreFacetValues(field: string, useCase?: string) {
  cy.intercept(getRoute(useCase), (req) => {
    req.continue((res) => {
      res.body.facets.find(
        (facet: Record<string, unknown>) => facet.field === field
      ).moreValuesAvailable = false;
      res.send();
    });
  }).as(getQueryAlias(useCase).substring(1));
}

export function mockFacetSearchSingleValue(queryString: string) {
  cy.intercept('POST', routeMatchers.facetSearch, (req) => {
    req.continue((res) => {
      res.body.values = [
        {
          displayValue: queryString,
          path: [],
          rawValue: queryString,
          count: 1,
        },
      ];
      res.body.moreValuesAvailable = false;
      res.send();
    });
  }).as(InterceptAliases.FacetSearch.substring(1));
}

export function extractFacetValues(
  response: CyHttpMessages.IncomingResponse | undefined
) {
  if (!response || !response.body) {
    throw new Error('A search response was expected');
  }
  return response.body.facets[0].values.map((v) => v.value);
}

export function interceptIndefinitely(
  requestMatcher: RouteMatcher,
  response?: StaticResponse | HttpResponseInterceptor
): {sendResponse: () => void} {
  let sendResponse;
  const trigger = new Promise((resolve) => {
    sendResponse = resolve;
  });
  cy.intercept(requestMatcher, (request) => {
    return trigger.then(() => {
      request.reply(response);
    });
  });
  return {sendResponse};
}

export function interceptSearchIndefinitely(): {sendResponse: () => void} {
  return interceptIndefinitely(routeMatchers.search);
}

export function mockSearchNoResults(useCase?: string) {
  cy.intercept(getRoute(useCase), (req) => {
    req.continue((res) => {
      res.body.results = [];
      res.body.totalCount = 0;
      res.body.totalCountFiltered = 0;
      res.send();
    });
  }).as(getQueryAlias(useCase).substring(1));
}

export function mockSearchWithResults(
  results?: Array<object>,
  useCase?: string
) {
  const defaultResults = [
    {title: 'Result', uri: 'uri', raw: {uriHash: 'resulthash'}},
  ];
  cy.intercept(getRoute(useCase), (req) => {
    req.continue((res) => {
      res.body.results = results ?? defaultResults;
      res.body.totalCount = res.body.results.length;
      res.body.totalCountFiltered = res.body.results.length;
      res.send();
    });
  }).as(InterceptAliases.Search.substring(1));
}

export function mockSearchWithCustomFunction(
  mockResponseFunction: Function,
  useCase?: string
) {
  cy.intercept(getRoute(useCase), (req) => {
    req.continue((res) => {
      mockResponseFunction(res);
      res.send();
    });
  }).as(getQueryAlias(useCase).substring(1));
}

export function interceptResultHtmlContent() {
  cy.intercept('GET', routeMatchers.html).as(
    InterceptAliases.ResultHtml.substring(1)
  );
}

export function mockResultHtmlContent(tag: string, innerHtml?: string) {
  cy.intercept('POST', routeMatchers.html, (req) => {
    req.alias = InterceptAliases.ResultHtml.substring(1);
    req.continue((res) => {
      const element = document.createElement(tag);
      element.innerHTML = innerHtml ? innerHtml : 'this is a response';
      res.body = element;
      res.send();
    });
  }).as(InterceptAliases.ResultHtml.substring(1));
}

export function interceptQuerySuggestWithParam(
  params: RequestParams,
  alias: string
) {
  cy.intercept('POST', routeMatchers.querySuggest, (req) => {
    if (paramsInclude(req.body, params)) {
      req.alias = alias.substring(1);
    }
  });
}

export function captureBaselineNumberOfRequests(interceptAlias: string) {
  cy.get(`${interceptAlias}.all`).then((calls) =>
    cy.wrap(calls.length).as(baselineAlias.substring(1))
  );
}

export function getQueryAlias(useCase?: string) {
  return useCase === useCaseEnum.insight
    ? InterceptAliases.Insight
    : InterceptAliases.Search;
}

export function getRoute(useCase?: string) {
  return useCase === useCaseEnum.insight
    ? routeMatchers.insight
    : routeMatchers.search;
}

export function mockSearchWithoutAnyFacetValues(useCase?: string) {
  cy.intercept(getRoute(useCase), (req) => {
    req.continue((res) => {
      res.body.facets.forEach((facet: {values: string[]}) => {
        facet.values = [];
      });
      res.body.results = [
        buildMockResult({
          title: 'Result',
          uri: 'uri',
          raw: buildMockRaw({urihash: 'resulthash'}),
        }),
      ];
      res.body.totalCount = 1;
      res.body.totalCountFiltered = 1;
      res.send();
    });
  }).as(InterceptAliases.Search.substring(1));
}

export function mockSearchWithSmartSnippet(
  smartSnippetOptions: {
    question: string;
    answer: string;
    title: string;
    uri: string;
    permanentId: string;
    uriHash: string;
    author?: string;
  },
  useCase?: string,
  responseId?: string
) {
  const {question, answer, title, uri, permanentId, uriHash, author} =
    smartSnippetOptions;
  cy.intercept(getRoute(useCase), (req) => {
    req.continue((res) => {
      res.body.questionAnswer = {
        answerFound: true,
        answerSnippet: answer,
        question: question,
        documentId: {
          contentIdKey: 'permanentid',
          contentIdValue: permanentId,
        },
        relatedQuestions: [],
      };
      res.body.results = [
        buildMockResult({
          uri: uri,
          title: title,
          clickUri: uri,
          uniqueId: '123',
          raw: buildMockRaw({
            permanentid: permanentId,
            urihash: uriHash,
            author,
          }),
        }),
      ];
      if (responseId) {
        res.body.searchUid = responseId;
      }
      res.send();
    });
  }).as(InterceptAliases.Search.substring(1));
}

export function mockSearchWithoutSmartSnippet(useCase?: string) {
  cy.intercept(getRoute(useCase), (req) => {
    req.continue((res) => {
      res.body.questionAnswer = {
        answerFound: false,
        relatedQuestions: [],
      };
      res.send();
    });
  }).as(InterceptAliases.Search.substring(1));
}

export function mockSearchWithSmartSnippetSuggestions(
  relatedQuestions: Array<{
    question: string;
    answerSnippet: string;
    title: string;
    uri: string;
    author?: string;
    documentId: {
      contentIdKey: string;
      contentIdValue: string;
    };
    uriHash: string;
  }>,
  useCase?: string,
  responseId?: string
) {
  cy.intercept(getRoute(useCase), (req) => {
    req.continue((res) => {
      res.body.questionAnswer = {
        relatedQuestions: relatedQuestions,
        documentId: {
          contentIdKey: 'permanentid',
          contentIdValue: 'example permanentId',
        },
      };
      res.body.results = relatedQuestions.map(
        ({title, uri, documentId, uriHash, author}) =>
          buildMockResult({
            uri,
            title,
            clickUri: uri,
            uniqueId: '123',
            raw: buildMockRaw({
              permanentid: documentId.contentIdValue,
              urihash: uriHash,
              author: author,
            }),
          })
      );
      if (responseId) {
        res.body.searchUid = responseId;
      }
      res.send();
    });
  }).as(InterceptAliases.Search.substring(1));
}

export function mockSearchWithoutSmartSnippetSuggestions(useCase?: string) {
  cy.intercept(getRoute(useCase), (req) => {
    req.continue((res) => {
      res.body.questionAnswer = {
        relatedQuestions: [],
      };
      res.send();
    });
  }).as(InterceptAliases.Search.substring(1));
}

export function mockSearchWithGeneratedAnswer(
  streamId: string,
  useCase?: string,
  responseId?: string
) {
  cy.intercept(getRoute(useCase), (req) => {
    req.continue((res) => {
      res.body.extendedResults = {
        generativeQuestionAnsweringId: streamId,
      };
      if (responseId) {
        res.body.searchUid = responseId;
      }
      res.send();
    });
  }).as(InterceptAliases.Search.substring(1));
}

export function mockSearchWithoutGeneratedAnswer(useCase?: string) {
  cy.intercept(getRoute(useCase), (req) => {
    req.continue((res) => {
      res.body.extendedResults = {};
      res.send();
    });
  }).as(InterceptAliases.Search.substring(1));
}

export const getStreamInterceptAlias = (streamId: string) =>
  `${InterceptAliases.GenQAStream}-${streamId}`;

export function mockStreamResponse(streamId: string, body: unknown) {
  cy.intercept(
    {
      method: 'GET',
      url: `**/machinelearning/streaming/${streamId}`,
    },
    (request) => {
      let bodyText = '';
      if (!Array.isArray(body)) {
        bodyText = `data: ${JSON.stringify(body)} \n\n`;
      } else {
        body.forEach((data) => {
          bodyText += `data: ${JSON.stringify(data)} \n\n`;
        });
      }
      request.reply({
        statusCode: 200,
        body: bodyText,
        headers: {
          'content-type': 'text/event-stream',
        },
      });
    }
  ).as(getStreamInterceptAlias(streamId).substring(1));
}

export function mockStreamError(streamId: string, errorCode: number) {
  cy.intercept(
    {
      method: 'GET',
      url: `**/machinelearning/streaming/${streamId}`,
    },
    (request) => {
      request.reply(
        errorCode,
        {},
        {
          'content-type': 'text/event-stream',
        }
      );
    }
  ).as(getStreamInterceptAlias(streamId).substring(1));
}

export function mockSearchWithDidYouMean(
  useCase: string,
  originalWord: string,
  correctedWord: string
) {
  cy.intercept(getRoute(useCase), (req) => {
    req.continue((res) => {
      res.body.queryCorrections = [
        {
          correctedQuery: correctedWord,
          wordCorrections: [
            {
              correctedWord: correctedWord,
              originalWord: originalWord,
              length: correctedWord.length,
              offset: 0,
            },
          ],
        },
      ];
      res.body.results = [
        buildMockResult({
          title: 'Result',
          uri: 'uri',
          raw: {urihash: 'resulthash'},
        }),
      ];
      res.body.totalCount = 1;
      res.send();
    });
  }).as(InterceptAliases.Search.substring(1));
}

export function mockSearchWithDidYouMeanAutomaticallyCorrected(
  useCase: string,
  originalWord: string,
  correctedWord: string
) {
  cy.intercept(getRoute(useCase), (req) => {
    req.continue((res) => {
      res.body.queryCorrections = [
        {
          correctedQuery: correctedWord,
          wordCorrections: [
            {
              correctedWord: correctedWord,
              originalWord: originalWord,
              length: correctedWord.length,
              offset: 0,
            },
          ],
        },
      ];

      res.body.results = [];
      res.body.totalCount = 0;
      res.send();
    });
  }).as(InterceptAliases.Search.substring(1));
}

export function mockSearchWithQueryTrigger(useCase: string, query: string) {
  cy.intercept(getRoute(useCase), (req) => {
    req.continue((res) => {
      res.body.triggers = [
        {
          type: 'query',
          content: query,
        },
      ];
      res.send();
    });
  }).as(InterceptAliases.Search.substring(1));
}

export function mockSearchWithNotifyTrigger(
  useCase: string,
  notifications: string[]
) {
  cy.intercept(getRoute(useCase), (req) => {
    req.continue((res) => {
      res.body.triggers = notifications.map((notification) => ({
        type: 'notify',
        content: notification,
      }));
      res.send();
    });
  }).as(InterceptAliases.Search.substring(1));
}

export function mockQuerySuggestions(suggestions: string[]) {
  cy.intercept(routeMatchers.querySuggest, (req) => {
    req.continue((res) => {
      res.body.completions = suggestions.map((suggestion) => ({
        expression: suggestion,
        highlighted: suggestion,
      }));

      res.body.responseId = crypto.randomUUID();
      res.send();
    });
  }).as(InterceptAliases.QuerySuggestions.substring(1));
}
