import {type Draft as WritableDraft} from '@reduxjs/toolkit';
import {
  createReducer,
  FacetValueRequest,
  NumericRangeRequest,
} from '../../../../ssr.index';
import {
  toggleExcludeFacetValue,
  toggleSelectFacetValue,
  updateFacetIsFieldExpanded,
  updateFacetNumberOfValues,
} from '../../../facets/facet-set/facet-set-actions';
import {convertFacetValueToRequest} from '../../../facets/facet-set/facet-set-slice';
import {
  toggleExcludeNumericFacetValue,
  toggleSelectNumericFacetValue,
} from '../../../facets/range-facets/numeric-facet-set/numeric-facet-actions';
import {convertToRangeRequests} from '../../../facets/range-facets/numeric-facet-set/numeric-facet-set-slice';
import {fetchProductListing} from '../../product-listing/product-listing-actions';
import {
  CommerceFacetSetState,
  getCommerceFacetSetInitialState,
} from './facet-set-state';
import {CommerceFacetRequest} from './interfaces/request';
import {
  AnyFacetResponse,
  RegularFacetResponse,
  RegularFacetValue,
  NumericFacetResponse,
} from './interfaces/response';

export const commerceFacetSetReducer = createReducer(
  getCommerceFacetSetInitialState(),

  (builder) => {
    builder
      .addCase(fetchProductListing.fulfilled, (state, action) => {
        const existingFacets = new Set(Object.keys(state));
        const facets = action.payload.response.facets;
        for (const facetResponse of facets) {
          updateStateFromFacetResponse(state, facetResponse, existingFacets);
        }

        for (const facetId of existingFacets) {
          delete state[facetId];
        }
      })
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
        const isSelected = existingValue.state === 'selected';
        existingValue.state = isSelected ? 'idle' : 'selected';
      })
      .addCase(toggleSelectNumericFacetValue, (state, action) => {
        const {facetId, selection} = action.payload;
        const facetRequest = state[facetId]?.request;

        if (!facetRequest || facetRequest.type !== 'numericalRange') {
          return;
        }

        facetRequest.preventAutoSelect = true;

        const existingValue = (
          facetRequest.values as WritableDraft<NumericRangeRequest>[]
        ).find(
          (req) =>
            req.start === selection.start &&
            req.end === selection.end &&
            req.endInclusive === selection.endInclusive
        );
        if (!existingValue) {
          insertNewValue(facetRequest, selection);
          return;
        }
        const isSelected = existingValue.state === 'selected';
        existingValue.state = isSelected ? 'idle' : 'selected';
      })
      // TODO: toggleSelectDateFacetValue, toggleSelectCategoryFacetValue
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

        const isExcluded = existingValue.state === 'excluded';
        existingValue.state = isExcluded ? 'idle' : 'excluded';
      })
      .addCase(toggleExcludeNumericFacetValue, (state, action) => {
        const {facetId, selection} = action.payload;
        const facetRequest = state[facetId]?.request;

        if (!facetRequest || facetRequest.type !== 'numericalRange') {
          return;
        }

        facetRequest.preventAutoSelect = true;

        const existingValue = (
          facetRequest.values as WritableDraft<NumericRangeRequest>[]
        ).find(
          (req) =>
            req.start === selection.start &&
            req.end === selection.end &&
            req.endInclusive === selection.endInclusive
        );
        if (!existingValue) {
          insertNewValue(facetRequest, selection);
          return;
        }

        const isExcluded = existingValue.state === 'excluded';
        existingValue.state = isExcluded ? 'idle' : 'excluded';
      })
      // TODO: toggleExcludeDateFacetValue, toggleExcludeCategoryFacetValue
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
      });
  }
);

function updateStateFromFacetResponse(
  state: WritableDraft<CommerceFacetSetState>,
  facetResponse: AnyFacetResponse,
  facetsToRemove: Set<string>
) {
  const facetId = facetResponse.facetId ?? facetResponse.field;
  let facetRequest = state[facetId]?.request;
  if (!facetRequest) {
    state[facetId] = {request: {} as CommerceFacetRequest};
    facetRequest = state[facetId].request;
    facetRequest.initialNumberOfValues = facetResponse.values.length;
  } else {
    facetsToRemove.delete(facetId);
  }

  facetRequest.facetId = facetId;
  facetRequest.numberOfValues = facetResponse.values.length;
  facetRequest.field = facetResponse.field;
  facetRequest.type = facetResponse.type;
  switch (facetResponse.type) {
    case 'regular':
      facetRequest.values = (facetResponse as RegularFacetResponse).values.map(
        convertFacetValueToRequest
      );
      break;
    case 'numericalRange':
      facetRequest.values = convertToRangeRequests(
        (facetResponse as NumericFacetResponse).values
      );
      break;
    case 'dateRange':
      // TODO
      break;
    case 'hierarchical':
      // TODO
      break;
  }

  facetRequest.preventAutoSelect = false;
}

function insertNewValue(
  facetRequest: CommerceFacetRequest,
  facetValue: FacetValueRequest | NumericRangeRequest
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
      // TODO
      break;
    case 'hierarchical':
      // TODO
      break;
  }

  facetRequest.numberOfValues = facetRequest.values.length;
}
