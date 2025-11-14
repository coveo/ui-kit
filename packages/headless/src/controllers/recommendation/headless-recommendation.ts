import {NumberValue, Schema, StringValue} from '@coveo/bueno';
import type {Result} from '../../api/search/search/result.js';
import {configuration} from '../../app/common-reducers.js';
import type {RecommendationEngine} from '../../app/recommendation-engine/recommendation-engine.js';
import {loadPaginationActions} from '../../features/pagination/pagination-actions-loader.js';
import {
  getRecommendations,
  setRecommendationId,
} from '../../features/recommendation/recommendation-actions.js';
import {recommendationReducer as recommendation} from '../../features/recommendation/recommendation-slice.js';
import {loadReducerError} from '../../utils/errors.js';
import {validateOptions} from '../../utils/validate-payload.js';
import type {ErrorPayload} from '../controller/error-payload.js';
import {
  buildController,
  type Controller,
} from '../controller/headless-controller.js';

const optionsSchema = new Schema<RecommendationListOptions>({
  id: new StringValue<string>({
    emptyAllowed: true,
    required: false,
    default: '',
  }),
  numberOfRecommendations: new NumberValue({min: 0}),
});

export interface RecommendationListOptions {
  /**
   * The Recommendation identifier used by the Coveo platform to retrieve recommended documents.
   *
   * @defaultValue `Recommendation`
   */
  id?: string;
  /**
   * The number of recommendations to return.
   */
  numberOfRecommendations?: number;
}

export interface RecommendationListProps {
  options?: RecommendationListOptions;
}

/**
 * The `RecommendationList` controller retrieves information about the current recommendations by the search API, if there are any.
 *
 * Example: [recommendation-list.fn.tsx](https://github.com/coveo/ui-kit/blob/main/samples/headless/search-react/src/components/recommendation-list/recommendation-list.fn.tsx)
 *
 * @group Controllers
 * @category RecommendationList
 */
export interface RecommendationList extends Controller {
  /**
   * Gets new recommendations.
   */
  refresh(): void;

  /**
   * The state relevant to the `RecommendationList` controller.
   * */
  state: RecommendationListState;
}

/**
 * A scoped and simplified part of the headless state that is relevant to the `RecommendationList` controller.
 */
export interface RecommendationListState {
  /**
   * The current error for the last executed query, or `null` if none is present.
   * */
  error: ErrorPayload | null;

  /**
   * `true` if a search is in progress and `false` otherwise.
   * */
  isLoading: boolean;

  /**
   * The recommendations based on the last executed query.
   * */
  recommendations: Result[];

  /**
   * The unique identifier of the Search API response from which the recommendations were fetched.
   */
  searchResponseId: string;
}

/**
 * Creates a `RecommendationList` controller instance.
 *
 * @param engine - The headless engine.
 * @param props - The configurable `RecommendationList` properties.
 * @returns A `RecommendationList` controller instance.
 *
 * @group Controllers
 * @category RecommendationList
 */
export function buildRecommendationList(
  engine: RecommendationEngine,
  props: RecommendationListProps = {}
): RecommendationList {
  if (!loadRecommendationListReducers(engine)) {
    throw loadReducerError;
  }

  const controller = buildController(engine);
  const {dispatch} = engine;
  const getState = () => engine.state;

  const options = validateOptions(
    engine,
    optionsSchema,
    props.options,
    'buildRecommendationList'
  ) as Required<RecommendationListOptions>;

  if (options.id !== '') {
    dispatch(setRecommendationId({id: options.id}));
  }

  if (options.numberOfRecommendations) {
    dispatch(
      loadPaginationActions(engine).updateNumberOfResults(
        options.numberOfRecommendations
      )
    );
  }

  return {
    ...controller,

    refresh() {
      dispatch(getRecommendations());
    },

    get state() {
      const state = getState();

      return {
        recommendations: state.recommendation.recommendations,
        error: state.recommendation.error,
        isLoading: state.recommendation.isLoading,
        searchResponseId: state.recommendation.searchUid,
      };
    },
  };
}

function loadRecommendationListReducers(
  engine: RecommendationEngine
): engine is RecommendationEngine {
  engine.addReducers({recommendation, configuration});
  return true;
}
