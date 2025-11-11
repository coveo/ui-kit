import type {
  DateFacet,
  DateFacetState,
  DateFacetValue,
} from '@coveo/headless/commerce';
import {vi} from 'vitest';

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

export const defaultState: DateFacetState = {
  canShowLessValues: true,
  canShowMoreValues: true,
  facetId: 'some-date-facet-id',
  displayName: 'some-display-name',
  values: defaultValues,
  isLoading: false,
  field: 'date',
  type: 'dateRange',
  hasActiveValues: false,
};

export const defaultImplementation = {
  toggleSingleSelect: vi.fn(),
  deselectAll: vi.fn(),
  setRanges: vi.fn(),
  subscribe: vi.fn((subscribedFunction: () => void) => {
    subscribedFunction();
    return vi.fn(); // Return unsubscribe function
  }),
  state: defaultState,
};

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
