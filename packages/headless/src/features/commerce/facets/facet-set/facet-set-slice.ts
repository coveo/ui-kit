import {fetchProductListing} from '../../product-listing/product-listing-actions';
import {createReducer, FacetValueRequest} from '../../../../ssr.index';
import {getCommerceFacetSetInitialState} from './facet-set-state';
import {toggleExcludeFacetValue, toggleSelectFacetValue, updateFacetNumberOfValues} from './facet-set-actions';
import {CommerceFacetRequest} from './interfaces/request';
import { type Draft as WritableDraft } from '@reduxjs/toolkit';
import {convertFacetValueToRequest} from '../../../facets/facet-set/facet-set-slice';
import {AnyFacetResponse, FacetResponse} from '../../../../api/commerce/product-listings/v2/facet';

export const commerceFacetSetReducer = createReducer(
  getCommerceFacetSetInitialState(),

  (builder) => {
    builder
      .addCase(fetchProductListing.fulfilled, (state, action) => {
        const facets = action.payload.response.facets;
        facets.forEach((facetResponse) =>
          mutateStateFromFacetResponse(
            state[facetResponse.facetId]?.request,
            facetResponse
          )
        );
      })
      .addCase(toggleSelectFacetValue, (state, action) => {
        const {field, selection} = action.payload;
        const facetRequest = state[field]?.request;

        if (!facetRequest) {
          return;
        }

        const existingValue = facetRequest.values.find(
          (req) => req.value === selection.value
        );
        if (!existingValue) {
          insertNewValue(facetRequest, selection);
          return;
        }

        const isSelected = existingValue.state === 'selected';
        existingValue.state = isSelected ? 'idle' : 'selected';
      })
      .addCase(toggleExcludeFacetValue, (state, action) => {
        const {field, selection} = action.payload;
        const facetRequest = state[field]?.request;

        if (!facetRequest) {
          return;
        }

        const existingValue = facetRequest.values.find(
          (req) => req.value === selection.value
        );
        if (!existingValue) {
          insertNewValue(facetRequest, selection);
          return;
        }

        const isExcluded = existingValue.state === 'excluded';
        existingValue.state = isExcluded ? 'idle' : 'excluded';
      })
      .addCase(updateFacetNumberOfValues, (state, action) => {
        const {field, numberOfValues} = action.payload;

        if (!state[field]?.request) {
          return;
        }

        state[field].request.numberOfValues = numberOfValues;
      });
  }
);

function mutateStateFromFacetResponse(
  facetRequest: WritableDraft<CommerceFacetRequest> | undefined,
  facetResponse: AnyFacetResponse
) {
  if (!facetRequest) {
    return;
  }

  facetRequest.numberOfValues = facetResponse.values.length;
  facetRequest.field = facetResponse.field;
  facetRequest.type = facetResponse.type;
  facetRequest.values = (facetResponse as FacetResponse).values.map(
    // TODO(nico): Ensure facet values work with our api
    convertFacetValueToRequest
  );
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
