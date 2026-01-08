import type {
  RecommendationList,
  RecommendationListState,
} from '@coveo/headless/recommendation';
import {vi} from 'vitest';
import {genericSubscribe} from '../common';

export const defaultState = {
  error: null,
  isLoading: false,
  recommendations: [],
  searchResponseId: '',
} satisfies RecommendationListState;

export const defaultImplementation = {
  subscribe: genericSubscribe,
  state: defaultState,
  refresh: vi.fn(),
} satisfies RecommendationList;

export const buildFakeRecommendationList = ({
  implementation,
  state,
}: Partial<{
  implementation?: Partial<RecommendationList>;
  state?: Partial<RecommendationListState>;
}> = {}): RecommendationList =>
  ({
    ...defaultImplementation,
    ...implementation,
    ...{state: {...defaultState, ...(state || {})}},
  }) as RecommendationList;
