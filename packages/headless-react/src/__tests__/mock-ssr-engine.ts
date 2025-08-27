import type {CommerceEngine} from '@coveo/headless/ssr-commerce';

export const createMockCommerceEngine = () =>
  ({
    state: {},
    subscribe: vi.fn(() => vi.fn()), // Returns unsubscribe function
    dispatch: vi.fn(),
  }) as unknown as CommerceEngine;
