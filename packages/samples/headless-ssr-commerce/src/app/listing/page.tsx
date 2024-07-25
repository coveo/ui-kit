import ListingPage from '../../components/listing-page';
import {fetchStaticState} from '../../lib/commerce-engine';

/**
 * This file defines a List component that uses the Coveo Headless SSR commerce library to manage its state.
 *
 * The Listing function is the entry point for server-side rendering (SSR).
 */
export default async function Listing() {
  const staticState = await fetchStaticState();
  console.log('*********************');
  console.log(staticState.controllers);
  console.log('*********************');

  return <ListingPage staticState={staticState}></ListingPage>;
}

export const dynamic = 'force-dynamic';
