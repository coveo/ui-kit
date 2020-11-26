import {Result} from './result';
import {
  SearchAPIErrorWithExceptionInBody,
  SearchAPIErrorWithStatusCode,
} from '../search-api-error-response';
import {QueryCorrection} from './query-corrections';
import {AnyFacetResponse} from '../../../features/facets/generic/interfaces/generic-facet-response';
import {RankingExpression} from './ranking-expression';
import {UserIdentity} from './user-identity';

export interface SearchResponseSuccess {
  results: Result[];
  searchUid: string;
  totalCountFiltered: number;
  facets: AnyFacetResponse[];
  queryCorrections: QueryCorrection[];
  /**
   * A detailed execution report sent by the Search API
   * Only sent if debug is true
   */
  executionReport?: unknown;
  /**
   * The basic expression that was executed
   * Only sent if debug is true
   */
  basicExpression?: string;
  /**
   * The advanced expression that was executed
   * Only sent if debug is true
   */
  advancedExpression?: string;
  /**
   * The constant expression that was executed.<br/>
   * Only sent if debug is true
   */
  constantExpression?: string;
  /**
   * A list of user identities that were used to perform this query
   * Only sent if debug is true
   */
  userIdentities?: UserIdentity[];
  /**
   * A list of ranking expression that were used to tweak the relevance
   * Only sent if debug is true
   */
  rankingExpressions?: RankingExpression[];
}

export type Search =
  | SearchResponseSuccess
  | SearchAPIErrorWithExceptionInBody
  | SearchAPIErrorWithStatusCode;
