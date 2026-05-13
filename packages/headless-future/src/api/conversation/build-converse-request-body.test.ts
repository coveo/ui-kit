import {describe, expect, it, vi} from 'vitest';
import {Engine, getFullEngine} from '@/src/core/interface/engine/engine.js';
import {
  buildMockFullEngine,
  MockNavigatorContext,
} from '@/src/test/test-utils.js';
import {conversationSlice} from '@/src/core/internal/conversation/conversation-slice.js';
import * as conversationMutators from '@/src/core/interface/conversation/conversation-mutators.js';
import {buildCartController} from '@/src/public/controllers/cart/cart-controller.js';
import {buildConverseRequestBody} from './build-converse-request-body.js';

type BuildConverseEngine = Parameters<typeof buildConverseRequestBody>[0];

type MockState = {
  configuration?: {
    trackingId?: string;
    language?: string;
    country?: string;
    currency?: string;
  };
  conversation?: {
    session?: {
      conversationSessionId?: string;
      conversationToken?: string;
    };
  };
  cart?: {
    items?: Array<{
      productId: string;
      name: string;
      price: number;
      quantity: number;
    }>;
  };
};

function buildMockEngine(
  state: MockState,
  navigatorContext?: MockNavigatorContext
): BuildConverseEngine {
  return buildMockFullEngine(state, navigatorContext) as BuildConverseEngine;
}

describe('buildConverseRequestBody()', () => {
  describe('integration (real engine)', () => {
    it('builds a payload from engine state', async () => {
      const engine = new Engine({
        configuration: {
          organizationId: 'org-id',
          accessToken: 'token',
          trackingId: 'market_123',
          language: 'en',
          country: 'CA',
          currency: 'CAD',
        },
        navigatorContextProvider: () => ({
          clientId: 'client-1',
          location: 'https://example.com/products',
          referrer: 'https://example.com/home',
          userAgent: 'Mozilla/5.0',
        }),
      });
      const cartController = buildCartController({engine});
      cartController.setItems({
        items: [
          {
            productId: 'sku-1',
            name: 'Shoe',
            price: 120,
            quantity: 2,
          },
        ],
      });

      const fullEngine = getFullEngine(engine);
      await fullEngine.adoptSlice(conversationSlice);
      fullEngine.mutate(
        conversationMutators.setSession({
          conversationSessionId: 'session-123',
          conversationToken: 'token-abc',
        })
      );

      const payload = buildConverseRequestBody(
        fullEngine,
        'Need running shoes'
      );

      expect(payload).toEqual({
        trackingId: 'market_123',
        language: 'en',
        country: 'CA',
        currency: 'CAD',
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

    it('calls Engine navigator-provider warning path when provider is missing', () => {
      const engine = new Engine();
      const fullEngine = getFullEngine(engine);
      const warningSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const payload = buildConverseRequestBody(fullEngine, 'hello');

      expect(payload).toEqual({
        trackingId: undefined,
        language: undefined,
        country: undefined,
        currency: undefined,
        clientId: undefined,
        message: 'hello',
        context: {
          user: {
            userAgent: undefined,
          },
          view: {
            url: undefined,
            referrer: undefined,
          },
          cart: [],
        },
        conversationSessionId: undefined,
        conversationToken: undefined,
        targetEngine: 'AGENT_CORE',
      });

      expect(warningSpy).toHaveBeenCalledTimes(1);
      expect(warningSpy.mock.calls[0][0]).toContain(
        'Missing navigator context provider'
      );
    });
  });

  describe('unit (mocked engine)', () => {
    it('passes raw values from state including null', () => {
      const engine = buildMockEngine(
        {
          configuration: {
            trackingId: '',
            language: '',
            country: '',
            currency: '',
          },
          conversation: {
            session: {
              conversationSessionId: '',
            },
          },
          cart: {
            items: [],
          },
        },
        {
          clientId: '',
          location: null,
          referrer: null,
          userAgent: null,
        }
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
            userAgent: null,
          },
          view: {
            url: null,
            referrer: null,
          },
          cart: [],
        },
        conversationSessionId: '',
        conversationToken: undefined,
        targetEngine: 'AGENT_CORE',
      });
    });

    it('falls back to empty cart when cart slice is missing', () => {
      const engine = buildMockEngine({
        configuration: {},
        conversation: {},
      });

      const payload = buildConverseRequestBody(engine, 'show hats');

      expect(payload).toEqual({
        trackingId: undefined,
        language: undefined,
        country: undefined,
        currency: undefined,
        clientId: undefined,
        message: 'show hats',
        context: {
          user: {
            userAgent: undefined,
          },
          view: {
            url: undefined,
            referrer: undefined,
          },
          cart: [],
        },
        conversationSessionId: undefined,
        conversationToken: undefined,
        targetEngine: 'AGENT_CORE',
      });
    });
  });
});
