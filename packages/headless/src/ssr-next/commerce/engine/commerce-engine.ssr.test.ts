import type {CommerceEngineConfiguration} from '../../../app/commerce-engine/commerce-engine-configuration.js';
import {defineMockCommerceController} from '../../../test/mock-ssr-controller-definitions.js';
import type {CommerceEngineDefinitionOptions} from '../factories/build-factory.js';
import {defineCommerceEngine} from './commerce-engine.ssr.js';

describe('Commerce Engine SSR', () => {
  let definitionOptions: CommerceEngineDefinitionOptions<{
    controller1: ReturnType<typeof defineMockCommerceController>;
    controller2: ReturnType<typeof defineMockCommerceController>;
  }>;

  beforeEach(() => {
    const mockConfiguration = {
      organizationId: 'some-org-id',
      accessToken: 'some-token',
      analytics: {
        trackingId: 'xxx',
      },
    } as CommerceEngineConfiguration;

    definitionOptions = {
      configuration: mockConfiguration,
      controllers: {
        controller1: defineMockCommerceController(),
        controller2: defineMockCommerceController(),
      },
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return 4 engine definitions', () => {
    const engineDefinition = defineCommerceEngine(definitionOptions);
    expect(engineDefinition).toHaveProperty('listingEngineDefinition');
    expect(engineDefinition).toHaveProperty('recommendationEngineDefinition');
    expect(engineDefinition).toHaveProperty('searchEngineDefinition');
    expect(engineDefinition).toHaveProperty('standaloneEngineDefinition');
  });

  describe.each([
    ['listingEngineDefinition'],
    ['searchEngineDefinition'],
    ['recommendationEngineDefinition'],
    ['standaloneEngineDefinition'],
  ])('%s', (definitionName) => {
    it('#getAccessToken should return the access token', () => {
      const engineDefinition = defineCommerceEngine(definitionOptions);
      const solutionType = definitionName as keyof typeof engineDefinition;
      const {getAccessToken} = engineDefinition[solutionType];
      expect(getAccessToken()).toBe('some-token');
    });

    it('#setAccessToken should update the access token', () => {
      const engineDefinition = defineCommerceEngine(definitionOptions);
      const solutionType = definitionName as keyof typeof engineDefinition;
      const {getAccessToken, setAccessToken} = engineDefinition[solutionType];
      setAccessToken('new-access-token');
      expect(getAccessToken()).toBe('new-access-token');
    });

    it('should always return context and cart controllers as well as the ones provided', async () => {
      const engineDefinition = defineCommerceEngine(definitionOptions);
      const solutionType = definitionName as keyof typeof engineDefinition;
      const staticState = await engineDefinition[solutionType].fetchStaticState(
        {
          searchParams: {query: 'test'},
          recommendations: [],
          context: {
            view: {url: 'http://example.com'},
            country: 'US',
            currency: 'USD',
            language: 'en',
          },
        }
      );
      expect(staticState.controllers).toHaveProperty('context');
      expect(staticState.controllers).toHaveProperty('cart');
      expect(staticState.controllers).toHaveProperty('controller1');
      expect(staticState.controllers).toHaveProperty('controller2');
    });
  });

  describe('#searchEngineDefinition', () => {
    it('should always return parameter manager controller', async () => {
      const {searchEngineDefinition} = defineCommerceEngine(definitionOptions);
      const staticState = await searchEngineDefinition.fetchStaticState({
        searchParams: {query: 'foo'},
        context: {
          view: {url: 'http://example.com/search'},
          country: 'US',
          currency: 'USD',
          language: 'en',
        },
      });
      expect(staticState.controllers).toHaveProperty('parameterManager');
    });
  });

  describe('#listingEngineDefinition', () => {
    it('should always return parameter manager controller', async () => {
      const {listingEngineDefinition} = defineCommerceEngine(definitionOptions);
      const staticState = await listingEngineDefinition.fetchStaticState({
        context: {
          view: {url: 'http://example.com'},
          country: 'US',
          currency: 'USD',
          language: 'en',
        },
      });
      expect(staticState.controllers).toHaveProperty('parameterManager');
    });
  });
});
