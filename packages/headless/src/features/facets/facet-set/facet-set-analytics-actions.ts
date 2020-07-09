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
 * Log a facet clear all event.
 * @param facetId The unique identifier for the facet.
 */
export const logFacetClearAll = createAsyncThunk(
  'analytics/facet/reset',
  async (facetId: string, {getState}) => {
    const state = searchPageState(getState);
    const facetField = getFacetField(state, facetId);
    const facetTitle = getFacetTitle(state, facetId);

    await configureAnalytics(state).logFacetClearAll({
      facetId,
      facetField,
      facetTitle,
    });
    return makeSearchActionType();
  }
);

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

  const facetValue = selection.value;
  const facetField = getFacetField(state, facetId);
  const facetTitle = getFacetTitle(state, facetId);

  return {facetId, facetValue, facetField, facetTitle};
}

const getFacetField = (state: SearchPageState, facetId: string) =>
  state.facetSet[facetId].field;
const getFacetTitle = (state: SearchPageState, facetId: string) =>
  `${getFacetField(state, facetId)}_${facetId}`;
