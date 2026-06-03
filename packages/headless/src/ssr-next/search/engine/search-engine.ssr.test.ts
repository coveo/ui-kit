import type {NavigatorContext} from '../../../app/navigator-context-provider.js';
import type {SearchEngineConfiguration} from '../../../app/search-engine/search-engine-configuration.js';
import {buildMockNavigatorContext} from '../../../test/mock-navigator-context.js';
import {defineMockSearchController} from '../../../test/mock-ssr-controller-definitions.js';
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
      expect(searchEngineDefinition).toHaveProperty('getAccessToken');
      expect(searchEngineDefinition).toHaveProperty('setAccessToken');
    });

    it('#getAccessToken should return the access token', () => {
      const {searchEngineDefinition} = defineSearchEngine(definitionOptions);
      const {getAccessToken} = searchEngineDefinition;
      expect(getAccessToken()).toBe('some-token');
    });

    it('#setAccessToken should update the access token', () => {
      const {searchEngineDefinition} = defineSearchEngine(definitionOptions);
      const {getAccessToken, setAccessToken} = searchEngineDefinition;
      setAccessToken('new-access-token');
      expect(getAccessToken()).toBe('new-access-token');
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

      const hydratedState =
        await searchEngineDefinition.hydrateStaticState(staticState);
      expect(hydratedState).toBeTruthy();
      expect(hydratedState.engine).toBeDefined();
      expect(hydratedState.controllers).toBeDefined();
      expect(hydratedState.engine.state.configuration.organizationId).toBe(
        'some-org-id'
      );
    });
  });

  describe('standaloneEngineDefinition', () => {
    it('should have all required properties', () => {
      const {standaloneEngineDefinition} =
        defineSearchEngine(definitionOptions);
      expect(standaloneEngineDefinition).toHaveProperty('fetchStaticState');
      expect(standaloneEngineDefinition).toHaveProperty('hydrateStaticState');
      expect(standaloneEngineDefinition).toHaveProperty('getAccessToken');
      expect(standaloneEngineDefinition).toHaveProperty('setAccessToken');
    });

    it('#getAccessToken should return the access token', () => {
      const {standaloneEngineDefinition} =
        defineSearchEngine(definitionOptions);
      const {getAccessToken} = standaloneEngineDefinition;
      expect(getAccessToken()).toBe('some-token');
    });

    it('#setAccessToken should update the access token', () => {
      const {standaloneEngineDefinition} =
        defineSearchEngine(definitionOptions);
      const {getAccessToken, setAccessToken} = standaloneEngineDefinition;
      setAccessToken('new-standalone-token');
      expect(getAccessToken()).toBe('new-standalone-token');
    });

    it('should always return parameter manager controller as well as the ones provided', async () => {
      const {standaloneEngineDefinition} =
        defineSearchEngine(definitionOptions);
      const staticState = await standaloneEngineDefinition.fetchStaticState({
        navigatorContext: mockNavigatorContext,
      });
      expect(staticState.controllers).toHaveProperty('parameterManager');
      expect(staticState.controllers).toHaveProperty('controller1');
      expect(staticState.controllers).toHaveProperty('controller2');
    });

    it('should fetch static state successfully', async () => {
      const {standaloneEngineDefinition} =
        defineSearchEngine(definitionOptions);
      const staticState = await standaloneEngineDefinition.fetchStaticState({
        navigatorContext: mockNavigatorContext,
      });
      expect(staticState).toBeTruthy();
      expect(staticState.controllers).toBeDefined();
    });

    it('should hydrate static state successfully', async () => {
      const {standaloneEngineDefinition} =
        defineSearchEngine(definitionOptions);
      const staticState = await standaloneEngineDefinition.fetchStaticState({
        navigatorContext: mockNavigatorContext,
      });

      const hydratedState =
        await standaloneEngineDefinition.hydrateStaticState(staticState);
      expect(hydratedState).toBeTruthy();
      expect(hydratedState.engine).toBeDefined();
      expect(hydratedState.controllers).toBeDefined();
      expect(hydratedState.engine.state.configuration.organizationId).toBe(
        'some-org-id'
      );
    });
  });

  describe('backward compatibility', () => {
    it('should allow destructuring only searchEngineDefinition', () => {
      const {searchEngineDefinition} = defineSearchEngine(definitionOptions);
      expect(searchEngineDefinition).toBeDefined();
      expect(searchEngineDefinition.fetchStaticState).toBeDefined();
    });

    it('should allow destructuring only standaloneEngineDefinition', () => {
      const {standaloneEngineDefinition} =
        defineSearchEngine(definitionOptions);
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
