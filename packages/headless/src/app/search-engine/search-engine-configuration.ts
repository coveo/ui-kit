import {RecordValue, Schema, StringValue} from '@coveo/bueno';
import {PreprocessRequestMiddleware} from '../../api/platform-client';
import {
  PostprocessFacetSearchResponseMiddleware,
  PostprocessQuerySuggestResponseMiddleware,
  PostprocessSearchResponseMiddleware,
} from '../../api/search/search-api-client-middleware';
import {localeValidation} from '../../features/configuration/configuration-actions';
import {
  engineConfigurationDefinitions,
  EngineConfiguration,
  getSampleEngineConfiguration,
} from '../engine-configuration';

export interface SearchEngineConfiguration extends EngineConfiguration {
  /**
   * The global headless engine configuration options specific to the SearchAPI.
   */
  search?: SearchConfigurationOptions;
}

export interface SearchConfigurationOptions {
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
  /**
   * The locale of the current user. Must comply with IETF’s BCP 47 definition: https://www.rfc-editor.org/rfc/bcp/bcp47.txt.
   *
   * Notes:
   *  Coveo Machine Learning models use this information to provide contextually relevant output.
   *  Moreover, this information can be referred to in query expressions and QPL statements by using the $locale object.
   */
  locale?: string;
  /**
   * Allows for augmenting a request (search, facet-search, query-suggest, etc.) before it is sent.
   * @deprecated Use `preprocessRequest` instead.
   */
  preprocessRequestMiddleware?: PreprocessRequestMiddleware;
  /**
   * Allows for augmenting a search response before the state is updated.
   */
  preprocessSearchResponseMiddleware?: PostprocessSearchResponseMiddleware;
  /**
   * Allows for augmenting a facet-search response before the state is updated.
   */
  preprocessFacetSearchResponseMiddleware?: PostprocessFacetSearchResponseMiddleware;
  /**
   * Allows for augmenting a query-suggest response before the state is updated.
   */
  preprocessQuerySuggestResponseMiddleware?: PostprocessQuerySuggestResponseMiddleware;
}

export const searchEngineConfigurationSchema = new Schema<
  SearchEngineConfiguration
>({
  ...engineConfigurationDefinitions,
  search: new RecordValue({
    options: {
      required: false,
    },
    values: {
      pipeline: new StringValue({
        required: false,
        emptyAllowed: false,
      }),
      searchHub: new StringValue({
        required: false,
        emptyAllowed: false,
      }),
      locale: localeValidation,
    },
  }),
});

export function getSampleSearchEngineConfiguration(): SearchEngineConfiguration {
  return {
    ...getSampleEngineConfiguration(),
    search: {
      pipeline: 'default',
      searchHub: 'default',
    },
  };
}
