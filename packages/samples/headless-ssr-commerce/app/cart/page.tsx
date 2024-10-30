import {headers} from 'next/headers';
import CartPage from '../_components/pages/cart-page';
import {standaloneEngineDefinition} from '../_lib/commerce-engine';
import {NextJsNavigatorContext} from '../_lib/navigatorContextProvider';

/**
 * This file defines a List component that uses the Coveo Headless SSR commerce library to manage its state.
 *
 * The Listing function is the entry point for server-side rendering (SSR).
 */
export default async function Page() {
  // Sets the navigator context provider to use the newly created `navigatorContext` before fetching the app static state
  const navigatorContext = new NextJsNavigatorContext(headers());
  standaloneEngineDefinition.setNavigatorContextProvider(
    () => navigatorContext
  );

  // Fetches the static state of the app with initial state (when applicable)
  const staticState = await standaloneEngineDefinition.fetchStaticState();

  return (
    <CartPage
      staticState={staticState}
      navigatorContext={navigatorContext.marshal}
    ></CartPage>
  );
}

export const dynamic = 'force-dynamic';
