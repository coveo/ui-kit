'use client';

import {
  listingEngineDefinition,
  searchEngineDefinition,
} from '@/lib/commerce-engine';
import {
  InferHydratedState,
  InferStaticState,
} from '@coveo/headless-react/ssr-commerce';
import {FunctionComponent} from 'react';

export interface HydrationMetadataProps {
  staticState:
    | InferStaticState<typeof searchEngineDefinition>
    | InferStaticState<typeof listingEngineDefinition>;
  hydratedState?:
    | InferHydratedState<typeof searchEngineDefinition>
    | InferHydratedState<typeof listingEngineDefinition>;
}

// This component displays metadata about the hydration state of the page.
// IMPORTANT: It was created for testing our package.
// You won't have to create this component yourself. This is just an internal tool.
export const HydrationMetadata: FunctionComponent<HydrationMetadataProps> = ({
  staticState,
  hydratedState,
}) => {
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
        products
      </span>
      <div id="cart-msg">
        Items in cart:{' '}
        {(hydratedState ?? staticState).controllers.cart.state.items.length}
      </div>
      <div>
        Rendered on{' '}
        <span id="timestamp" suppressHydrationWarning>
          {new Date().toISOString()}
        </span>
      </div>
    </>
  );
};
