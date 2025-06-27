import {
  RegularFacetValue,
  RegularFacet,
  RegularFacetState,
} from '@coveo/headless/commerce';

const defaultValues: RegularFacetValue[] = [
  {
    value: 'value-1',
    numberOfResults: 15,
    moreValuesAvailable: false,
    state: 'idle',
    isAutoSelected: false,
    isSuggested: false,
  },
  {
    value: 'value-2',
    numberOfResults: 8,
    moreValuesAvailable: false,
    state: 'idle',
    isAutoSelected: false,
    isSuggested: false,
  },
];

export const defaultState: RegularFacetState = {
  canShowLessValues: true,
  canShowMoreValues: true,
  facetId: 'some-facet-id',
  displayName: 'some-display-name',
  values: defaultValues,
  facetSearch: {
    isLoading: false,
    query: '',
    moreValuesAvailable: false,
    values: [],
  },
  isLoading: false,
  field: 'field',
  type: 'regular',
  hasActiveValues: false,
};

export const defaultImplementation = {
  subscribe: (subscribedFunction: () => void) => {
    subscribedFunction();
  },
  state: defaultState,
};

export const buildFakeRegularFacet = ({
  implementation,
  state,
}: Partial<{
  implementation?: Partial<RegularFacet>;
  state?: Partial<RegularFacetState>;
}>): RegularFacet =>
  ({
    ...defaultImplementation,
    ...implementation,
    ...(state && {state: {...defaultState, ...state}}),
  }) as RegularFacet;
