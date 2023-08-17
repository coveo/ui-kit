import {createReducer} from '@reduxjs/toolkit';
import {deselectAllBreadcrumbs} from '../../breadcrumb/breadcrumb-actions';
import {change} from '../../history/history-actions';
import {restoreSearchParameters} from '../../search-parameters/search-parameter-actions';
import {executeSearch} from '../../search/search-actions';
import {FacetValue} from '../facet-set/interfaces/response';
import {
  deselectAllAutomaticFacetValues,
  setOptions,
  toggleSelectAutomaticFacetValue,
} from './automatic-facet-set-actions';
import {getAutomaticFacetSetInitialState} from './automatic-facet-set-state';
import {AutomaticFacetResponse} from './interfaces/response';

export const automaticFacetSetReducer = createReducer(
  getAutomaticFacetSetInitialState(),
  (builder) => {
    builder
      .addCase(executeSearch.fulfilled, (state, action) => {
        state.set = {};

        const facets = action.payload.response.generateAutomaticFacets?.facets;
        facets?.forEach((response) => {
          state.set[response.field] = {response};
        });
      })
      .addCase(setOptions, (state, action) => {
        if (action.payload.desiredCount) {
          state.desiredCount = action.payload.desiredCount;
        }
        if (action.payload.numberOfValues) {
          state.numberOfValues = action.payload.numberOfValues;
        }
      })
      .addCase(toggleSelectAutomaticFacetValue, (state, action) => {
        const {field, selection} = action.payload;
        const facet = state.set[field]?.response;

        if (!facet) {
          return;
        }
        const value = facet.values.find(
          (value) => value.value === selection.value
        );
        if (!value) {
          return;
        }
        const isSelected = value.state === 'selected';
        value.state = isSelected ? 'idle' : 'selected';
      })
      .addCase(deselectAllAutomaticFacetValues, (state, action) => {
        const field = action.payload;
        const facet = state.set[field]?.response;

        if (!facet) {
          return;
        }
        for (const value of facet.values) {
          value.state = 'idle';
        }
      })
      .addCase(restoreSearchParameters, (state, action) => {
        const af = action.payload.af ?? {};
        const currentFields = Object.keys(state.set);

        // Add facets in af that are not in facet set
        for (const field in af) {
          if (!state.set[field]) {
            const response = buildTemporaryAutomaticFacetResponse(field);
            const values = af[field].map((value) =>
              buildTemporarySelectedFacetValue(value)
            );
            response.values.push(...values);
            state.set[field] = {response};
          }
        }

        // Unselected facets in set that are not in af
        for (const field of currentFields) {
          if (!(field in af)) {
            const facet = state.set[field]?.response;
            for (const value of facet.values) {
              value.state = 'idle';
            }
          }
        }

        // Sync value state for facets in set and af
        for (const field in af) {
          const facet = state.set[field]?.response;
          if (facet) {
            const values = facet.values;
            for (const value of values) {
              if (!af[field].includes(value.value)) {
                value.state = 'idle';
              } else if (value.state === 'idle') {
                value.state = 'selected';
              }
            }
          }
        }
      })
      .addCase(change.fulfilled, (_, action) => {
        if (!action.payload) {
          return;
        }

        if (Object.keys(action.payload.automaticFacetSet.set).length === 0) {
          return;
        }

        return action.payload.automaticFacetSet;
      })
      .addCase(deselectAllBreadcrumbs, (state) => {
        Object.values(state.set).forEach(({response}) => {
          response.values.forEach((value) => (value.state = 'idle'));
        });
      });
  }
);

function buildTemporaryAutomaticFacetResponse(
  field: string
): AutomaticFacetResponse {
  return {
    field,
    values: [],
    moreValuesAvailable: false,
    label: '',
    indexScore: 0,
  };
}

function buildTemporarySelectedFacetValue(value: string): FacetValue {
  return {
    value,
    state: 'selected',
    numberOfResults: 0,
  };
}
