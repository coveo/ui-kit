import type {SearchEngine} from '@coveo/headless/ssr';
import type {CommerceEngine} from '@coveo/headless/ssr-commerce';
import {vi} from 'vitest';

export const createMockCommerceEngine = () =>
  ({
    state: {},
    subscribe: vi.fn(() => vi.fn()), // Returns unsubscribe function
    dispatch: vi.fn(),
  }) as unknown as CommerceEngine;

export const createMockSearchEngine = () =>
  ({
    state: {},
    subscribe: vi.fn(() => vi.fn()), // Returns unsubscribe function
    dispatch: vi.fn(),
  }) as unknown as SearchEngine;
