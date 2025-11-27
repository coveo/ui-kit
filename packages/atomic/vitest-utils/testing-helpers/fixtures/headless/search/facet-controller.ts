import type {Facet, FacetState, FacetValue} from '@coveo/headless';
import {vi} from 'vitest';
import {genericSubscribe} from '../common';

const defaultValues: FacetValue[] = [
  {
    value: 'value-1',
    numberOfResults: 15,
    state: 'idle',
  },
  {
    value: 'value-2',
    numberOfResults: 8,
    state: 'idle',
  },
];

export const defaultState = {
  canShowLessValues: true,
  canShowMoreValues: true,
  facetId: 'some-facet-id',
  enabled: true,
  sortCriterion: 'automatic',
  values: defaultValues,
  facetSearch: {
    isLoading: false,
    query: '',
    moreValuesAvailable: false,
    values: [],
  },
  isLoading: false,
  hasActiveValues: false,
} satisfies FacetState;

export const defaultImplementation = {
  subscribe: genericSubscribe,
  state: defaultState,
  facetSearch: {
    updateText: vi.fn(),
    search: vi.fn(),
    select: vi.fn(),
    singleSelect: vi.fn(),
    exclude: vi.fn(),
    singleExclude: vi.fn(),
    showMoreResults: vi.fn(),
    clear: vi.fn(),
    updateCaptions: vi.fn(),
  },
  toggleSelect: vi.fn(),
  toggleExclude: vi.fn(),
  toggleSingleSelect: vi.fn(),
  toggleSingleExclude: vi.fn(),
  isValueSelected: vi.fn(),
  isValueExcluded: vi.fn(),
  deselectAll: vi.fn(),
  sortBy: vi.fn(),
  isSortedBy: vi.fn(),
  showMoreValues: vi.fn(),
  showLessValues: vi.fn(),
  enable: vi.fn(),
  disable: vi.fn(),
} satisfies Facet;

export const buildFakeFacet = ({
  implementation,
  state,
}: Partial<{
  implementation?: Partial<Facet>;
  state?: Partial<FacetState>;
}>): Facet =>
  ({
    ...defaultImplementation,
    ...implementation,
    ...{state: {...defaultState, ...(state || {})}},
  }) as Facet;
