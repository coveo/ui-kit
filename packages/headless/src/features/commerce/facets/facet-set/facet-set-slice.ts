import {
  AnyAction,
  createReducer,
  type Draft as WritableDraft,
} from '@reduxjs/toolkit';
import {
  DateRangeRequest,
  FacetValueRequest,
  NumericRangeRequest,
} from '../../../../controllers/commerce/core/facets/headless-core-commerce-facet';
import {deselectAllBreadcrumbs} from '../../../breadcrumb/breadcrumb-actions';
import {
  deselectAllFacetValues,
  toggleExcludeFacetValue,
  toggleSelectFacetValue,
  updateFacetIsFieldExpanded,
  updateFacetNumberOfValues,
} from '../../../facets/facet-set/facet-set-actions';
import {convertFacetValueToRequest} from '../../../facets/facet-set/facet-set-slice';
import {updateFacetAutoSelection} from '../../../facets/generic/facet-actions';
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
import {toggleSelectCommerceCategoryFacetValue} from './facet-set-actions';
import {
  CommerceFacetSetState,
  getCommerceFacetSetInitialState,
} from './facet-set-state';
import {
  CommerceCategoryFacetValueRequest,
  CommerceFacetRequest,
} from './interfaces/request';
import {
  AnyFacetResponse,
  CommerceCategoryFacetValue,
  RegularFacetValue,
} from './interfaces/response';

export const commerceFacetSetReducer = createReducer(
  getCommerceFacetSetInitialState(),

  (builder) => {
    builder
      .addCase(fetchProductListing.fulfilled, handleQueryFulfilled)
      .addCase(executeSearch.fulfilled, handleQueryFulfilled)
      .addCase(toggleSelectFacetValue, (state, action) => {
        const {facetId, selection} = action.payload;
        const facetRequest = state[facetId]?.request;

        if (!facetRequest || facetRequest.type !== 'regular') {
          return;
        }

        facetRequest.preventAutoSelect = true;

        const existingValue = (
          facetRequest.values as WritableDraft<FacetValueRequest>[]
        ).find((req) => req.value === selection.value);
        if (!existingValue) {
          insertNewValue(facetRequest, selection);
          return;
        }

        updateExistingFacetValueState(existingValue, 'select');
      })
      .addCase(toggleSelectNumericFacetValue, (state, action) => {
        const {facetId, selection} = action.payload;
        const facetRequest = state[facetId]?.request;

        if (!facetRequest || facetRequest.type !== 'numericalRange') {
          return;
        }

        facetRequest.preventAutoSelect = true;

        const existingValue = findExactRangeValue(
          facetRequest.values as NumericRangeRequest[],
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

        if (!facetRequest || facetRequest.type !== 'dateRange') {
          return;
        }

        facetRequest.preventAutoSelect = true;

        const existingValue = findExactRangeValue(
          facetRequest.values as DateRangeRequest[],
          selection
        );
        if (!existingValue) {
          insertNewValue(facetRequest, selection);
          return;
        }
        updateExistingFacetValueState(existingValue, 'select');
      })
      .addCase(toggleSelectCommerceCategoryFacetValue, (state, action) => {
        const {facetId, selection} = action.payload;
        const facetRequest = state[facetId]?.request;

        if (!facetRequest || facetRequest.type !== 'hierarchical') {
          return;
        }

        facetRequest.preventAutoSelect = true;

        const {path} = selection;
        const pathToSelection = path.slice(0, path.length - 1);
        const parentValueRequest = ensurePathAndReturnParentValueRequest(
          facetRequest,
          pathToSelection
        );

        if (!parentValueRequest) {
          const rootValueRequests =
            facetRequest.values as CommerceCategoryFacetValueRequest[];
          if (rootValueRequests.length) {
            toggleSelectCategoryFacetRootValue(rootValueRequests, selection);
            return;
          } else {
            const newParent = buildCategoryFacetValueRequest(selection.value);
            newParent.state = 'selected';
            facetRequest.values.push(newParent);
            return;
          }
        }

        if (selection.state === 'selected') {
          deselectChildCategoryFacetValue(parentValueRequest);
          return;
        }

        selectChildCategoryFacetValue(parentValueRequest, selection);
      })
      .addCase(toggleExcludeFacetValue, (state, action) => {
        const {facetId, selection} = action.payload;
        const facetRequest = state[facetId]?.request;

        if (!facetRequest || facetRequest.type !== 'regular') {
          return;
        }

        facetRequest.preventAutoSelect = true;

        const existingValue = (
          facetRequest.values as WritableDraft<FacetValueRequest>[]
        ).find((req) => req.value === selection.value);
        if (!existingValue) {
          insertNewValue(facetRequest, selection);
          return;
        }

        updateExistingFacetValueState(existingValue, 'exclude');
      })
      .addCase(toggleExcludeNumericFacetValue, (state, action) => {
        const {facetId, selection} = action.payload;
        const facetRequest = state[facetId]?.request;

        if (!facetRequest || facetRequest.type !== 'numericalRange') {
          return;
        }

        facetRequest.preventAutoSelect = true;

        const existingValue = findExactRangeValue(
          facetRequest.values as NumericRangeRequest[],
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

        if (!facetRequest || facetRequest.type !== 'dateRange') {
          return;
        }

        facetRequest.preventAutoSelect = true;

        const existingValue = findExactRangeValue(
          facetRequest.values as DateRangeRequest[],
          selection
        );
        if (!existingValue) {
          insertNewValue(facetRequest, selection);
          return;
        }

        updateExistingFacetValueState(existingValue, 'exclude');
      })
      .addCase(updateFacetNumberOfValues, (state, action) => {
        const {facetId, numberOfValues} = action.payload;

        if (!state[facetId]?.request) {
          return;
        }

        state[facetId].request.numberOfValues = numberOfValues;
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

function handleDeselectAllFacetValues(request: CommerceFacetRequest) {
  if (request.type === 'hierarchical') {
    request.numberOfValues = request.initialNumberOfValues;
    (request.values as CommerceCategoryFacetValueRequest[]).forEach((value) => {
      value.state = 'idle';
      value.children = [];
    });
    request.preventAutoSelect = true;
  } else {
    request.values.forEach((value) => (value.state = 'idle'));
  }
}

function ensurePathAndReturnParentValueRequest(
  request: CommerceFacetRequest,
  path: string[]
) {
  let children = request.values as CommerceCategoryFacetValueRequest[];
  let lastSelectedParent;

  for (const segment of path) {
    let parent = children[0] as CommerceCategoryFacetValueRequest;
    const missingParent = !parent;

    if (missingParent || segment !== parent.value) {
      parent = buildCategoryFacetValueRequest(segment);
      children.length = 0;
      children.push(parent);
    }

    parent.state = 'idle';
    children = parent.children;
    lastSelectedParent = parent;
  }

  return lastSelectedParent;
}

function toggleSelectCategoryFacetRootValue(
  rootValueRequests: CommerceCategoryFacetValueRequest[],
  selection: CommerceCategoryFacetValueRequest
): void {
  if (rootValueRequests.length === 0) {
    const newRootValueRequest = buildCategoryFacetValueRequest(selection.value);
    newRootValueRequest.state = selection.state;
    rootValueRequests.push(newRootValueRequest);
    return;
  }

  for (const rootValueRequest of rootValueRequests) {
    rootValueRequest.children = [];
    rootValueRequest.state =
      rootValueRequest.value === selection.value && selection.state === 'idle'
        ? 'selected'
        : 'idle';
  }
}

function deselectChildCategoryFacetValue(
  parentValueRequest: CommerceCategoryFacetValueRequest
): void {
  parentValueRequest.state = 'selected';
  parentValueRequest.children = [];
}

function selectChildCategoryFacetValue(
  parentValueRequest: CommerceCategoryFacetValueRequest,
  selection: CommerceCategoryFacetValueRequest
): void {
  parentValueRequest.state = 'idle';
  const newParent = buildCategoryFacetValueRequest(selection.value);
  newParent.state = 'selected';
  parentValueRequest.children.length = 0;
  parentValueRequest.children.push(newParent);
}

function buildCategoryFacetValueRequest(
  value: string
): CommerceCategoryFacetValueRequest {
  return {
    children: [],
    state: 'idle',
    value,
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
  console.log(`update ${facetId} from response...`);

  let facetRequest = state[facetId]?.request;
  if (!facetRequest) {
    state[facetId] = {request: {} as CommerceFacetRequest};
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

  console.log(facetRequest.values);
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
    default:
      return;
  }
}

export function convertCategoryFacetValueToRequest(
  responseValue: CommerceCategoryFacetValue
): CommerceCategoryFacetValueRequest {
  const {children, state, value} = responseValue;
  return {
    children,
    state,
    value,
  };
}

function insertNewValue(
  facetRequest: CommerceFacetRequest,
  facetValue:
    | FacetValueRequest
    | NumericRangeRequest
    | DateRangeRequest
    | CommerceCategoryFacetValueRequest
) {
  const {type, values} = facetRequest;
  const firstIdleIndex = values.findIndex((v) => v.state === 'idle');
  const indexToInsertAt =
    firstIdleIndex === -1 ? values.length : firstIdleIndex;

  const valuesBefore = values.slice(0, indexToInsertAt);
  const valuesAfter = values.slice(indexToInsertAt + 1);

  switch (type) {
    case 'regular':
      facetRequest.values = [
        ...(valuesBefore as FacetValueRequest[]),
        facetValue as FacetValueRequest,
        ...(valuesAfter as RegularFacetValue[]),
      ];
      break;
    case 'numericalRange':
      facetRequest.values = [
        ...(valuesBefore as NumericRangeRequest[]),
        facetValue as NumericRangeRequest,
        ...(valuesAfter as NumericRangeRequest[]),
      ];
      break;
    case 'dateRange':
      facetRequest.values = [
        ...(valuesBefore as DateRangeRequest[]),
        facetValue as DateRangeRequest,
        ...(valuesAfter as DateRangeRequest[]),
      ];
      break;
    case 'hierarchical':
      facetRequest.values = [
        ...(valuesBefore as CommerceCategoryFacetValueRequest[]),
        facetValue as CommerceCategoryFacetValueRequest,
        ...(valuesAfter as CommerceCategoryFacetValueRequest[]),
      ];
      break;
    default:
      break;
  }

  facetRequest.numberOfValues = facetRequest.values.length;
}

function resetAllFacetValues(state: CommerceFacetSetState) {
  Object.values(state).forEach((facet) => {
    facet.request.values.forEach((value) => (value.state = 'idle'));
  });
}
