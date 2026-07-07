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
}
