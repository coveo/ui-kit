import type {
  Recommendations,
  RecommendationsState,
} from '@coveo/headless/commerce';
import {vi} from 'vitest';
import {genericSubscribe} from '../common';
import {buildFakeProduct} from './product';

export const defaultState = {
  headline: 'Recommended for you',
  responseId: 'some-id',
  productId: '123',
  products: [buildFakeProduct(), buildFakeProduct(), buildFakeProduct()],
  isLoading: false,
  error: null,
} satisfies RecommendationsState;
export const defaultImplementation = {
  subscribe: genericSubscribe,
  state: defaultState,
  refresh: vi.fn(),
  promoteChildToParent: vi.fn(),
  interactiveProduct: vi.fn(),
  pagination: vi.fn(),
  summary: vi.fn(),
} satisfies Recommendations;

export const buildFakeRecommendations = ({
  implementation,
  state,
}: Partial<{
  implementation?: Partial<Recommendations>;
  state?: Partial<RecommendationsState>;
}>): Recommendations =>
  ({
    ...defaultImplementation,
    ...implementation,
    ...{state: {...defaultState, ...(state || {})}},
  }) as Recommendations;
