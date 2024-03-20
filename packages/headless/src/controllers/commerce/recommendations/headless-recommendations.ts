import {CommerceAPIErrorStatusResponse} from '../../../api/commerce/commerce-api-error-response';
import {ProductRecommendation} from '../../../api/search/search/product-recommendation';
import {CommerceEngine} from '../../../app/commerce-engine/commerce-engine';
import {configuration} from '../../../app/common-reducers';
import {contextReducer as commerceContext} from '../../../features/commerce/context/context-slice';
import {
  fetchRecommendation,
  updateRecommendationSlotId,
} from '../../../features/commerce/recommendation/recommendation-actions';
import {recommendationV2Reducer as recommendation} from '../../../features/commerce/recommendation/recommendation-slice';
import {loadReducerError, slotIdError} from '../../../utils/errors';
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
   * A scoped and simplified part of the headless state that is relevant to the `ProductListing` controller.
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

/**
 * Creates a `ProductListing` controller instance.
 *
 * @param engine - The headless commerce engine.
 * @returns A `ProductListing` controller instance.
 */
export function buildRecommendations(
  slotId: string,
  engine: CommerceEngine
): Recommendation {
  if (slotId === '') {
    throw slotIdError;
  }

  if (!loadBaseRecommendationReducers(engine)) {
    throw loadReducerError;
  }

  const controller = buildController(engine);
  const {dispatch} = engine;
  dispatch(updateRecommendationSlotId({slotId}));

  const getState = () => engine.state;

  return {
    ...controller,

    get state() {
      const {headline, products, error, isLoading, responseId} =
        getState().recommendation;

      return {
        headline,
        products,
        error,
        isLoading,
        responseId,
      };
    },

    refresh: () => dispatch(fetchRecommendation()),
  };
}

function loadBaseRecommendationReducers(
  engine: CommerceEngine
): engine is CommerceEngine {
  engine.addReducers({recommendation, commerceContext, configuration});
  return true;
}
