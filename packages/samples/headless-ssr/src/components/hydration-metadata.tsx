import {FunctionComponent} from 'react';
import {SearchCSRState, SearchSSRState} from '../common/engine';

export interface HydrationMetadataProps {
  initialState: SearchSSRState;
  hydrationResult?: SearchCSRState;
}

export const HydrationMetadata: FunctionComponent<HydrationMetadataProps> = ({
  initialState,
  hydrationResult,
}) => (
  <>
    <div>
      Hydrated:{' '}
      <span id="hydrated-indicator">{hydrationResult ? 'yes' : 'no'}</span>
    </div>
    <span id="hydrated-msg">
      Rendered engine with{' '}
      {
        (hydrationResult ?? initialState).controllers.resultList.state.results
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
