export interface TriggerState {
  /**
   * The URL to redirect the user to after receiving a redirection trigger.
   */
  redirectTo: string;

  /**
   * The new query to perform a search with after receiving a query trigger.
   */
  query: string;
}

export const getTriggerInitialState: () => TriggerState = () => ({
  redirectTo: '',
  query: '',
});
