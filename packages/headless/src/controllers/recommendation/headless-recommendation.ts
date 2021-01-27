import {Engine} from '../../app/headless-engine';
import {
  getRecommendations,
  setRecommendationId,
} from '../../features/recommendation/recommendation-actions';
import {
  ConfigurationSection,
  RecommendationSection,
} from '../../state/state-sections';
import {buildController} from '../controller/headless-controller';
import {Schema, SchemaValues, StringValue} from '@coveo/bueno';
import {validateOptions} from '../../utils/validate-payload';

const optionsSchema = new Schema({
  /**
   * The Recommendation identifier used by the Coveo platform to retrieve recommended documents.
   * If not provided, will use default value of `Recommendation`.
   */
  id: new StringValue<string>({
    emptyAllowed: true,
    required: false,
    default: '',
  }),
});

export type RecommendationListOptions = SchemaValues<typeof optionsSchema>;

export interface RecommendationListProps {
  options?: RecommendationListOptions;
}

/**
 * The `RecommendationList` controller retrieves information about the current recommendations by the search API, if there are any.
 */
export type RecommendationList = ReturnType<typeof buildRecommendationList>;
/** The state relevant to the `RecommendationList` controller.*/
export type RecommendationListState = RecommendationList['state'];

export function buildRecommendationList(
  engine: Engine<RecommendationSection & ConfigurationSection>,
  props: RecommendationListProps = {}
) {
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
    /**
     * Gets new recommendations.
     */
    refresh() {
      dispatch(getRecommendations());
    },
    /**
     * The state of the `Recommendation` controller.
     */
    get state() {
      const state = engine.state;

      return {
        /** The recommendations based on the last executed query. */
        recommendations: state.recommendation.recommendations,
        /** The current error for the last executed query, or `null` if none is present. */
        error: state.recommendation.error,
        /** `true` if a search is in progress and `false` otherwise. */
        isLoading: state.recommendation.isLoading,
      };
    },
  };
}
