import {createReducer} from '@reduxjs/toolkit';
import {registerCategoryFacet} from '../facets/category-facet-set/category-facet-set-actions';
import {registerFacet} from '../facets/facet-set/facet-set-actions';
import {registerDateFacet} from '../facets/range-facets/date-facet-set/date-facet-actions';
import {registerNumericFacet} from '../facets/range-facets/numeric-facet-set/numeric-facet-actions';
import {change} from '../history/history-actions';
import {restoreSearchParameters} from '../search-parameters/search-parameter-actions';
import {executeSearch} from '../search/search-actions';
import {updateActiveTab} from '../tab-set/tab-set-actions';
import {
  disableFacet,
  enableFacet,
  updateFacetOptions,
} from './facet-options-actions';
import {
  getFacetOptionsSliceInitialState,
  getFacetOptionsInitialState,
  FacetOptionsState,
} from './facet-options-state';
import {isFacetIncludedOnTab} from './facet-options-utils';

export const facetOptionsReducer = createReducer(
  getFacetOptionsInitialState(),
  (builder) => {
    builder
      .addCase(updateFacetOptions, (state, action) => {
        return {...state, ...action.payload};
      })
      .addCase(executeSearch.fulfilled, (state) => {
        state.freezeFacetOrder = false;
      })
      .addCase(executeSearch.rejected, (state) => {
        state.freezeFacetOrder = false;
      })
      .addCase(updateActiveTab, (state, action) => {
        for (const facetId in state.facets) {
          const facet = state.facets[facetId];

          if (Object.keys({...facet.tabs}).length > 0) {
            facet.enabled = isFacetIncludedOnTab(facet.tabs, action.payload);
          }
        }
      })
      .addCase(
        change.fulfilled,
        (state, action) => action.payload?.facetOptions ?? state
      )
      .addCase(registerCategoryFacet, (state, action) => {
        const {facetId, tabs, activeTab} = action.payload;

        handleRegisterFacetTabs(tabs, activeTab, state, facetId);
      })
      .addCase(registerFacet, (state, action) => {
        const {facetId, tabs, activeTab} = action.payload;

        handleRegisterFacetTabs(tabs, activeTab, state, facetId);
      })
      .addCase(registerDateFacet, (state, action) => {
        const {facetId, tabs, activeTab} = action.payload;

        handleRegisterFacetTabs(tabs, activeTab, state, facetId);
      })
      .addCase(registerNumericFacet, (state, action) => {
        const {facetId, tabs, activeTab} = action.payload;

        handleRegisterFacetTabs(tabs, activeTab, state, facetId);
      })
      .addCase(enableFacet, (state, action) => {
        state.facets[action.payload].enabled = true;
      })
      .addCase(disableFacet, (state, action) => {
        state.facets[action.payload].enabled = false;
      })
      .addCase(restoreSearchParameters, (state, action) => {
        for (const facetId in state.facets) {
          const facet = state.facets[facetId];
          if (Object.keys({...facet.tabs}).length > 0) {
            facet.enabled = isFacetIncludedOnTab(
              facet.tabs,
              action.payload.tab
            );
          }
        }
        [
          ...Object.keys(action.payload.f ?? {}),
          ...Object.keys(action.payload.fExcluded ?? {}),
          ...Object.keys(action.payload.cf ?? {}),
          ...Object.keys(action.payload.nf ?? {}),
          ...Object.keys(action.payload.df ?? {}),
        ].forEach((facetId) => {
          if (!(facetId in state)) {
            state.facets[facetId] = getFacetOptionsSliceInitialState();
          }
          state.facets[facetId].enabled = true;
        });
      });
  }
);

function handleRegisterFacetTabs(
  tabs: {included?: string[]; excluded?: string[]} | undefined,
  activeTab: string | undefined,
  state: FacetOptionsState,
  facetId: string
) {
  const newFacetState = {
    ...getFacetOptionsSliceInitialState(),
    tabs: tabs ?? {},
    enabled: isFacetIncludedOnTab(tabs, activeTab),
  };

  state.facets[facetId] = newFacetState;
}
