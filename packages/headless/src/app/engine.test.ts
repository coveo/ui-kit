import {
  StateFromReducersMapObject,
  createAction,
  createReducer,
} from '@reduxjs/toolkit';
import * as Store from '../app/store.js';
import {updateAnalyticsConfiguration} from '../features/configuration/configuration-actions.js';
import {ConfigurationState} from '../features/configuration/configuration-state.js';
import {buildMockThunkExtraArguments} from '../test/mock-thunk-extra-arguments.js';
import {configuration} from './common-reducers.js';
import {getSampleEngineConfiguration} from './engine-configuration.js';
import {buildEngine, CoreEngine, EngineOptions} from './engine.js';
import {ThunkExtraArguments} from './thunk-extra-arguments.js';

vi.mock(import('pino'), async (importOriginal) => {
  const mod = await importOriginal(); // type is inferred
  return {
    ...mod,
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  };
});

describe('engine', () => {
  let options: EngineOptions<{}>;
  let engine: CoreEngine<{}, ThunkExtraArguments, ConfigurationState>;
  let organizationId: string;

  function initEngine() {
    const thunkArguments = buildMockThunkExtraArguments();
    engine = buildEngine(options, thunkArguments);
    return engine;
  }

  beforeEach(() => {
    organizationId = 'orgId';
    options = {
      configuration: {
        accessToken: 'token',
        environment: 'hipaa',
        organizationId,
      },
      reducers: {},
    };
  });

  it('registers the basic configuration', () => {
    const {accessToken, environment, organizationId} = options.configuration;
    initEngine();
    expect(engine.state.configuration.accessToken).toBe(accessToken);
    expect(engine.state.configuration.environment).toBe(environment);
    expect(engine.state.configuration.organizationId).toBe(organizationId);
    expect(engine.state.configuration.analytics.apiBaseUrl).toBeUndefined();
    expect(engine.state.configuration.search.apiBaseUrl).toBeUndefined();
  });

  it('when no reducers are specified, still registers the basic configuration correctly', () => {
    options.reducers = {};
    const {accessToken, environment, organizationId} = options.configuration;
    initEngine();
    expect(engine.state.configuration.accessToken).toBe(accessToken);
    expect(engine.state.configuration.environment).toBe(environment);
    expect(engine.state.configuration.organizationId).toBe(organizationId);
    expect(engine.state.configuration.analytics.apiBaseUrl).toBeUndefined();
    expect(engine.state.configuration.search.apiBaseUrl).toBeUndefined();
  });

  it('registers the analytics configuration if specified', () => {
    options.configuration.analytics = {
      analyticsMode: 'next',
      anonymous: true,
      deviceId: 'deviceId',
      documentLocation: 'https://example.com/documentLocation',
      enabled: true,
      originLevel2: 'originLevel2',
      originLevel3: 'originLevel3',
      originContext: 'originContext',
      proxyBaseUrl: 'https://example.com/analytics',
      trackingId: 'trackingId',
      source: {
        '@coveo/atomic': '1.0.0',
        '@coveo/quantic': '1.0.0',
      },
      userDisplayName: 'userDisplayName',
    };

    initEngine();

    const {analytics} = engine.state.configuration;
    const {proxyBaseUrl, ...restOfAnalyticsConfiguration} =
      options.configuration.analytics;

    expect(analytics).toEqual({
      ...restOfAnalyticsConfiguration,
      apiBaseUrl: proxyBaseUrl,
    });
  });

  it('should throw an error if trackingId is not set in the analytics configuration and analyticsMode is next', () => {
    options.configuration.analytics = {analyticsMode: 'next'};
    expect(() => initEngine()).toThrowErrorMatchingSnapshot();
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
    const spy = vi.spyOn(Store, 'configureStore');
    initEngine();

    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'myEngine',
      })
    );
  });

  it("when no name is specified, the engine's store name is initialized to the default value: 'coveo-headless'", () => {
    const spy = vi.spyOn(Store, 'configureStore');
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

    const stateListener = vi.fn();

    engine.subscribe(stateListener);
    engine.addReducers({configuration});

    expect(stateListener).not.toHaveBeenCalled();
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
