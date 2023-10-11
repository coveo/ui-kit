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
  enableFallbackSearchOnEmptyQueryResults,
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
import {Logger} from 'pino';

export type {QueryCorrection, WordCorrection};

export interface DidYouMeanProps {
  options?: DidYouMeanOptions;
}

export interface DidYouMeanOptions {
  /**
   * Whether to automatically apply corrections for queries that would otherwise return no results.
   * When `automaticallyCorrectQuery` is `true`, the controller automatically triggers a new query using the suggested term.
   * When `automaticallyCorrectQuery` is `false`, the controller returns the suggested term without triggering a new query.
   *
   * The default value is `true`.
   */
  automaticallyCorrectQuery?: boolean;
  // TODO: V3: Change the default to true
  /**
   * Whether to use machine learning powered query suggestions model as a fallback to provide query corrections.
   * This system requires a working and properly configured query suggestions model in the Coveo platform.
   *
   * This option is off by default. As such, the Coveo platform will use an older query correction system, powered solely by the index.
   * By opting in this new system, the Coveo Search API will stop returning the `queryCorrections` field in the response.
   * Instead, it will start returning a `changedQuery` field.
   * This implies that the usage of this option introduce a breaking change in the way query corrections are handled, both at the Search API and Headless level.
   *
   * The default value is `false`.
   */
  enableFallbackSearchOnEmptyQueryResults?: boolean;
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
  const {dispatch, logger} = engine;

  dispatch(enableDidYouMean());
  warnAboutMismatchBetweenQuerySuggestionFallbackAndAutomaticQueryCorrection(
    logger,
    props
  );

  if (props.options?.automaticallyCorrectQuery === false) {
    dispatch(disableAutomaticQueryCorrection());
  }
  if (props.options?.enableFallbackSearchOnEmptyQueryResults === true) {
    dispatch(enableFallbackSearchOnEmptyQueryResults());
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

function warnAboutMismatchBetweenQuerySuggestionFallbackAndAutomaticQueryCorrection(
  logger: Logger,
  props: DidYouMeanProps
) {
  if (
    props.options?.automaticallyCorrectQuery === false &&
    props.options.enableFallbackSearchOnEmptyQueryResults === true
  ) {
    logger.warn(
      '#automaticallyCorrectQuery is set to false, but #useQuerySuggestionsForQueryCorrections is set to true. This is a mismatch. Please disable the query suggestions fallback if you want to disable the automatic query correction. #useQuerySuggestionsForQueryCorrections will be ignored.'
    );
  }
}
