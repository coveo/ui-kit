import type {
  SearchBox as InsightSearchBox,
  SearchBoxState as InsightSearchBoxState,
} from '@coveo/headless/insight';
import {vi} from 'vitest';
import {genericSubscribe} from '../common';

export const defaultState = {
  value: '',
  suggestions: [],
  isLoading: false,
  isLoadingSuggestions: false,
} satisfies InsightSearchBoxState;

export const defaultImplementation = {
  subscribe: genericSubscribe,
  state: defaultState,
  updateText: vi.fn(),
  clear: vi.fn(),
  submit: vi.fn(),
  selectSuggestion: vi.fn(),
  showSuggestions: vi.fn(),
} satisfies InsightSearchBox;

export const buildFakeInsightSearchBox = ({
  implementation,
  state,
}: Partial<{
  implementation?: Partial<InsightSearchBox>;
  state?: Partial<InsightSearchBoxState>;
}> = {}): InsightSearchBox =>
  ({
    ...defaultImplementation,
    ...implementation,
    ...{state: {...defaultState, ...(state || {})}},
  }) as InsightSearchBox;
