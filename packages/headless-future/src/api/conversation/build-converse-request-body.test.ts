import {describe, expect, it, vi} from 'vitest';
import {Engine, getFullEngine} from '@/src/core/interface/engine/engine.js';
import {cartSlice} from '@/src/core/internal/cart/cart-slice.js';
import {conversationSlice} from '@/src/core/internal/conversation/conversation-slice.js';
import * as cartMutators from '@/src/core/interface/cart/cart-mutators.js';
import * as conversationMutators from '@/src/core/interface/conversation/conversation-mutators.js';
import {buildConverseRequestBody} from './build-converse-request-body.js';

describe('buildConverseRequestBody()', () => {
  it('builds a Barca-shaped payload from engine state', async () => {
    const engine = getFullEngine(
      new Engine({
        configuration: {
          organizationId: 'org-id',
          accessToken: 'token',
          trackingId: 'market_123',
          language: 'EN',
          country: 'ca',
          currency: 'cad',
        },
        navigatorContextProvider: () => ({
          clientId: 'client-1',
          location: 'https://example.com/products',
          referrer: 'https://example.com/home',
          userAgent: 'Mozilla/5.0',
        }),
      })
    );

    await engine.adoptSlice(cartSlice);
    await engine.adoptSlice(conversationSlice);

    engine.mutate(
      cartMutators.setItems({
        items: [
          {
            productId: 'sku-1',
            name: 'Shoe',
            price: 120,
            quantity: 2,
          },
        ],
      })
    );

    engine.mutate(
      conversationMutators.setSession({
        conversationSessionId: 'session-123',
        conversationToken: 'token-abc',
      })
    );

    const payload = buildConverseRequestBody(engine, 'Need running shoes');

    expect(payload).toEqual({
      trackingId: 'market_123',
      language: 'EN',
      country: 'ca',
      currency: 'cad',
      clientId: 'client-1',
      message: 'Need running shoes',
      context: {
        user: {
          userAgent: 'Mozilla/5.0',
        },
        view: {
          url: 'https://example.com/products',
          referrer: 'https://example.com/home',
        },
        cart: [
          {
            productId: 'sku-1',
            name: 'Shoe',
            price: 120,
            quantity: 2,
          },
        ],
      },
      conversationSessionId: 'session-123',
      conversationToken: 'token-abc',
      targetEngine: 'AGENT_CORE',
    });
  });

  it('defaults missing fields to empty strings', async () => {
    const engine = getFullEngine(
      new Engine({
        configuration: {
          organizationId: 'org-id',
          accessToken: 'token',
          trackingId: '',
          language: '',
          country: '',
          currency: '',
        },
        navigatorContextProvider: () => ({
          clientId: '',
          location: null,
          referrer: null,
          userAgent: null,
        }),
      })
    );

    await engine.adoptSlice(conversationSlice);

    engine.mutate(
      conversationMutators.setSession({
        conversationSessionId: '',
      })
    );

    const payload = buildConverseRequestBody(engine, 'hello');

    expect(payload).toEqual({
      trackingId: '',
      language: '',
      country: '',
      currency: '',
      clientId: '',
      message: 'hello',
      context: {
        user: {
          userAgent: '',
        },
        view: {
          url: '',
          referrer: '',
        },
        cart: [],
      },
      conversationSessionId: '',
      conversationToken: '',
      targetEngine: 'AGENT_CORE',
    });
  });

  it('calls Engine navigator-provider warning path when provider is missing', () => {
    const engine = getFullEngine(new Engine());
    const warningSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const payload = buildConverseRequestBody(engine, 'hello');

    expect(payload).toEqual({
      trackingId: '',
      language: '',
      country: '',
      currency: '',
      clientId: '',
      message: 'hello',
      context: {
        user: {
          userAgent: '',
        },
        view: {
          url: '',
          referrer: '',
        },
        cart: [],
      },
      conversationSessionId: '',
      conversationToken: '',
      targetEngine: 'AGENT_CORE',
    });

    expect(warningSpy).toHaveBeenCalledTimes(1);
    expect(warningSpy.mock.calls[0][0]).toContain(
      'Missing navigator context provider'
    );
  });

  it('works when configuration slice is not adopted', async () => {
    const engine = getFullEngine(new Engine());
    await engine.adoptSlice(cartSlice);

    engine.mutate(
      cartMutators.setItems({
        items: [
          {
            productId: 'sku-2',
            name: 'Hat',
            price: 40,
            quantity: 1,
          },
        ],
      })
    );

    const payload = buildConverseRequestBody(engine, 'show hats');

    expect(payload).toEqual({
      trackingId: '',
      language: '',
      country: '',
      currency: '',
      clientId: '',
      message: 'show hats',
      context: {
        user: {
          userAgent: '',
        },
        view: {
          url: '',
          referrer: '',
        },
        cart: [
          {
            productId: 'sku-2',
            name: 'Hat',
            price: 40,
            quantity: 1,
          },
        ],
      },
      conversationSessionId: '',
      conversationToken: '',
      targetEngine: 'AGENT_CORE',
    });
  });
});
