import {
  updateAnalyticsConfiguration,
  updateBasicConfiguration,
} from '../features/configuration/configuration-actions';
import {buildMockStore} from '../test/mock-store';
import {buildMockThunkExtraArguments} from '../test/mock-thunk-extra-arguments';
import {buildEngine, Engine, EngineOptions} from './engine';
import {searchAppReducers} from './search-app-reducers';
import * as Store from './store';

describe('engine', () => {
  let options: EngineOptions<typeof searchAppReducers>;
  let engine: Engine;

  function initEngine() {
    jest.spyOn(Store, 'configureStore').mockReturnValue(buildMockStore());

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
      reducers: searchAppReducers,
    };

    initEngine();
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
