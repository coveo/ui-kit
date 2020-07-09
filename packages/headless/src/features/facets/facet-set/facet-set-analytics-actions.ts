import {FacetValue} from './facet-set-interfaces';
import {createAsyncThunk} from '@reduxjs/toolkit';
import {
  searchPageState,
  makeSearchActionType,
} from '../../analytics/analytics-actions';
import {configureAnalytics} from '../../../api/analytics/analytics';
import {SearchPageState} from '../../../state';

export type FacetSelectionChangeMetadata = {
  facetId: string;
  selection: FacetValue;
};

/**
 * Log the selected facet value.
 */
export const logFacetSelect = createAsyncThunk(
  'analytics/facet/select',
  async (payload: FacetSelectionChangeMetadata, {getState}) => {
    const state = searchPageState(getState);
    const metadata = buildFacetSelectionChangeMetadata(payload, state);

    await configureAnalytics(state).logFacetSelect(metadata);
    return makeSearchActionType();
  }
);

/**
 * Log the deselected facet value.
 */
export const logFacetDeselect = createAsyncThunk(
  'analytics/facet/deselect',
  async (payload: FacetSelectionChangeMetadata, {getState}) => {
    const state = searchPageState(getState);
    const metadata = buildFacetSelectionChangeMetadata(payload, state);

    await configureAnalytics(state).logFacetDeselect(metadata);
    return makeSearchActionType();
  }
);

function buildFacetSelectionChangeMetadata(
  payload: FacetSelectionChangeMetadata,
  state: SearchPageState
) {
  const {facetId, selection} = payload;

  const facetField = state.facetSet[facetId].field;
  const facetValue = selection.value;
  const facetTitle = `${facetField}_${facetId}`;

  return {facetField, facetValue, facetId, facetTitle};
}
