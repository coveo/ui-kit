import {ReducersMapObject, StateFromReducersMapObject} from '@reduxjs/toolkit';
import {
  updateSearchConfiguration,
  localeValidation,
} from '../features/configuration/configuration-actions';
import {SearchAPIClient} from '../api/search/search-api-client';
import {Logger} from 'pino';
import {NoopPreprocessRequestMiddleware} from '../api/platform-client';
import {NoopPreprocessRequest} from '../api/preprocess-request';
import {RecordValue, Schema, StringValue} from '@coveo/bueno';
import {
  NoopPostprocessFacetSearchResponseMiddleware,
  NoopPostprocessQuerySuggestResponseMiddleware,
  NoopPostprocessSearchResponseMiddleware,
} from '../api/search/search-api-client-middleware';
import {buildEngine, CoreEngine, EngineOptions} from './engine';
import {
  engineConfigurationDefinitions,
  EngineConfiguration,
} from './engine-configuration-options';
import {buildLogger} from './logger';
import {
  buildThunkExtraArguments,
  ThunkExtraArguments,
} from './thunk-extra-arguments';
import {SearchAppState} from '../state/search-app-state';
import {debug, pipeline, searchHub} from './reducers';
import {SearchConfigurationOptions} from './search-engine/search-engine-configuration-options';

const headlessReducers = {debug, pipeline, searchHub};
type HeadlessReducers = typeof headlessReducers;
type HeadlessState = StateFromReducersMapObject<HeadlessReducers>;

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
export interface HeadlessConfigurationOptions extends EngineConfiguration {
  /**
   * The global headless engine configuration options specific to the SearchAPI.
   */
  search?: SearchConfigurationOptions;
}

/**
 * The engine for powering search experiences.
 */
export interface Engine<State = SearchAppState>
  extends CoreEngine<State & HeadlessState, SearchThunkExtraArguments> {}

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
    this.logger = buildLogger(options.loggerOptions);
    this.validateConfiguration(options);

    const thunkArguments = {
      ...buildThunkExtraArguments(options.configuration, this.logger),
      searchAPIClient: this.createSearchAPIClient(),
    };

    const augmentedOptions: HeadlessOptions<Reducers & HeadlessReducers> = {
      ...options,
      reducers: {...headlessReducers, ...options.reducers},
    };

    this.engine = buildEngine(augmentedOptions, thunkArguments);

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
      name: 'sampleName',
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
    this.engine.enableAnalytics();
  }

  /**
   * Disable analytics tracking
   */
  public disableAnalytics() {
    this.engine.disableAnalytics();
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
