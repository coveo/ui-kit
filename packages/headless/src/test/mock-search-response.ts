import {
  SearchResponseSuccess,
  SearchResponseSuccessWithDebugInfo,
} from '../api/search/search/search-response';
import {emptyCorrection} from '../features/did-you-mean/did-you-mean-state';

export function buildMockSearchResponse(
  config: Partial<SearchResponseSuccess> = {}
): SearchResponseSuccess {
  return {
    results: [],
    searchUid: '',
    totalCountFiltered: 0,
    facets: [],
    queryCorrections: [emptyCorrection()],
    questionAnswer: {
      answerSnippet: '',
      documentId: {contentIdKey: '', contentIdValue: ''},
      question: '',
      relatedQuestions: [],
      score: 0,
    },
    ...config,
  };
}

export function buildMockSearchResponseWithDebugInfo(
  config: Partial<SearchResponseSuccessWithDebugInfo> = {}
): SearchResponseSuccessWithDebugInfo {
  return {
    ...buildMockSearchResponse(),
    basicExpression: '',
    advancedExpression: '',
    constantExpression: '',
    userIdentities: [],
    rankingExpressions: [],
    executionReport: {
      children: [],
      duration: 0,
    },
    ...config,
  };
}
