'use client';

import {
  listingEngineDefinition,
  ListingHydratedState,
  ListingStaticState,
} from '@/lib/commerce-engine';
import {NavigatorContext} from '@coveo/headless-react/ssr-commerce';
import {PropsWithChildren, useEffect, useState} from 'react';
import {HydrationMetadata} from '../hydration-metadata';

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
        searchActions: staticState.searchActions,
        controllers: {
          cart: {
            initialState: {items: staticState.controllers.cart.state.items},
          },
          context: staticState.controllers.context.state,
        },
      })
      .then(({engine, controllers}) => {
        setHydratedState({engine, controllers});
      });
  }, [staticState]);

  if (hydratedState) {
    return (
      <listingEngineDefinition.HydratedStateProvider
        engine={hydratedState.engine}
        controllers={hydratedState.controllers}
      >
        {children}
        <HydrationMetadata
          staticState={staticState}
          hydratedState={hydratedState}
        />
      </listingEngineDefinition.HydratedStateProvider>
    );
  } else {
    return (
      <listingEngineDefinition.StaticStateProvider
        controllers={staticState.controllers}
      >
        {children} <HydrationMetadata staticState={staticState} />
      </listingEngineDefinition.StaticStateProvider>
    );
  }
}
