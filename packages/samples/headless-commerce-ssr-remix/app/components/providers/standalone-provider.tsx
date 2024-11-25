import {
  standaloneEngineDefinition,
  StandaloneHydratedState,
  StandaloneStaticState,
} from '@/lib/commerce-engine';
import {NavigatorContext} from '@coveo/headless-react/ssr-commerce';
import {PropsWithChildren, useEffect, useState} from 'react';

interface StandaloneProviderProps {
  staticState: StandaloneStaticState;
  navigatorContext: NavigatorContext;
}

export default function StandaloneProvider({
  staticState,
  navigatorContext,
  children,
}: PropsWithChildren<StandaloneProviderProps>) {
  const [hydratedState, setHydratedState] = useState<
    StandaloneHydratedState | undefined
  >(undefined);

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
          parameterManager: {initialState: {parameters: {}}},
        },
      })
      .then(({engine, controllers}) => {
        setHydratedState({engine, controllers});
      });
  }, [staticState]);

  if (hydratedState) {
    return (
      <standaloneEngineDefinition.HydratedStateProvider
        engine={hydratedState.engine}
        controllers={hydratedState.controllers}
      >
        {children}
      </standaloneEngineDefinition.HydratedStateProvider>
    );
  } else {
    return (
      <standaloneEngineDefinition.StaticStateProvider
        controllers={staticState.controllers}
      >
        {children}
      </standaloneEngineDefinition.StaticStateProvider>
    );
  }
}
