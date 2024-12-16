import {
  ListingHydratedState,
  ListingStaticState,
  SearchHydratedState,
  SearchStaticState,
} from '@/lib/commerce-engine';
import {FunctionComponent} from 'react';

export interface HydrationMetadataProps {
  staticState: SearchStaticState | ListingStaticState;
  hydratedState?: SearchHydratedState | ListingHydratedState;
}

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
