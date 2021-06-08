import {Result} from './result';
import {
  SearchAPIErrorWithExceptionInBody,
  SearchAPIErrorWithStatusCode,
} from '../search-api-error-response';
import {QueryCorrection} from './query-corrections';
import {AnyFacetResponse} from '../../../features/facets/generic/interfaces/generic-facet-response';
import {QueryRankingExpression} from './query-ranking-expression';
import {SecurityIdentity} from './security-identity';
import {ExecutionReport} from './execution-report';
import {Trigger} from './../trigger';

export interface SearchResponseSuccess {
  results: Result[];
  searchUid: string;
  totalCountFiltered: number;
  facets: AnyFacetResponse[];
  queryCorrections: QueryCorrection[];
  triggers: Trigger[];
}

export interface SearchResponseSuccessWithDebugInfo
  extends SearchResponseSuccess {
  executionReport: ExecutionReport;
  basicExpression: string;
  advancedExpression: string;
  constantExpression: string;
  userIdentities: SecurityIdentity[];
  rankingExpressions: QueryRankingExpression[];
}

export type Search =
  | SearchResponseSuccess
  | SearchAPIErrorWithExceptionInBody
  | SearchAPIErrorWithStatusCode;
