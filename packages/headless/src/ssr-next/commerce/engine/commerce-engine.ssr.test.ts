import type {CommerceEngineConfiguration} from '../../../app/commerce-engine/commerce-engine-configuration.js';
import type {NavigatorContext} from '../../../app/navigator-context-provider.js';
import {buildMockNavigatorContext} from '../../../test/mock-navigator-context.js';
import {defineMockCommerceController} from '../../../test/mock-ssr-controller-definitions.js';
import {defineRecommendations} from '../controllers/recommendations/headless-recommendations.ssr.js';
import type {CommerceEngineDefinitionOptions} from '../types/engine.js';
import {defineCommerceEngine} from './commerce-engine.ssr.js';

describe('Commerce Engine SSR', () => {
  let mockNavigatorContext: NavigatorContext;
  let definitionOptions: CommerceEngineDefinitionOptions<{
    controller1: ReturnType<typeof defineMockCommerceController>;
    controller2: ReturnType<typeof defineMockCommerceController>;
  }>;

  beforeEach(() => {
    mockNavigatorContext = buildMockNavigatorContext();
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
    it('should always return context and cart controllers as well as the ones provided', async () => {
      const engineDefinition = defineCommerceEngine(definitionOptions);
      const solutionType = definitionName as keyof typeof engineDefinition;
      const staticState = await engineDefinition[solutionType].fetchStaticState({
        navigatorContext: mockNavigatorContext,
        searchParams: {q: 'test'},
        recommendations: [],
        context: {
          view: {url: 'http://example.com'},
          country: 'US',
          currency: 'USD',
          language: 'en',
        },
      });
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
        navigatorContext: mockNavigatorContext,
        searchParams: {q: 'foo'},
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
        navigatorContext: mockNavigatorContext,
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

  describe('definition validation', () => {
    it('should throw at definition time when two recommendation controllers share a slot ID', () => {
      expect(() =>
        defineCommerceEngine({
          ...definitionOptions,
          controllers: {
            popularViewed: defineRecommendations({options: {slotId: 'same-slot-id'}}),
            popularBought: defineRecommendations({options: {slotId: 'same-slot-id'}}),
          },
        })
      ).toThrow('Multiple recommendation controllers found for the same slotId: same-slot-id');
    });
  });

  describe('static state round trip', () => {
    const context = {
      view: {url: 'http://example.com'},
      country: 'US',
      currency: 'USD' as const,
      language: 'en',
    };

    it('should refuse to hydrate a static state fetched by another engine definition', async () => {
      const {listingEngineDefinition, searchEngineDefinition} =
        defineCommerceEngine(definitionOptions);
      const listingStaticState = await listingEngineDefinition.fetchStaticState({
        navigatorContext: mockNavigatorContext,
        context,
      });

      await expect(
        // @ts-expect-error: a listing static state is not a search static state
        searchEngineDefinition.hydrateStaticState(listingStaticState)
      ).rejects.toThrow(
        'This static state was fetched with the listing engine definition but is being hydrated with the search engine definition'
      );
    });

    it('should not serialize the forwarded-for header into the static state', async () => {
      const {listingEngineDefinition} = defineCommerceEngine(definitionOptions);

      const staticState = await listingEngineDefinition.fetchStaticState({
        navigatorContext: buildMockNavigatorContext({forwardedFor: '1.2.3.4'}),
        context,
      });

      expect(staticState.navigatorContext).not.toHaveProperty('forwardedFor');
      expect(staticState.navigatorContext.clientId).toBe(mockNavigatorContext.clientId);
    });
  });

  describe('requests sent to the Commerce API', () => {
    interface CapturedRequest {
      url: string;
      forwardedFor: string | null;
      body: Record<string, unknown>;
    }

    let commerceRequests: CapturedRequest[];

    const context = {
      view: {url: 'http://example.com'},
      country: 'US',
      currency: 'USD' as const,
      language: 'en',
    };

    beforeEach(() => {
      commerceRequests = [];
      vi.stubGlobal(
        'fetch',
        vi.fn(async (url: string, init: RequestInit) => {
          if (url.includes('/commerce/v2/')) {
            commerceRequests.push({
              url,
              forwardedFor: new Headers(init.headers).get('x-forwarded-for'),
              body: JSON.parse(String(init.body)),
            });
          }
          // The request is what matters here: an error response completes the request without
          // having to replicate a full Commerce API payload.
          return new Response(
            JSON.stringify({message: 'Stubbed response', statusCode: 500, type: 'Stubbed'}),
            {status: 500, headers: {'Content-Type': 'application/json'}}
          );
        })
      );
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it('should send each request its own x-forwarded-for header', async () => {
      const {listingEngineDefinition} = defineCommerceEngine(definitionOptions);

      await listingEngineDefinition.fetchStaticState({
        navigatorContext: buildMockNavigatorContext({forwardedFor: '1.1.1.1'}),
        context,
      });
      await listingEngineDefinition.fetchStaticState({
        navigatorContext: buildMockNavigatorContext({forwardedFor: '2.2.2.2'}),
        context,
      });

      expect(commerceRequests.map((request) => request.forwardedFor)).toEqual([
        '1.1.1.1',
        '2.2.2.2',
      ]);
    });

    it('should send each concurrent request its own x-forwarded-for header', async () => {
      const {listingEngineDefinition} = defineCommerceEngine(definitionOptions);

      await Promise.all([
        listingEngineDefinition.fetchStaticState({
          navigatorContext: buildMockNavigatorContext({forwardedFor: '5.5.5.5'}),
          context,
        }),
        listingEngineDefinition.fetchStaticState({
          navigatorContext: buildMockNavigatorContext({forwardedFor: '6.6.6.6'}),
          context,
        }),
      ]);

      expect(commerceRequests.map((request) => request.forwardedFor).toSorted()).toEqual([
        '5.5.5.5',
        '6.6.6.6',
      ]);
    });

    it('should seed the recommendation requests with the product ID', async () => {
      const {recommendationEngineDefinition} = defineCommerceEngine({
        ...definitionOptions,
        controllers: {
          viewedTogether: defineRecommendations({options: {slotId: 'some-slot-id'}}),
        },
      });

      await recommendationEngineDefinition.fetchStaticState({
        navigatorContext: mockNavigatorContext,
        context,
        recommendations: ['viewedTogether'],
        productId: 'product-123',
      });

      const recommendationRequest = commerceRequests.find((request) =>
        request.url.includes('/recommendations')
      );
      expect(recommendationRequest?.body.context).toEqual(
        expect.objectContaining({product: {productId: 'product-123'}})
      );
    });
  });
});
