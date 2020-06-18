import {HeadlessEngine, HeadlessOptions} from './headless-engine';
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
    new HeadlessEngine(options);
  });

  it('should call configureStore', () => {
    expect(configureStoreSpy).toHaveBeenCalled();
  });

  it('should dispatch updateBasicConfiguration with the right configuration', () => {
    expect(store.dispatch).toHaveBeenCalledWith(
      updateBasicConfiguration(options.configuration)
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
});
