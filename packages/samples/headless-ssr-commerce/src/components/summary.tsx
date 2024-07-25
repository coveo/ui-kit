import {
  ProductListingSummaryState,
  Summary as SummaryController,
} from '@coveo/headless/ssr-commerce';
import {useEffect, useState, FunctionComponent} from 'react';
import {ListingHydratedState} from '../lib/commerce-engine';

interface SummaryProps {
  hydratedState?: ListingHydratedState;
  staticState: ProductListingSummaryState;
  controller?: SummaryController;
}

export const Summary: FunctionComponent<SummaryProps> = ({
  staticState,
  hydratedState,
  controller,
}: SummaryProps) => {
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
