'use client';

import {NavigatorContext} from '@coveo/headless/ssr-commerce';
import {useSearchParams} from 'next/navigation';
import {useEffect, useState} from 'react';
import {
  searchEngineDefinition,
  SearchHydratedState,
  SearchStaticState,
} from '../_lib/commerce-engine';

interface IProductPageProps {
  staticState: SearchStaticState;
  navigatorContext: NavigatorContext;
  productId: string;
}

export default function ProductPage(props: IProductPageProps) {
  const [hydratedState, setHydratedState] = useState<
    SearchHydratedState | undefined
  >(undefined);

  const {staticState, navigatorContext, productId} = props;

  const searchParams = useSearchParams();

  const price = Number(searchParams.get('price')) ?? NaN;
  const name = searchParams.get('name') ?? productId;

  // Setting the navigator context provider also in client-side before hydrating the application
  searchEngineDefinition.setNavigatorContextProvider(() => navigatorContext);

  useEffect(() => {
    searchEngineDefinition
      .hydrateStaticState({
        searchAction: staticState.searchAction,
      })
      .then(({engine, controllers}) => {
        setHydratedState({engine, controllers});
      });
  }, [staticState]);

  const controller = hydratedState?.controllers.productView;

  useEffect(() => {
    controller?.view({name, productId, price});
  }, [controller, productId, name, price]);

  return (
    <p>
      {name} ({productId}) - ${price}
    </p>
  );
}
