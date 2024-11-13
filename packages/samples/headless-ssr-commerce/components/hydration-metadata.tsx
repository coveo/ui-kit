'use client';

import {
  searchEngineDefinition,
  SearchHydratedState,
  SearchStaticState,
} from '@/lib/commerce-engine';
import {FunctionComponent, useEffect, useState} from 'react';

export interface HydrationMetadataProps {
  staticState: SearchStaticState;
}

export const HydrationMetadata: FunctionComponent<HydrationMetadataProps> = ({
  staticState,
}) => {
  const [hydratedState, setHydratedState] = useState<
    SearchHydratedState | undefined
  >(undefined);

  useEffect(() => {
    const {} = staticState.controllers;
    searchEngineDefinition
      .hydrateStaticState({
        searchAction: staticState.searchAction,
        controllers: {
          context: staticState.controllers.context.state,
          cart: {initialState: staticState.controllers.cart.state},
        },
      })
      .then(({engine, controllers}) => {
        setHydratedState({engine, controllers});
      });
  }, [staticState]);
  return (
    <>
      <div>
        Hydrated:{' '}
        <input
          id="hydrated-indicator"
          type="checkbox"
          disabled
          checked={!!hydratedState}
        />
      </div>
      <span id="hydrated-msg">
        Rendered page with{' '}
        {
          (hydratedState ?? staticState).controllers.productList.state.products
            .length
        }{' '}
        results
      </span>
      <div>
        Rendered on{' '}
        <span id="timestamp" suppressHydrationWarning>
          {new Date().toISOString()}
        </span>
      </div>
    </>
  );
};
