import type {NumericFilter, NumericFilterState} from '@coveo/headless';
import {vi} from 'vitest';
import {genericSubscribe} from '../common';

const defaultState = {
  facetId: 'numericFilter',
  range: undefined,
  isLoading: false,
  enabled: true,
} satisfies NumericFilterState;

const defaultImplementation = {
  subscribe: genericSubscribe,
  clear: vi.fn(),
  setRange: vi.fn().mockReturnValue(true),
  enable: vi.fn(),
  disable: vi.fn(),
  state: defaultState,
} satisfies NumericFilter;

export const buildFakeNumericFilter = ({
  implementation,
  state,
}: Partial<{
  implementation?: Partial<NumericFilter>;
  state?: Partial<NumericFilterState>;
}> = {}): NumericFilter =>
  ({
    ...defaultImplementation,
    ...implementation,
    ...{state: {...defaultState, ...(state || {})}},
  }) as NumericFilter;
