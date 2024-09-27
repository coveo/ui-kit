import {createReducer, type Draft as WritableDraft} from '@reduxjs/toolkit';
import {
  CategoryFacetValueRequest,
  DateRangeRequest,
  FacetValueRequest,
  NumericRangeRequest,
} from '../../../../controllers/commerce/core/facets/headless-core-commerce-facet.js';
import {defaultNumberOfValuesIncrement} from '../../../facets/category-facet-set/category-facet-set-actions.js';
import {selectCategoryFacetSearchResult} from '../../../facets/facet-search-set/category/category-facet-search-actions.js';
import {
  excludeFacetSearchResult,
  selectFacetSearchResult,
} from '../../../facets/facet-search-set/specific/specific-facet-search-actions.js';
import {convertFacetValueToRequest} from '../../../facets/facet-set/facet-set-slice.js';
import {handleFacetUpdateNumberOfValues} from '../../../facets/generic/facet-reducer-helpers.js';
import {convertToDateRangeRequests} from '../../../facets/range-facets/date-facet-set/date-facet-set-slice.js';
import {findExactRangeValue} from '../../../facets/range-facets/generic/range-facet-reducers.js';
import {convertToNumericRangeRequests} from '../../../facets/range-facets/numeric-facet-set/numeric-facet-set-slice.js';
import {setContext, setView} from '../../context/context-actions.js';
import {restoreProductListingParameters} from '../../product-listing-parameters/product-listing-parameters-actions.js';
import {fetchProductListing} from '../../product-listing/product-listing-actions.js';
import {fetchQuerySuggestions} from '../../query-suggest/query-suggest-actions.js';
import {restoreSearchParameters} from '../../search-parameters/search-parameters-actions.js';
import {executeSearch} from '../../search/search-actions.js';
import '../category-facet/category-facet-actions.js';
import {
  toggleSelectCategoryFacetValue,
  updateCategoryFacetNumberOfValues,
} from '../category-facet/category-facet-actions.js';
import {
  deselectAllValuesInCoreFacet,
  updateCoreFacetFreezeCurrentValues,
  updateCoreFacetIsFieldExpanded,
  updateCoreFacetNumberOfValues,
  updateAutoSelectionForAllCoreFacets,
  clearAllCoreFacets,
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
import {handleCategoryFacetNestedNumberOfValuesUpdate} from './facet-set-reducer-helpers.js';
import {
  buildCategoryFacetValueRequest,
  buildSelectedFacetValueRequest,
  restoreFromParameters,
  selectPath,
} from './facet-set-reducers.js';
import {
  CommerceFacetSetState,
  getCommerceFacetSetInitialState,
} from './facet-set-state.js';
import {
  AnyFacetRequest,
  AnyFacetValueRequest,
  RegularFacetRequest,
  NumericFacetRequest,
  DateFacetRequest,
  CategoryFacetRequest,
} from './interfaces/request.js';
import {CategoryFacetValue} from './interfaces/response.js';
import {AnyFacetResponse} from './interfaces/response.js';

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
        const {facetId, selection, retrieveCount} = action.payload;
        const request = state[facetId]?.request;

        if (!request || !ensureCategoryFacetRequest(request)) {
          return;
        }

        const {path} = selection;
        const pathToSelection = path.slice(0, path.length - 1);
        const children = ensurePathAndReturnChildren(
          request,
          pathToSelection,
          retrieveCount
        );

        if (children.length) {
          const lastSelectedParent = children[0];

          lastSelectedParent.state = 'selected';
          lastSelectedParent.children = [];
          return;
        }

        const newParent = buildCategoryFacetValueRequest(
          selection.value,
          retrieveCount
        );
        newParent.state = 'selected';
        children.push(newParent);
        request.numberOfValues = 1;
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
      })
      .addCase(updateCategoryFacetNumberOfValues, (state, action) => {
        const {facetId, numberOfValues} = action.payload;
        const request = state[facetId]?.request;
        if (!request) {
          return;
        }
        if (!request.values.length) {
          return handleFacetUpdateNumberOfValues<AnyFacetRequest>(
            request,
            numberOfValues
          );
        }
        handleCategoryFacetNestedNumberOfValuesUpdate(state, action.payload);
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
          (v) =>
            (v as FacetValueRequest | CategoryFacetValueRequest).value ===
            rawValue
        );

        if (!existingValue) {
          insertNewValue(facetRequest, {state: 'excluded', value: rawValue});
          return;
        }

        updateExistingFacetValueState(existingValue, 'exclude');
      })
      .addCase(selectCategoryFacetSearchResult, (state, action) => {
        const {facetId, value} = action.payload;
        const facetRequest = state[facetId];

        if (
          !facetRequest ||
          !ensureCategoryFacetRequest(facetRequest?.request)
        ) {
          return;
        }

        const path = [...value.path, value.rawValue];
        selectPath(
          facetRequest.request,
          path,
          facetRequest.request.initialNumberOfValues
        );
      })
      .addCase(updateNumericFacetValues, (state, action) => {
        const {facetId, values} = action.payload;
        const request = state[facetId]?.request;

        if (!request || !ensureNumericFacetRequest(request)) {
          return;
        }

        // TODO: KIT-3226 No need for this function if the values in the payload already contains appropriate parameters
        request.values = convertToNumericRangeRequests(values);
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
  facetRequest: AnyFacetRequest
): facetRequest is CategoryFacetRequest {
  return facetRequest.type === 'hierarchical';
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
  if (request.type === 'hierarchical') {
    request.numberOfValues = request.initialNumberOfValues;
    request.values = [];
    request.preventAutoSelect = true;
  } else {
    request.values.forEach((value) => (value.state = 'idle'));
  }
}

function ensurePathAndReturnChildren(
  request: CategoryFacetRequest,
  path: string[],
  retrieveCount: number
) {
  let children = request.values;

  for (const segment of path) {
    let parent = children[0];
    const missingParent = !parent;

    if (missingParent || segment !== parent.value) {
      parent = buildCategoryFacetValueRequest(segment, retrieveCount);
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
    FacetValueRequest | NumericRangeRequest | DateRangeRequest
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
    facetRequest.initialNumberOfValues = facetResponse.numberOfValues;
  } else {
    facetsToRemove.delete(facetId);
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
      return facetResponse.values.every(
        (f) => f.state === 'idle' && f.children.length === 0
      )
        ? []
        : facetResponse.values.map(convertCategoryFacetValueToRequest);
    case 'regular':
      return facetResponse.values.map(convertFacetValueToRequest);
    default:
      return;
  }
}

export function convertCategoryFacetValueToRequest(
  responseValue: CategoryFacetValue
): CategoryFacetValueRequest {
  const children = responseValue.children.every(
    (c) => c.state === 'idle' && c.children.length === 0
  )
    ? []
    : responseValue.children.map(convertCategoryFacetValueToRequest);
  const {state, value} = responseValue;
  return {
    children,
    state,
    value,
    retrieveCount: defaultNumberOfValuesIncrement,
  };
}

function insertNewValue(
  facetRequest: AnyFacetRequest,
  facetValue: AnyFacetValueRequest
) {
  const {values} = facetRequest;
  const firstIdleIndex = values.findIndex((v) => v.state === 'idle');
  const indexToInsertAt =
    firstIdleIndex === -1 ? values.length : firstIdleIndex;

  const valuesBefore = values.slice(0, indexToInsertAt);
  const valuesAfter = values.slice(indexToInsertAt + 1);

  facetRequest.values = [...valuesBefore, facetValue, ...valuesAfter];

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
