import {NumberOfResultsParam} from '../../../platform-service-params';
import {
  ConstantQueryParam,
  FacetsParam,
  FirstResultParam,
  QueryParam,
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
