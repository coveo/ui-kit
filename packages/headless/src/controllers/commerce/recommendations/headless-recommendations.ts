import {Schema} from '@coveo/bueno';
import {createSelector} from '@reduxjs/toolkit';
import {CommerceAPIErrorStatusResponse} from '../../../api/commerce/commerce-api-error-response';
import {ProductRecommendation} from '../../../api/search/search/product-recommendation';
import {
  CommerceEngine,
  CommerceEngineState,
} from '../../../app/commerce-engine/commerce-engine';
import {configuration} from '../../../app/common-reducers';
import {contextReducer as commerceContext} from '../../../features/commerce/context/context-slice';
import {recommendationSlotDefinition} from '../../../features/commerce/recommendation/recommendation';
import {
  fetchRecommendations,
  updateRecommendationSlotId,
} from '../../../features/commerce/recommendation/recommendation-actions';
import {recommendationV2Reducer as recommendation} from '../../../features/commerce/recommendation/recommendation-slice';
import {loadReducerError} from '../../../utils/errors';
import {validateInitialState} from '../../../utils/validate-payload';
import {
  buildController,
  Controller,
} from '../../controller/headless-controller';

/**
 * The `Recommendations` controller exposes a method for retrieving recomendations content in a commerce interface.
 */
export interface Recommendation extends Controller {
  /**
   * Fetches the recommendations.
   */
  refresh(): void;

  /**
   * A scoped and simplified part of the headless state that is relevant to the `Recommendation` controller.
   */
  state: RecommendationState;
}

export interface RecommendationState {
  headline: string;
  products: ProductRecommendation[];
  error: CommerceAPIErrorStatusResponse | null;
  isLoading: boolean;
  responseId: string;
}

export type RecommendationControllerState = Recommendation['state'];

interface RecommendationsOptions {
  slotId: string;
}

interface RecommendationsProps {
  options: RecommendationsOptions;
}

function validateRecommendationInitialState(
  engine: CommerceEngine,
  state: RecommendationsOptions
) {
  if (!state) {
    return;
  }

  const schema = new Schema<RecommendationsOptions>({
    slotId: recommendationSlotDefinition,
  });

  validateInitialState(engine, schema, state, 'buildRecommendations');
}
/**
 * Creates a `Recommendation` controller instance.
 *
 * @param engine - The headless commerce engine.
 * @returns A `Recommendation` controller instance.
 */
export function buildRecommendations(
  engine: CommerceEngine,
  props: RecommendationsProps
): Recommendation {
  if (!loadBaseRecommendationReducers(engine)) {
    throw loadReducerError;
  }

  const controller = buildController(engine);
  const {dispatch} = engine;

  validateRecommendationInitialState(engine, props.options);
  dispatch(updateRecommendationSlotId({slotId: props.options.slotId}));

  const recommendationStateSelector = createSelector(
    (state: CommerceEngineState) => state.recommendation,
    (recommendation) => ({
      headline: recommendation.headline,
      products: recommendation.products,
      error: recommendation.error,
      isLoading: recommendation.isLoading,
      responseId: recommendation.responseId,
    })
  );

  return {
    ...controller,

    get state() {
      return recommendationStateSelector(engine.state);
    },

    refresh: () => dispatch(fetchRecommendations()),
  };
}

function loadBaseRecommendationReducers(
  engine: CommerceEngine
): engine is CommerceEngine {
  engine.addReducers({recommendation, commerceContext, configuration});
  return true;
}
