import type {FacetValueState} from '../../../facets/facet-api/value.js';
import type {FacetValueRequest} from '../../../facets/facet-set/interfaces/request.js';
import type {DateRangeRequest} from '../../../facets/range-facets/date-facet-set/interfaces/request.js';
import type {NumericRangeRequest} from '../../../facets/range-facets/numeric-facet-set/interfaces/request.js';
import type {Parameters} from '../../parameters/parameters-actions.js';
import type {CommerceFacetSetState} from './facet-set-state.js';
import type {
  CategoryFacetRequest,
  CategoryFacetValueRequest,
  DateFacetRequest,
  LocationFacetValueRequest,
  NumericFacetRequest,
} from './interfaces/request.js';

export function restoreFromParameters(
  state: CommerceFacetSetState,
  action: {payload: Parameters}
) {
  for (const facetId of Object.keys(state)) {
    delete state[facetId];
  }

  if (action.payload.f) {
    restoreFacets(state, action.payload.f, 'regular');
  }
  if (action.payload.lf) {
    restoreFacets(state, action.payload.lf, 'location');
  }
  if (action.payload.nf) {
    restoreRangeFacets(state, action.payload.nf, 'numericalRange');
  }
  if (action.payload.mnf) {
    restoreManualRangeFacets(state, action.payload.mnf);
  }
  if (action.payload.df) {
    restoreRangeFacets(state, action.payload.df, 'dateRange');
  }
  if (action.payload.cf) {
    restoreCategoryFacets(state, action.payload.cf);
  }
}

function restoreFacets(
  state: CommerceFacetSetState,
  parameterFacets: Record<string, string[]>,
  type: 'regular' | 'location'
) {
  const entries = Object.entries(parameterFacets);
  for (const [facetId, values] of entries) {
    state[facetId] = {
      request: {
        ...restoreFacet(facetId),
        type,
        values: values.map((value) => {
          const facetValue = {
            ...restoreFacetValue(),
            value,
          };
          switch (type) {
            case 'regular':
              return facetValue as FacetValueRequest;
            case 'location':
              return facetValue as LocationFacetValueRequest;
          }
        }),
      },
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

function restoreManualRangeFacets<T extends NumericFacetRequest>(
  state: CommerceFacetSetState,
  parameterFacets: Record<string, T['values']>
) {
  const entries = Object.entries(parameterFacets);
  for (const [facetId, values] of entries) {
    state[facetId] = {
      request: {
        ...restoreFacet(facetId),
        type: 'numericalRange',
        interval: 'continuous',
        values: values.map(
          (value) =>
            ({
              start: value.start,
              end: value.end,
              endInclusive: value.endInclusive,
              ...restoreFacetValue(),
            }) as NumericRangeRequest
        ),
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
        // In the CAPI, the default retrieveCount is 5, while the default
        // numberOfValues is 8. We explicitly set retrieveCount to 8 when
        // restoring category facets to ensure a consistent show more / show
        // less behavior, given that the retrieveCount is not returned in the
        // API response.
        retrieveCount: 8,
      } as CategoryFacetRequest,
    };
    selectPath(state[facetId].request as CategoryFacetRequest, path);
  }
}

function restoreFacet(facetId: string) {
  // eslint-disable-next-line @cspell/spellchecker
  // TODO CAPI-966: Only set facet field
  return {
    facetId,
    field: facetId,
    isFieldExpanded: false,
    preventAutoSelect: false,
  };
}

function restoreFacetValue() {
  // eslint-disable-next-line @cspell/spellchecker
  // TODO CAPI-966: Only set facet value state
  return {
    state: 'selected' as FacetValueState,
    isAutoSelected: false,
    isSuggested: false,
    moreValuesAvailable: true,
  };
}

export function buildSelectedFacetValueRequest(rawValue: string) {
  return {state: 'selected', value: rawValue};
}

export function selectPath(
  request: CategoryFacetRequest,
  path: string[],
  initialNumberOfValues?: number
) {
  request.values = buildCurrentValuesFromPath(path);
  request.numberOfValues = initialNumberOfValues;
  request.preventAutoSelect = true;
}

function buildCurrentValuesFromPath(path: string[]) {
  if (!path.length) {
    return [];
  }

  const root = buildCategoryFacetValueRequest(path[0]);
  let curr = root;

  const [_first, ...rest] = path;
  for (const segment of rest) {
    const next = buildCategoryFacetValueRequest(segment);
    curr.children.push(next);
    curr = next;
  }

  curr.state = 'selected';

  return [root];
}

export function buildCategoryFacetValueRequest(
  value: string
): CategoryFacetValueRequest {
  return {
    children: [],
    state: 'idle',
    value,
  };
}
