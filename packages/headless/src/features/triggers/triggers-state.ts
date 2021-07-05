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
   * The notification to display to the user after receiving a notification trigger.
   */
  notification: string;
}

export const getTriggerInitialState: () => TriggerState = () => ({
  redirectTo: '',
  query: '',
  notification: '',
});
