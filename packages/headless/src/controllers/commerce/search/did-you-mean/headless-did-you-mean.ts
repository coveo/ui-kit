import {
  QueryCorrection,
  WordCorrection,
} from '../../../../api/search/search/query-corrections';
import {CommerceEngine} from '../../../../app/commerce-engine/commerce-engine';
import {stateKey} from '../../../../app/state-key';
import {didYouMeanReducer as didYouMean} from '../../../../features/commerce/did-you-mean/did-you-mean-slice';
import {hasQueryCorrectionSelector} from '../../../../features/did-you-mean/did-you-mean-selectors';
import {CommerceDidYouMeanSection} from '../../../../state/state-sections';
import {loadReducerError} from '../../../../utils/errors';
import {
  buildController,
  Controller,
} from '../../../controller/headless-controller';
import {DidYouMeanState} from '../../../did-you-mean/headless-did-you-mean';

export type {QueryCorrection, WordCorrection, DidYouMeanState};

/**
 * Represents the `DidYouMean` controller.
 * This controller is responsible for managing the state and behavior related to the "Did You Mean" feature in a search interface.
 */
export interface DidYouMean extends Controller {
  /**
   * A scoped and simplified part of the headless state that is relevant to the `DidYouMean` controller.
   */
  state: DidYouMeanState;
}

/**
 * Builds a DidYouMean object that provides functionality for handling query corrections.
 *
 * @param engine - The CommerceEngine instance.
 * @returns A DidYouMean object.
 */
export function buildDidYouMean(engine: CommerceEngine): DidYouMean {
  if (!loadDidYouMeanReducers(engine)) {
    throw loadReducerError;
  }

  const controller = buildController(engine);
  const getState = () => engine[stateKey].didYouMean;

  /**
   * Checks if there is a query correction available.
   *
   * @returns A boolean indicating whether there is a query correction.
   */
  const hasQueryCorrection = () => hasQueryCorrectionSelector(getState());

  return {
    ...controller,

    /**
     * Gets the current state of the DidYouMean object.
     *
     * @returns An object representing the state of the DidYouMean object.
     */
    get state() {
      const state = getState();

      return {
        originalQuery: state.originalQuery,
        wasCorrectedTo: state.wasCorrectedTo,
        queryCorrection: state.queryCorrection,
        hasQueryCorrection: hasQueryCorrection(),
        wasAutomaticallyCorrected: hasQueryCorrection(),
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
