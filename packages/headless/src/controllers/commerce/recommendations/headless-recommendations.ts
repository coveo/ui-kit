import type {CommerceAPIErrorStatusResponse} from '../../../api/commerce/commerce-api-error-response.js';
import type {
  ChildProduct,
  Product,
} from '../../../api/commerce/common/product.js';
import type {
  CommerceEngine,
  CommerceEngineState,
} from '../../../app/commerce-engine/commerce-engine.js';
import {stateKey} from '../../../app/state-key.js';
import {
  pageRecommendationSelector,
  perPageRecommendationSelector,
  totalEntriesRecommendationSelector,
} from '../../../features/commerce/pagination/pagination-selectors.js';
import {recommendationsOptionsSchema} from '../../../features/commerce/recommendations/recommendations.js';
import {
  fetchMoreRecommendations,
  fetchRecommendations,
  promoteChildToParent,
  registerRecommendationsSlot,
} from '../../../features/commerce/recommendations/recommendations-actions.js';
import {
  isLoadingSelector,
  numberOfRecommendationsSelector,
} from '../../../features/commerce/recommendations/recommendations-selectors.js';
import {recommendationsReducer as recommendations} from '../../../features/commerce/recommendations/recommendations-slice.js';
import {loadReducerError} from '../../../utils/errors.js';
import {validateInitialState} from '../../../utils/validate-payload.js';
import {
  buildController,
  type Controller,
} from '../../controller/headless-controller.js';
import {
  type BaseSolutionTypeSubControllers,
  buildBaseSubControllers,
} from '../core/sub-controller/headless-sub-controller.js';
import type {SummaryState} from '../core/summary/headless-core-summary.js';
import type {RecommendationsSummaryState} from './summary/headless-recommendations-summary.js';

/**
 * The `Recommendations` controller exposes a method for retrieving recommendations content in a commerce interface.
 *
 * Example: [recommendations.fn.tsx](https://github.com/coveo/ui-kit/blob/main/samples/headless/search-react/src/components/commerce/recommendations.fn.tsx)
 *
 * @group Buildable controllers
 * @category Recommendations
 */
export interface Recommendations
  extends Controller,
    BaseSolutionTypeSubControllers<SummaryState> {
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
   * For example, if a product has children (such as color variations), you can call this method when the user selects a child
   * to make that child the new parent product, and re-render the product as such in the storefront.
   *
   * **Note:** In the controller state, a product that has children will always include itself as its own child so that
   * it can be rendered as a nested product, and restored as the parent product through this method as needed.
   *
   * @param child The child product that will become the new parent.
   */
  promoteChildToParent(child: ChildProduct): void;

  /**
   * A scoped and simplified part of the headless state that is relevant to the `Recommendations` controller.
   *
   * @group Buildable controllers
   * @category Recommendations
   */
  state: RecommendationsState;
}

export interface RecommendationsState {
  headline: string;
  products: Product[];
  error: CommerceAPIErrorStatusResponse | null;
  isLoading: boolean;
  responseId: string;
  productId?: string;
}

export interface RecommendationsOptions {
  /**
   * The unique identifier of the recommendations slot (for example, `b953ab2e-022b-4de4-903f-68b2c0682942`).
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
 *
 * @group Buildable controllers
 * @category Recommendations
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
  dispatch(registerRecommendationsSlot({slotId, productId}));

  const recommendationStateSelector = (state: CommerceEngineState) =>
    state.recommendations[slotId]!;

  const subControllers = buildBaseSubControllers<RecommendationsSummaryState>(
    engine,
    {
      slotId,
      responseIdSelector: (state) => state.recommendations[slotId]!.responseId,
      fetchProductsActionCreator: () => fetchRecommendations({slotId}),
      fetchMoreProductsActionCreator: () => fetchMoreRecommendations({slotId}),
      isLoadingSelector: (state) => isLoadingSelector(state, slotId),
      errorSelector: (state) => state.recommendations[slotId]!.error,
      pageSelector: (state) => pageRecommendationSelector(state, slotId),
      perPageSelector: (state) => perPageRecommendationSelector(state, slotId),
      totalEntriesSelector: (state) =>
        totalEntriesRecommendationSelector(state, slotId),
      numberOfProductsSelector: (state) =>
        numberOfRecommendationsSelector(state, slotId),
    }
  );

  return {
    ...controller,
    ...subControllers,

    promoteChildToParent(child: ChildProduct) {
      dispatch(promoteChildToParent({child, slotId}));
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
