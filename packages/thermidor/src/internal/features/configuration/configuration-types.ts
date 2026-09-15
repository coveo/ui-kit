/**
 * Configuration Feature Types
 *
 * This file defines types for the configuration feature.
 * CRITICAL: NO imports from @reduxjs/toolkit or immer allowed.
 */

/**
 * Configuration state
 */
export interface ConfigurationState {
  /** Coveo organization ID */
  organizationId: string;
  /** Access token for API authentication */
  accessToken: string;
  /** Tracking identifier for commerce requests */
  trackingId: string;
  /** Request language */
  language: string;
  /** Request country */
  country: string;
  /** Request currency */
  currency: string;
  /** Optional API endpoint URL */
  endpoint?: string;
  /**
   * Full override for the converse request URL. When set, Thermidor sends every
   * converse request to this exact URL, bypassing all endpoint/path composition
   * (organization endpoint resolution and the `/api/preview/.../agui/converse`
   * path).
   *
   * Escape hatch for fast iteration — e.g. pointing at a local gateway or an
   * internal endpoint — until catalog-bound endpoint resolution lands. For
   * normal proxying, prefer the `endpoint` base override instead.
   *
   * @internal
   */
  converseUrl?: string;
}
