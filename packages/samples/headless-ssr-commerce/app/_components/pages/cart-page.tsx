'use client';

import {NavigatorContext} from '@coveo/headless/ssr-commerce';
import {useEffect, useState} from 'react';
import {
  StandaloneStaticState,
  StandaloneHydratedState,
  standaloneEngineDefinition,
} from '../../_lib/commerce-engine';
import Cart from '../cart';

export default function CartPage({
  staticState,
  navigatorContext,
}: {
  staticState: StandaloneStaticState;
  navigatorContext: NavigatorContext;
}) {
  const [hydratedState, setHydratedState] = useState<
    StandaloneHydratedState | undefined
  >(undefined);

  // Setting the navigator context provider also in client-side before hydrating the application
  standaloneEngineDefinition.setNavigatorContextProvider(
    () => navigatorContext
  );

  useEffect(() => {
    standaloneEngineDefinition
      .hydrateStaticState({
        searchAction: staticState.searchAction,
      })
      .then(({engine, controllers}) => {
        setHydratedState({engine, controllers});

        // Refreshing recommendations in the browser after hydrating the state in the client-side
        // Recommendation refresh in the server is not supported yet.
        controllers.popularBoughtRecs.refresh();
        controllers.popularViewedRecs.refresh();
      });
  }, [staticState]);

  return (
    <>
      <Cart
        staticState={staticState.controllers.cart.state}
        controller={hydratedState?.controllers.cart}
        staticContextState={staticState.controllers.context.state}
        contextController={hydratedState?.controllers.context}
      />
    </>
  );
}
