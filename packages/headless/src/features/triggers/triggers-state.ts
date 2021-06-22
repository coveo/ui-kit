export interface TriggerState {
  /**
   * The URL to redirect the user to after receiving a redirection trigger.
   */
  redirectTo: string | null;
}

export const getTriggerInitialState: () => TriggerState = () => ({
  redirectTo: null,
});
