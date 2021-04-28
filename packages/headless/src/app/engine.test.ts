import {
  updateAnalyticsConfiguration,
  updateBasicConfiguration,
} from '../features/configuration/configuration-actions';
import {buildMockStore} from '../test/mock-store';
import {buildMockThunkExtraArguments} from '../test/mock-thunk-extra-arguments';
import {buildEngine, CoreEngine, EngineOptions} from './engine';
import {configuration, version} from './reducers';
import * as Store from './store';
import * as ReducerManagerUtils from './reducer-manager';
import {buildMockReducerManager} from '../test/mock-reducer-manager';

describe('engine', () => {
  let options: EngineOptions<{}>;
  let engine: CoreEngine;
  let reducerManager: ReducerManagerUtils.ReducerManager;

  function initEngine() {
    reducerManager = buildMockReducerManager();

    jest.spyOn(Store, 'configureStore').mockReturnValue(buildMockStore());
    jest
      .spyOn(ReducerManagerUtils, 'createReducerManager')
      .mockReturnValue(reducerManager);

    const thunkArguments = buildMockThunkExtraArguments();
    engine = buildEngine(options, thunkArguments);
  }

  beforeEach(() => {
    options = {
      configuration: {
        organizationId: 'orgId',
        accessToken: 'token',
        platformUrl: 'https://www.coveo.com/',
      },
      reducers: {},
    };

    initEngine();
  });

  it('when #reducers is an empty object, it still registers certain core reducers', () => {
    options.reducers = {};
    initEngine();

    expect(reducerManager.add).toHaveBeenCalledWith({configuration, version});
  });

  it('dispatches #updateBasicConfiguration with the correct params', () => {
    expect(engine.dispatch).toHaveBeenCalledWith(
      updateBasicConfiguration({
        accessToken: options.configuration.accessToken,
        organizationId: options.configuration.organizationId,
        platformUrl: options.configuration.platformUrl,
      })
    );
  });

  it(`when no #analytics configuration is specified,
  it does not dispatch #updateAnalyticsConfiguration`, () => {
    expect(engine.dispatch).not.toHaveBeenCalledWith(
      updateAnalyticsConfiguration({})
    );
  });

  it(`when an #analytics configuration is specified,
  it dispatches #updateAnalyticsConfiguration`, () => {
    options.configuration.analytics = {enabled: true};
    initEngine();

    expect(engine.dispatch).toHaveBeenLastCalledWith(
      updateAnalyticsConfiguration({enabled: true})
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
