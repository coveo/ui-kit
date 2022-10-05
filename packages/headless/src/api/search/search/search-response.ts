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
import {QuestionsAnswers} from './question-answering';
import {FacetResponse} from '../../../features/facets/facet-set/interfaces/response';

export interface SearchResponseSuccess {
  results: Result[];
  searchUid: string;
  totalCountFiltered: number;
  facets: AnyFacetResponse[];
  generateAutomaticFacets: {facets: FacetResponse[]};
  queryCorrections: QueryCorrection[];
  triggers: Trigger[];
  questionAnswer: QuestionsAnswers;
  pipeline: string;
  splitTestRun: string;
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
