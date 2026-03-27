import type {
  QueryCorrection,
  WordCorrection,
} from '../../../../api/search/search/query-corrections.js';
import type {CommerceEngine} from '../../../../app/commerce-engine/commerce-engine.js';
import type {FrankensteinEngine} from '../../../../app/frankenstein-engine/frankenstein-engine.js';
import {ensureCommerceEngine} from '../../../../app/frankenstein-engine/frankenstein-engine-utils.js';
import {stateKey} from '../../../../app/state-key.js';
import {didYouMeanReducer as didYouMean} from '../../../../features/commerce/did-you-mean/did-you-mean-slice.js';
import {updateQuery} from '../../../../features/commerce/query/query-actions.js';
import {executeSearch} from '../../../../features/commerce/search/search-actions.js';
import type {CommerceDidYouMeanSection} from '../../../../state/state-sections.js';
import {loadReducerError} from '../../../../utils/errors.js';
import {
  buildController,
  type Controller,
} from '../../../controller/headless-controller.js';
import type {DidYouMeanState} from '../../../did-you-mean/headless-did-you-mean.js';

export type {DidYouMeanState, QueryCorrection, WordCorrection};

/**
 * The `DidYouMean` controller is responsible for handling query corrections.
 *
 * @group Sub-controllers
 * @category DidYouMean
 */
export interface DidYouMean extends Controller {
  /**
   * Executes a search using the suggested query correction.
   *
   * Typically, you only call this method when `state.hasQueryCorrection` is `true` and `state.wasAutomaticallyCorrected` is `false`.
   * When this is the case, you could call this method when the user clicks a link to search with the suggested query correction rather than
   * with the query they originally submitted.
   */
  applyCorrection(): void;
  /**
   * A scoped and simplified part of the headless state that is relevant to the `DidYouMean` controller.
   */
  state: DidYouMeanState;
}

/**
 * The `DidYouMean` controller is responsible for handling query corrections.
 *
 * @param engine - The commerce engine.
 * @returns A `DidYouMean` controller.
 *
 * @group Sub-controllers
 * @category DidYouMean
 */
export function buildDidYouMean(
  engine: CommerceEngine | FrankensteinEngine
): DidYouMean {
  const commerceEngine = ensureCommerceEngine(engine);
  if (!loadDidYouMeanReducers(commerceEngine)) {
    throw loadReducerError;
  }

  const controller = buildController(commerceEngine);
  const getState = () => commerceEngine[stateKey].didYouMean;

  return {
    ...controller,

    applyCorrection() {
      commerceEngine.dispatch(
        updateQuery({query: this.state.queryCorrection.correctedQuery})
      );
      commerceEngine.dispatch(executeSearch());
    },

    get state() {
      const state = getState();

      return {
        originalQuery: state.originalQuery,
        wasCorrectedTo: state.wasCorrectedTo,
        queryCorrection: state.queryCorrection,
        hasQueryCorrection: state.queryCorrection.correctedQuery !== '',
        wasAutomaticallyCorrected: state.wasCorrectedTo !== '',
      };
    },
  };
}

function loadDidYouMeanReducers(
  engine: CommerceEngine
): engine is CommerceEngine<CommerceDidYouMeanSection> {
  engine.addReducers({
    didYouMean,
  });
  return true;
}
