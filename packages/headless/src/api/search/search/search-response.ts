import {AnyFacetResponse} from '../../../features/facets/generic/interfaces/generic-facet-response';
import {
  SearchAPIErrorWithExceptionInBody,
  SearchAPIErrorWithStatusCode,
} from '../search-api-error-response';
import {Trigger} from './../trigger';
import {AutomaticFacets} from './automatic-facets';
import {ExecutionReport} from './execution-report';
import {ExtendedResults} from './extended-results';
import {QueryCorrection} from './query-corrections';
import {QueryRankingExpression} from './query-ranking-expression';
import {QuestionsAnswers} from './question-answering';
import {Result} from './result';
import {SecurityIdentity} from './security-identity';
import {PhrasesToHighlight, TermsToHighlight} from './stemming';

export interface SearchResponseSuccess {
  generateAutomaticFacets?: AutomaticFacets;
  termsToHighlight: TermsToHighlight;
  phrasesToHighlight: PhrasesToHighlight;
  results: Result[];
  searchUid: string;
  totalCountFiltered: number;
  facets: AnyFacetResponse[];
  queryCorrections: QueryCorrection[];
  triggers: Trigger[];
  questionAnswer: QuestionsAnswers;
  pipeline: string;
  splitTestRun: string;
  extendedResults: ExtendedResults;
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
