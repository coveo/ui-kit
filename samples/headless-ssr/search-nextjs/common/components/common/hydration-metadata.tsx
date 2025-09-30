import type {FunctionComponent} from 'react';
import type {
  SearchHydratedState,
  SearchStaticState,
} from '../../lib/generic/engine';

export interface HydrationMetadataProps {
  staticState: SearchStaticState;
  hydratedState?: SearchHydratedState;
}

export const HydrationMetadata: FunctionComponent<HydrationMetadataProps> = ({
  staticState,
  hydratedState,
}) => (
  <>
    <div>
      Hydrated: <input type="checkbox" disabled checked={!!hydratedState} />
    </div>
    <span data-testid="hydrated-results-count">
      Rendered page with{' '}
      {
        (hydratedState ?? staticState).controllers.resultList.state.results
          .length
      }{' '}
      results
    </span>
    <div>
      Rendered on{' '}
      <span data-testid="hydrated-timestamp" suppressHydrationWarning>
        {new Date().toISOString()}
      </span>
    </div>
  </>
);
