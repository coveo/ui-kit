import {headers} from 'next/headers';
import Recommendation from '../_components/recommendation';
import {recommendationEngineDefinition} from '../_lib/commerce-engine';
import {NextJsNavigatorContext} from '../_lib/navigatorContextProvider';

/**
 * This file defines a List component that uses the Coveo Headless SSR commerce library to manage its state.
 *
 * The Listing function is the entry point for server-side rendering (SSR).
 */
export default async function RecommendationPage() {
  // Sets the navigator context provider to use the newly created `navigatorContext` before fetching the app static state
  const navigatorContext = new NextJsNavigatorContext(headers());
  recommendationEngineDefinition.setNavigatorContextProvider(
    () => navigatorContext
  );

  // Fetches the static state of the app with initial state (when applicable)
  const staticState = await recommendationEngineDefinition.fetchStaticState({
    // TODO: would be nice to have inference on the slotIds or controller name
    recommendationSlots: [
      // 'd73afbd2-8521-4ee6-a9b8-31f064721e73',
      // 'af4fb7ba-6641-4b67-9cf9-be67e9f30174',
      'popularViewedRecs',
      'popularBoughtRecs',
    ],
  });

  return (
    <Recommendation
      staticState={staticState}
      navigatorContext={navigatorContext.marshal}
    ></Recommendation>
  );
}

export const dynamic = 'force-dynamic';
