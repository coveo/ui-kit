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

  it('should return the expected search engine definition structure', () => {
    const engineDefinition = defineSearchEngine(definitionOptions);
    expect(engineDefinition).toHaveProperty('fetchStaticState');
    expect(engineDefinition).toHaveProperty('hydrateStaticState');
    expect(engineDefinition).toHaveProperty('getAccessToken');
    expect(engineDefinition).toHaveProperty('setAccessToken');
  });

  it('#getAccessToken should return the access token', () => {
    const engineDefinition = defineSearchEngine(definitionOptions);
    const {getAccessToken} = engineDefinition;
    expect(getAccessToken()).toBe('some-token');
  });

  it('#setAccessToken should update the access token', () => {
    const engineDefinition = defineSearchEngine(definitionOptions);
    const {getAccessToken, setAccessToken} = engineDefinition;
    setAccessToken('new-access-token');
    expect(getAccessToken()).toBe('new-access-token');
  });

  it('should always return parameter manager controller as well as the ones provided', async () => {
    const engineDefinition = defineSearchEngine(definitionOptions);
    const staticState = await engineDefinition.fetchStaticState({
      navigatorContext: mockNavigatorContext,
      searchParams: {q: 'test'},
    });
    expect(staticState.controllers).toHaveProperty('parameterManager');
    expect(staticState.controllers).toHaveProperty('controller1');
    expect(staticState.controllers).toHaveProperty('controller2');
  });

  it('should fetch static state successfully', async () => {
    const engineDefinition = defineSearchEngine(definitionOptions);
    const staticState = await engineDefinition.fetchStaticState({
      navigatorContext: mockNavigatorContext,
      searchParams: {q: 'test query'},
    });
    expect(staticState).toBeTruthy();
    expect(staticState.controllers).toBeDefined();
  });

  it('should hydrate static state successfully', async () => {
    const engineDefinition = defineSearchEngine(definitionOptions);
    const staticState = await engineDefinition.fetchStaticState({
      navigatorContext: mockNavigatorContext,
      searchParams: {q: 'test'},
    });

    const hydratedState =
      await engineDefinition.hydrateStaticState(staticState);
    expect(hydratedState).toBeTruthy();
    expect(hydratedState.engine).toBeDefined();
    expect(hydratedState.controllers).toBeDefined();
    expect(hydratedState.engine.state.configuration.organizationId).toBe(
      'some-org-id'
    );
  });

  describe('when skipSearch parameter is used', () => {
    it('should skip search execution when skipSearch is true', async () => {
      const engineDefinition = defineSearchEngine(definitionOptions);
      const staticState = await engineDefinition.fetchStaticState({
        navigatorContext: mockNavigatorContext,
        searchParams: {q: 'test'},
        skipSearch: true,
      });

      expect(staticState).toBeTruthy();
      expect(staticState.controllers).toBeDefined();
      expect(staticState.searchActions).toBeDefined();
      expect(staticState.searchActions).toHaveLength(0);
    });

    it('should execute search when skipSearch is false', async () => {
      const engineDefinition = defineSearchEngine(definitionOptions);
      const staticState = await engineDefinition.fetchStaticState({
        navigatorContext: mockNavigatorContext,
        searchParams: {q: 'test'},
        skipSearch: false,
      });

      expect(staticState).toBeTruthy();
      expect(staticState.controllers).toBeDefined();
      expect(staticState.searchActions).toBeDefined();
      expect(staticState.searchActions.length).toBeGreaterThan(0);
    });

    it('should execute search when skipSearch is undefined (default behavior)', async () => {
      const engineDefinition = defineSearchEngine(definitionOptions);
      const staticState = await engineDefinition.fetchStaticState({
        navigatorContext: mockNavigatorContext,
        searchParams: {q: 'test'},
      });

      expect(staticState).toBeTruthy();
      expect(staticState.controllers).toBeDefined();
      expect(staticState.searchActions).toBeDefined();
      expect(staticState.searchActions.length).toBeGreaterThan(0);
    });

    it('should initialize controllers properly even when skipSearch is true', async () => {
      const engineDefinition = defineSearchEngine(definitionOptions);
      const staticState = await engineDefinition.fetchStaticState({
        navigatorContext: mockNavigatorContext,
        skipSearch: true,
      });

      expect(staticState.controllers).toHaveProperty('parameterManager');
      expect(staticState.controllers).toHaveProperty('controller1');
      expect(staticState.controllers).toHaveProperty('controller2');
    });

    it('should be able to hydrate static state that was created with skipSearch: true', async () => {
      const engineDefinition = defineSearchEngine(definitionOptions);
      const staticState = await engineDefinition.fetchStaticState({
        navigatorContext: mockNavigatorContext,
        skipSearch: true,
      });

      const hydratedState =
        await engineDefinition.hydrateStaticState(staticState);
      expect(hydratedState).toBeTruthy();
      expect(hydratedState.engine).toBeDefined();
      expect(hydratedState.controllers).toBeDefined();
      expect(hydratedState.engine.state.configuration.organizationId).toBe(
        'some-org-id'
      );
    });
  });
});
