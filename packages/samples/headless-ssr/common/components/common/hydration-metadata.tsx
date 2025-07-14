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
        (hydratedState ?? staticState).controllers.resultList.state.results
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
