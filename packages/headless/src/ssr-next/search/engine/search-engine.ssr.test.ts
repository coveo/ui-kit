import type {NavigatorContext} from '../../../app/navigator-context-provider.js';
import type {SearchEngineConfiguration} from '../../../app/search-engine/search-engine-configuration.js';
import {buildMockNavigatorContext} from '../../../test/mock-navigator-context.js';
import {buildMockSearchResponse} from '../../../test/mock-search-response.js';
import {defineMockSearchController} from '../../../test/mock-ssr-controller-definitions.js';
import {defineContext} from '../controllers/context/headless-context.ssr.js';
import type {SearchEngineDefinitionOptions} from '../types/engine.js';
import {defineSearchEngine} from './search-engine.ssr.js';

describe('Search Engine SSR', () => {
  let mockNavigatorContext: NavigatorContext;
  let definitionOptions: SearchEngineDefinitionOptions<{
    controller1: ReturnType<typeof defineMockSearchController>;
    controller2: ReturnType<typeof defineMockSearchController>;
  }>;

  beforeEach(() => {
    mockNavigatorContext = buildMockNavigatorContext();
    const mockConfiguration = {
      organizationId: 'some-org-id',
      accessToken: 'some-token',
      analytics: {
        trackingId: 'xxx',
      },
    } as SearchEngineConfiguration;

    definitionOptions = {
      configuration: mockConfiguration,
      controllers: {
        controller1: defineMockSearchController(),
        controller2: defineMockSearchController(),
      },
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return an object with searchEngineDefinition and standaloneEngineDefinition', () => {
    const engineDefinitions = defineSearchEngine(definitionOptions);
    expect(engineDefinitions).toHaveProperty('searchEngineDefinition');
    expect(engineDefinitions).toHaveProperty('standaloneEngineDefinition');
  });

  describe('searchEngineDefinition', () => {
    it('should have all required properties', () => {
      const {searchEngineDefinition} = defineSearchEngine(definitionOptions);
      expect(searchEngineDefinition).toHaveProperty('fetchStaticState');
      expect(searchEngineDefinition).toHaveProperty('hydrateStaticState');
    });

    it('should not expose an access token getter or setter', () => {
      const {searchEngineDefinition} = defineSearchEngine(definitionOptions);
      expect(searchEngineDefinition).not.toHaveProperty('getAccessToken');
      expect(searchEngineDefinition).not.toHaveProperty('setAccessToken');
    });

    it('should always return parameter manager controller as well as the ones provided', async () => {
      const {searchEngineDefinition} = defineSearchEngine(definitionOptions);
      const staticState = await searchEngineDefinition.fetchStaticState({
        navigatorContext: mockNavigatorContext,
        searchParams: {q: 'test'},
      });
      expect(staticState.controllers).toHaveProperty('parameterManager');
      expect(staticState.controllers).toHaveProperty('controller1');
      expect(staticState.controllers).toHaveProperty('controller2');
    });

    it('should fetch static state successfully', async () => {
      const {searchEngineDefinition} = defineSearchEngine(definitionOptions);
      const staticState = await searchEngineDefinition.fetchStaticState({
        navigatorContext: mockNavigatorContext,
        searchParams: {q: 'test query'},
      });
      expect(staticState).toBeTruthy();
      expect(staticState.controllers).toBeDefined();
    });

    it('should hydrate static state successfully', async () => {
      const {searchEngineDefinition} = defineSearchEngine(definitionOptions);
      const staticState = await searchEngineDefinition.fetchStaticState({
        navigatorContext: mockNavigatorContext,
        searchParams: {q: 'test'},
      });

      const hydratedState = await searchEngineDefinition.hydrateStaticState(staticState);
      expect(hydratedState).toBeTruthy();
      expect(hydratedState.engine).toBeDefined();
      expect(hydratedState.controllers).toBeDefined();
      expect(hydratedState.engine.state.configuration.organizationId).toBe('some-org-id');
    });
  });

  describe('standaloneEngineDefinition', () => {
    it('should have all required properties', () => {
      const {standaloneEngineDefinition} = defineSearchEngine(definitionOptions);
      expect(standaloneEngineDefinition).toHaveProperty('fetchStaticState');
      expect(standaloneEngineDefinition).toHaveProperty('hydrateStaticState');
    });

    it('should not expose an access token getter or setter', () => {
      const {standaloneEngineDefinition} = defineSearchEngine(definitionOptions);
      expect(standaloneEngineDefinition).not.toHaveProperty('getAccessToken');
      expect(standaloneEngineDefinition).not.toHaveProperty('setAccessToken');
    });

    it('should always return parameter manager controller as well as the ones provided', async () => {
      const {standaloneEngineDefinition} = defineSearchEngine(definitionOptions);
      const staticState = await standaloneEngineDefinition.fetchStaticState({
        navigatorContext: mockNavigatorContext,
      });
      expect(staticState.controllers).toHaveProperty('parameterManager');
      expect(staticState.controllers).toHaveProperty('controller1');
      expect(staticState.controllers).toHaveProperty('controller2');
    });

    it('should fetch static state successfully', async () => {
      const {standaloneEngineDefinition} = defineSearchEngine(definitionOptions);
      const staticState = await standaloneEngineDefinition.fetchStaticState({
        navigatorContext: mockNavigatorContext,
      });
      expect(staticState).toBeTruthy();
      expect(staticState.controllers).toBeDefined();
    });

    it('should hydrate static state successfully', async () => {
      const {standaloneEngineDefinition} = defineSearchEngine(definitionOptions);
      const staticState = await standaloneEngineDefinition.fetchStaticState({
        navigatorContext: mockNavigatorContext,
      });

      const hydratedState = await standaloneEngineDefinition.hydrateStaticState(staticState);
      expect(hydratedState).toBeTruthy();
      expect(hydratedState.engine).toBeDefined();
      expect(hydratedState.controllers).toBeDefined();
      expect(hydratedState.engine.state.configuration.organizationId).toBe('some-org-id');
    });
  });

  describe('per-request access token', () => {
    it('should return the per-request token alongside the static state', async () => {
      const {searchEngineDefinition} = defineSearchEngine(definitionOptions);

      const staticState = await searchEngineDefinition.fetchStaticState({
        navigatorContext: mockNavigatorContext,
        accessToken: 'per-request-token',
      });

      expect(staticState.accessToken).toBe('per-request-token');
    });

    it('should carry the per-request token into the hydrated engine', async () => {
      const {searchEngineDefinition} = defineSearchEngine(definitionOptions);

      const staticState = await searchEngineDefinition.fetchStaticState({
        navigatorContext: mockNavigatorContext,
        accessToken: 'per-request-token',
      });
      const hydratedState = await searchEngineDefinition.hydrateStaticState(staticState);

      expect(hydratedState.engine.state.configuration.accessToken).toBe('per-request-token');
    });

    it('should fall back to the definition token when none is provided', async () => {
      const {searchEngineDefinition} = defineSearchEngine(definitionOptions);

      const staticState = await searchEngineDefinition.fetchStaticState({
        navigatorContext: mockNavigatorContext,
      });
      const hydratedState = await searchEngineDefinition.hydrateStaticState(staticState);

      expect(hydratedState.engine.state.configuration.accessToken).toBe('some-token');
    });

    it('should not mutate the shared definition configuration', async () => {
      const {searchEngineDefinition} = defineSearchEngine(definitionOptions);

      await searchEngineDefinition.fetchStaticState({
        navigatorContext: mockNavigatorContext,
        accessToken: 'per-request-token',
      });

      expect(definitionOptions.configuration.accessToken).toBe('some-token');
    });

    it('should isolate the token across concurrent requests', async () => {
      const {searchEngineDefinition} = defineSearchEngine(definitionOptions);

      const [stateA, stateB] = await Promise.all([
        searchEngineDefinition.fetchStaticState({
          navigatorContext: mockNavigatorContext,
          accessToken: 'token-user-A',
        }),
        searchEngineDefinition.fetchStaticState({
          navigatorContext: mockNavigatorContext,
          accessToken: 'token-user-B',
        }),
      ]);

      expect(stateA.accessToken).toBe('token-user-A');
      expect(stateB.accessToken).toBe('token-user-B');
    });
  });

  describe('definition validation', () => {
    it('should throw when a controller uses the reserved parameterManager name', () => {
      expect(() =>
        defineSearchEngine({
          ...definitionOptions,
          // @ts-expect-error: the reserved name is rejected at the type level too
          controllers: {parameterManager: defineMockSearchController()},
        })
      ).toThrow('Reserved controller names found: parameterManager');
    });
  });

  describe('static state round trip', () => {
    it('should not serialize the forwarded-for header into the static state', async () => {
      const {standaloneEngineDefinition} = defineSearchEngine(definitionOptions);

      const staticState = await standaloneEngineDefinition.fetchStaticState({
        navigatorContext: buildMockNavigatorContext({forwardedFor: '1.2.3.4'}),
      });

      expect(staticState.navigatorContext).not.toHaveProperty('forwardedFor');
      expect(staticState.navigatorContext.clientId).toBe(mockNavigatorContext.clientId);
    });
  });

  describe('controller props', () => {
    it('should carry the controller props from the static state into the hydrated engine', async () => {
      const {searchEngineDefinition} = defineSearchEngine({
        ...definitionOptions,
        controllers: {context: defineContext()},
      });

      const staticState = await searchEngineDefinition.fetchStaticState({
        navigatorContext: mockNavigatorContext,
        controllers: {context: {initialState: {values: {ageGroup: '30-45'}}}},
      });
      const hydratedState = await searchEngineDefinition.hydrateStaticState(staticState);

      expect(staticState.controllerProps).toEqual({
        context: {initialState: {values: {ageGroup: '30-45'}}},
      });
      expect(hydratedState.controllers.context.state.values).toEqual({ageGroup: '30-45'});
    });
  });

  describe('x-forwarded-for header', () => {
    let forwardedForPerSearchRequest: (string | null)[];

    beforeEach(() => {
      forwardedForPerSearchRequest = [];
      vi.stubGlobal(
        'fetch',
        vi.fn(async (url: string, init: RequestInit) => {
          if (url.includes('/rest/search/v2')) {
            forwardedForPerSearchRequest.push(new Headers(init.headers).get('x-forwarded-for'));
          }
          return new Response(JSON.stringify(buildMockSearchResponse()), {
            headers: {'Content-Type': 'application/json'},
          });
        })
      );
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it('should send each request its own x-forwarded-for header', async () => {
      const {searchEngineDefinition} = defineSearchEngine(definitionOptions);

      await searchEngineDefinition.fetchStaticState({
        navigatorContext: buildMockNavigatorContext({forwardedFor: '1.1.1.1'}),
      });
      await searchEngineDefinition.fetchStaticState({
        navigatorContext: buildMockNavigatorContext({forwardedFor: '2.2.2.2'}),
      });

      expect(forwardedForPerSearchRequest).toEqual(['1.1.1.1', '2.2.2.2']);
    });

    it('should send each concurrent request its own x-forwarded-for header', async () => {
      const {searchEngineDefinition} = defineSearchEngine(definitionOptions);

      await Promise.all([
        searchEngineDefinition.fetchStaticState({
          navigatorContext: buildMockNavigatorContext({forwardedFor: '5.5.5.5'}),
        }),
        searchEngineDefinition.fetchStaticState({
          navigatorContext: buildMockNavigatorContext({forwardedFor: '6.6.6.6'}),
        }),
      ]);

      expect(forwardedForPerSearchRequest.toSorted()).toEqual(['5.5.5.5', '6.6.6.6']);
    });
  });

  describe('backward compatibility', () => {
    it('should allow destructuring only searchEngineDefinition', () => {
      const {searchEngineDefinition} = defineSearchEngine(definitionOptions);
      expect(searchEngineDefinition).toBeDefined();
      expect(searchEngineDefinition.fetchStaticState).toBeDefined();
    });

    it('should allow destructuring only standaloneEngineDefinition', () => {
      const {standaloneEngineDefinition} = defineSearchEngine(definitionOptions);
      expect(standaloneEngineDefinition).toBeDefined();
      expect(standaloneEngineDefinition.fetchStaticState).toBeDefined();
    });

    it('should allow destructuring both definitions', () => {
      const {searchEngineDefinition, standaloneEngineDefinition} =
        defineSearchEngine(definitionOptions);
      expect(searchEngineDefinition).toBeDefined();
      expect(standaloneEngineDefinition).toBeDefined();
    });
  });
});
