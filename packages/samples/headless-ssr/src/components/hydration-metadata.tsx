import {FunctionComponent} from 'react';
import {SearchCSRState, SearchSSRState} from '../common/engine';

export interface HydrationMetadataProps {
  ssrState: SearchSSRState;
  csrResult?: SearchCSRState;
}

export const HydrationMetadata: FunctionComponent<HydrationMetadataProps> = ({
  ssrState,
  csrResult,
}) => (
  <>
    <div>
      Hydrated: <span id="hydrated-indicator">{csrResult ? 'yes' : 'no'}</span>
    </div>
    <span id="hydrated-msg">
      Rendered engine with{' '}
      {(csrResult ?? ssrState).controllers.resultList.state.results.length}{' '}
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
