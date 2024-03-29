import {
  ContextParam,
  FoldingParam,
  NumberOfResultsParam,
} from '../../../platform-service-params';
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
} from '../../../search/search-api-params';
import {
  baseInsightRequest,
  InsightParam,
  pickNonInsightParams,
} from '../insight-params';
import {InsightQuerySuggestRequest} from '../query-suggest/query-suggest-request';

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
