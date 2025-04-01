import {AnyFacetResponse} from '../../../features/facets/generic/interfaces/generic-facet-response.js';
import {Trigger} from '../../common/trigger.js';
import {
  SearchAPIErrorWithExceptionInBody,
  SearchAPIErrorWithStatusCode,
} from '../search-api-error-response.js';
import {AutomaticFacets} from './automatic-facets.js';
import {ExecutionReport} from './execution-report.js';
import {ExtendedResults} from './extended-results.js';
import {Correction, QueryCorrection} from './query-corrections.js';
import {QueryRankingExpression} from './query-ranking-expression.js';
import {QuestionsAnswers} from './question-answering.js';
import {Result} from './result.js';
import {SecurityIdentity} from './security-identity.js';
import {PhrasesToHighlight, TermsToHighlight} from './stemming.js';

export interface SearchResponseSuccess {
  generateAutomaticFacets?: AutomaticFacets;
  termsToHighlight: TermsToHighlight;
  phrasesToHighlight: PhrasesToHighlight;
  results: Result[];
  searchUid: string;
  totalCountFiltered: number;
  facets: AnyFacetResponse[];
  queryCorrections?: QueryCorrection[];
  queryCorrection?: Correction;
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
