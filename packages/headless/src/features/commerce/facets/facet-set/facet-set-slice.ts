import {createReducer, type Draft as WritableDraft} from '@reduxjs/toolkit';
import type {
  CategoryFacetValueRequest,
  DateRangeRequest,
  FacetValueRequest,
  NumericRangeRequest,
} from '../../../../controllers/commerce/core/facets/headless-core-commerce-facet.js';
import {selectCategoryFacetSearchResult} from '../../../facets/facet-search-set/category/category-facet-search-actions.js';
import {
  excludeFacetSearchResult,
  selectFacetSearchResult,
} from '../../../facets/facet-search-set/specific/specific-facet-search-actions.js';
import {convertFacetValueToRequest} from '../../../facets/facet-set/facet-set-slice.js';
import {convertToDateRangeRequests} from '../../../facets/range-facets/date-facet-set/date-facet-set-slice.js';
import {findExactRangeValue} from '../../../facets/range-facets/generic/range-facet-reducers.js';
import {convertToNumericRangeRequests} from '../../../facets/range-facets/numeric-facet-set/numeric-facet-set-slice.js';
import {setContext, setView} from '../../context/context-actions.js';
import {fetchProductListing} from '../../product-listing/product-listing-actions.js';
import {restoreProductListingParameters} from '../../product-listing-parameters/product-listing-parameters-actions.js';
import {fetchQuerySuggestions} from '../../query-suggest/query-suggest-actions.js';
import {executeSearch} from '../../search/search-actions.js';
import {restoreSearchParameters} from '../../search-parameters/search-parameters-actions.js';
import {
  toggleSelectCategoryFacetValue,
  updateCategoryFacetNumberOfValues,
} from '../category-facet/category-facet-actions.js';
import {
  clearAllCoreFacets,
  deleteAllCoreFacets,
  deselectAllValuesInCoreFacet,
  updateAutoSelectionForAllCoreFacets,
  updateCoreFacetFreezeCurrentValues,
  updateCoreFacetIsFieldExpanded,
  updateCoreFacetNumberOfValues,
} from '../core-facet/core-facet-actions.js';
import {
  toggleExcludeDateFacetValue,
  toggleSelectDateFacetValue,
  updateDateFacetValues,
} from '../date-facet/date-facet-actions.js';
import {
  executeCommerceFieldSuggest,
  getFacetIdWithCommerceFieldSuggestionNamespace,
} from '../facet-search-set/commerce-facet-search-actions.js';
import {toggleSelectLocationFacetValue} from '../location-facet/location-facet-actions.js';
import {
  toggleExcludeNumericFacetValue,
  toggleSelectNumericFacetValue,
  updateManualNumericFacetRange,
  updateNumericFacetValues,
} from '../numeric-facet/numeric-facet-actions.js';
import {
  toggleExcludeFacetValue,
  toggleSelectFacetValue,
} from '../regular-facet/regular-facet-actions.js';
import {
  buildCategoryFacetValueRequest,
  buildSelectedFacetValueRequest,
  restoreFromParameters,
  selectPath,
} from './facet-set-reducers.js';
import {
  type CommerceFacetSetState,
  getCommerceFacetSetInitialState,
} from './facet-set-state.js';
import type {
  AnyFacetRequest,
  AnyFacetValueRequest,
  CategoryFacetRequest,
  DateFacetRequest,
  LocationFacetRequest,
  LocationFacetValueRequest,
  NumericFacetRequest,
  RegularFacetRequest,
} from './interfaces/request.js';
import type {
  AnyFacetResponse,
  CategoryFacetValue,
  LocationFacetValue,
} from './interfaces/response.js';

export const commerceFacetSetReducer = createReducer(
  getCommerceFacetSetInitialState(),

  (builder) => {
    builder
      .addCase(fetchProductListing.fulfilled, handleQueryFulfilled)
      .addCase(executeSearch.fulfilled, handleQueryFulfilled)
      .addCase(executeCommerceFieldSuggest.fulfilled, (state, action) =>
        handleFieldSuggestionsFulfilled(
          state,
          getFacetIdWithCommerceFieldSuggestionNamespace(action.payload.facetId)
        )
      )
      .addCase(fetchQuerySuggestions.fulfilled, (state, action) => {
        if (!action.payload.fieldSuggestionsFacets) {
          return;
        }

        for (const {facetId} of action.payload.fieldSuggestionsFacets) {
          handleFieldSuggestionsFulfilled(
            state,
            getFacetIdWithCommerceFieldSuggestionNamespace(facetId)
          );
        }
      })
      .addCase(toggleSelectFacetValue, (state, action) => {
        const {facetId, selection} = action.payload;
        const facetRequest = state[facetId]?.request;

        if (!facetRequest || !ensureRegularFacetRequest(facetRequest)) {
          return;
        }

        facetRequest.preventAutoSelect = true;

        const existingValue = facetRequest.values.find(
          (req) => req.value === selection.value
        );
        if (!existingValue) {
          insertNewValue(facetRequest, selection);
          return;
        }

        updateExistingFacetValueState(existingValue, 'select');
        facetRequest.freezeCurrentValues = true;
      })
      .addCase(toggleSelectLocationFacetValue, (state, action) => {
        const {facetId, selection} = action.payload;
        const facetRequest = state[facetId]?.request;

        if (!facetRequest || !ensureLocationFacetRequest(facetRequest)) {
          return;
        }

        const existingValue = facetRequest.values.find(
          (req) => req.value === selection.value
        );
        if (!existingValue) {
          insertNewValue(facetRequest, selection);
          return;
        }

        updateExistingFacetValueState(existingValue, 'select');
      })
      .addCase(toggleSelectNumericFacetValue, (state, action) => {
        const {facetId, selection} = action.payload;
        const facetRequest = state[facetId]?.request;

        if (!facetRequest || !ensureNumericFacetRequest(facetRequest)) {
          return;
        }

        facetRequest.preventAutoSelect = true;

        const existingValue = findExactRangeValue(
          facetRequest.values,
          selection
        );
        if (!existingValue) {
          insertNewValue(facetRequest, selection);
          return;
        }
        updateExistingFacetValueState(existingValue, 'select');
        facetRequest.numberOfValues = facetRequest.initialNumberOfValues;

        if (
          facetRequest.interval === 'continuous' &&
          existingValue.state === 'idle'
        ) {
          facetRequest.values = [];
          return;
        }
      })
      .addCase(toggleSelectDateFacetValue, (state, action) => {
        const {facetId, selection} = action.payload;
        const facetRequest = state[facetId]?.request;

        if (!facetRequest || !ensureDateFacetRequest(facetRequest)) {
          return;
        }

        facetRequest.preventAutoSelect = true;

        const existingValue = findExactRangeValue(
          facetRequest.values,
          selection
        );
        if (!existingValue) {
          insertNewValue(facetRequest, selection);
          return;
        }
        updateExistingFacetValueState(existingValue, 'select');
      })
      .addCase(toggleSelectCategoryFacetValue, (state, action) => {
        const {facetId, selection} = action.payload;
        const request = state[facetId]?.request;

        if (!ensureCategoryFacetRequest(request)) {
          return;
        }

        const {path} = selection;
        const pathToSelection = path.slice(0, path.length - 1);
        const children = ensurePathAndReturnChildren(request, pathToSelection);

        let selectedValue = children.find(
          (value) => value.value === selection.value
        );

        if (!selectedValue) {
          selectedValue = buildCategoryFacetValueRequest(selection.value);
          children.push(selectedValue);
        }

        selectedValue.state =
          selectedValue.state === 'idle' ? 'selected' : 'idle';

        if (selectedValue.state === 'selected') {
          request.numberOfValues = request.initialNumberOfValues;
          request.retrieveCount = request.initialNumberOfValues;
        }
      })
      .addCase(toggleExcludeFacetValue, (state, action) => {
        const {facetId, selection} = action.payload;
        const facetRequest = state[facetId]?.request;

        if (!facetRequest || !ensureRegularFacetRequest(facetRequest)) {
          return;
        }

        facetRequest.preventAutoSelect = true;

        const existingValue = facetRequest.values.find(
          (req) => req.value === selection.value
        );
        if (!existingValue) {
          insertNewValue(facetRequest, selection);
          return;
        }

        updateExistingFacetValueState(existingValue, 'exclude');
        facetRequest.freezeCurrentValues = true;
      })
      .addCase(toggleExcludeNumericFacetValue, (state, action) => {
        const {facetId, selection} = action.payload;
        const facetRequest = state[facetId]?.request;

        if (!facetRequest || !ensureNumericFacetRequest(facetRequest)) {
          return;
        }

        facetRequest.preventAutoSelect = true;

        const existingValue = findExactRangeValue(
          facetRequest.values,
          selection
        );
        if (!existingValue) {
          insertNewValue(facetRequest, selection);
          return;
        }

        updateExistingFacetValueState(existingValue, 'exclude');
        facetRequest.numberOfValues = facetRequest.initialNumberOfValues;

        if (
          facetRequest.interval === 'continuous' &&
          existingValue.state === 'idle'
        ) {
          facetRequest.values = [];
          return;
        }
      })
      .addCase(toggleExcludeDateFacetValue, (state, action) => {
        const {facetId, selection} = action.payload;
        const facetRequest = state[facetId]?.request;

        if (!facetRequest || !ensureDateFacetRequest(facetRequest)) {
          return;
        }

        facetRequest.preventAutoSelect = true;

        const existingValue = findExactRangeValue(
          facetRequest.values,
          selection
        );
        if (!existingValue) {
          insertNewValue(facetRequest, selection);
          return;
        }

        updateExistingFacetValueState(existingValue, 'exclude');
        facetRequest.numberOfValues = facetRequest.initialNumberOfValues;
      })
      .addCase(updateCategoryFacetNumberOfValues, (state, action) => {
        const {facetId, numberOfValues} = action.payload;
        const request = state[facetId]?.request;

        if (!ensureCategoryFacetRequest(request)) {
          return;
        }

        handleCategoryFacetUpdateNumberOfValues(request, numberOfValues);
      })
      .addCase(selectFacetSearchResult, (state, action) => {
        const {facetId, value} = action.payload;
        const facetRequest = state[facetId]?.request;

        if (!facetRequest || !ensureRegularFacetRequest(facetRequest)) {
          return;
        }

        const {rawValue} = value;

        facetRequest.freezeCurrentValues = true;
        facetRequest.preventAutoSelect = true;

        const existingValue = facetRequest.values.find(
          (v) => v.value === rawValue
        );

        if (!existingValue) {
          insertNewValue(
            facetRequest,
            buildSelectedFacetValueRequest(rawValue) as AnyFacetValueRequest
          );
          return;
        }

        updateExistingFacetValueState(existingValue, 'select');
      })
      .addCase(excludeFacetSearchResult, (state, action) => {
        const {facetId, value} = action.payload;
        const facetRequest = state[facetId]?.request;

        if (!facetRequest || !ensureRegularFacetRequest(facetRequest)) {
          return;
        }

        const {rawValue} = value;

        facetRequest.freezeCurrentValues = true;
        facetRequest.preventAutoSelect = true;

        const existingValue = facetRequest.values.find(
          (v) => v.value === rawValue
        );

        if (!existingValue) {
          insertNewValue(facetRequest, {state: 'excluded', value: rawValue});
          return;
        }

        updateExistingFacetValueState(existingValue, 'exclude');
      })
      .addCase(selectCategoryFacetSearchResult, (state, action) => {
        const {facetId, value} = action.payload;
        const request = state[facetId]?.request;

        if (!ensureCategoryFacetRequest(request)) {
          return;
        }

        const path = [...value.path, value.rawValue];
        selectPath(request, path, request.initialNumberOfValues);
      })
      .addCase(updateNumericFacetValues, (state, action) => {
        const {facetId, values} = action.payload;
        const request = state[facetId]?.request;

        if (!request || !ensureNumericFacetRequest(request)) {
          return;
        }

        request.values = values;
        request.numberOfValues = values.length;
      })
      .addCase(updateDateFacetValues, (state, action) => {
        const {facetId, values} = action.payload;
        const request = state[facetId]?.request;

        if (!request || !ensureDateFacetRequest(request)) {
          return;
        }

        request.values = convertToDateRangeRequests(values);
        request.numberOfValues = values.length;
      })
      .addCase(updateCoreFacetNumberOfValues, (state, action) => {
        const {facetId, numberOfValues} = action.payload;
        const facetRequest = state[facetId]?.request;

        if (!facetRequest) {
          return;
        }

        facetRequest.numberOfValues = numberOfValues;
      })
      .addCase(updateCoreFacetIsFieldExpanded, (state, action) => {
        const {facetId, isFieldExpanded} = action.payload;
        const facetRequest = state[facetId]?.request;

        if (!facetRequest) {
          return;
        }

        facetRequest.isFieldExpanded = isFieldExpanded;
      })
      .addCase(updateAutoSelectionForAllCoreFacets, (state, action) =>
        Object.values(state).forEach((slice) => {
          slice.request.preventAutoSelect = !action.payload.allow;
        })
      )
      .addCase(updateCoreFacetFreezeCurrentValues, (state, action) => {
        const {facetId, freezeCurrentValues} = action.payload;
        const facetRequest = state[facetId]?.request;

        if (!facetRequest) {
          return;
        }

        facetRequest.freezeCurrentValues = freezeCurrentValues;
      })
      .addCase(deselectAllValuesInCoreFacet, (state, action) => {
        const {facetId} = action.payload;
        const request = state[facetId]?.request;

        if (!request) {
          return;
        }

        handleDeselectAllFacetValues(request);
      })
      .addCase(updateManualNumericFacetRange, (state, action) => {
        const {facetId} = action.payload;
        const request = state[facetId]?.request;

        if (!request) {
          return;
        }

        handleDeselectAllFacetValues(request);
      })
      .addCase(clearAllCoreFacets, setAllFacetValuesToIdle)
      .addCase(deleteAllCoreFacets, clearAllFacetValues)
      .addCase(setContext, clearAllFacetValues)
      .addCase(setView, clearAllFacetValues)
      .addCase(restoreSearchParameters, restoreFromParameters)
      .addCase(restoreProductListingParameters, restoreFromParameters);
  }
);

function ensureRegularFacetRequest(
  facetRequest: AnyFacetRequest
): facetRequest is RegularFacetRequest {
  return facetRequest.type === 'regular';
}

function ensureLocationFacetRequest(
  facetRequest: AnyFacetRequest
): facetRequest is LocationFacetRequest {
  return facetRequest.type === 'location';
}

function ensureNumericFacetRequest(
  facetRequest: AnyFacetRequest
): facetRequest is NumericFacetRequest {
  return facetRequest.type === 'numericalRange';
}

function ensureDateFacetRequest(
  facetRequest: AnyFacetRequest
): facetRequest is DateFacetRequest {
  return facetRequest.type === 'dateRange';
}

function ensureCategoryFacetRequest(
  facetRequest?: AnyFacetRequest
): facetRequest is CategoryFacetRequest {
  return facetRequest?.type === 'hierarchical';
}

function handleQueryFulfilled(
  state: WritableDraft<CommerceFacetSetState>,
  action: ReturnType<
    typeof fetchProductListing.fulfilled | typeof executeSearch.fulfilled
  >
) {
  const existingFacets = new Set(Object.keys(state));
  const facets = action.payload.response.facets;
  for (const facetResponse of facets) {
    updateStateFromFacetResponse(state, facetResponse, existingFacets);
  }

  for (const facetId of existingFacets) {
    delete state[facetId];
  }
}

function handleFieldSuggestionsFulfilled(
  state: WritableDraft<CommerceFacetSetState>,
  facetId: string
) {
  let facetRequest = state[facetId]?.request;
  if (!facetRequest) {
    state[facetId] = {request: {} as AnyFacetRequest};
    facetRequest = state[facetId].request;
    facetRequest.initialNumberOfValues = 10;
    facetRequest.values = [];
  }
}

function handleDeselectAllFacetValues(request: AnyFacetRequest) {
  const resetValues = () => {
    request.values.forEach((value) => {
      value.state = 'idle';
    });
  };

  switch (request.type) {
    case 'hierarchical':
      request.initialNumberOfValues = undefined;
      request.numberOfValues = undefined;
      request.values = [];
      request.preventAutoSelect = true;
      break;

    case 'numericalRange':
      request.numberOfValues = request.initialNumberOfValues;
      resetValues();
      break;

    default:
      resetValues();
      break;
  }
}

/**
 * Traverses the request values and validates the path, building new values for
 * missing path segments if needed, then returns the children of the last
 * visited value.
 *
 * Used to navigate to a specific level in the category tree before manipulating
 * values.
 */
function ensurePathAndReturnChildren(
  request: CategoryFacetRequest,
  path: string[]
) {
  let children = request.values;

  for (const segment of path) {
    let parent = children[0];
    const missingParent = !parent;

    if (missingParent || segment !== parent.value) {
      parent = buildCategoryFacetValueRequest(segment);
      children.length = 0;
      children.push(parent);
    }

    parent.state = 'idle';
    children = parent.children;
  }

  return children;
}

function updateExistingFacetValueState(
  existingFacetValue: WritableDraft<
    | FacetValueRequest
    | LocationFacetValueRequest
    | NumericRangeRequest
    | DateRangeRequest
  >,
  toggleAction: 'select' | 'exclude'
) {
  switch (existingFacetValue.state) {
    case 'idle':
      existingFacetValue.state =
        toggleAction === 'exclude' ? 'excluded' : 'selected';
      break;
    case 'excluded':
      existingFacetValue.state =
        toggleAction === 'exclude' ? 'idle' : 'selected';
      break;
    case 'selected':
      existingFacetValue.state =
        toggleAction === 'exclude' ? 'excluded' : 'idle';
      break;
    default:
      break;
  }
}

function updateStateFromFacetResponse(
  state: WritableDraft<CommerceFacetSetState>,
  facetResponse: AnyFacetResponse,
  facetsToRemove: Set<string>
) {
  const facetId = facetResponse.facetId ?? facetResponse.field;

  let facetRequest = state[facetId]?.request;
  if (!facetRequest) {
    state[facetId] = {request: {} as AnyFacetRequest};
    facetRequest = state[facetId].request;
  } else {
    facetsToRemove.delete(facetId);
  }

  if (facetRequest.initialNumberOfValues === undefined) {
    facetRequest.initialNumberOfValues = facetResponse.numberOfValues;
  }

  facetRequest.facetId = facetId;
  facetRequest.displayName = facetResponse.displayName;
  facetRequest.numberOfValues = facetResponse.numberOfValues;
  facetRequest.field = facetResponse.field;
  facetRequest.type = facetResponse.type;
  facetRequest.values =
    getFacetRequestValuesFromFacetResponse(facetResponse) ?? [];
  facetRequest.freezeCurrentValues = false;
  facetRequest.preventAutoSelect = false;
  if (
    facetResponse.type === 'hierarchical' &&
    ensureCategoryFacetRequest(facetRequest)
  ) {
    facetRequest.delimitingCharacter = facetResponse.delimitingCharacter;
  } else if (facetResponse.type === 'numericalRange') {
    facetRequest.interval = facetResponse.interval;
    if (facetResponse.domain) {
      facetRequest.domain = {
        min: facetResponse.domain.min,
        max: facetResponse.domain.max,
        increment: facetResponse.domain.increment,
      };
    }
  }
}

function getFacetRequestValuesFromFacetResponse(
  facetResponse: AnyFacetResponse
) {
  switch (facetResponse.type) {
    case 'numericalRange':
      return convertToNumericRangeRequests(facetResponse.values);
    case 'dateRange':
      return convertToDateRangeRequests(facetResponse.values);
    case 'hierarchical':
      return facetResponse.values.map(convertCategoryFacetValueToRequest);
    case 'regular':
      return facetResponse.values.map(convertFacetValueToRequest);
    case 'location':
      return facetResponse.values.map(convertLocationFacetValueToRequest);
    default:
      return;
  }
}

export function convertCategoryFacetValueToRequest(
  responseValue: CategoryFacetValue
): CategoryFacetValueRequest {
  const children = responseValue.children.map(
    convertCategoryFacetValueToRequest
  );
  const {state, value} = responseValue;
  return {
    children,
    state,
    value,
  };
}

export function convertLocationFacetValueToRequest(
  facetValue: LocationFacetValue
): LocationFacetValueRequest {
  const {value, state} = facetValue;

  return {value, state};
}

function insertNewValue(
  facetRequest: AnyFacetRequest,
  facetValue: AnyFacetValueRequest
) {
  const {values} = facetRequest;
  const firstIdleIndex = values.findIndex((v) => v.state === 'idle');
  const indexToInsertAt =
    firstIdleIndex === -1 ? values.length : firstIdleIndex;

  facetRequest.values.splice(indexToInsertAt, 0, facetValue);

  if (firstIdleIndex > -1) {
    facetRequest.values.pop();
  }

  facetRequest.numberOfValues = facetRequest.values.length;
}

function setAllFacetValuesToIdle(state: CommerceFacetSetState) {
  Object.values(state).forEach((facet) =>
    handleDeselectAllFacetValues(facet.request)
  );
}

function clearAllFacetValues(state: CommerceFacetSetState) {
  Object.values(state).forEach((facet) => {
    facet.request.values = [];
  });
}

function handleCategoryFacetUpdateNumberOfValues(
  facetRequest: CategoryFacetRequest,
  numberOfValues: number
) {
  facetRequest.numberOfValues = numberOfValues;
  facetRequest.retrieveCount = numberOfValues;
}
