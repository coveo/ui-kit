import {ReducersMapObject, StateFromReducersMapObject} from '@reduxjs/toolkit';
import {
  updateSearchConfiguration,
  disableAnalytics,
  enableAnalytics,
  localeValidation,
} from '../features/configuration/configuration-actions';
import {SearchAPIClient} from '../api/search/search-api-client';
import {Logger} from 'pino';
import {
  NoopPreprocessRequestMiddleware,
  PreprocessRequestMiddleware,
} from '../api/platform-client';
import {NoopPreprocessRequest} from '../api/preprocess-request';
import {RecordValue, Schema, StringValue} from '@coveo/bueno';
import {
  NoopPostprocessFacetSearchResponseMiddleware,
  NoopPostprocessQuerySuggestResponseMiddleware,
  NoopPostprocessSearchResponseMiddleware,
  PostprocessFacetSearchResponseMiddleware,
  PostprocessQuerySuggestResponseMiddleware,
  PostprocessSearchResponseMiddleware,
} from '../api/search/search-api-client-middleware';
import {buildEngine, CoreEngine, EngineOptions} from './engine';
import {
  engineConfigurationOptionDefinitions,
  EngineConfigurationOptions,
} from './engine-configuration-options';
import {buildLogger} from './logger';
import {
  buildThunkExtraArguments,
  ThunkExtraArguments,
} from './thunk-extra-arguments';
import {SearchAppState} from '../state/search-app-state';

/**
 * The global headless engine options.
 */
export interface HeadlessOptions<Reducers extends ReducersMapObject>
  extends EngineOptions<Reducers> {
  /**
   * The global headless engine configuration options.
   */
  configuration: HeadlessConfigurationOptions;
}

/**
 * The global headless engine configuration options.
 */
export interface HeadlessConfigurationOptions
  extends EngineConfigurationOptions {
  /**
   * The global headless engine configuration options specific to the SearchAPI.
   */
  search?: {
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
  };
}

/**
 * The engine for powering search experiences.
 */
export interface Engine<State extends object = SearchAppState>
  extends CoreEngine<State, SearchThunkExtraArguments> {}

export interface SearchThunkExtraArguments extends ThunkExtraArguments {
  searchAPIClient: SearchAPIClient;
}

/**
 * The global headless engine.
 * You should instantiate one `HeadlessEngine` class per application and share it.
 * Every headless controller requires an instance of `Engine` as a parameter.
 */
export class HeadlessEngine<Reducers extends ReducersMapObject>
  implements Engine<StateFromReducersMapObject<Reducers>> {
  public logger!: Logger;
  private engine: Engine<StateFromReducersMapObject<Reducers>>;

  constructor(private options: HeadlessOptions<Reducers>) {
    this.validateConfiguration(options);

    this.logger = buildLogger(options.loggerOptions);

    const thunkArguments = {
      ...buildThunkExtraArguments(options.configuration, this.logger),
      searchAPIClient: this.createSearchAPIClient(),
    };

    this.engine = buildEngine(options, thunkArguments);

    if (options.configuration.search) {
      this.engine.dispatch(
        updateSearchConfiguration(options.configuration.search)
      );
    }
  }

  public addReducers(reducers: ReducersMapObject) {
    this.engine.addReducers(reducers);
  }

  private validateConfiguration(options: HeadlessOptions<Reducers>) {
    if (options.configuration.search?.preprocessRequestMiddleware) {
      this.logger
        .warn(`The "search.preprocessRequestMiddleware" configuration option is now deprecated and will be removed in the upcoming @coveo/headless major version.
      Please use the "preprocessRequest" option instead, which works for both the Search and Analytics API requests.`);
    }
    const configurationSchema = new Schema<HeadlessConfigurationOptions>({
      ...engineConfigurationOptionDefinitions,
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
    try {
      configurationSchema.validate(options.configuration);
    } catch (error) {
      this.logger.error(error, 'Headless engine configuration error');
      throw error;
    }
  }

  private createSearchAPIClient() {
    const {search} = this.options.configuration;
    const preprocessRequest =
      this.options.configuration.preprocessRequest || NoopPreprocessRequest;

    return new SearchAPIClient({
      logger: this.logger,
      renewAccessToken: () => this.renewAccessToken(),
      preprocessRequest,
      deprecatedPreprocessRequest:
        search?.preprocessRequestMiddleware || NoopPreprocessRequestMiddleware,
      postprocessSearchResponseMiddleware:
        search?.preprocessSearchResponseMiddleware ||
        NoopPostprocessSearchResponseMiddleware,
      postprocessFacetSearchResponseMiddleware:
        search?.preprocessFacetSearchResponseMiddleware ||
        NoopPostprocessFacetSearchResponseMiddleware,
      postprocessQuerySuggestResponseMiddleware:
        search?.preprocessQuerySuggestResponseMiddleware ||
        NoopPostprocessQuerySuggestResponseMiddleware,
    });
  }

  /**
   * @returns A configuration with sample data for testing purposes.
   */
  static getSampleConfiguration(): HeadlessConfigurationOptions {
    return {
      organizationId: 'searchuisamples',
      accessToken: 'xx564559b1-0045-48e1-953c-3addd1ee4457',
      search: {
        pipeline: 'default',
        searchHub: 'default',
      },
    };
  }

  /**
   * Enable analytics tracking
   */
  public enableAnalytics() {
    this.dispatch(enableAnalytics());
  }

  /**
   * Disable analytics tracking
   */
  public disableAnalytics() {
    this.dispatch(disableAnalytics());
  }

  get store() {
    return this.engine.store;
  }

  get dispatch() {
    return this.engine.dispatch;
  }

  get subscribe() {
    return this.engine.subscribe;
  }

  get state() {
    return this.engine.state;
  }

  public async renewAccessToken() {
    return await this.engine.renewAccessToken();
  }
}
