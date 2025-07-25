import type {DidYouMean as HeadlessDidYouMean} from '@coveo/headless';
import {type FunctionComponent, useEffect, useState} from 'react';

interface DidYouMeanProps {
  controller: HeadlessDidYouMean;
}

export const DidYouMean: FunctionComponent<DidYouMeanProps> = (props) => {
  const {controller} = props;
  const [state, setState] = useState(controller.state);

  useEffect(() => controller.subscribe(() => setState(controller.state)), []);

  if (!state.hasQueryCorrection) {
    return null;
  }

  if (state.wasAutomaticallyCorrected) {
    return (
      <div>
        <p>
          No results for{' '}
          <b>{state.queryCorrection.wordCorrections![0].originalWord}</b>
        </p>
        <p>
          Query was automatically corrected to <b>{state.wasCorrectedTo}</b>
        </p>
      </div>
    );
  }

  return (
    <button onClick={() => controller.applyCorrection()}>
      Did you mean: {state.queryCorrection.correctedQuery} ?
    </button>
  );
};

// usage

/**
 * ```tsx
 * const controller = buildDidYouMean(engine);
 *
 * <DidYouMean controller={controller} />;
 * ```
 */
