import {Recommendations, RecommendationsState} from '@coveo/headless/commerce';
import {vi} from 'vitest';
import {genericSubscribe} from '../common.js';
import {buildFakeProduct} from './product.js';

export const defaultState: RecommendationsState = {
  headline: 'Recommended for you',
  responseId: 'some-id',
  productId: '123',
  products: [buildFakeProduct(), buildFakeProduct()],
  isLoading: false,
  error: null,
};
export const defaultImplementation: Partial<Recommendations> = {
  subscribe: genericSubscribe,
  state: defaultState,
  refresh: vi.fn(),
};

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
    ...(state && {state: {...defaultState, ...state}}),
  }) as Recommendations;
