import {
  RangeFacetRequest,
  RangeFacetResponse,
  RangeFacetValue,
  RangeValueRequest,
} from './interfaces/range-facet';
import {RangeFacetOptionalParameters} from './interfaces/options';

type FindRange<T> = (currentValues: T[], paramValue: T) => T | undefined;

export const defaultRangeFacetOptions: RangeFacetOptionalParameters = {
  filterFacetCount: true,
  injectionDepth: 1000,
  numberOfValues: 8,
  sortCriteria: 'ascending',
  rangeAlgorithm: 'even',
};

export function registerRangeFacet<T extends RangeFacetRequest>(
  state: Record<string, T>,
  request: T
) {
  const {facetId} = request;

  if (facetId in state) {
    return;
  }

  const numberOfValues = calculateNumberOfValues(request);
  state[facetId] = {...request, numberOfValues};
}

export function updateRangeValues<T extends RangeFacetRequest>(
  state: Record<string, T>,
  facetId: string,
  values: T['currentValues']
) {
  const request = state[facetId];

  if (!request) {
    return;
  }

  request.currentValues = values;
  request.numberOfValues = calculateNumberOfValues(request);
}

export function toggleSelectRangeValue<
  T extends RangeFacetRequest,
  U extends RangeFacetValue
>(
  state: Record<string, T>,
  facetId: string,
  selection: U,
  find: FindRange<T['currentValues'][0]>
) {
  const request = state[facetId];

  if (!request) {
    return;
  }

  const value = find(request.currentValues, selection);

  if (!value) {
    return;
  }

  const isSelected = value.state === 'selected';
  value.state = isSelected ? 'idle' : 'selected';

  request.preventAutoSelect = true;
}

export function handleRangeFacetDeselectAll<T extends RangeFacetRequest>(
  state: Record<string, T>,
  facetId: string
) {
  const facetRequest = state[facetId];

  if (!facetRequest) {
    return;
  }

  facetRequest.currentValues.forEach(
    (request: T['currentValues'][0]) => (request.state = 'idle')
  );
}

export function handleRangeFacetSearchParameterRestoration<
  T extends RangeValueRequest
>(currentValues: T[], paramValues: T[], find: FindRange<T>): T[] {
  const missingRanges = paramValues.filter(
    (value) => !find(currentValues, value)
  );

  currentValues.forEach((value) => {
    const found = !!find(paramValues, value);
    value.state = found ? 'selected' : 'idle';
  });

  return [...currentValues, ...missingRanges];
}

export function onRangeFacetRequestFulfilled<
  T extends RangeFacetRequest,
  U extends RangeFacetResponse
>(
  state: Record<string, T>,
  facets: U[],
  convert: (values: U['values']) => T['currentValues'],
  assign = (
    _requestValues: T['currentValues'],
    responseValues: T['currentValues']
  ) => responseValues
) {
  facets.forEach((facetResponse) => {
    const id = facetResponse.facetId;
    const facetRequest = state[id];

    if (!facetRequest) {
      return;
    }

    facetRequest.currentValues = assign(
      facetRequest.currentValues,
      convert(facetResponse.values)
    );
    facetRequest.preventAutoSelect = false;
  });
}

function calculateNumberOfValues(request: RangeFacetRequest) {
  const {generateAutomaticRanges, currentValues, numberOfValues} = request;
  return generateAutomaticRanges
    ? Math.max(numberOfValues, currentValues.length)
    : currentValues.length;
}
