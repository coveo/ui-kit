import type {QueryCorrection} from '../../../api/search/search/query-corrections.js';
import {configuration} from '../../../app/common-reducers.js';
import type {CoreEngine} from '../../../app/engine.js';
import {
  applyDidYouMeanCorrection,
  disableAutomaticQueryCorrection,
  enableDidYouMean,
  setCorrectionMode,
} from '../../../features/did-you-mean/did-you-mean-actions.js';
import {hasQueryCorrectionSelector} from '../../../features/did-you-mean/did-you-mean-selectors.js';
import {didYouMeanReducer as didYouMean} from '../../../features/did-you-mean/did-you-mean-slice.js';
import type {
  ConfigurationSection,
  DidYouMeanSection,
} from '../../../state/state-sections.js';
import {loadReducerError} from '../../../utils/errors.js';
import {
  buildController,
  type Controller,
} from '../../controller/headless-controller.js';

export interface DidYouMeanProps {
  options?: DidYouMeanOptions;
}

type QueryCorrectionMode = 'legacy' | 'next';

export interface DidYouMeanOptions {
  /**
   * Whether to automatically apply corrections for queries that would otherwise return no results.
   * When `automaticallyCorrectQuery` is `true`, the controller automatically triggers a new query using the suggested term.
   * When `automaticallyCorrectQuery` is `false`, the controller returns the suggested term without triggering a new query.
   *
   * The default value is `true`.
   */
  automaticallyCorrectQuery?: boolean;

  /**
   * Define which query correction system to use
   *
   * `legacy`: Query correction is powered by the legacy index system. This system relies on an algorithm using solely the index content to compute the suggested terms.
   * `next`: Query correction is powered by a machine learning system, requiring a valid query suggestion model configured in your Coveo environment to function properly. This system relies on machine learning algorithms to compute the suggested terms.
   *
   * Default value is `next`.
   */
  queryCorrectionMode?: QueryCorrectionMode;
}

/**
 * The `DidYouMean` controller is responsible for handling query corrections.
 *
 * Example: [did-you-mean.fn.tsx](https://github.com/coveo/ui-kit/blob/main/samples/headless/search-react/src/components/did-you-mean/did-you-mean.fn.tsx)
 *
 * @group Controllers
 * @category DidYouMean
 */
export interface DidYouMean extends Controller {
  /**
   * Apply query correction using the query correction, if any, currently present in the state.
   */
  applyCorrection(): void;

  /**
   * Update which query correction system to use
   *
   * `legacy`: Query correction is powered by the legacy index system. This system relies on an algorithm using solely the index content to compute the suggested terms.
   * `next`: Query correction is powered by a machine learning system, requiring a valid query suggestion model configured in your Coveo environment to function properly. This system relies on machine learning algorithms to compute the suggested terms.
   *
   *  @param queryCorrectionMode - the query correction mode to use
   *
   */
  updateQueryCorrectionMode(queryCorrectionMode: QueryCorrectionMode): void;

  /**
   * The state of the `DidYouMean` controller.
   */
  state: DidYouMeanState;
}

/**
 * A scoped and simplified part of the headless engine that is relevant to the `DidYouMean` controller.
 *
 * @group Controllers
 * @category DidYouMean
 */
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
 *
 * @group Controllers
 * @category DidYouMean
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

  if (props.options?.automaticallyCorrectQuery === false) {
    dispatch(disableAutomaticQueryCorrection());
  }

  dispatch(setCorrectionMode(props.options?.queryCorrectionMode || 'next'));

  const getState = () => engine.state;
  const hasQueryCorrection = () =>
    hasQueryCorrectionSelector(getState().didYouMean);

  return {
    ...controller,

    get state() {
      const state = getState();

      return {
        originalQuery: state.didYouMean.originalQuery,
        wasCorrectedTo: state.didYouMean.wasCorrectedTo,
        wasAutomaticallyCorrected: state.didYouMean.wasAutomaticallyCorrected,
        queryCorrection: state.didYouMean.queryCorrection,
        hasQueryCorrection: hasQueryCorrection(),
      };
    },

    applyCorrection() {
      dispatch(
        applyDidYouMeanCorrection(this.state.queryCorrection.correctedQuery)
      );
    },
    updateQueryCorrectionMode(queryCorrectionMode: QueryCorrectionMode) {
      dispatch(setCorrectionMode(queryCorrectionMode));
    },
  };
}

function loadDidYouMeanReducers(
  engine: CoreEngine
): engine is CoreEngine<ConfigurationSection & DidYouMeanSection> {
  engine.addReducers({configuration, didYouMean});
  return true;
}
