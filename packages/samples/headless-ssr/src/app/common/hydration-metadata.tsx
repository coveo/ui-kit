import {FunctionComponent} from 'react';
import {SearchCSRState, SearchSSRState} from '../generic/common/engine';

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
      Hydrated:{' '}
      <input
        id="hydrated-indicator"
        type="checkbox"
        readOnly
        checked={!!csrResult}
      />
    </div>
    <span id="hydrated-msg">
      Rendered page with{' '}
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
