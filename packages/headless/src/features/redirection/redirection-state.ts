export interface RedirectionState {
  /**
   * The URL to redirect the user to.
   */
  redirectTo: string | null;
}

export const getRedirectionInitialState: () => RedirectionState = () => ({
  redirectTo: null,
});
