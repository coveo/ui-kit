import type {DidYouMean as HeadlessDidYouMean} from '@coveo/headless/commerce';
import {useEffect, useState} from 'react';

interface IDidYouMeanProps {
  controller: HeadlessDidYouMean;
}

export default function DidYouMean(props: IDidYouMeanProps) {
  const {controller} = props;

  const [state, setState] = useState(controller.state);

  useEffect(() => {
    controller.subscribe(() => setState(controller.state));
  }, [controller]);

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
        {/** biome-ignore lint/a11y/noStaticElementInteractions: <> */}
        <span
          onClick={() => controller?.applyCorrection()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              controller?.applyCorrection();
            }
          }}
        >
          <b>{state.queryCorrection.correctedQuery}</b>
        </span>
        instead?
      </p>
    </div>
  );
}
