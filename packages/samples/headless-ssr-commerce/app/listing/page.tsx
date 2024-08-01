import ListingPage from '../_components/listing-page';
import {ProductListingEngine} from '../_lib/commerce-engine';

/**
 * This file defines a List component that uses the Coveo Headless SSR commerce library to manage its state.
 *
 * The Listing function is the entry point for server-side rendering (SSR).
 */
export default async function Listing() {
  const staticState = await ProductListingEngine.fetchStaticState();

  return <ListingPage staticState={staticState}></ListingPage>;
}

export const dynamic = 'force-dynamic';
