import {
  DidYouMeanState,
  DidYouMean as DidYouMeanController,
} from '@coveo/headless/ssr-commerce';
import {useEffect, useState} from 'react';

interface DidYouMeanProps {
  staticState: DidYouMeanState;
  controller?: DidYouMeanController;
}
export default function DidYouMean({staticState, controller}: DidYouMeanProps) {
  const [state, setState] = useState(staticState);

  useEffect(
    () =>
      controller?.subscribe(() => {
        setState({...controller.state});
      }),
    [controller]
  );

  if (!state.hasQueryCorrection) {
    return null;
  }

  if (state.wasAutomaticallyCorrected) {
    return (
      <div>
        <p>
          No results for <b>{state.originalQuery}</b>
        </p>
        <p>
          Query was automatically corrected to <b>{state.wasCorrectedTo}</b>
        </p>
      </div>
    );
  }

  return (
    <div>
      <p>
        Search for
        <span onClick={() => controller?.applyCorrection()}>
          <b>{state.queryCorrection.correctedQuery}</b>
        </span>
        instead?
      </p>
    </div>
  );
}
