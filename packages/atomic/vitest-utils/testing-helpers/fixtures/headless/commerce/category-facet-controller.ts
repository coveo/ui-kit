import type {
  CategoryFacet,
  CategoryFacetState,
  CategoryFacetValue,
} from '@coveo/headless/commerce';

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
        isAutoSelected: false,
        isSuggested: false,
      },
      {
        value: 'Smartphones',
        numberOfResults: 8,
        moreValuesAvailable: false,
        state: 'idle',
        path: ['Electronics', 'Smartphones'],
        children: [],
        isLeafValue: true,
        isAutoSelected: false,
        isSuggested: false,
      },
    ],
    isLeafValue: false,
    isAutoSelected: false,
    isSuggested: false,
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
        isAutoSelected: false,
        isSuggested: false,
      },
      {
        value: 'Womens',
        numberOfResults: 8,
        moreValuesAvailable: false,
        state: 'idle',
        path: ['Clothing', 'Womens'],
        children: [],
        isLeafValue: true,
        isAutoSelected: false,
        isSuggested: false,
      },
    ],
    isLeafValue: false,
    isAutoSelected: false,
    isSuggested: false,
  },
];

export const defaultState = {
  canShowLessValues: true,
  canShowMoreValues: true,
  facetId: 'some-category-facet-id',
  displayName: 'some-category-display-name',
  values: defaultValues,
  facetSearch: {
    isLoading: false,
    query: '',
    moreValuesAvailable: false,
    values: [],
  },
  isLoading: false,
  field: 'category_field',
  type: 'hierarchical',
  hasActiveValues: false,
  selectedValueAncestry: [],
  activeValue: undefined,
} satisfies CategoryFacetState;

export const defaultImplementation = {
  subscribe: (subscribedFunction: () => void) => {
    subscribedFunction();
  },
  state: defaultState,
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
