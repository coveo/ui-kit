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
 * `Recommendation` controller allows to retrieve information about the current recommendations by the search API, if any.
 */
export type RecommendationList = ReturnType<typeof buildRecommendationList>;
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
    buildRecommendationList.name
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
