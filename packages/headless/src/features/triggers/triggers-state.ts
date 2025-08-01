import type {ExecuteTriggerParams} from '../../api/common/trigger.js';

/**
 * The name of a function to execute and its parameters.
 */
export interface FunctionExecutionTrigger {
  /**
   * The name of the function to execute.
   */
  functionName: string;
  /**
   * The parameters of the function to execute.
   */
  params: ExecuteTriggerParams;
}

export interface TriggerState {
  /**
   * The URL to redirect the user to after receiving a redirection trigger.
   */
  redirectTo: string;

  /**
   * The new query to perform a search with after receiving a query trigger.
   */
  query: string;

  /**
   * The JavaScript functions to execute after receiving execution triggers.
   */
  executions: FunctionExecutionTrigger[];

  /**
   * The notifications to display to the user after receiving notification triggers.
   */
  notifications: string[];

  /**
   * The modification that should be applied as a result of a query trigger.
   */
  queryModification: {
    /**
     * The original query performed by the end user.
     */
    originalQuery: string;
    /**
     * The new query that should be executed.
     */
    newQuery: string;
    /**
     * The query modification that should be ignored when explicitly requested by the end user.
     */
    queryToIgnore: string;
  };
}

export const getTriggerInitialState: () => TriggerState = () => ({
  redirectTo: '',
  query: '',
  executions: [],
  notifications: [],
  queryModification: {originalQuery: '', newQuery: '', queryToIgnore: ''},
});
