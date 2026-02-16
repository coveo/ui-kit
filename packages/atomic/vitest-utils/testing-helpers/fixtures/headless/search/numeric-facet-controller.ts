import type {
  NumericFacet,
  NumericFacetState,
  NumericFacetValue,
} from '@coveo/headless';
import {vi} from 'vitest';
import {genericSubscribe} from '../common';

const defaultValues: NumericFacetValue[] = [
  {
    start: 1,
    end: 2,
    endInclusive: false,
    state: 'selected',
    numberOfResults: 10,
  },
  {
    start: 2,
    end: 3,
    endInclusive: false,
    state: 'idle',
    numberOfResults: 20,
  },
  {
    start: 3,
    end: 4,
    endInclusive: false,
    state: 'idle',
    numberOfResults: 30,
  },
];

const defaultState = {
  enabled: true,
  facetId: 'numericFacet',
  hasActiveValues: false,
  values: defaultValues,
  isLoading: false,
  sortCriterion: 'ascending',
} satisfies NumericFacet['state'];

const defaultImplementation = {
  subscribe: genericSubscribe,
  deselectAll: vi.fn(),
  isSortedBy: vi.fn(),
  isValueSelected: vi.fn(),
  sortBy: vi.fn(),
  toggleSelect: vi.fn(),
  toggleSingleSelect: vi.fn(),
  enable: vi.fn(),
  disable: vi.fn(),
  state: defaultState,
} satisfies NumericFacet;

export const buildFakeNumericFacet = ({
  implementation,
  state,
}: Partial<{
  implementation?: Partial<NumericFacet>;
  state?: Partial<NumericFacetState>;
}>): NumericFacet =>
  ({
    ...defaultImplementation,
    ...implementation,
    ...{state: {...defaultState, ...(state || {})}},
  }) as NumericFacet;
