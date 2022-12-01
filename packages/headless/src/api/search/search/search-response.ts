import {AnyFacetResponse} from '../../../features/facets/generic/interfaces/generic-facet-response';
import {
  SearchAPIErrorWithExceptionInBody,
  SearchAPIErrorWithStatusCode,
} from '../search-api-error-response';
import {Trigger} from './../trigger';
import {ExecutionReport} from './execution-report';
import {QueryCorrection} from './query-corrections';
import {QueryRankingExpression} from './query-ranking-expression';
import {QuestionsAnswers} from './question-answering';
import {Result} from './result';
import {SecurityIdentity} from './security-identity';

export interface SearchResponseSuccess {
  results: Result[];
  searchUid: string;
  totalCountFiltered: number;
  facets: AnyFacetResponse[];
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
