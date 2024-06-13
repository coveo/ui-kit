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
  promoteChildToParent,
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
   * Finds the specified parent product and the specified child product of that parent, and makes that child the new
   * parent. The `children` and `totalNumberOfChildren` properties of the original parent are preserved in the new
   * parent.
   *
   * This method is useful when leveraging the product grouping feature to allow users to select nested products.
   *
   * E.g., if a product has children (such as color variations), you can call this method when the user selects a child
   * to make that child the new parent product, and re-render the product as such in the storefront.
   *
   * **Note:** In the controller state, a product that has children will always include itself as its own child so that
   * it can be rendered as a nested product, and restored as the parent product through this method as needed.
   *
   * @param childPermanentId The permanentid of the child product that will become the new parent.
   * @param parentPermanentId The permanentid of the current parent product of the child product to promote.
   */
  promoteChildToParent(
    childPermanentId: string,
    parentPermanentId: string
  ): void;

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

export interface RecommendationsProps {
  /**
   * The options for the `Recommendations` controller.
   */
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

    promoteChildToParent(childPermanentId, parentPermanentId) {
      dispatch(
        promoteChildToParent({childPermanentId, parentPermanentId, slotId})
      );
    },

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
