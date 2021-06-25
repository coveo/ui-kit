export interface TriggerState {
  /**
   * The URL to redirect the user to after receiving a redirection trigger.
   */
  redirectTo: string | null;

  /**
   * The new query to perform a search with after receiving a query trigger.
   */
  query: string | null;

  /**
   * The notification to present to the user after receiving a notification trigger.
   */
  notify: string | null;
}

export const getTriggerInitialState: () => TriggerState = () => ({
  redirectTo: null,
  query: null,
  notify: null,
});
