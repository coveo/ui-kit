import {
  listingEngineDefinition,
  ListingHydratedState,
  ListingStaticState,
} from '@/lib/commerce-engine';
import {NavigatorContext} from '@coveo/headless-react/ssr-commerce';
import {PropsWithChildren, useEffect, useState} from 'react';

interface ListingProviderProps {
  staticState: ListingStaticState;
  navigatorContext: NavigatorContext;
}

export default function ListingProvider({
  staticState,
  navigatorContext,
  children,
}: PropsWithChildren<ListingProviderProps>) {
  const [hydratedState, setHydratedState] = useState<
    ListingHydratedState | undefined
  >(undefined);

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
          parameterManager: {
            initialState: {
              parameters:
                staticState.controllers.parameterManager.state.parameters,
            },
          },
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
      </listingEngineDefinition.HydratedStateProvider>
    );
  } else {
    return (
      <listingEngineDefinition.StaticStateProvider
        controllers={staticState.controllers}
      >
        {children}
      </listingEngineDefinition.StaticStateProvider>
    );
  }
}
