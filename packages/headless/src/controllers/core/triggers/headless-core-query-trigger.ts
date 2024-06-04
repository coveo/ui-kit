import {Controller} from '../../controller/headless-controller';

/**
 * The `QueryTrigger` controller handles query triggers. A [Query trigger](https://docs.coveo.com/en/3413#query) query pipeline rule lets you define a query to be automatically executed against the index when a certain condition is met.
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
   * The new query to perform a search with after receiving a query trigger.
   */
  newQuery: string;

  /**
   * The query used to perform the search that received a query trigger in its response.
   */
  originalQuery: string;

  /**
   * A boolean to specify if the controller was triggered resulting in a modification to the query.
   */
  wasQueryModified: boolean;
}
