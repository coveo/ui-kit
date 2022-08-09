import {NumberOfResultsParam} from '../../../platform-service-params';
import {
  ConstantQueryParam,
  EnableDidYouMeanParam,
  FacetsParam,
  FieldsToIncludeParam,
  FirstResultParam,
  QueryParam,
  SortCriteriaParam,
} from '../../../search/search-api-params';
import {
  baseInsightRequest,
  InsightParam,
  pickNonInsightParams,
} from '../insight-params';

export type InsightQueryRequest = InsightParam &
  CaseContextParam &
  FacetsParam &
  QueryParam &
  FirstResultParam &
  NumberOfResultsParam &
  SortCriteriaParam &
  FieldsToIncludeParam &
  EnableDidYouMeanParam &
  ConstantQueryParam;

interface CaseContextParam {
  caseContext?: Record<string, string>;
}

export const buildInsightQueryRequest = (req: InsightQueryRequest) => {
  return {
    ...baseInsightRequest(req, 'POST', 'application/json', '/search'),
    requestParams: pickNonInsightParams(req),
  };
};
