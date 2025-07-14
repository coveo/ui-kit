import type {
  SearchResponseSuccess,
  SearchResponseSuccessWithDebugInfo,
} from '../api/search/search/search-response.js';
import {emptyLegacyCorrection} from '../features/did-you-mean/did-you-mean-state.js';
import {emptyQuestionAnswer} from '../features/search/search-state.js';

export function buildMockSearchResponse(
  config: Partial<SearchResponseSuccess> = {}
): SearchResponseSuccess {
  return {
    results: [],
    searchUid: '',
    totalCountFiltered: 0,
    facets: [],
    generateAutomaticFacets: {facets: []},
    queryCorrections: [emptyLegacyCorrection()],
    triggers: [],
    questionAnswer: emptyQuestionAnswer(),
    pipeline: '',
    splitTestRun: '',
    termsToHighlight: {},
    phrasesToHighlight: {},
    extendedResults: {},
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
    pipeline: '',
    ...config,
  };
}
