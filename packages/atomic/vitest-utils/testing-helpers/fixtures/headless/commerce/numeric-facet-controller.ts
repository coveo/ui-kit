import {
  NumericFacetValue,
  NumericFacet,
  NumericFacetState,
} from '@coveo/headless/commerce';

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

export const defaultState: NumericFacetState = {
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
};

export const defaultImplementation = {
  subscribe: (subscribedFunction: () => void) => {
    subscribedFunction();
  },
  state: defaultState,
};

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
    ...(state && {state: {...defaultState, ...state}}),
  }) as NumericFacet;
