import {RecordValue, Schema} from '@coveo/bueno';
import {
  PostprocessFacetSearchResponseMiddleware,
  PostprocessQuerySuggestResponseMiddleware,
  PostprocessSearchResponseMiddleware,
} from '../../api/search/search-api-client-middleware';
import {nonEmptyString} from '../../utils/validate-payload';
import {
  engineConfigurationDefinitions,
  EngineConfiguration,
  getSampleEngineConfiguration,
} from '../engine-configuration';

/**
 * The search engine configuration.
 */
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
   * The [tz database](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones) identifier of the time zone to use to correctly interpret dates in the query expression, facets and result items.
   * By default, the timezone will be [guessed](https://day.js.org/docs/en/timezone/guessing-user-timezone).
   *
   * @example
   * America/Montreal
   */
  timezone?: string;
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
      pipeline: nonEmptyString,
      searchHub: nonEmptyString,
      locale: nonEmptyString,
      timezone: nonEmptyString,
    },
  }),
});

/**
 * Creates a sample search engine configuration.
 *
 * @returns The sample search engine configuration.
 */
export function getSampleSearchEngineConfiguration(): SearchEngineConfiguration {
  return {
    ...getSampleEngineConfiguration(),
    search: {
      pipeline: 'default',
      searchHub: 'default',
    },
  };
}
