import {type Draft as WritableDraft} from '@reduxjs/toolkit';
import {createReducer, FacetValueRequest} from '../../../../ssr.index';
import {
  toggleExcludeFacetValue,
  toggleSelectFacetValue,
  updateFacetIsFieldExpanded,
  updateFacetNumberOfValues,
} from '../../../facets/facet-set/facet-set-actions';
import {convertFacetValueToRequest} from '../../../facets/facet-set/facet-set-slice';
import {fetchProductListing} from '../../product-listing/product-listing-actions';
import {
  CommerceFacetSetState,
  getCommerceFacetSetInitialState,
} from './facet-set-state';
import {CommerceFacetRequest} from './interfaces/request';
import {AnyFacetResponse, FacetResponse} from './interfaces/response';

export const commerceFacetSetReducer = createReducer(
  getCommerceFacetSetInitialState(),

  (builder) => {
    builder
      .addCase(fetchProductListing.fulfilled, (state, action) => {
        const facets = action.payload.response.facets;
        facets.forEach((facetResponse) =>
          updateStateFromFacetResponse(
            state,
            facetResponse.facetId ?? facetResponse.field,
            facetResponse
          )
        );
      })
      .addCase(toggleSelectFacetValue, (state, action) => {
        const {facetId, selection} = action.payload;
        const facetRequest = state[facetId]?.request;

        if (!facetRequest) {
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
        const isSelected = existingValue.state === 'selected';
        existingValue.state = isSelected ? 'idle' : 'selected';
        facetRequest.freezeCurrentValues = true;
      })
      .addCase(toggleExcludeFacetValue, (state, action) => {
        const {facetId, selection} = action.payload;
        const facetRequest = state[facetId]?.request;

        if (!facetRequest) {
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

        const isExcluded = existingValue.state === 'excluded';
        existingValue.state = isExcluded ? 'idle' : 'excluded';
        facetRequest.freezeCurrentValues = true;
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
      });
  }
);

function updateStateFromFacetResponse(
  state: WritableDraft<CommerceFacetSetState>,
  facetId: string,
  facetResponse: AnyFacetResponse
) {
  let facetRequest = state[facetId]?.request;
  if (!facetRequest) {
    state[facetId] = {request: {} as CommerceFacetRequest};
    facetRequest = state[facetId].request;
  }

  facetRequest.facetId = facetId;
  facetRequest.numberOfValues = facetResponse.values.length;
  facetRequest.field = facetResponse.field;
  facetRequest.type = facetResponse.type;
  facetRequest.values = (facetResponse as FacetResponse).values.map(
    convertFacetValueToRequest
  );
  facetRequest.freezeCurrentValues = false;
  facetRequest.preventAutoSelect = false;
}

function insertNewValue(
  facetRequest: CommerceFacetRequest,
  facetValue: FacetValueRequest
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
