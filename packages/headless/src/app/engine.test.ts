import {
  createAction,
  createReducer,
  type StateFromReducersMapObject,
} from '@reduxjs/toolkit';
import * as Store from '../app/store.js';
import {updateAnalyticsConfiguration} from '../features/configuration/configuration-actions.js';
import {buildMockNavigatorContextProvider} from '../test/mock-navigator-context-provider.js';
import {buildMockThunkExtraArguments} from '../test/mock-thunk-extra-arguments.js';
import {configuration} from './common-reducers.js';
import {buildEngine, type CoreEngine, type EngineOptions} from './engine.js';
import {getSampleEngineConfiguration} from './engine-configuration.js';

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
  let organizationId: string;

  function initEngine() {
    const thunkArguments = buildMockThunkExtraArguments();
    return buildEngine(options, thunkArguments);
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
    const engine = initEngine();
    expect(engine.state.configuration.accessToken).toBe(accessToken);
    expect(engine.state.configuration.environment).toBe(environment);
    expect(engine.state.configuration.organizationId).toBe(organizationId);
    expect(engine.state.configuration.analytics.apiBaseUrl).toBeUndefined();
    expect(engine.state.configuration.search.apiBaseUrl).toBeUndefined();
  });

  it('when no reducers are specified, still registers the basic configuration correctly', () => {
    options.reducers = {};
    const {accessToken, environment, organizationId} = options.configuration;
    const engine = initEngine();
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

    const engine = initEngine();

    const {analytics} = engine.state.configuration;
    const {proxyBaseUrl, ...restOfAnalyticsConfiguration} =
      options.configuration.analytics;

    expect(analytics).toEqual({
      ...restOfAnalyticsConfiguration,
      apiBaseUrl: proxyBaseUrl,
    });
  });

  it('should not throw an error if trackingId is not set in the analytics configuration and analyticsMode is next', () => {
    options.configuration.analytics = {analyticsMode: 'next'};
    delete options.configuration.analytics.trackingId;
    const engine = initEngine();

    const {analytics} = engine.state.configuration;
    expect(analytics.enabled).toBe(true);
    expect(analytics.trackingId).toBeUndefined();
  });

  it('calling #enableAnalytics sets #analytics.enabled to true', () => {
    options.configuration.analytics = {enabled: false};
    const engine = initEngine();

    engine.enableAnalytics();

    const {analytics} = engine.state.configuration;
    expect(analytics.enabled).toBe(true);
  });

  it('calling #disableAnalytics sets #analytics.enabled to false', () => {
    options.configuration.analytics = {enabled: true};
    const engine = initEngine();

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
    const engine = initEngine();

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

  describe('navigatorContext', () => {
    it('given nodejs environment, it returns falsy values', () => {
      const engine = initEngine();
      expect(engine.navigatorContext).toEqual({
        referrer: null,
        userAgent: null,
        location: null,
        clientId: '',
      });
    });

    it('given custom context provider, it returns the values from the custom provider', () => {
      const customProvider = buildMockNavigatorContextProvider({
        clientId: 'b6ab9151-5886-48b5-b254-a381ed8f8a91',
        location: 'http://example.com/',
        referrer: 'http://example.com/referrer',
        userAgent: 'Mozilla/5.0',
        capture: true,
        forwardedFor: '203.0.113.195',
      });

      options.navigatorContextProvider = customProvider;

      const engine = initEngine();
      expect(engine.navigatorContext).toEqual(customProvider());
    });

    it('given custom context provider, it truncates long urls', () => {
      const urlLimit = 1024;
      const longUrl = 'a'.repeat(urlLimit * 2);

      const customProvider = buildMockNavigatorContextProvider({
        clientId: 'b6ab9151-5886-48b5-b254-a381ed8f8a91',
        location: longUrl,
        referrer: longUrl,
        userAgent: 'Mozilla/5.0',
      });

      options.navigatorContextProvider = customProvider;

      const engine = initEngine();
      const context = engine.navigatorContext;

      expect(context.location).toHaveLength(urlLimit);
      expect(context.referrer).toHaveLength(urlLimit);
    });
  });
});
