import {describe, it, expect, vi, beforeEach} from 'vitest';
import {createUnifiedEndpointRequestSelector} from './unified-request-selector.js';
import type {InterfaceHandle} from '@/src/internal/utils/index.js';

vi.mock('@/src/internal/features/configuration/index.js', () => ({
  getOrCreateConfigurationSelectors: () => ({
    getTrackingId: (state: any) => state.__trackingId ?? '',
    getLanguage: (state: any) => state.__language ?? '',
    getCountry: (state: any) => state.__country ?? '',
    getCurrency: (state: any) => state.__currency ?? '',
  }),
}));

vi.mock('@/src/internal/features/generative/index.js', () => ({
  getOrCreateGenerativeSelectors: () => ({
    getConversationSessionId: (state: any) => state.__conversationSessionId,
    getConversationToken: (state: any) => state.__conversationToken,
  }),
}));

vi.mock('@/src/internal/features/cart/index.js', () => ({
  getOrCreateCartSelectors: () => ({
    getCartContext: (state: any) => state.__cart,
  }),
}));

const mockInterface: InterfaceHandle = {} as any;

describe('createUnifiedEndpointRequestSelector', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('maps trackingId, language, country, currency from configuration', () => {
    const selector = createUnifiedEndpointRequestSelector(mockInterface, mockInterface);

    const state = {
      __trackingId: 'my-tracking-id',
      __language: 'fr',
      __country: 'CA',
      __currency: 'CAD',
    };

    const result = selector(state);

    expect(result.trackingId).toBe('my-tracking-id');
    expect(result.language).toBe('fr');
    expect(result.country).toBe('CA');
    expect(result.currency).toBe('CAD');
  });

  it('maps conversationSessionId and conversationToken from generative', () => {
    const selector = createUnifiedEndpointRequestSelector(mockInterface, mockInterface);

    const state = {
      __conversationSessionId: 'session-123',
      __conversationToken: 'token-abc',
    };

    const result = selector(state);

    expect(result.conversationSessionId).toBe('session-123');
    expect(result.conversationToken).toBe('token-abc');
  });

  it('maps cart context from cart selectors', () => {
    const selector = createUnifiedEndpointRequestSelector(mockInterface, mockInterface);

    const cartItems = [
      {productId: 'p1', name: 'Shirt', price: 29.99, quantity: 2},
      {productId: 'p2', name: 'Pants', price: 49.99, quantity: 1},
    ];

    const state = {
      __cart: cartItems,
    };

    const result = selector(state);

    expect(result.cart).toBe(cartItems);
  });

  it('returns memoized output when inputs are unchanged', () => {
    const selector = createUnifiedEndpointRequestSelector(mockInterface, mockInterface);

    const state = {
      __trackingId: 'tid',
      __language: 'en',
      __country: 'US',
      __currency: 'USD',
      __cart: undefined,
      __conversationSessionId: 'sid',
      __conversationToken: 'tok',
    };

    const result1 = selector(state);
    const result2 = selector(state);

    expect(result1).toBe(result2);
  });
});
