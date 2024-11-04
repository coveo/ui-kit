'use client';

import {
  standaloneEngineDefinition,
  StandaloneHydratedState,
  StandaloneStaticState,
} from '@/lib/commerce-engine';
import {NavigatorContext} from '@coveo/headless-react/ssr-commerce';
import {useSearchParams} from 'next/navigation';
import {PropsWithChildren, useEffect, useState} from 'react';

interface ProductProviderProps {
  staticState: StandaloneStaticState;
  navigatorContext: NavigatorContext;
  productId: string;
}

export default function ProductProvider({
  staticState,
  navigatorContext,
  productId,
  children,
}: PropsWithChildren<ProductProviderProps>) {
  const [hydratedState, setHydratedState] = useState<
    StandaloneHydratedState | undefined
  >(undefined);

  const searchParams = useSearchParams();

  const price = Number(searchParams.get('price')) ?? NaN;
  const name = searchParams.get('name') ?? productId;

  // Setting the navigator context provider also in client-side before hydrating the application
  standaloneEngineDefinition.setNavigatorContextProvider(
    () => navigatorContext
  );

  useEffect(() => {
    standaloneEngineDefinition
      .hydrateStaticState({
        searchAction: staticState.searchAction,
        controllers: {
          parameterManager: {
            initialState: {parameters: {}},
          },
        },
      })
      .then(({engine, controllers}) => {
        setHydratedState({engine, controllers});

        // Refreshing recommendations in the browser after hydrating the state in the client-side
        // Recommendation refresh in the server is not supported yet.
        controllers.popularBoughtRecs.refresh();
      });
  }, [staticState]);

  const viewController = hydratedState?.controllers.productView;

  useEffect(() => {
    viewController?.view({name, productId, price});
  }, [viewController, productId, name, price]);

  const renderProductName = () => {
    return (
      <p>
        {name} ({productId}) - ${price}
      </p>
    );
  };

  if (hydratedState) {
    return (
      <standaloneEngineDefinition.HydratedStateProvider
        engine={hydratedState.engine}
        controllers={hydratedState.controllers}
      >
        {/* // TODO: KIT-3701: Type 'React.ReactNode' is not assignable to type 'import(".../node_modules/@types/react/index").ReactNode'.
  Type 'bigint' is not assignable to type 'ReactNode'.*/}
        <>
          {renderProductName()}
          {children}
        </>
      </standaloneEngineDefinition.HydratedStateProvider>
    );
  } else {
    return (
      <standaloneEngineDefinition.StaticStateProvider
        controllers={staticState.controllers}
      >
        {/* // TODO: KIT-3701: Type 'React.ReactNode' is not assignable to type 'import(".../node_modules/@types/react/index").ReactNode'.
  Type 'bigint' is not assignable to type 'ReactNode'.*/}
        <>
          {renderProductName()}
          {children}
        </>
      </standaloneEngineDefinition.StaticStateProvider>
    );
  }
}
