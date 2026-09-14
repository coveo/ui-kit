type TokenChangeCallback = (accessToken: string) => void;

/**
 * This helper allows updating the search token at any point in the SSR workflow—before or after
 * static state creation, and before or after hydration.
 */
export function createAccessTokenManager(initialToken: string) {
  const subscriptions = new Set<WeakRef<TokenChangeCallback>>();
  // Anchors each callback's lifetime to its owner engine so the GC releases the subscription only
  // once the engine itself is unreachable, never while the engine is still alive.
  const callbacksByOwner = new WeakMap<WeakKey, TokenChangeCallback>();
  const collectedSubscriptions = new FinalizationRegistry<WeakRef<TokenChangeCallback>>(
    (subscription) => {
      subscriptions.delete(subscription);
    }
  );
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

      let notified = false;
      for (const subscription of subscriptions) {
        const callback = subscription.deref();
        if (callback === undefined) {
          subscriptions.delete(subscription);
          continue;
        }
        callback(accessToken);
        notified = true;
      }

      queuedToken = notified ? null : accessToken;
    },

    /**
     * Registers a callback function to be invoked when the access token changes.
     * If there's a queued token, the callback will be invoked immediately.
     *
     * @param callback - Invoked with the new token on every subsequent change.
     * @param owner - The object whose lifetime bounds the subscription (the engine).
     * @returns An unsubscribe function that removes the callback immediately.
     */
    registerCallback(callback: TokenChangeCallback, owner: WeakKey): () => void {
      const subscription = new WeakRef(callback);
      subscriptions.add(subscription);
      callbacksByOwner.set(owner, callback);
      collectedSubscriptions.register(callback, subscription, callback);

      if (queuedToken) {
        callback(queuedToken);
        queuedToken = null;
      }

      return () => {
        subscriptions.delete(subscription);
        callbacksByOwner.delete(owner);
        collectedSubscriptions.unregister(callback);
      };
    },
  };
}
