import {createSelector} from '@reduxjs/toolkit';
import {CommerceAPIErrorStatusResponse} from '../../../api/commerce/commerce-api-error-response';
import {Product} from '../../../api/commerce/common/product';
import {
  CommerceEngine,
  CommerceEngineState,
} from '../../../app/commerce-engine/commerce-engine';
import {stateKey} from '../../../app/state-key';
import {recommendationsOptionsSchema} from '../../../features/commerce/recommendations/recommendations';
import {
  fetchMoreRecommendations,
  fetchRecommendations,
  registerRecommendationsSlot,
} from '../../../features/commerce/recommendations/recommendations-actions';
import {recommendationsReducer as recommendations} from '../../../features/commerce/recommendations/recommendations-slice';
import {loadReducerError} from '../../../utils/errors';
import {validateInitialState} from '../../../utils/validate-payload';
import {
  buildController,
  Controller,
} from '../../controller/headless-controller';
import {
  BaseSolutionTypeSubControllers,
  buildBaseSubControllers,
} from '../core/sub-controller/headless-sub-controller';

/**
 * The `Recommendations` controller exposes a method for retrieving recommendations content in a commerce interface.
 */
export interface Recommendations
  extends Controller,
    BaseSolutionTypeSubControllers {
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
  /**
   * The unique identifier of the recommendations slot (e.g., `b953ab2e-022b-4de4-903f-68b2c0682942`).
   */
  slotId: string;
  /**
   * The unique identifier of the product to use for seeded recommendations.
   */
  productId?: string;
}

interface RecommendationsProps {
  options: RecommendationsOptions;
}

/**
 * Creates a `Recommendations` controller instance.
 *
 * @param engine - The headless commerce engine.
 * @param props - The configurable `Recommendations` controller properties.
 * @returns A `Recommendations` controller instance.
 */
export function buildRecommendations(
  engine: CommerceEngine,
  props: RecommendationsProps
): Recommendations {
  if (!loadBaseRecommendationsReducers(engine)) {
    throw loadReducerError;
  }

  validateInitialState(
    engine,
    recommendationsOptionsSchema,
    props.options,
    'buildRecommendations'
  );

  const controller = buildController(engine);
  const {dispatch} = engine;

  const {slotId, productId} = props.options;
  dispatch(registerRecommendationsSlot({slotId}));

  const recommendationStateSelector = createSelector(
    (state: CommerceEngineState) => state.recommendations[slotId]!,
    (recommendations) => recommendations
  );
  const subControllers = buildBaseSubControllers(engine, {
    slotId,
    responseIdSelector: (state) => state.recommendations[slotId]!.responseId,
    fetchProductsActionCreator: () => fetchRecommendations({slotId}),
    fetchMoreProductsActionCreator: () => fetchMoreRecommendations({slotId}),
  });

  return {
    ...controller,
    ...subControllers,

    get state() {
      return recommendationStateSelector(engine[stateKey]);
    },

    refresh: () => dispatch(fetchRecommendations({slotId, productId})),
  };
}

function loadBaseRecommendationsReducers(
  engine: CommerceEngine
): engine is CommerceEngine {
  engine.addReducers({recommendations});
  return true;
}
