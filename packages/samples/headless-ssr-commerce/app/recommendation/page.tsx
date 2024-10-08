import {headers} from 'next/headers';
import Recommendation from '../_components/pages/recommendation';
import {standaloneEngineDefinition} from '../_lib/commerce-engine';
import {NextJsNavigatorContext} from '../_lib/navigatorContextProvider';

/**
 * This file defines a List component that uses the Coveo Headless SSR commerce library to manage its state.
 *
 * The Listing function is the entry point for server-side rendering (SSR).
 */
export default async function RecommendationPage() {
  // Sets the navigator context provider to use the newly created `navigatorContext` before fetching the app static state
  const navigatorContext = new NextJsNavigatorContext(headers());
  standaloneEngineDefinition.setNavigatorContextProvider(
    () => navigatorContext
  );

  // Fetches the static state of the app with initial state (when applicable)
  const staticState = await standaloneEngineDefinition.fetchStaticState();

  return (
    <Recommendation
      staticState={staticState}
      navigatorContext={navigatorContext.marshal}
    ></Recommendation>
  );
}

export const dynamic = 'force-dynamic';
