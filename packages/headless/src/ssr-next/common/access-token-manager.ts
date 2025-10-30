/**
 * This helper allows updating the search token at any point in the SSR workflow—before or after
 * static state creation, and before or after hydration.
 */
export function createAccessTokenManager(initialToken: string) {
  const tokenChangeCallbacks = new Set<(accessToken: string) => void>();
  let queuedToken: string | null = null;
  let currentAccessToken: string = initialToken;

  return {
    /**
     * Gets the current access token.
     */
    getAccessToken(): string {
      return currentAccessToken;
    },

    /**
     * Sets the access token, updating both configuration and active engines.
     */
    setAccessToken(accessToken: string): void {
      currentAccessToken = accessToken;

      if (tokenChangeCallbacks.size > 0) {
        tokenChangeCallbacks.forEach((callback) => {
          callback(accessToken);
        });
        queuedToken = null;
      } else {
        queuedToken = accessToken;
      }
    },

    /**
     * Registers a callback function to be invoked when the access token changes.
     * If there's a queued token, the callback will be invoked immediately.
     */
    registerCallback(callback: (accessToken: string) => void): void {
      tokenChangeCallbacks.add(callback);

      if (queuedToken) {
        callback(queuedToken);
        queuedToken = null;
      }
    },
  };
}
