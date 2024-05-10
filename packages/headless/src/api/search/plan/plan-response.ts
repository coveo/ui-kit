import {Trigger} from '../../common/trigger';
import {
  SearchAPIErrorWithExceptionInBody,
  SearchAPIErrorWithStatusCode,
} from '../search-api-error-response';

/**
 * Describes the plan of execution of a search request.
 */
export interface PlanResponseSuccess {
  /**
   * The output that would be included by the Search API in the query response
   * once the search request has been fully processed by the query pipeline.
   */
  preprocessingOutput: {
    /**
     * The query response output generated by _trigger_ rules in the query
     * pipeline (i.e., by `execute`, `notify`, `query`, and `redirect` rules).
     */
    triggers: Trigger[];
  };
  /**
   * The query expressions that would be sent to the index once the search
   * request has been fully processed by the query pipeline.
   */
  parsedInput: {
    /**
     * The final basic query expression (`q`).
     */
    basicExpression: string;
    /**
     * The final large query expression (`lq`).
     */
    largeExpression: string;
  };
}

export type Plan =
  | PlanResponseSuccess
  | SearchAPIErrorWithExceptionInBody
  | SearchAPIErrorWithStatusCode;
