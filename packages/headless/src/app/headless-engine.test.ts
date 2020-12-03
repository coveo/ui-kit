import {HeadlessEngine, HeadlessOptions, Engine} from './headless-engine';
import {
  updateBasicConfiguration,
  updateSearchConfiguration,
} from '../features/configuration/configuration-actions';
import * as storeConfig from './store';
import {searchAppReducers} from './search-app-reducers';
import {SearchAPIClient} from '../api/search/search-api-client';
import {AnalyticsClientSendEventHook} from 'coveo.analytics/dist/definitions/client/analytics';
import pino from 'pino';
import {NoopPreprocessRequestMiddleware} from '../api/platform-client';
import {validateActionPayloadAndThrow} from '../utils/validate-payload';

describe('headless engine', () => {
  let options: HeadlessOptions<typeof searchAppReducers>;
  let configureStoreSpy: jest.SpyInstance;
  let store: storeConfig.Store;
  let engine: Engine;
  const logger = pino({level: 'silent'});

  beforeEach(() => {
    store = storeConfig.configureStore({
      reducers: searchAppReducers,
      thunkExtraArguments: {
        searchAPIClient: new SearchAPIClient({
          logger,
          renewAccessToken: async () => '',
          preprocessRequest: NoopPreprocessRequestMiddleware,
        }),
        analyticsClientMiddleware: {} as AnalyticsClientSendEventHook,
        logger: logger,
        validatePayload: validateActionPayloadAndThrow,
      },
    });
    jest.spyOn(store, 'dispatch');
    configureStoreSpy = jest
      .spyOn(storeConfig, 'configureStore')
      .mockReturnValue(store);

    options = {
      configuration: HeadlessEngine.getSampleConfiguration(),
      reducers: searchAppReducers,
      loggerOptions: {level: 'silent'},
    };
    engine = new HeadlessEngine(options);
  });

  it('should thrown an error if the engine is constructed with invalid options', () => {
    const invalidOptions: HeadlessOptions<typeof searchAppReducers> = {
      ...options,
      configuration: {
        ...options.configuration,
        organizationId: (123 as unknown) as string,
      },
    };
    expect(() => new HeadlessEngine(invalidOptions)).toThrow(
      `Check the options of ${HeadlessEngine.name}`
    );
  });

  it('should call configureStore', () => {
    expect(configureStoreSpy).toHaveBeenCalled();
  });

  it('should dispatch updateBasicConfiguration with the right configuration', () => {
    expect(store.dispatch).toHaveBeenCalledWith(
      updateBasicConfiguration({
        accessToken: options.configuration.accessToken,
        platformUrl: options.configuration.platformUrl,
        organizationId: options.configuration.organizationId,
      })
    );
  });

  it(`when there is a search param in the configuration
  should dispatch updateSearchConfiguration`, () => {
    expect(store.dispatch).toHaveBeenCalledWith(
      updateSearchConfiguration(options.configuration.search!)
    );
  });

  it(`when there is no search param in the configuration
  should not dispatch updateSearchConfiguration`, () => {
    jest.clearAllMocks();
    options = {
      configuration: {
        accessToken: 'mytoken',
        organizationId: 'someorg',
      },
      reducers: searchAppReducers,
    };

    new HeadlessEngine(options);
    expect(store.dispatch).not.toHaveBeenCalledWith(
      updateSearchConfiguration(options.configuration.search!)
    );
  });

  it(`when renewAccessToken is not defined in the config
  renewAccessToken should return an empty string`, async (done) => {
    expect(await engine.renewAccessToken()).toBe('');
    done();
  });

  it(`when renewAccessToken is defined in the config
  renewAccessToken should return a new token`, async (done) => {
    options.configuration.renewAccessToken = async () => 'newToken';
    expect(await engine.renewAccessToken()).toBe('newToken');
    done();
  });

  it(`after calling renewAccessToken more than 5 times in a row
  it should return an empty string`, async (done) => {
    options.configuration.renewAccessToken = async () => 'newToken';

    engine.renewAccessToken();
    engine.renewAccessToken();
    engine.renewAccessToken();
    engine.renewAccessToken();
    engine.renewAccessToken();
    expect(await engine.renewAccessToken()).toBe('');
    done();
  });

  it(`after calling renewAccessToken more than 5 times in a row then waiting at least 500ms
  it should return a new token`, async (done) => {
    jest.useFakeTimers();
    options.configuration.renewAccessToken = async () => 'newToken';

    engine.renewAccessToken();
    engine.renewAccessToken();
    engine.renewAccessToken();
    engine.renewAccessToken();
    engine.renewAccessToken();
    jest.advanceTimersByTime(1000);
    expect(await engine.renewAccessToken()).toBe('newToken');
    done();
  });
});
