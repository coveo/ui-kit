import type {
  CategoryFacet,
  CategoryFacetState,
  CategoryFacetValue,
} from '@coveo/headless';
import {vi} from 'vitest';
import {genericSubscribe} from '../common';

const defaultValues: CategoryFacetValue[] = [
  {
    value: 'Electronics',
    numberOfResults: 25,
    moreValuesAvailable: true,
    state: 'idle',
    path: ['Electronics'],
    children: [
      {
        value: 'Laptops',
        numberOfResults: 12,
        moreValuesAvailable: false,
        state: 'idle',
        path: ['Electronics', 'Laptops'],
        children: [],
        isLeafValue: true,
      },
      {
        value: 'Smartphones',
        numberOfResults: 8,
        moreValuesAvailable: false,
        state: 'idle',
        path: ['Electronics', 'Smartphones'],
        children: [],
        isLeafValue: true,
      },
    ],
    isLeafValue: false,
  },
  {
    value: 'Clothing',
    numberOfResults: 18,
    moreValuesAvailable: true,
    state: 'idle',
    path: ['Clothing'],
    children: [
      {
        value: 'Mens',
        numberOfResults: 10,
        moreValuesAvailable: false,
        state: 'idle',
        path: ['Clothing', 'Mens'],
        children: [],
        isLeafValue: true,
      },
      {
        value: 'Womens',
        numberOfResults: 8,
        moreValuesAvailable: false,
        state: 'idle',
        path: ['Clothing', 'Womens'],
        children: [],
        isLeafValue: true,
      },
    ],
    isLeafValue: false,
  },
];

export const defaultState = {
  canShowLessValues: true,
  canShowMoreValues: true,
  facetId: 'some-category-facet-id',
  enabled: true,
  sortCriterion: 'occurrences' as const,
  valuesAsTrees: defaultValues,
  values: defaultValues,
  facetSearch: {
    isLoading: false,
    query: '',
    moreValuesAvailable: false,
    values: [],
  },
  isLoading: false,
  hasActiveValues: false,
  selectedValueAncestry: [],
  parents: [],
  activeValue: undefined,
} satisfies CategoryFacetState;

export const defaultImplementation = {
  subscribe: genericSubscribe,
  state: defaultState,
  deselectAll: vi.fn(),
  showLessValues: vi.fn(),
  showMoreValues: vi.fn(),
  toggleSelect: vi.fn(),
  isValueSelected: vi.fn(() => false),
  sortBy: vi.fn(),
  isSortedBy: vi.fn(),
  enable: vi.fn(),
  disable: vi.fn(),
  facetSearch: {
    updateText: vi.fn(),
    showMoreResults: vi.fn(),
    search: vi.fn(),
    select: vi.fn(),
    clear: vi.fn(),
    updateCaptions: vi.fn(),
  },
} satisfies CategoryFacet;

export const buildFakeCategoryFacet = ({
  implementation,
  state,
}: Partial<{
  implementation?: Partial<CategoryFacet>;
  state?: Partial<CategoryFacetState>;
}>): CategoryFacet =>
  ({
    ...defaultImplementation,
    ...implementation,
    ...{state: {...defaultState, ...(state || {})}},
  }) as CategoryFacet;
