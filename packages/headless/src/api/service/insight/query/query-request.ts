import {
  ContextParam,
  FoldingParam,
  LocaleParam,
  NumberOfResultsParam,
} from '../../../platform-service-params.js';
import {
  AnalyticsParam,
  ConstantQueryParam,
  EnableDidYouMeanParam,
  FacetsParam,
  FieldsToIncludeParam,
  FirstResultParam,
  PipelineRuleParams,
  QueryParam,
  SortCriteriaParam,
  TabParam,
} from '../../../search/search-api-params.js';
import {
  baseInsightRequest,
  InsightParam,
  pickNonInsightParams,
} from '../insight-params.js';
import {InsightQuerySuggestRequest} from '../query-suggest/query-suggest-request.js';

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
  ConstantQueryParam &
  TabParam &
  FoldingParam &
  ContextParam &
  LocaleParam &
  PipelineRuleParams;

interface CaseContextParam {
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
