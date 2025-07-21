import type {RangeFacetOptionalParameters} from './interfaces/options.js';
import type {
  RangeFacetRequest,
  RangeFacetResponse,
  RangeFacetValue,
  RangeValueRequest,
} from './interfaces/range-facet.js';

type RangeFacetSlice<
  RequestType extends RangeFacetRequest = RangeFacetRequest,
> = {
  request: RequestType;
};

type RangeFacetState<SliceType extends RangeFacetSlice<RangeFacetRequest>> =
  Record<string, SliceType>;

export const defaultRangeFacetOptions: RangeFacetOptionalParameters = {
  filterFacetCount: true,
  injectionDepth: 1000,
  numberOfValues: 8,
  sortCriteria: 'ascending',
  rangeAlgorithm: 'even',
  resultsMustMatch: 'atLeastOneValue',
};

export function registerRangeFacet<T extends RangeFacetSlice>(
  state: RangeFacetState<T>,
  slice: T
) {
  const {request} = slice;
  const {facetId} = request;

  if (facetId in state) {
    return;
  }

  const numberOfValues = calculateNumberOfValues(request);
  request.numberOfValues = numberOfValues;
  state[facetId] = slice;
}

export function updateRangeValues<T extends RangeFacetSlice>(
  state: RangeFacetState<T>,
  facetId: string,
  values: T['request']['currentValues']
) {
  const request = state[facetId]?.request;

  if (!request) {
    return;
  }

  request.currentValues = values;
  request.numberOfValues = calculateNumberOfValues(request);
}

export function toggleSelectRangeValue<
  T extends RangeFacetSlice,
  U extends RangeFacetValue,
>(state: RangeFacetState<T>, facetId: string, selection: U) {
  const request = state[facetId]?.request;

  if (!request) {
    return;
  }

  const value = findRange(request.currentValues, selection);

  if (!value) {
    return;
  }

  const isSelected = value.state === 'selected';
  value.previousState = value.state;
  value.state = isSelected ? 'idle' : 'selected';

  request.preventAutoSelect = true;
}

export function toggleExcludeRangeValue<
  T extends RangeFacetSlice,
  U extends RangeFacetValue,
>(state: RangeFacetState<T>, facetId: string, selection: U) {
  const request = state[facetId]?.request;

  if (!request) {
    return;
  }

  const value = findRange(request.currentValues, selection);

  if (!value) {
    return;
  }

  const isExcluded = value.state === 'excluded';
  value.previousState = value.state;
  value.state = isExcluded ? 'idle' : 'excluded';

  request.preventAutoSelect = true;
}

export function handleRangeFacetDeselectAll<T extends RangeFacetSlice>(
  state: RangeFacetState<T>,
  facetId: string
) {
  const facetRequest = state[facetId]?.request;

  if (!facetRequest) {
    return;
  }

  facetRequest.currentValues.forEach((request) => {
    if (request.state !== 'idle') {
      request.previousState = request.state;
    }
    request.state = 'idle';
  });
}

export function handleRangeFacetSearchParameterRestoration<
  T extends RangeFacetSlice,
>(
  state: RangeFacetState<T>,
  rangeFacets: Record<string, T['request']['currentValues']>
) {
  Object.entries(state).forEach(([facetId, {request}]) => {
    type Range = T['request']['currentValues'][0];
    const rangesToSelect: Range[] = rangeFacets[facetId] || [];

    request.currentValues.forEach((range: Range) => {
      const found = !!findRange(rangesToSelect, range);
      if (found) {
        range.state = 'selected';
      }
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
  T extends RangeFacetSlice,
  U extends RangeFacetResponse,
>(
  state: RangeFacetState<T>,
  facets: U[],
  convert: (values: U['values']) => T['request']['currentValues']
) {
  facets.forEach((facetResponse) => {
    const id = facetResponse.facetId;
    const facetRequest = state[id]?.request;

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

export function findExactRangeValue(
  values: RangeValueRequest[],
  value: RangeValueRequest
) {
  const {start, end, endInclusive} = value;
  return values.find(
    (range) =>
      range.start === start &&
      range.end === end &&
      range.endInclusive === endInclusive
  );
}

function calculateNumberOfValues(request: RangeFacetRequest) {
  const {generateAutomaticRanges, currentValues, numberOfValues} = request;
  return generateAutomaticRanges
    ? Math.max(numberOfValues, currentValues.length)
    : currentValues.length;
}
