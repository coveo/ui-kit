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
          No results for <b>{state.originalQuery}</b>. Query was automatically
          corrected to <b>{state.wasCorrectedTo}</b>.
        </p>
      </div>
    );
  }

  return (
    <div>
      <p>
        Did you mean
        <span onClick={() => methods?.applyCorrection()}>
          <u>{state.queryCorrection.correctedQuery}</u>?
        </span>
      </p>
    </div>
  );
}
