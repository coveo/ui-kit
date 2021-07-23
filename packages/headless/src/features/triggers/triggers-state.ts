import {ExecuteTriggerParams} from '../../api/search/trigger';

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
   */
  execute: {functionName: string; params: ExecuteTriggerParams};

  /**
   * The notification to display to the user after receiving a notification trigger.
   */
  notification: string;
}

export const getTriggerInitialState: () => TriggerState = () => ({
  redirectTo: '',
  query: '',
  execute: {functionName: '', params: []},
  notification: '',
});
