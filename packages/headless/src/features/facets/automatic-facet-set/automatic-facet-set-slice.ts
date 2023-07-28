import {createReducer} from '@reduxjs/toolkit';
import {deselectAllBreadcrumbs} from '../../breadcrumb/breadcrumb-actions';
import {change} from '../../history/history-actions';
import {restoreSearchParameters} from '../../search-parameters/search-parameter-actions';
import {executeSearch} from '../../search/search-actions';
import {FacetValue} from '../facet-set/interfaces/response';
import {
  deselectAllAutomaticFacetValues,
  setDesiredCount,
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
      .addCase(setDesiredCount, (state, action) => {
        state.desiredCount = action.payload;
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

        if (!state.set) {
          state.set = {};
        }

        for (const field in af) {
          const response =
            state.set[field]?.response ??
            buildTemporaryAutomaticFacetResponse(field);

          const selectedValues = af[field] || [];
          const idleValues = response.values.filter(
            (facetValue) => !selectedValues.includes(facetValue.value)
          );

          response.values = [
            ...selectedValues.map((value) => {
              const facetValueObject = response.values.find(
                (facetValue) => facetValue.value === value
              );
              const numberOfResults = facetValueObject?.numberOfResults;
              return buildTemporarySelectedFacetValue(value, numberOfResults);
            }),
            ...idleValues.map(restoreFacetValueToIdleState),
          ];

          state.set[field] = {response};
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

function buildTemporarySelectedFacetValue(
  value: string,
  numberOfResults = 0
): FacetValue {
  return {
    value,
    state: 'selected',
    numberOfResults,
  };
}

function restoreFacetValueToIdleState(facetValue: FacetValue): FacetValue {
  return {...facetValue, state: 'idle'};
}
