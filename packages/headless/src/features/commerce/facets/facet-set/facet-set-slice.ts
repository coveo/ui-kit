import {
  AnyAction,
  createReducer,
  type Draft as WritableDraft,
} from '@reduxjs/toolkit';
import {
  CategoryFacetValueRequest,
  DateRangeRequest,
  FacetValueRequest,
  NumericRangeRequest,
} from '../../../../controllers/commerce/core/facets/headless-core-commerce-facet';
import {deselectAllBreadcrumbs} from '../../../breadcrumb/breadcrumb-actions';
import {
  toggleSelectCategoryFacetValue,
  updateCategoryFacetNumberOfValues,
} from '../../../facets/category-facet-set/category-facet-set-actions';
import {
  excludeFacetSearchResult,
  selectFacetSearchResult,
} from '../../../facets/facet-search-set/specific/specific-facet-search-actions';
import {
  deselectAllFacetValues,
  toggleExcludeFacetValue,
  toggleSelectFacetValue,
  updateFacetIsFieldExpanded,
  updateFacetNumberOfValues,
} from '../../../facets/facet-set/facet-set-actions';
import {convertFacetValueToRequest} from '../../../facets/facet-set/facet-set-slice';
import {updateFacetAutoSelection} from '../../../facets/generic/facet-actions';
import {handleFacetUpdateNumberOfValues} from '../../../facets/generic/facet-reducer-helpers';
import {
  toggleExcludeDateFacetValue,
  toggleSelectDateFacetValue,
} from '../../../facets/range-facets/date-facet-set/date-facet-actions';
import {convertToDateRangeRequests} from '../../../facets/range-facets/date-facet-set/date-facet-set-slice';
import {findExactRangeValue} from '../../../facets/range-facets/generic/range-facet-reducers';
import {
  toggleExcludeNumericFacetValue,
  toggleSelectNumericFacetValue,
} from '../../../facets/range-facets/numeric-facet-set/numeric-facet-actions';
import {convertToNumericRangeRequests} from '../../../facets/range-facets/numeric-facet-set/numeric-facet-set-slice';
import {setContext, setUser, setView} from '../../context/context-actions';
import {fetchProductListing} from '../../product-listing/product-listing-actions';
import {executeSearch} from '../../search/search-actions';
import {handleCategoryFacetNestedNumberOfValuesUpdate} from './facet-set-reducer-helpers';
import {
  CommerceFacetSetState,
  getCommerceFacetSetInitialState,
} from './facet-set-state';
import {
  AnyFacetRequest,
  CommerceFacetRequest,
  AnyFacetValueRequest,
} from './interfaces/request';
import {CategoryFacetValue} from './interfaces/response';
import {AnyFacetResponse} from './interfaces/response';

export const commerceFacetSetReducer = createReducer(
  getCommerceFacetSetInitialState(),

  (builder) => {
    builder
      .addCase(fetchProductListing.fulfilled, handleQueryFulfilled)
      .addCase(executeSearch.fulfilled, handleQueryFulfilled)
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

        if (
          !facetRequest ||
          (facetRequest.type !== 'regular' &&
            facetRequest.type !== 'hierarchical')
        ) {
          return;
        }

        const {rawValue} = value;

        facetRequest.preventAutoSelect = true;

        const existingValue = facetRequest.values.find(
          (v) =>
            (v as FacetValueRequest | CategoryFacetValueRequest).value ===
            rawValue
        );

        if (!existingValue) {
          insertNewValue(facetRequest, {state: 'selected', value: rawValue});
          return;
        }

        updateExistingFacetValueState(existingValue, 'select');
      })
      .addCase(excludeFacetSearchResult, (state, action) => {
        const {facetId, value} = action.payload;
        const facetRequest = state[facetId]?.request;

        if (
          !facetRequest ||
          (facetRequest.type !== 'regular' &&
            facetRequest.type !== 'hierarchical')
        ) {
          return;
        }

        const {rawValue} = value;

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
      .addCase(updateFacetNumberOfValues, (state, action) => {
        const {facetId, numberOfValues} = action.payload;
        const facetRequest = state[facetId]?.request;

        if (!facetRequest) {
          return;
        }

        facetRequest.numberOfValues = numberOfValues;
      })
      .addCase(updateFacetIsFieldExpanded, (state, action) => {
        const {facetId, isFieldExpanded} = action.payload;
        const facetRequest = state[facetId]?.request;

        if (!facetRequest) {
          return;
        }

        facetRequest.isFieldExpanded = isFieldExpanded;
      })
      .addCase(updateFacetAutoSelection, (state, action) =>
        Object.values(state).forEach((slice) => {
          slice.request.preventAutoSelect = !action.payload.allow;
        })
      )
      .addCase(deselectAllFacetValues, (state, action) => {
        const facetId = action.payload;
        const request = state[facetId]?.request;

        if (!request) {
          return;
        }

        handleDeselectAllFacetValues(request);
      })
      .addCase(deselectAllBreadcrumbs, resetAllFacetValues)
      .addCase(setContext, resetAllFacetValues)
      .addCase(setView, resetAllFacetValues)
      .addCase(setUser, resetAllFacetValues);
  }
);

function ensureRegularFacetRequest(
  facetRequest: AnyFacetRequest
): facetRequest is CommerceFacetRequest<FacetValueRequest> {
  return facetRequest.type === 'regular';
}

function ensureNumericFacetRequest(
  facetRequest: AnyFacetRequest
): facetRequest is CommerceFacetRequest<NumericRangeRequest> {
  return facetRequest.type === 'numericalRange';
}

function ensureDateFacetRequest(
  facetRequest: AnyFacetRequest
): facetRequest is CommerceFacetRequest<DateRangeRequest> {
  return facetRequest.type === 'dateRange';
}

function ensureCategoryFacetRequest(
  facetRequest: AnyFacetRequest
): facetRequest is CommerceFacetRequest<CategoryFacetValueRequest> {
  return facetRequest.type === 'hierarchical';
}

function handleQueryFulfilled(
  state: WritableDraft<CommerceFacetSetState>,
  action: AnyAction
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
  request: CommerceFacetRequest<CategoryFacetValueRequest>,
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

function buildCategoryFacetValueRequest(
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
    facetRequest.initialNumberOfValues = facetResponse.values.length;
  } else {
    facetsToRemove.delete(facetId);
  }

  facetRequest.facetId = facetId;
  facetRequest.displayName = facetResponse.displayName;
  facetRequest.numberOfValues = facetResponse.values.length;
  facetRequest.field = facetResponse.field;
  facetRequest.type = facetResponse.type;
  facetRequest.values =
    getFacetRequestValuesFromFacetResponse(facetResponse) ?? [];
  facetRequest.preventAutoSelect = false;
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
    retrieveCount: 5,
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

function resetAllFacetValues(state: CommerceFacetSetState) {
  Object.values(state).forEach((facet) => {
    facet.request.values.forEach((value) => (value.state = 'idle'));
  });
}
