import * as Store from '../app/store';
import {buildMockThunkExtraArguments} from '../test/mock-thunk-extra-arguments';
import {buildEngine, CoreEngine, EngineOptions} from './engine';
import {configuration} from './reducers';

jest.mock('pino', () => ({
  ...jest.requireActual('pino'),
  __esModule: true,
  default: () => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  }),
}));

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

  it("when name is specified in the config, the engine's store name is initialized with the config's value", () => {
    options.configuration.name = 'myEngine';
    const spy = jest.spyOn(Store, 'configureStore');
    initEngine();

    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'myEngine',
      })
    );
  });

  it("when no name is specified, the engine's store name is initialized to the default value: 'coveo-headless'", () => {
    const spy = jest.spyOn(Store, 'configureStore');
    initEngine();

    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'coveo-headless',
      })
    );
  });

  it('when calling addReducers and all keys already exist, it does not update state', () => {
    options.reducers = {configuration};
    initEngine();

    const stateListener = jest.fn();

    engine.subscribe(stateListener);
    engine.addReducers({configuration});

    expect(stateListener).not.toHaveBeenCalled();
  });

  it('should correctly log warnings when dealing with the useCustomDNS and platformUrl option', () => {
    const testCases: Array<{
      useCustomDNS: boolean | undefined;
      platformUrl: string | undefined;
      expectation: () => void;
    }> = [
      {
        useCustomDNS: undefined,
        platformUrl: undefined,
        expectation: () =>
          expect(engine.logger.warn).toHaveBeenCalledWith(
            expect.stringContaining(
              'The `useCustomDNS` options was not explicitely set on Headless engine configuration'
            )
          ),
      },
      {
        useCustomDNS: true,
        platformUrl: undefined,
        expectation: () => expect(engine.logger.warn).not.toHaveBeenCalled(),
      },
      {
        useCustomDNS: false,
        platformUrl: undefined,
        expectation: () => expect(engine.logger.warn).not.toHaveBeenCalled(),
      },
      {
        useCustomDNS: undefined,
        platformUrl: 'https://definitely.not.a.coveo.custom.dns',
        expectation: () => expect(engine.logger.warn).not.toHaveBeenCalled(),
      },
      {
        useCustomDNS: true,
        platformUrl: 'https://definitely.not.a.coveo.custom.dns',
        expectation: () =>
          expect(engine.logger.warn).toHaveBeenCalledWith(
            expect.stringContaining(
              'The `useCustomDNS` (true) option cannot be set at the same time as `platformUrl`'
            )
          ),
      },
      {
        useCustomDNS: false,
        platformUrl: 'https://definitely.not.a.coveo.custom.dns',
        expectation: () => expect(engine.logger.warn).not.toHaveBeenCalled(),
      },
      {
        useCustomDNS: true,
        platformUrl: 'https://orgId.org.coveo.com',
        expectation: () => expect(engine.logger.warn).not.toHaveBeenCalled(),
      },
    ];

    testCases.forEach((testCase) => {
      options.configuration = {
        ...options.configuration,
        ...testCase,
      };
      initEngine();
      testCase.expectation();
    });
  });
});
