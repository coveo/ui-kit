'use client';

import {
  StandaloneHydratedState,
  StandaloneStaticState,
  standaloneEngineDefinition,
} from '@/lib/commerce-engine';
import {NavigatorContext} from '@coveo/headless-react/ssr-commerce';
import {PropsWithChildren, useEffect, useState} from 'react';

interface StandalonePageProps {
  staticState: StandaloneStaticState;
  navigatorContext: NavigatorContext;
}

export default function StandaloneProvider({
  staticState,
  navigatorContext,
  children,
}: PropsWithChildren<StandalonePageProps>) {
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

        // Refreshing recommendations in the browser after hydrating the state in the client-side
        // Recommendation refresh in the server is not supported yet.
        // controllers.popularBoughtRecs.refresh();
      });
  }, [staticState]);

  if (hydratedState) {
    return (
      <standaloneEngineDefinition.HydratedStateProvider
        engine={hydratedState.engine}
        controllers={hydratedState.controllers}
      >
        {/* // TODO: KIT-3701: Type 'React.ReactNode' is not assignable to type 'import(".../node_modules/@types/react/index").ReactNode'.
  Type 'bigint' is not assignable to type 'ReactNode'.*/}
        <>{children}</>
      </standaloneEngineDefinition.HydratedStateProvider>
    );
  } else {
    return (
      <standaloneEngineDefinition.StaticStateProvider
        controllers={staticState.controllers}
      >
        {/* // TODO: KIT-3701: Type 'React.ReactNode' is not assignable to type 'import(".../node_modules/@types/react/index").ReactNode'.
  Type 'bigint' is not assignable to type 'ReactNode'.*/}
        <>{children}</>
      </standaloneEngineDefinition.StaticStateProvider>
    );
  }
}
