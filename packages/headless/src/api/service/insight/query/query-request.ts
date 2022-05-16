import {NumberOfResultsParam} from '../../../platform-service-params';
import {
  AdvancedQueryParam,
  ConstantQueryParam,
  FacetsParam,
  QueryParam,
} from '../../../search/search-api-params';
import {
  baseInsightRequest,
  InsightParam,
  pickNonInsightParams,
} from '../insight-params';

export type InsightQueryRequest = InsightParam &
  AdvancedQueryParam &
  CaseContextParam &
  ConstantQueryParam &
  FacetsParam &
  NumberOfResultsParam &
  QueryParam;

interface CaseContextParam {
  caseContext: Record<string, string>;
}

export const buildInsightQueryRequest = (req: InsightQueryRequest) => {
  return {
    ...baseInsightRequest(req, 'POST', 'application/json', '/search'),
    requestParams: pickNonInsightParams(req),
  };
};
