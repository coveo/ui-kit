import {buildMockThunkExtraArguments} from '../test/mock-thunk-extra-arguments';
import {buildEngine, CoreEngine, EngineOptions} from './engine';

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

  it('calling #enableAnalytics sets #analytics.enabled to true', () => {
    options.configuration.analytics = {enabled: false};
    initEngine();

    engine.enableAnalytics();

    const {analytics} = engine.state.configuration;
    expect(analytics.enabled).toBe(true);
  });

  it('calling #disableAnalytics sets #analytics.enabled to false', () => {
    options.configuration.analytics = {enabled: true};
    initEngine();

    engine.disableAnalytics();

    const {analytics} = engine.state.configuration;
    expect(analytics.enabled).toBe(false);
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
