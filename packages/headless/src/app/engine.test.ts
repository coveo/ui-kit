import {
  StateFromReducersMapObject,
  createAction,
  createReducer,
} from '@reduxjs/toolkit';
import {getOrganizationEndpoints} from '../api/platform-client';
import * as Store from '../app/store';
import {updateAnalyticsConfiguration} from '../features/configuration/configuration-actions';
import {buildMockThunkExtraArguments} from '../test/mock-thunk-extra-arguments';
import {configuration} from './common-reducers';
import {buildEngine, CoreEngine, EngineOptions} from './engine';
import {getSampleEngineConfiguration} from './engine-configuration';

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
    return engine;
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
      organizationEndpoints: undefined,
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

  it('should throw an error if trackingId is not set in the analytics configuration and analyticsMode is next', () => {
    options.configuration.analytics = {analyticsMode: 'next'};
    expect(() => initEngine()).toThrowErrorMatchingSnapshot();
  });

  describe('with preloaded state', () => {
    const testAction = createAction('increment');
    const testReducer = createReducer(0, (builder) =>
      builder.addCase(testAction, (value) => value + 1)
    );
    const reducers = {testReducer};
    let preloadedState: StateFromReducersMapObject<typeof reducers>;

    beforeEach(() => {
      const temporaryEngine = buildEngine(
        {
          configuration: getSampleEngineConfiguration(),
          reducers: {testReducer},
        },
        buildMockThunkExtraArguments()
      );
      temporaryEngine.dispatch(testAction());
      preloadedState = temporaryEngine.state;
    });

    describe('with all needed reducers', () => {
      let resumedEngine: CoreEngine<typeof preloadedState>;
      beforeEach(() => {
        resumedEngine = buildEngine(
          {
            configuration: getSampleEngineConfiguration(),
            preloadedState,
            reducers,
          },
          buildMockThunkExtraArguments()
        );
      });

      it('should be able to resume the preloaded state', () => {
        resumedEngine.dispatch(testAction());
        expect(resumedEngine.state.testReducer).toEqual(2);
      });
    });

    describe('with a missing reducer', () => {
      let resumedEngine: CoreEngine<Partial<typeof preloadedState>>;
      beforeEach(() => {
        resumedEngine = buildEngine(
          {
            configuration: getSampleEngineConfiguration(),
            preloadedState,
            reducers: {},
          },
          buildMockThunkExtraArguments()
        );
      });

      it('should have the preloaded state', () => {
        expect(resumedEngine.state.testReducer).toEqual(1);
      });

      it("should not update the missing reducer's state when an action from the missing reducer is dispatched", () => {
        resumedEngine.dispatch(testAction());
        expect(resumedEngine.state.testReducer).toEqual(1);
      });

      describe('after adding the missing reducer', () => {
        beforeEach(() => {
          resumedEngine.addReducers(reducers);
        });

        it('should not reset the state', () => {
          expect(resumedEngine.state.testReducer).toEqual(1);
        });

        it('should update the preloaded state after dispatching an action', () => {
          resumedEngine.dispatch(testAction());
          expect(resumedEngine.state.testReducer).toEqual(2);
        });
      });
    });
  });

  it('should exposes a Relay instance', () => {
    const engine = initEngine();
    expect(engine.relay).toBeDefined();
  });

  it('should return the exact same instance of Relay if the state has not changed between two calls to engine.relay', () => {
    const engine = initEngine();
    expect(engine.relay).toBe(engine.relay);
  });

  it('should return a new instance of Relay if the state has changed', () => {
    const engine = initEngine();
    const oldRelay = engine.relay;
    engine.dispatch(
      updateAnalyticsConfiguration({trackingId: 'newTrackingId'})
    );
    expect(engine.relay).not.toBe(oldRelay);
  });
});
