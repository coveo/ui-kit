import {createReducer} from '@reduxjs/toolkit';
import {registerCategoryFacet} from '../category-facet-set/category-facet-set-actions';
import {registerFacet} from '../facet-set/facet-set-actions';
import {registerDateFacet} from '../range-facets/date-facet-set/date-facet-actions';
import {registerNumericFacet} from '../range-facets/numeric-facet-set/numeric-facet-actions';
import {disableFacet, enableFacet} from './any-facet-set-actions';
import {
  getAnyFacetSetInitialState,
  getAnyFacetSliceInitialState,
} from './any-facet-set-state';

export const anyFacetSetReducer = createReducer(
  getAnyFacetSetInitialState(),
  (builder) => {
    builder
      .addCase(registerCategoryFacet, (state, action) => {
        state[action.payload.facetId] = getAnyFacetSliceInitialState();
      })
      .addCase(registerFacet, (state, action) => {
        state[action.payload.facetId] = getAnyFacetSliceInitialState();
      })
      .addCase(registerDateFacet, (state, action) => {
        state[action.payload.facetId] = getAnyFacetSliceInitialState();
      })
      .addCase(registerNumericFacet, (state, action) => {
        state[action.payload.facetId] = getAnyFacetSliceInitialState();
      })
      .addCase(enableFacet, (state, action) => {
        state[action.payload].enabled = true;
      })
      .addCase(disableFacet, (state, action) => {
        state[action.payload].enabled = false;
      });
  }
);
