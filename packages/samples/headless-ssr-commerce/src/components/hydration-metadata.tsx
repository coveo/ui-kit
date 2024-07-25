import {
  ProductListingSummaryState,
  Summary as SummaryController,
} from '@coveo/headless/ssr-commerce';
import {FunctionComponent, useEffect, useState} from 'react';
import {SearchHydratedState as ListingSearchHydratedState} from '../lib/generic/commerce-listing-engine';
import {SearchHydratedState as SearchSearchHydratedState} from '../lib/generic/commerce-search-engine';

export interface HydrationMetadataProps {
  searchOrListingHydratedState?:
    | ListingSearchHydratedState
    | SearchSearchHydratedState;
  staticState: ProductListingSummaryState;
  controller?: SummaryController;
}

export const HydrationMetadata: FunctionComponent<HydrationMetadataProps> = ({
  staticState,
  searchOrListingHydratedState: hydratedState,
  controller,
}) => {
  const [state, setState] = useState(staticState);

  useEffect(
    () => controller?.subscribe?.(() => setState({...controller.state})),
    [controller]
  );
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
        Rendered page with {state.totalNumberOfProducts} results
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
