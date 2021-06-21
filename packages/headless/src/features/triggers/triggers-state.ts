export interface TriggerState {
  /**
   * The URL to redirect the user to after receiving a redirection trigger.
   */
  redirectTo: string | null;

  /**
   * The new query to perform a search with after receiving a query trigger.
   */
  query: string | null;
}

export const getTriggerInitialState: () => TriggerState = () => ({
  redirectTo: null,
  query: null,
});
