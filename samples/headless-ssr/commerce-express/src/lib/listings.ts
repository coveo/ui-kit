/**
 * The category listings available in the sample's merchandising hub. In a real
 * storefront these would come from your catalog rather than a hardcoded list.
 *
 * This is the single source of truth for both the header navigation
 * (`components/Header.ts`) and the server's `/listing/:listingId` route
 * (`server.ts`), so the tabs and the set of valid listings never drift apart.
 */
export interface Listing {
  /** URL slug used in `/listing/:listingId`. */
  id: string;
  /** Human-readable label shown in the header navigation. */
  label: string;
}

export const LISTINGS: Listing[] = [
  {id: 'surf-accessories', label: 'Surf Accessories'},
  {id: 'paddleboards', label: 'Paddleboards'},
  {id: 'toys', label: 'Toys'},
];

/** Valid listing slugs, used to validate the `/listing/:listingId` route. */
export const LISTING_IDS = new Set(LISTINGS.map((listing) => listing.id));
