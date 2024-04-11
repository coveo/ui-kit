import {createSelector} from '@reduxjs/toolkit';
import {CommerceEngineState} from '../../../app/commerce-engine/commerce-engine';

export const responseIdSelector = createSelector(
  (state: CommerceEngineState) => state.productListing.responseId,
  (responseId) => responseId
);
