import {HeadlessEngine, HeadlessOptions, SearchEngine} from './headless-engine';
import {updateSearchConfiguration} from '../features/configuration/configuration-actions';
import * as Store from './store';
import {searchAppReducers} from './search-app-reducers';
import {buildMockStore} from '../test/mock-store';

describe('headless engine', () => {
  let options: HeadlessOptions<typeof searchAppReducers>;
  let engine: SearchEngine;

  beforeEach(() => {
    jest.spyOn(Store, 'configureStore').mockReturnValue(buildMockStore());

    options = {
      configuration: HeadlessEngine.getSampleConfiguration(),
      reducers: searchAppReducers,
      loggerOptions: {level: 'silent'},
    };
    engine = new HeadlessEngine(options);
  });

  it('should thrown an error if the engine is constructed with invalid options', () => {
    options.configuration.organizationId = (123 as unknown) as string;
    expect(() => new HeadlessEngine(options)).toThrow();
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
