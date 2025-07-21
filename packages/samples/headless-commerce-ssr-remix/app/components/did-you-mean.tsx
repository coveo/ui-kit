import {useDidYouMean} from '@/lib/commerce-engine';

export default function DidYouMean() {
  const {state, methods} = useDidYouMean();

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
          onClick={() => methods?.applyCorrection()}
          onKeyUp={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              methods?.applyCorrection();
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
