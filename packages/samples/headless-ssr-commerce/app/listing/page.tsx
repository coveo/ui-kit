import {headers} from 'next/headers';
import ListingPage from '../_components/listing-page';
import {
  fetchStaticState,
  setNavigatorContextProvider,
} from '../_lib/commerce-engine';
import {NextJsNavigatorContext} from '../_lib/navigatorContextProvider';

/**
 * This file defines a List component that uses the Coveo Headless SSR commerce library to manage its state.
 *
 * The Listing function is the entry point for server-side rendering (SSR).
 */
export default async function Listing() {
  const navigatorContext = new NextJsNavigatorContext(headers());
  setNavigatorContextProvider(() => navigatorContext);
  const staticState = await fetchStaticState();

  return (
    <ListingPage
      navigatorContext={navigatorContext.marshal}
      staticState={staticState}
    ></ListingPage>
  );
}

export const dynamic = 'force-dynamic';
