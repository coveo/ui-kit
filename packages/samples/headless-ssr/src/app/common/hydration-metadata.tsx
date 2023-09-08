import {FunctionComponent} from 'react';
import {
  SearchHydratedState,
  SearchInitialState,
} from '../generic/common/engine';

export interface HydrationMetadataProps {
  initialState: SearchInitialState;
  hydratedState?: SearchHydratedState;
}

export const HydrationMetadata: FunctionComponent<HydrationMetadataProps> = ({
  initialState,
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
        (hydratedState ?? initialState).controllers.resultList.state.results
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
