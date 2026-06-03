import type {
  ContextParam,
  FoldingParam,
  LocaleParam,
  NumberOfResultsParam,
} from '../../../platform-service-params.js';
import type {
  AnalyticsParam,
  ConstantQueryParam,
  EnableDidYouMeanParam,
  FacetsParam,
  FieldsToIncludeParam,
  FirstResultParam,
  PipelineRuleParams,
  QueryCorrectionParam,
  QueryParam,
  SortCriteriaParam,
  TabParam,
} from '../../../search/search-api-params.js';
import {
  baseInsightRequest,
  type InsightParam,
  pickNonInsightParams,
} from '../insight-params.js';
import type {InsightQuerySuggestRequest} from '../query-suggest/query-suggest-request.js';

export type InsightQueryRequest = InsightParam &
  AnalyticsParam &
  CaseContextParam &
  FacetsParam &
  QueryParam &
  FirstResultParam &
  NumberOfResultsParam &
  SortCriteriaParam &
  FieldsToIncludeParam &
  EnableDidYouMeanParam &
  QueryCorrectionParam &
  ConstantQueryParam &
  TabParam &
  FoldingParam &
  ContextParam &
  LocaleParam &
  PipelineRuleParams;

export interface CaseContextParam {
  caseContext?: Record<string, string>;
}

export const buildInsightQueryRequest = (req: InsightQueryRequest) => {
  return {
    ...baseInsightRequest(req, 'POST', 'application/json', '/search'),
    requestParams: pickNonInsightParams(req),
  };
};

export const buildInsightQuerySuggestRequest = (
  req: InsightQuerySuggestRequest
) => {
  return {
    ...baseInsightRequest(req, 'POST', 'application/json', '/querysuggest'),
    requestParams: pickNonInsightParams(req),
  };
};
