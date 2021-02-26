import {Engine} from '../../app/headless-engine';
import {buildController, Controller} from '../controller/headless-controller';
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
import {
  QueryCorrection,
  WordCorrection,
} from '../../api/search/search/query-corrections';

export {QueryCorrection, WordCorrection};

export interface DidYouMean extends Controller {
  /**
   * Apply query correction using the query correction, if any, currently present in the state.
   */
  applyCorrection(): void;

  /**
   * The state of the `DidYouMean` controller.
   */
  state: DidYouMeanState;
}

export interface DidYouMeanState {
  /**
   * The correction that was applied to the query. If no correction was applied, will default to an empty string.
   */
  wasCorrectedTo: string;

  /**
   * Specifies if the query was automatically corrected by Headless.
   *
   * This happens when there is no result returned by the API for a particular mispelling.
   */
  wasAutomaticallyCorrected: boolean;

  /**
   * The query correction that is currently applied by the "did you mean" module.
   */
  queryCorrection: QueryCorrection;

  /**
   * Specifies if there is a query correction to apply.
   */
  hasQueryCorrection: boolean;
}

/**
 * The DidYouMean controller is responsible for handling query corrections.
 * When a query returns no result but finds a possible query correction, the controller either suggests the correction or
 * automatically triggers a new query with the suggested term.
 *
 * @param engine - The headless engine.
 */
export function buildDidYouMean(
  engine: Engine<ConfigurationSection & DidYouMeanSection>
): DidYouMean {
  const controller = buildController(engine);
  const {dispatch} = engine;

  dispatch(enableDidYouMean());

  return {
    ...controller,

    get state() {
      const state = engine.state;

      return {
        wasCorrectedTo: state.didYouMean.wasCorrectedTo,
        wasAutomaticallyCorrected: state.didYouMean.wasAutomaticallyCorrected,
        queryCorrection: state.didYouMean.queryCorrection,
        hasQueryCorrection:
          state.didYouMean.queryCorrection.correctedQuery !== '' ||
          state.didYouMean.wasCorrectedTo !== '',
      };
    },

    applyCorrection() {
      dispatch(
        applyDidYouMeanCorrection(this.state.queryCorrection.correctedQuery)
      );
      dispatch(executeSearch(logDidYouMeanClick()));
    },
  };
}
