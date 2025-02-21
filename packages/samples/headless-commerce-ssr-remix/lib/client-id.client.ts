/**
 * Determines whether the client allows Coveo requests to capture analytics data.
 *
 * @returns `true` if the client allows Coveo to capture analytics data, `false` otherwise.
 */
export const isUserTrackingAllowedByClient = (): boolean => {
  // Actual implementation should verify whether the user has somehow indicated that they do not wish to be tracked.

  return true; // This is a placeholder implementation that always returns `true`.
};

/**
 * Retrieves the `clientId` value from the `coveo_visitorId` document cookie if possible, or generates a new one.
 *
 * @returns The parsed value retrieved from the `coveo_visitorId` document cookie if available, or a new random clientId
 * otherwise (UUID).
 */
export const retrieveOrGenerateClientId = (): string => {
  return (
    document.cookie
      .split('; ')
      .find((cookie) => cookie.startsWith('coveo_visitorId='))
      ?.split('=')[1] ?? globalThis.crypto.randomUUID()
  );
};
