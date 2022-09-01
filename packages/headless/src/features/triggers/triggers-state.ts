import {ExecuteTriggerParams} from '../../api/search/trigger';

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
   * The JavaScript function to be executed after receiving an execute trigger.
   *
   * @deprecated Use `executions` instead.
   */
  execute: FunctionExecutionTrigger;

  /**
   * The JavaScript functions to execute after receiving execution triggers.
   */
  executions: FunctionExecutionTrigger[];

  /**
   * The notification to display to the user after receiving a notification trigger.
   *
   * @deprecated Use `notifications` instead.
   */
  notification: string;

  /**
   * The notifications to display to the user after receiving notification triggers.
   */
  notifications: string[];

  /**
   * The modification that should be applied as a result of a query trigger.
   */
  queryModification: {
    originalQuery: string;
    modification: string;
    ignore: string;
  };
}

export const getTriggerInitialState: () => TriggerState = () => ({
  redirectTo: '',
  query: '',
  execute: {functionName: '', params: []},
  executions: [],
  notification: '',
  notifications: [],
  queryModification: {originalQuery: '', modification: '', ignore: ''},
});
