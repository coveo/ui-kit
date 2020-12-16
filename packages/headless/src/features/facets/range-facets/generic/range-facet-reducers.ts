import {
  RangeFacetRequest,
  RangeFacetResponse,
  RangeFacetValue,
  RangeValueRequest,
} from './interfaces/range-facet';
import {RangeFacetOptionalParameters} from './interfaces/options';

export const defaultRangeFacetOptions: RangeFacetOptionalParameters = {
  filterFacetCount: true,
  injectionDepth: 1000,
  numberOfValues: 8,
  sortCriteria: 'ascending',
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

export function toggleSelectRangeValue<
  T extends RangeFacetRequest,
  U extends RangeFacetValue
>(state: Record<string, T>, facetId: string, selection: U) {
  const request = state[facetId];

  if (!request) {
    return;
  }

  const value = findRange(request.currentValues, selection);

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
  T extends RangeFacetRequest
>(state: Record<string, T>, rangeFacets: Record<string, T['currentValues']>) {
  Object.entries(state).forEach(([facetId, request]) => {
    type Range = T['currentValues'][0];
    const rangesToSelect: Range[] = rangeFacets[facetId] || [];

    request.currentValues.forEach((range: Range) => {
      const found = !!findRange(rangesToSelect, range);
      range.state = found ? 'selected' : 'idle';
      return range;
    });

    const missingRanges = rangesToSelect.filter(
      (range) => !findRange(request.currentValues, range)
    );
    const currentValues: Range[] = request.currentValues;
    currentValues.push(...missingRanges);

    request.numberOfValues = Math.max(
      request.numberOfValues,
      currentValues.length
    );
  });
}

export function onRangeFacetRequestFulfilled<
  T extends RangeFacetRequest,
  U extends RangeFacetResponse
>(
  state: Record<string, T>,
  facets: U[],
  convert: (values: U['values']) => T['currentValues']
) {
  facets.forEach((facetResponse) => {
    const id = facetResponse.facetId;
    const facetRequest = state[id];

    if (!facetRequest) {
      return;
    }

    const values = convert(facetResponse.values);
    facetRequest.currentValues = values;
    facetRequest.preventAutoSelect = false;
  });
}

function findRange(values: RangeValueRequest[], value: RangeValueRequest) {
  const {start, end} = value;
  return values.find((range) => range.start === start && range.end === end);
}

function calculateNumberOfValues(request: RangeFacetRequest) {
  const {generateAutomaticRanges, currentValues, numberOfValues} = request;
  return generateAutomaticRanges
    ? Math.max(numberOfValues, currentValues.length)
    : currentValues.length;
}
