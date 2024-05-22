import {CommerceFacetSetState} from './facet-set-state';
import {Parameters} from '../../parameters/parameters-actions';
import {NumericRangeRequest} from '../../../facets/range-facets/numeric-facet-set/interfaces/request';
import {
  AnyFacetValueRequest,
  CategoryFacetRequest, CategoryFacetValueRequest,
  DateFacetRequest,
  NumericFacetRequest,
  RegularFacetRequest
} from './interfaces/request';
import {FacetValueRequest} from '../../../facets/facet-set/interfaces/request';
import {DateRangeRequest} from '../../../facets/range-facets/date-facet-set/interfaces/request';

export function restoreFromParameters(state: CommerceFacetSetState, action: { payload: Parameters }) {
  if (action.payload.f) {
    restoreRegularFacets(state, action.payload.f);
  }
  if (action.payload.nf) {
    restoreRangeFacets(state, action.payload.nf, 'numericalRange');
  }
  if (action.payload.df) {
    restoreRangeFacets(state, action.payload.df, 'dateRange');
  }
  if (action.payload.cf) {
    restoreCategoryFacets(state, action.payload.cf);
  }
}

function restoreRegularFacets(state: CommerceFacetSetState, parameterFacets: Record<string, string[]>) {
  const regularFacetIds = Object.keys(state)
    .filter((id) => state[id]?.request.type === 'regular');

  regularFacetIds
    .forEach((id) => {
      const request = state[id]!.request as RegularFacetRequest;
      const selectedValues = parameterFacets[id] || [];
      const activeValueCount = selectedValues.length;
      const idleValues = request.values.filter(
        (facetValue) =>
          !selectedValues.includes(facetValue.value)
      );

      request.values = [
        ...selectedValues.map(buildSelectedFacetValueRequest),
        ...idleValues.map(restoreFacetValueToIdleState),
      ] as FacetValueRequest[];
      request.preventAutoSelect = activeValueCount > 0;
      request.numberOfValues = Math.max(
        activeValueCount,
        request.numberOfValues
      );
    });
}

function restoreRangeFacets<T extends (NumericFacetRequest | DateFacetRequest)>(state: CommerceFacetSetState, parameterFacets: Record<string, T['values']>, type: 'dateRange' | 'numericalRange') {
  const numericFacetIds = Object.keys(state)
    .filter((id) => state[id]?.request.type === type);

  type Range = T['values'][number];
  numericFacetIds.forEach((id) => {
    const request = state[id]!.request as T;
    const rangesToSelect = parameterFacets[id] || [];

    request.values.forEach((range) => {
      const found = !!findRange<Range>(rangesToSelect, range);
      range.state = found ? 'selected' : 'idle';
      return range;
    });

    const missingRanges = rangesToSelect.filter(
      (range) => !findRange<Range>(request.values, range)
    );
    const currentValues = request.values as Range[];
    currentValues.push(...missingRanges);

    request.numberOfValues = Math.max(
      request.numberOfValues,
      currentValues.length
    );
  });
}

function restoreCategoryFacets(state: CommerceFacetSetState, parameterFacets: Record<string, string[]>) {
  Object.keys(state).forEach((id) => {
    const request = state[id]!.request as CategoryFacetRequest;
    const path = parameterFacets[id] || [];
    if (path.length || request.values.length) {
      selectPath(request, path, state[id]!.request.initialNumberOfValues);
    }
  });
}

export function buildSelectedFacetValueRequest(rawValue: string) {
  return {state: 'selected', value: rawValue};
}

export function restoreFacetValueToIdleState(
  facetValue: AnyFacetValueRequest
): AnyFacetValueRequest {
  return {...facetValue, state: 'idle'};
}

function findRange<T extends (NumericRangeRequest | DateRangeRequest)>(values: T[], value: T) {
  const {start, end} = value;
  return values.find((range) => range.start === start && range.end === end);
}

export function selectPath(
  request: CategoryFacetRequest,
  path: string[],
  initialNumberOfValues: number
) {
  request.values = buildCurrentValuesFromPath(path, initialNumberOfValues);
  request.numberOfValues = path.length ? 1 : initialNumberOfValues;
  request.preventAutoSelect = true;
}

export function buildCurrentValuesFromPath(path: string[], retrieveCount: number) {
  if (!path.length) {
    return [];
  }

  const root = buildCategoryFacetValueRequest(path[0], retrieveCount);
  let curr = root;

  for (const segment of path.splice(1)) {
    const next = buildCategoryFacetValueRequest(segment, retrieveCount);
    curr.children.push(next);
    curr = next;
  }

  curr.state = 'selected';

  return [root];
}

export function buildCategoryFacetValueRequest(
  value: string,
  retrieveCount: number
): CategoryFacetValueRequest {
  return {
    children: [],
    state: 'idle',
    value,
    retrieveCount,
  };
}