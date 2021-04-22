import {HeadlessEngine, HeadlessOptions} from './headless-engine';
import {updateSearchConfiguration} from '../features/configuration/configuration-actions';
import * as storeConfig from './store';
import {searchAppReducers} from './search-app-reducers';
import {AnalyticsClientSendEventHook} from 'coveo.analytics/dist/definitions/client/analytics';
import pino from 'pino';
import {validatePayloadAndThrow} from '../utils/validate-payload';
import {buildMockSearchAPIClient} from '../test/mock-search-api-client';
import {combineReducers} from '@reduxjs/toolkit';
import {Engine} from './engine';

describe('headless engine', () => {
  let options: HeadlessOptions<typeof searchAppReducers>;
  let configureStoreSpy: jest.SpyInstance;
  let engine: Engine;

  beforeEach(() => {
    const store = storeConfig.configureStore({
      reducer: combineReducers(searchAppReducers),
      thunkExtraArguments: {
        searchAPIClient: buildMockSearchAPIClient(),
        analyticsClientMiddleware: {} as AnalyticsClientSendEventHook,
        logger: pino({level: 'silent'}),
        validatePayload: validatePayloadAndThrow,
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
    expect(() => new HeadlessEngine(invalidOptions)).toThrow();
  });

  it('should call configureStore', () => {
    expect(configureStoreSpy).toHaveBeenCalled();
  });

  it(`when there is a search param in the configuration
  should dispatch updateSearchConfiguration`, () => {
    expect(engine.dispatch).toHaveBeenCalledWith(
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

    engine = new HeadlessEngine(options);
    expect(engine.dispatch).not.toHaveBeenCalledWith(
      updateSearchConfiguration(options.configuration.search!)
    );
  });
});
