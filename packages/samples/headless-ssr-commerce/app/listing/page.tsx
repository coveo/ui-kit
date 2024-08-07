import {headers} from 'next/headers';
import ListingPage from '../_components/listing-page';
import {listingEngineDefinition} from '../_lib/commerce-engine';
import {NextJsNavigatorContext} from '../_lib/navigatorContextProvider';

/**
 * This file defines a List component that uses the Coveo Headless SSR commerce library to manage its state.
 *
 * The Listing function is the entry point for server-side rendering (SSR).
 */
export default async function Listing() {
  // Sets the navigator context provider to use the newly created `navigatorContext` before fetching the app static state
  const navigatorContext = new NextJsNavigatorContext(headers());
  listingEngineDefinition.setNavigatorContextProvider(() => navigatorContext);

  // Fetches the static state of the app with initial state (when applicable)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const staticState = await (listingEngineDefinition.fetchStaticState as any)({
    recommendationSlots: ['slot-1', 'slot-2'],
  });

  return (
    // TODO: remove page suffix since it is a component!
    <ListingPage
      staticState={staticState}
      navigatorContext={navigatorContext.marshal}
    ></ListingPage>
  );
}

export const dynamic = 'force-dynamic';
