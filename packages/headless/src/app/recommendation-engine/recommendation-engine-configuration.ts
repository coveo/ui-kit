import {Schema, StringValue} from '@coveo/bueno';
import {
  EngineConfiguration,
  engineConfigurationDefinitions,
  getSampleEngineConfiguration,
} from '../engine-configuration';

export interface RecommendationEngineConfiguration extends EngineConfiguration {
  /**
   * Specifies the name of the query pipeline to use for the query. If not specified, the default query pipeline will be used.
   */
  pipeline?: string;

  /**
   * The first level of origin of the request, typically the identifier of the graphical search interface from which the request originates.
   * Coveo Machine Learning models use this information to provide contextually relevant output.
   * Notes:
   *    This parameter will be overridden if the search request is authenticated by a search token that enforces a specific searchHub.
   *    When logging a Search usage analytics event for a query, the originLevel1 field of that event should be set to the value of the searchHub search request parameter.
   */
  searchHub?: string;
}

export const recommendationEngineConfigurationSchema = new Schema<
  RecommendationEngineConfiguration
>({
  ...engineConfigurationDefinitions,
  pipeline: new StringValue({required: false, emptyAllowed: false}),
  searchHub: new StringValue({required: false, emptyAllowed: false}),
});

export function getSampleRecommendationEngineConfiguration(): RecommendationEngineConfiguration {
  return {
    ...getSampleEngineConfiguration(),
    pipeline: 'default',
    searchHub: 'default',
  };
}
