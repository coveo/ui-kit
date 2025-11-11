import type {Facet, FacetState, FacetValue} from '@coveo/headless';

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

export const defaultState: FacetState = {
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
};

export const defaultImplementation = {
  subscribe: (subscribedFunction: () => void) => {
    subscribedFunction();
  },
  state: defaultState,
};

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
