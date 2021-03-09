import {Result} from './result';
import {
  SearchAPIErrorWithExceptionInBody,
  SearchAPIErrorWithStatusCode,
} from '../search-api-error-response';
import {QueryCorrection} from './query-corrections';
import {AnyFacetResponse} from '../../../features/facets/generic/interfaces/generic-facet-response';
import {RankingExpression} from './ranking-expression';
import {SecurityIdentity} from './security-identity';
import {ExecutionReport} from './execution-report';

export interface SearchResponseSuccess {
  results: Result[];
  searchUid: string;
  totalCountFiltered: number;
  facets: AnyFacetResponse[];
  queryCorrections: QueryCorrection[];
}

export interface SearchResponseSuccessWithDebugInfo
  extends SearchResponseSuccess {
  executionReport: ExecutionReport;
  basicExpression: string;
  advancedExpression: string;
  constantExpression: string;
  userIdentities: SecurityIdentity[];
  rankingExpressions: RankingExpression[];
}

export type Search =
  | SearchResponseSuccess
  | SearchAPIErrorWithExceptionInBody
  | SearchAPIErrorWithStatusCode;
