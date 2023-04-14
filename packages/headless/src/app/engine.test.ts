import {getOrganizationEndpoints} from '../api/platform-client';
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

  it.each([
    {
      organizationEndpoints: undefined,
      platformUrl: undefined,
      expectedMessage:
        'The `organizationEndpoints` options was not explicitly set in the Headless engine configuration.',
    },

    {
      organizationEndpoints: undefined,
      platformUrl: 'https://definitely.not.a.coveo.custom.dns',
      expectedMessage:
        'The `organizationEndpoints` options was not explicitly set in the Headless engine configuration.',
    },
    {
      organizationEndpoints: getOrganizationEndpoints('myorg'),
      platformUrl: 'https://definitely.not.a.coveo.custom.dns',
      expectedMessage:
        'The `platformUrl` (https://definitely.not.a.coveo.custom.dns) option will be deprecated in the next major version.',
    },
  ] as const)(
    'should correctly log warnings when dealing with the organizationEndpoints and platformUrl option',
    (testCase) => {
      options.configuration = {
        ...options.configuration,
        ...testCase,
      };
      initEngine();
      expect(engine.logger.warn).toHaveBeenCalledWith(
        expect.stringContaining(testCase.expectedMessage)
      );
    }
  );

  it('should not log warnings when the organizationEndpoints option is set and platformUrl is not set', () => {
    options.configuration = {
      ...options.configuration,
      organizationEndpoints: getOrganizationEndpoints('orgId'),
      platformUrl: undefined,
    };
    initEngine();
    expect(engine.logger.warn).not.toHaveBeenCalled();
  });

  it('should log warnings when the organizationId option does not match what is configured on organizationEndpoints option.', () => {
    options.configuration = {
      ...options.configuration,
      organizationId: 'a',
      organizationEndpoints: getOrganizationEndpoints('b'),
      platformUrl: undefined,
    };
    initEngine();
    expect(engine.logger.warn).toHaveBeenCalledWith(
      expect.stringContaining(
        'There is a mismatch between the `organizationId` option (a) and the organization configured in the `organizationEndpoints` option (https://b.org.coveo.com).'
      )
    );
  });
});
