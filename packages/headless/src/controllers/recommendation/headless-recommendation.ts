import {Engine} from '../../app/headless-engine';
import {
  getRecommendations,
  setRecommendationId,
} from '../../features/recommendation/recommendation-actions';
import {
  ConfigurationSection,
  RecommendationSection,
} from '../../state/state-sections';
import {buildController, Controller} from '../controller/headless-controller';
import {Schema, StringValue} from '@coveo/bueno';
import {validateOptions} from '../../utils/validate-payload';
import {Result} from '../../api/search/search/result';
import {ErrorPayload} from '../controller/error-payload';

const optionsSchema = new Schema({
  id: new StringValue<string>({
    emptyAllowed: true,
    required: false,
    default: '',
  }),
});

export interface RecommendationListOptions {
  /**
   * The Recommendation identifier used by the Coveo platform to retrieve recommended documents.
   *
   * @default "Recommendation".
   */
  id?: string;
}

export interface RecommendationListProps {
  options?: RecommendationListOptions;
}

/**
 * The `RecommendationList` controller retrieves information about the current recommendations by the search API, if there are any.
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
}

/**
 * Creates a `RecommendationList` controller instance.
 *
 * @param engine - The headless engine.
 * @param props - The configurable `RecommendationList` properties.
 * @returns A `RecommendationList` controller instance.
 */
export function buildRecommendationList(
  engine: Engine<RecommendationSection & ConfigurationSection>,
  props: RecommendationListProps = {}
): RecommendationList {
  const controller = buildController(engine);
  const {dispatch} = engine;
  const options = validateOptions(
    engine,
    optionsSchema,
    props.options,
    'buildRecommendationList'
  ) as Required<RecommendationListOptions>;

  if (options.id !== '') {
    dispatch(setRecommendationId({id: options.id}));
  }

  return {
    ...controller,

    refresh() {
      dispatch(getRecommendations());
    },

    get state() {
      const state = engine.state;

      return {
        recommendations: state.recommendation.recommendations,
        error: state.recommendation.error,
        isLoading: state.recommendation.isLoading,
      };
    },
  };
}
