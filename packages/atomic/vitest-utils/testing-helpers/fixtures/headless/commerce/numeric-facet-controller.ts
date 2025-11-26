import type {
  NumericFacet,
  NumericFacetState,
  NumericFacetValue,
} from '@coveo/headless/commerce';
import {vi} from 'vitest';
import {genericSubscribe} from '../common';

const defaultValues: NumericFacetValue[] = [
  {
    start: 1,
    end: 9,
    endInclusive: true,
    numberOfResults: 15,
    moreValuesAvailable: false,
    state: 'idle',
    isAutoSelected: false,
    isSuggested: false,
  },
  {
    numberOfResults: 8,
    start: 10,
    end: 100,
    endInclusive: true,
    moreValuesAvailable: false,
    state: 'idle',
    isAutoSelected: false,
    isSuggested: false,
  },
];

export const defaultState = {
  canShowLessValues: true,
  canShowMoreValues: true,
  facetId: 'some-facet-id',
  displayName: 'some-display-name',
  values: defaultValues,
  domain: {min: 0, max: 100},
  isLoading: false,
  field: 'field',
  type: 'numericalRange',
  hasActiveValues: false,
} satisfies NumericFacetState;

export const defaultImplementation = {
  subscribe: genericSubscribe,
  state: defaultState,
  deselectAll: vi.fn(),
  showLessValues: vi.fn(),
  showMoreValues: vi.fn(),
  toggleSelect: vi.fn(),
  toggleExclude: vi.fn(),
  toggleSingleSelect: vi.fn(),
  toggleSingleExclude: vi.fn(),
  isValueSelected: vi.fn(),
  isValueExcluded: vi.fn(),
  setRanges: vi.fn(),
  type: 'numericalRange' as const,
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
