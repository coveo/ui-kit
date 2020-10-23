import {Engine} from '../../app/headless-engine';
import {buildController} from '../controller/headless-controller';
import {
  applyDidYouMeanCorrection,
  enableDidYouMean,
} from '../../features/did-you-mean/did-you-mean-actions';
import {logDidYouMeanClick} from '../../features/did-you-mean/did-you-mean-analytics-actions';
import {executeSearch} from '../../features/search/search-actions';
import {
  ConfigurationSection,
  DidYouMeanSection,
} from '../../state/state-sections';

/**
 * The DidYouMean controller is responsible for handling query corrections.
 * When a query returns no result but finds a possible query correction, the controller either suggests the correction or
 * automatically triggers a new query with the suggested term.
 */
export type DidYouMean = ReturnType<typeof buildDidYouMean>;
export type DidYouMeanState = DidYouMean['state'];

export const buildDidYouMean = (
  engine: Engine<ConfigurationSection & DidYouMeanSection>
) => {
  const controller = buildController(engine);
  const {dispatch} = engine;

  dispatch(enableDidYouMean());

  return {
    ...controller,

    /**
     * @returns The state of the `DidYouMean` controller.
     */
    get state() {
      const state = engine.state;

      return {
        ...state.didYouMean,
        hasQueryCorrection:
          state.didYouMean.queryCorrection.correctedQuery !== '' ||
          state.didYouMean.wasCorrectedTo !== '',
      };
    },

    /**
     * Apply query correction using the query correction, if any, currently present in the state.
     */
    applyCorrection() {
      dispatch(
        applyDidYouMeanCorrection(this.state.queryCorrection.correctedQuery)
      );
      dispatch(executeSearch(logDidYouMeanClick()));
    },
  };
};
