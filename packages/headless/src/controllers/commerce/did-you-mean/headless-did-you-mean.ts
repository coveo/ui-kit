import {
  QueryCorrection,
  WordCorrection,
} from '../../../api/search/search/query-corrections';
import {CommerceEngine} from '../../../app/commerce-engine/commerce-engine';
import {stateKey} from '../../../app/state-key';
import {didYouMeanReducer as didYouMean} from '../../../features/commerce/did-you-mean/did-you-mean-slice';
import {hasQueryCorrectionSelector} from '../../../features/did-you-mean/did-you-mean-selectors';
import {CommerceDidYouMeanSection} from '../../../state/state-sections';
import {loadReducerError} from '../../../utils/errors';
import {
  buildController,
  Controller,
} from '../../controller/headless-controller';
import {DidYouMeanState} from '../../did-you-mean/headless-did-you-mean';

export type {QueryCorrection, WordCorrection, DidYouMeanState};

export interface DidYouMean extends Controller {
  /**
   * A scoped and simplified part of the headless state that is relevant to the `DidYouMean` controller.
   */
  state: DidYouMeanState;
}

/**
 * The DidYouMean controller is responsible for handling query corrections.
 * When a query returns no result but finds a possible query correction, the controller automatically triggers a new
 * query with the suggested term.
 *
 * @param engine - The headless commerce engine.
 */
export function buildDidYouMean(engine: CommerceEngine): DidYouMean {
  if (!loadDidYouMeanReducers(engine)) {
    throw loadReducerError;
  }

  const controller = buildController(engine);
  const getState = () => engine[stateKey];

  const hasQueryCorrection = () =>
    hasQueryCorrectionSelector(getState().didYouMean);

  return {
    ...controller,

    get state() {
      const state = getState();

      return {
        originalQuery: state.didYouMean.originalQuery,
        wasCorrectedTo: state.didYouMean.wasCorrectedTo,
        queryCorrection: state.didYouMean.queryCorrection,
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
