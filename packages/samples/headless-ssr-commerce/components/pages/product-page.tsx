'use client';

import {
  standaloneEngineDefinition,
  StandaloneHydratedState,
  StandaloneStaticState,
} from '@/lib/commerce-engine';
import {NavigatorContext} from '@coveo/headless-react/ssr-commerce';
import {useSearchParams} from 'next/navigation';
import {useEffect, useState} from 'react';

interface IProductPageProps {
  staticState: StandaloneStaticState;
  navigatorContext: NavigatorContext;
  productId: string;
}

export default function ProductPage(props: IProductPageProps) {
  const [hydratedState, setHydratedState] = useState<
    StandaloneHydratedState | undefined
  >(undefined);

  const {staticState, navigatorContext, productId} = props;

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

  const viewController = hydratedState?.controllers.productView;

  useEffect(() => {
    viewController?.view({name, productId, price});
  }, [viewController, productId, name, price]);

  return (
    <>
      <p>
        {name} ({productId}) - ${price}
      </p>
      <br />
    </>
  );
}
