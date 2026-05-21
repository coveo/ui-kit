import {beforeEach, describe, expect, it, vi} from 'vitest';
import type {FullEngine} from '@/src/core/interface/engine/engine.js';
import {createConversationEndpointClient} from '@/src/api/index.js';
import * as configurationSelectors from '@/src/core/interface/configuration/configuration-selectors.js';
import * as cartSelectors from '@/src/core/interface/cart/cart-selectors.js';
import * as conversationSelectors from '@/src/core/interface/conversation/conversation-selectors.js';
import * as conversationEndpointSelectors from './conversation-endpoint-selectors.js';
import {ConversationEndpointFacade} from './conversation-endpoint-facade.js';
import type {ConversationEndpointClientResult} from '@/src/api/index.js';

const mockClientCall = vi.fn();

vi.mock('@/src/api/index.js', async () => {
  const actual = await vi.importActual('@/src/api/index.js');

  return {
    ...actual,
    createConversationEndpointClient: vi.fn(() => ({
      call: mockClientCall,
    })),
  };
});

type MockEngine = FullEngine & {
  adoptSlice: ReturnType<typeof vi.fn>;
  getNavigatorContextProvider: ReturnType<typeof vi.fn>;
  mutate: ReturnType<typeof vi.fn>;
  read: ReturnType<typeof vi.fn>;
  subscribe: ReturnType<typeof vi.fn>;
};

const createMockEngine = (): MockEngine => {
  return {
    adoptSlice: vi.fn(async () => undefined),
    getNavigatorContextProvider: vi.fn(),
    mutate: vi.fn(),
    read: vi.fn((selector) => {
      if (selector === configurationSelectors.organizationId) {
        return 'test-org-id';
      }
      if (selector === configurationSelectors.accessToken) {
        return 'test-token';
      }
      if (selector === configurationSelectors.endpoint) {
        return 'https://platform.cloud.coveo.com';
      }
      if (selector === configurationSelectors.trackingId) {
        return 'tracking-id';
      }
      if (selector === configurationSelectors.language) {
        return 'en';
      }
      if (selector === configurationSelectors.country) {
        return 'US';
      }
      if (selector === configurationSelectors.currency) {
        return 'USD';
      }
      if (selector === conversationEndpointSelectors.configuration) {
        return {
          trackingId: 'tracking-id',
          language: 'en',
          country: 'US',
          currency: 'USD',
        };
      }
      if (selector === cartSelectors.items) {
        return [
          {
            productId: 'p1',
            name: 'Laptop',
            price: 999,
            quantity: 1,
          },
        ];
      }
      if (selector === conversationSelectors.session) {
        return {
          conversationSessionId: 'session-1',
          conversationToken: 'token-1',
        };
      }
      return undefined;
    }),
    subscribe: vi.fn(() => vi.fn()),
  } as unknown as MockEngine;
};

describe('ConversationEndpointFacade', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockClientCall.mockReset();

    vi.mocked(createConversationEndpointClient).mockImplementation(() => ({
      call: mockClientCall,
    }));
  });

  it('returns the same instance for the same engine', () => {
    const engine = createMockEngine();

    const firstInstance = ConversationEndpointFacade.getInstance(engine);
    const secondInstance = ConversationEndpointFacade.getInstance(engine);

    expect(firstInstance).toBe(secondInstance);
    expect(createConversationEndpointClient).toHaveBeenCalledTimes(1);
  });

  it('returns different instances for different engines', () => {
    const firstEngine = createMockEngine();
    const secondEngine = createMockEngine();

    const firstInstance = ConversationEndpointFacade.getInstance(firstEngine);
    const secondInstance = ConversationEndpointFacade.getInstance(secondEngine);

    expect(firstInstance).not.toBe(secondInstance);
    expect(createConversationEndpointClient).toHaveBeenCalledTimes(2);
  });

  it('composes base request from state and passes configuration to the client', async () => {
    const engine = createMockEngine();
    engine.getNavigatorContextProvider.mockReturnValue(() => ({
      clientId: 'client-123',
      location: 'https://example.com/page',
      referrer: 'https://example.com/ref',
      userAgent: 'Mozilla/5.0',
    }));

    const facade = ConversationEndpointFacade.getInstance(engine);
    const clientResult: ConversationEndpointClientResult = {
      success: false,
      error: 'failed',
    };
    mockClientCall.mockResolvedValue(clientResult);

    await facade.callEndpoint('Hello there');

    expect(mockClientCall).toHaveBeenCalledWith(
      {
        trackingId: 'tracking-id',
        language: 'en',
        country: 'US',
        currency: 'USD',
        clientId: 'client-123',
        message: 'Hello there',
        context: {
          user: {
            userAgent: 'Mozilla/5.0',
          },
          view: {
            url: 'https://example.com/page',
            referrer: 'https://example.com/ref',
          },
          cart: {
            items: [
              {
                productId: 'p1',
                name: 'Laptop',
                price: 999,
                quantity: 1,
              },
            ],
          },
        },
        conversationSessionId: 'session-1',
        conversationToken: 'token-1',
        targetEngine: 'AGENT_CORE',
      },
      {
        organizationId: 'test-org-id',
        accessToken: 'test-token',
        endpoint: 'https://platform.cloud.coveo.com',
      }
    );
  });

  it('continues without navigator context provider and without session values', async () => {
    const engine = createMockEngine();
    engine.getNavigatorContextProvider.mockReturnValue(undefined);
    engine.read.mockImplementation((selector) => {
      if (selector === configurationSelectors.organizationId) {
        return 'test-org-id';
      }
      if (selector === configurationSelectors.accessToken) {
        return 'test-token';
      }
      if (selector === configurationSelectors.endpoint) {
        return 'https://platform.cloud.coveo.com';
      }
      if (selector === configurationSelectors.trackingId) {
        return 'tracking-id';
      }
      if (selector === configurationSelectors.language) {
        return 'en';
      }
      if (selector === configurationSelectors.country) {
        return 'US';
      }
      if (selector === configurationSelectors.currency) {
        return 'USD';
      }
      if (selector === conversationEndpointSelectors.configuration) {
        return {
          trackingId: 'tracking-id',
          language: 'en',
          country: 'US',
          currency: 'USD',
        };
      }
      if (selector === cartSelectors.items) {
        return [];
      }
      if (selector === conversationSelectors.session) {
        return {};
      }
      return undefined;
    });

    const facade = ConversationEndpointFacade.getInstance(engine);
    mockClientCall.mockResolvedValue({success: true, data: {stream: null}});

    await facade.callEndpoint('Hello there');

    expect(mockClientCall).toHaveBeenCalledWith(
      {
        trackingId: 'tracking-id',
        language: 'en',
        country: 'US',
        currency: 'USD',
        message: 'Hello there',
        context: {
          user: {},
          view: {},
          cart: {
            items: [],
          },
        },
        targetEngine: 'AGENT_CORE',
      },
      {
        organizationId: 'test-org-id',
        accessToken: 'test-token',
        endpoint: 'https://platform.cloud.coveo.com',
      }
    );
  });

  it('merges request contributors in registration order with later overrides', async () => {
    const engine = createMockEngine();
    engine.getNavigatorContextProvider.mockReturnValue(undefined);
    const facade = ConversationEndpointFacade.getInstance(engine);

    facade.onRequest(() => ({message: 'first override', language: 'fr'}));
    facade.onRequest(() => ({message: 'final override'}));
    mockClientCall.mockResolvedValue({success: true, data: {stream: null}});

    await facade.callEndpoint('base message');

    expect(mockClientCall).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'final override',
        language: 'fr',
      }),
      expect.any(Object)
    );
  });

  it('returns the client result without remapping', async () => {
    const engine = createMockEngine();
    const facade = ConversationEndpointFacade.getInstance(engine);
    const expectedResult: ConversationEndpointClientResult = {
      success: false,
      error: 'request failed',
    };

    mockClientCall.mockResolvedValue(expectedResult);

    const result = await facade.callEndpoint('hello');

    expect(result).toBe(expectedResult);
  });

  it('returns composition debug information with registered contributors', () => {
    const engine = createMockEngine();
    const facade = ConversationEndpointFacade.getInstance(engine);
    const baselineCount =
      facade.getRequestCompositionDebugInfo().registeredContributorCount;

    facade.onRequest(() => ({message: 'one'}));
    facade.onRequest(() => ({message: 'two'}));

    const debugInfo = facade.getRequestCompositionDebugInfo();

    expect(debugInfo.registeredContributorCount).toBe(baselineCount + 2);
  });
});
