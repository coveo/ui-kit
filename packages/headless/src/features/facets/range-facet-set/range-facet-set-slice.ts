import {createReducer} from '@reduxjs/toolkit';
import {RangeFacetRequest} from './interfaces/request';
import {registerRangeFacet} from './range-facet-set-actions';
import {RangeFacetRegistrationOptions} from './interfaces/options';
import {change} from '../../history/history-actions';

export type RangeFacetSetState = Record<string, RangeFacetRequest>;

export function getRangeFacetSetInitialState(): RangeFacetSetState {
  return {};
}

export const rangeFacetSetReducer = createReducer(
  getRangeFacetSetInitialState(),
  (builder) => {
    builder
      .addCase(registerRangeFacet, (state, action) => {
        const {payload} = action;
        const {facetId} = payload;

        if (facetId in state) {
          return;
        }

        state[facetId] = buildRangeFacetRequest(payload);
      })
      .addCase(change.fulfilled, (_, action) => action.payload.rangeFacetSet);
  }
);

function buildRangeFacetRequest(
  config: RangeFacetRegistrationOptions
): RangeFacetRequest {
  return {
    currentValues: [],
    isFieldExpanded: false,
    preventAutoSelect: false,
    freezeCurrentValues: false,
    filterFacetCount: false,
    injectionDepth: 1000,
    numberOfValues: 8, // TODO: check value when manual vs. automatic
    sortCriteria: 'ascending',
    ...config,
  };
}
