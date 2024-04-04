import {
  QueryCorrection,
  WordCorrection,
} from '../../../api/search/search/query-corrections';
import {configuration} from '../../../app/common-reducers';
import {CoreEngine} from '../../../app/engine';
import {
  applyDidYouMeanCorrection,
  disableAutomaticQueryCorrection,
  enableDidYouMean,
} from '../../../features/did-you-mean/did-you-mean-actions';
import {didYouMeanReducer as didYouMean} from '../../../features/did-you-mean/did-you-mean-slice';
import {
  ConfigurationSection,
  DidYouMeanSection,
} from '../../../state/state-sections';
import {loadReducerError} from '../../../utils/errors';
import {
  buildController,
  Controller,
} from '../../controller/headless-controller';

export type {QueryCorrection, WordCorrection};

export interface DidYouMeanProps {
  /**
   * Whether to automatically apply corrections for queries that would otherwise return no results.
   * When `automaticallyCorrectQuery` is `true`, the controller automatically triggers a new query using the suggested term.
   * When `automaticallyCorrectQuery` is `false`, the controller returns the suggested term without triggering a new query.
   *
   * The default value is `true`.
   */
  automaticallyCorrectQuery?: boolean;
}
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
   * The original query that was performed, without any automatic correction applied.
   */
  originalQuery: string;
  /**
   * Specifies if the query was automatically corrected by Headless.
   *
   * This happens when there is no result returned by the API for a particular misspelling.
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
 * @param props - The configurable `DidYouMean` controller properties.
 * @returns A `DidYouMean` controller instance.
 */
export function buildCoreDidYouMean(
  engine: CoreEngine,
  props: DidYouMeanProps = {}
): DidYouMean {
  if (!loadDidYouMeanReducers(engine)) {
    throw loadReducerError;
  }

  const controller = buildController(engine);
  const {dispatch} = engine;

  dispatch(enableDidYouMean());

  if (props.automaticallyCorrectQuery === false) {
    dispatch(disableAutomaticQueryCorrection());
  }

  const getState = () => engine.state;

  return {
    ...controller,

    get state() {
      const state = getState();

      return {
        originalQuery: state.didYouMean.originalQuery,
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
    },
  };
}

function loadDidYouMeanReducers(
  engine: CoreEngine
): engine is CoreEngine<ConfigurationSection & DidYouMeanSection> {
  engine.addReducers({configuration, didYouMean});
  return true;
}
