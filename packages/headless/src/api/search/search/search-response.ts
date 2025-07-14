import type {AnyFacetResponse} from '../../../features/facets/generic/interfaces/generic-facet-response.js';
import type {Trigger} from '../../common/trigger.js';
import type {
  SearchAPIErrorWithExceptionInBody,
  SearchAPIErrorWithStatusCode,
} from '../search-api-error-response.js';
import type {AutomaticFacets} from './automatic-facets.js';
import type {ExecutionReport} from './execution-report.js';
import type {ExtendedResults} from './extended-results.js';
import type {Correction, QueryCorrection} from './query-corrections.js';
import type {QueryRankingExpression} from './query-ranking-expression.js';
import type {QuestionsAnswers} from './question-answering.js';
import type {Result} from './result.js';
import type {SecurityIdentity} from './security-identity.js';
import type {PhrasesToHighlight, TermsToHighlight} from './stemming.js';

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
