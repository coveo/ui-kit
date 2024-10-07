import {FacetValueState} from '../../../facets/facet-api/value.js';
import {DateRangeRequest} from '../../../facets/range-facets/date-facet-set/interfaces/request.js';
import {NumericRangeRequest} from '../../../facets/range-facets/numeric-facet-set/interfaces/request.js';
import {Parameters} from '../../parameters/parameters-actions.js';
import {CommerceFacetSetState} from './facet-set-state.js';
import {
  CategoryFacetRequest,
  CategoryFacetValueRequest,
  DateFacetRequest,
  NumericFacetRequest,
  RegularFacetRequest,
} from './interfaces/request.js';
import {RegularFacetValue} from './interfaces/response.js';

export function restoreFromParameters(
  state: CommerceFacetSetState,
  action: {payload: Parameters}
) {
  for (const facetId of Object.keys(state)) {
    delete state[facetId];
  }

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

function restoreRegularFacets(
  state: CommerceFacetSetState,
  parameterFacets: Record<string, string[]>
) {
  const entries = Object.entries(parameterFacets);
  for (const [facetId, values] of entries) {
    state[facetId] = {
      request: {
        ...restoreFacet(facetId),
        type: 'regular',
        values: values.map((value): RegularFacetValue => {
          return {
            ...restoreFacetValue(),
            value,
          };
        }),
      } as RegularFacetRequest,
    };
  }
}

function restoreRangeFacets<T extends NumericFacetRequest | DateFacetRequest>(
  state: CommerceFacetSetState,
  parameterFacets: Record<string, T['values']>,
  type: 'dateRange' | 'numericalRange'
) {
  const entries = Object.entries(parameterFacets);
  for (const [facetId, values] of entries) {
    state[facetId] = {
      request: {
        ...restoreFacet(facetId),
        type,
        values: values.map((value) => {
          const rangeValue = {
            start: value.start,
            end: value.end,
            endInclusive: value.endInclusive,
            ...restoreFacetValue(),
          };
          switch (type) {
            case 'dateRange':
              return rangeValue as DateRangeRequest;
            case 'numericalRange':
              return rangeValue as NumericRangeRequest;
          }
        }),
      },
    };
  }
}

function restoreCategoryFacets(
  state: CommerceFacetSetState,
  parameterFacets: Record<string, string[]>
) {
  const entries = Object.entries(parameterFacets);
  for (const [facetId, path] of entries) {
    state[facetId] = {
      request: {
        ...restoreFacet(facetId),
        type: 'hierarchical',
        values: [],
        // eslint-disable-next-line @cspell/spellchecker
        // TODO CAPI-966: Remove delimitingCharacter
        delimitingCharacter: '|',
      } as CategoryFacetRequest,
    };
    selectPath(state[facetId].request as CategoryFacetRequest, path, 10);
  }
}

function restoreFacet(facetId: string) {
  // eslint-disable-next-line @cspell/spellchecker
  // TODO CAPI-966: Only set facet field
  return {
    facetId,
    field: facetId,
    numberOfValues: 10,
    isFieldExpanded: false,
    preventAutoSelect: false,
    initialNumberOfValues: 10,
  };
}

function restoreFacetValue() {
  // eslint-disable-next-line @cspell/spellchecker
  // TODO CAPI-966: Only set facet value state
  return {
    state: 'selected' as FacetValueState,
    isAutoSelected: false,
    isSuggested: false,
    numberOfResults: 10,
    moreValuesAvailable: true,
  };
}

export function buildSelectedFacetValueRequest(rawValue: string) {
  return {state: 'selected', value: rawValue};
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

export function buildCurrentValuesFromPath(
  path: string[],
  retrieveCount: number
) {
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
