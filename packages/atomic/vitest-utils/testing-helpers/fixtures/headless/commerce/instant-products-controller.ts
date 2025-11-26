import type {
  InstantProducts,
  InstantProductsState,
} from '@coveo/headless/commerce';
import {vi} from 'vitest';

export const defaultState = {
  query: 'the query',
  products: [
    {
      id: 'product1',
      title: 'Product 1',
      permanentid: '12345',
      price: 100,
      imageUrl: 'https://example.com/product1.jpg',
      children: [],
    },
    {
      id: 'product2',
      title: 'Product 2',
      permanentid: '12346',
      price: 200,
      imageUrl: 'https://example.com/product2.jpg',
      children: [],
    },
    {
      id: 'product3',
      title: 'Product 3',
      permanentid: '12347',
      price: 300,
      imageUrl: 'https://example.com/product3.jpg',
      children: [],
    },
  ],
  isLoading: false,
  error: null,
  totalCount: 3,
} satisfies InstantProductsState;

export const defaultImplementation = {
  updateQuery: vi.fn(),
  clearExpired: vi.fn(),
  promoteChildToParent: vi.fn(),
  interactiveProduct: vi.fn(),
  subscribe: vi.fn((subscribedFunction: () => void) => {
    setTimeout(subscribedFunction, 0);
    return vi.fn();
  }) as unknown as InstantProducts['subscribe'],
  state: defaultState,
} satisfies InstantProducts;

export const buildFakeInstantProducts = (
  state?: Partial<InstantProductsState>
): InstantProducts =>
  ({
    ...defaultImplementation,
    ...{state: {...defaultState, ...(state || {})}},
  }) as InstantProducts;
