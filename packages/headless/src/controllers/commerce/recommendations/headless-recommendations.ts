import {createSelector} from '@reduxjs/toolkit';
import {CommerceAPIErrorStatusResponse} from '../../../api/commerce/commerce-api-error-response';
import {Product} from '../../../api/commerce/common/product';
import {
  CommerceEngine,
  CommerceEngineState,
} from '../../../app/commerce-engine/commerce-engine';
import {recommendationsOptionsSchema} from '../../../features/commerce/recommendations/recommendations';
import {
  fetchRecommendations,
  updateRecommendationsSlotId,
} from '../../../features/commerce/recommendations/recommendations-actions';
import {recommendationsReducer as recommendations} from '../../../features/commerce/recommendations/recommendations-slice';
import {loadReducerError} from '../../../utils/errors';
import {validateInitialState} from '../../../utils/validate-payload';
import {
  buildController,
  Controller,
} from '../../controller/headless-controller';

/**
 * The `Recommendations` controller exposes a method for retrieving recommendations content in a commerce interface.
 */
export interface Recommendations extends Controller {
  /**
   * Fetches the recommendations.
   */
  refresh(): void;

  /**
   * A scoped and simplified part of the headless state that is relevant to the `Recommendations` controller.
   */
  state: RecommendationsState;
}

export interface RecommendationsState {
  headline: string;
  products: Product[];
  error: CommerceAPIErrorStatusResponse | null;
  isLoading: boolean;
  responseId: string;
}

export interface RecommendationsOptions {
  slotId: string;
}

interface RecommendationsProps {
  options: RecommendationsOptions;
}

/**
 * Creates a `Recommendations` controller instance.
 *
 * @param engine - The headless commerce engine.
 * @returns A `Recommendations` controller instance.
 */
export function buildRecommendations(
  engine: CommerceEngine,
  props: RecommendationsProps
): Recommendations {
  if (!loadBaseRecommendationsReducers(engine)) {
    throw loadReducerError;
  }

  const controller = buildController(engine);
  const {dispatch} = engine;

  validateInitialState(
    engine,
    recommendationsOptionsSchema,
    props.options,
    'buildRecommendations'
  );
  dispatch(updateRecommendationsSlotId({slotId: props.options.slotId}));

  const recommendationStateSelector = createSelector(
    (state: CommerceEngineState) => state.recommendations,
    (recommendations) => recommendations
  );

  return {
    ...controller,

    get state() {
      return recommendationStateSelector(engine.state);
    },

    refresh: () => dispatch(fetchRecommendations()),
  };
}

function loadBaseRecommendationsReducers(
  engine: CommerceEngine
): engine is CommerceEngine {
  engine.addReducers({recommendations});
  return true;
}
