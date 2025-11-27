import type {
  DateFacet,
  DateFacetState,
  DateFacetValue,
} from '@coveo/headless/commerce';
import {vi} from 'vitest';
import {genericSubscribe} from '../common';

const defaultValues: DateFacetValue[] = [
  {
    start: 'past-1-month',
    end: 'now',
    endInclusive: true,
    numberOfResults: 15,
    moreValuesAvailable: false,
    state: 'idle',
    isAutoSelected: false,
    isSuggested: false,
  },
  {
    start: 'past-1-year',
    end: 'now',
    endInclusive: true,
    numberOfResults: 8,
    moreValuesAvailable: false,
    state: 'idle',
    isAutoSelected: false,
    isSuggested: false,
  },
];

export const defaultState = {
  canShowLessValues: true,
  canShowMoreValues: true,
  facetId: 'some-date-facet-id',
  displayName: 'some-display-name',
  values: defaultValues,
  isLoading: false,
  field: 'date',
  type: 'dateRange',
  hasActiveValues: false,
} satisfies DateFacetState;

export const defaultImplementation = {
  type: 'dateRange' as const,
  toggleSelect: vi.fn(),
  toggleExclude: vi.fn(),
  toggleSingleSelect: vi.fn(),
  toggleSingleExclude: vi.fn(),
  isValueSelected: vi.fn(),
  isValueExcluded: vi.fn(),
  deselectAll: vi.fn(),
  setRanges: vi.fn(),
  showLessValues: vi.fn(),
  showMoreValues: vi.fn(),
  subscribe: genericSubscribe,
  state: defaultState,
} satisfies DateFacet;

export const buildFakeDateFacet = ({
  implementation,
  state,
}: Partial<{
  implementation?: Partial<DateFacet>;
  state?: Partial<DateFacetState>;
}> = {}): DateFacet =>
  ({
    ...defaultImplementation,
    ...implementation,
    ...{state: {...defaultState, ...(state || {})}},
  }) as DateFacet;
