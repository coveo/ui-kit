import {buildMockThunkExtraArguments} from '../test/mock-thunk-extra-arguments';
import {buildEngine, CoreEngine, EngineOptions} from './engine';
import * as Store from '../app/store';

describe('engine', () => {
  let options: EngineOptions<{}>;
  let engine: CoreEngine;

  function initEngine() {
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

  it('when no reducers are specified, it still registers the configuration correctly', () => {
    options.reducers = {};
    initEngine();

    const {configuration} = engine.state;
    expect(configuration.accessToken).toBe(options.configuration.accessToken);
    expect(configuration.organizationId).toBe(
      options.configuration.organizationId
    );
    expect(configuration.platformUrl).toBe(options.configuration.platformUrl);
  });

  it('when an #analytics configuration is specified, it registers the configuration', () => {
    const enabled = true;
    const originLevel2 = 'tab';
    const originLevel3 = 'referrer';

    options.configuration.analytics = {enabled, originLevel2, originLevel3};
    initEngine();

    const {analytics} = engine.state.configuration;

    expect(analytics.enabled).toBe(enabled);
    expect(analytics.originLevel2).toBe(originLevel2);
    expect(analytics.originLevel3).toBe(originLevel3);
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

  it("when name is specified in the config, the engine's store name is initialized with the config's value", () => {
    options.configuration.name = 'myEngine';
    const spy = jest.spyOn(Store, 'configureStore');
    initEngine();

    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        name: options.configuration.name,
      })
    );
    spy.mockReset();
    spy.mockRestore();
  });

  it("when no name is specified, the engine's store name is initialized to the default value: 'coveo-headless'", () => {
    options.configuration.name = undefined;
    const spy = jest.spyOn(Store, 'configureStore');
    initEngine();

    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'coveo-headless',
      })
    );
    spy.mockReset();
    spy.mockRestore();
  });
});
