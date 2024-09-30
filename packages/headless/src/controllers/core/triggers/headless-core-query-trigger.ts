import {Controller} from '../../controller/headless-controller.js';

/**
 * The `QueryTrigger` controller handles [query trigger](https://docs.coveo.com/en/3413#query) query pipeline rules, which let you define a search query to execute when a certain condition is met.
 */
export interface QueryTrigger extends Controller {
  /**
   * The state of the `QueryTrigger` controller.
   */
  state: QueryTriggerState;
  /**
   * Undoes a query trigger's correction.
   */
  undo(): void;
}

/**
 * A scoped and simplified part of the headless state that is relevant to the `QueryTrigger` controller.
 */
export interface QueryTriggerState {
  /**
   * The new query returned by a query trigger rule in the query pipeline.
   */
  newQuery: string;

  /**
   * The original query that was submitted by the user.
   */
  originalQuery: string;

  /**
   * Whether the original query was modified by a trigger rule in the query pipeline.
   */
  wasQueryModified: boolean;
}
