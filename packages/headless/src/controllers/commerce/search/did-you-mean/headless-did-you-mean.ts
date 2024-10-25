import {
  QueryCorrection,
  WordCorrection,
} from '../../../../api/search/search/query-corrections.js';
import {CommerceEngine} from '../../../../app/commerce-engine/commerce-engine.js';
import {stateKey} from '../../../../app/state-key.js';
import {didYouMeanReducer as didYouMean} from '../../../../features/commerce/did-you-mean/did-you-mean-slice.js';
import {CommerceDidYouMeanSection} from '../../../../state/state-sections.js';
import {loadReducerError} from '../../../../utils/errors.js';
import {
  buildController,
  Controller,
} from '../../../controller/headless-controller.js';
import {DidYouMeanState} from '../../../did-you-mean/headless-did-you-mean.js';

export type {QueryCorrection, WordCorrection, DidYouMeanState};

/**
 * The `DidYouMean` controller is responsible for handling query corrections.
 *
 * @group Sub-controllers
 * @category DidYouMean
 */
export interface DidYouMean extends Controller {
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
export function buildDidYouMean(engine: CommerceEngine): DidYouMean {
  if (!loadDidYouMeanReducers(engine)) {
    throw loadReducerError;
  }

  const controller = buildController(engine);
  const getState = () => engine[stateKey].didYouMean;

  return {
    ...controller,

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
