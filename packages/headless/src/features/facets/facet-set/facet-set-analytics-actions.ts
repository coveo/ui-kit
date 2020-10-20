import {FacetSortCriterion} from './interfaces/request';
import {createAsyncThunk} from '@reduxjs/toolkit';
import {
  searchPageState,
  makeSearchActionType,
} from '../../analytics/analytics-actions';
import {configureAnalytics} from '../../../api/analytics/analytics';
import {RangeFacetSortCriterion} from '../range-facets/generic/interfaces/request';
import {SearchAppState} from '../../../state/search-app-state';

export type FacetUpdateSortMetadata = {
  facetId: string;
  criterion: FacetSortCriterion | RangeFacetSortCriterion;
};

export type FacetSelectionChangeMetadata = {
  facetId: string;
  facetValue: string;
};

/**
 * Logs a facet show more event.
 * @param facetId (string) The unique identifier of the facet (e.g., `"1"`).
 */
export const logFacetShowMore = createAsyncThunk(
  'analytics/facet/showMore',
  async (facetId: string, {getState}) => {
    const state = searchPageState(getState);
    const metadata = buildFacetBaseMetadata(facetId, state);

    await configureAnalytics(state).logFacetShowMore(metadata);
    return makeSearchActionType();
  }
);

/**
 * Logs a facet show less event.
 * @param facetId (string) The unique identifier of the facet (e.g., `"1"`).
 */
export const logFacetShowLess = createAsyncThunk(
  'analytics/facet/showLess',
  async (facetId: string, {getState}) => {
    const state = searchPageState(getState);
    const metadata = buildFacetBaseMetadata(facetId, state);

    await configureAnalytics(state).logFacetShowLess(metadata);
    return makeSearchActionType();
  }
);

/**
 * Logs a facet search event.
 * @param facetId (string) The unique identifier of the facet (e.g., `"1"`).
 */
export const logFacetSearch = createAsyncThunk(
  'analytics/facet/search',
  async (facetId: string, {getState}) => {
    const state = searchPageState(getState);
    const metadata = buildFacetBaseMetadata(facetId, state);

    await configureAnalytics(state).logFacetSearch(metadata);
    return makeSearchActionType();
  }
);

/**
 * Logs a facet sort event.
 * @param payload (FacetUpdateSortMetadata) Object specifying the facet and sort criterion.
 */
export const logFacetUpdateSort = createAsyncThunk(
  'analytics/facet/sortChange',
  async (payload: FacetUpdateSortMetadata, {getState}) => {
    const {facetId, criterion} = payload;
    const state = searchPageState(getState);

    const base = buildFacetBaseMetadata(facetId, state);
    const metadata = {...base, criteria: criterion};

    await configureAnalytics(state).logFacetUpdateSort(metadata);
    return makeSearchActionType();
  }
);

/**
 * Logs a facet clear all event.
 * @param facetId (string) The unique identifier of the facet (e.g., `"1"`).
 */
export const logFacetClearAll = createAsyncThunk(
  'analytics/facet/reset',
  async (facetId: string, {getState}) => {
    const state = searchPageState(getState);
    const metadata = buildFacetBaseMetadata(facetId, state);

    await configureAnalytics(state).logFacetClearAll(metadata);
    return makeSearchActionType();
  }
);

/**
 * Logs a facet value selection event.
 * @param payload (FacetSelectionChangeMetadata) Object specifying the target facet and value.
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
 * Logs a facet deselect event.
 * @param payload (FacetSelectionChangeMetadata) Object specifying the target facet and value.
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
  state: SearchAppState
) {
  const {facetId, facetValue} = payload;
  const base = buildFacetBaseMetadata(facetId, state);

  return {...base, facetValue};
}

function buildFacetBaseMetadata(facetId: string, state: SearchAppState) {
  const facet =
    state.facetSet[facetId] ||
    state.categoryFacetSet[facetId] ||
    state.dateFacetSet[facetId] ||
    state.numericFacetSet[facetId];
  const facetField = facet.field;
  const facetTitle = `${facetField}_${facetId}`;

  return {facetId, facetField, facetTitle};
}
