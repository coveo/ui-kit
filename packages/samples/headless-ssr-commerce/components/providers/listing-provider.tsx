'use client';

import {
  listingEngineDefinition,
  ListingHydratedState,
  ListingStaticState,
} from '@/lib/commerce-engine';
import {
  loadSearchActions,
  NavigatorContext,
} from '@coveo/headless-react/ssr-commerce';
import {PropsWithChildren, useEffect, useState} from 'react';

interface ListingPageProps {
  staticState: ListingStaticState;
  navigatorContext: NavigatorContext;
}

export default function ListingProvider({
  staticState,
  navigatorContext,
  children,
}: PropsWithChildren<ListingPageProps>) {
  const [hydratedState, setHydratedState] = useState<
    ListingHydratedState | undefined
  >(undefined);

  // Setting the navigator context provider also in client-side before hydrating the application
  listingEngineDefinition.setNavigatorContextProvider(() => navigatorContext);

  useEffect(() => {
    listingEngineDefinition
      .hydrateStaticState({
        searchAction: staticState.searchAction,
        controllers: {
          cart: {
            initialState: {items: staticState.controllers.cart.state.items},
          },
          context: staticState.controllers.context.state,
        },
      })
      .then(({engine, controllers}) => {
        setHydratedState({engine, controllers});
        engine.addReducers({});
        const {executeSearch} = loadSearchActions(engine);
        engine.dispatch(executeSearch());
        // Refreshing recommendations in the browser after hydrating the state in the client-side
        // Recommendation refresh in the server is not supported yet.
        // controllers.popularBoughtRecs.refresh(); // FIXME: does not work
      });
  }, [staticState]);

  if (hydratedState) {
    return (
      <listingEngineDefinition.HydratedStateProvider
        engine={hydratedState.engine}
        controllers={hydratedState.controllers}
      >
        <>{children}</>
      </listingEngineDefinition.HydratedStateProvider>
    );
  } else {
    return (
      <listingEngineDefinition.StaticStateProvider
        controllers={staticState.controllers}
      >
        {/* // TODO: Add KIT-3701:  Type 'React.ReactNode' is not assignable to type 'import(".../node_modules/@types/react/index").ReactNode'.
  Type 'bigint' is not assignable to type 'ReactNode'.*/}
        <>{children}</>
      </listingEngineDefinition.StaticStateProvider>
    );
  }
}
