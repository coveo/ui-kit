/**
 * Navigator Context Feature Types
 *
 * Stores runtime navigation data used when building commerce requests.
 */

export interface NavigatorContextState {
  clientId: string;
  userAgent: string | null;
  url: string | null;
  referrer: string | null;
}
