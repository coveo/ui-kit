import {HeadlessEngine, HeadlessOptions, Engine} from './headless-engine';
import {
  updateBasicConfiguration,
  updateSearchConfiguration,
} from '../features/configuration/configuration-actions';
import * as storeConfig from './store';
import {searchPageReducers} from './reducers';

describe('headless engine', () => {
  let options: HeadlessOptions<typeof searchPageReducers>;
  let configureStoreSpy: jest.SpyInstance;
  let store: storeConfig.Store;
  let engine: Engine;

  beforeEach(() => {
    store = storeConfig.configureStore({reducers: searchPageReducers});
    jest.spyOn(store, 'dispatch');
    configureStoreSpy = jest
      .spyOn(storeConfig, 'configureStore')
      .mockReturnValue(store);

    options = {
      configuration: HeadlessEngine.getSampleConfiguration(),
      reducers: searchPageReducers,
    };
    engine = new HeadlessEngine(options);
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
      reducers: searchPageReducers,
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
