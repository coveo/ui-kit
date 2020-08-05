import {CategoryFacetRequest} from './interfaces/request';
import {createReducer} from '@reduxjs/toolkit';
import {registerCategoryFacet} from './category-facet-set-actions';
import {CategoryFacetRegistrationOptions} from './interfaces/options';
import {change} from '../../history/history-actions';

export type CategoryFacetSetState = Record<string, CategoryFacetRequest>;

export function getCategoryFacetSetInitialState(): CategoryFacetSetState {
  return {};
}

export const categoryFacetSetReducer = createReducer(
  getCategoryFacetSetInitialState(),
  (builder) => {
    builder
      .addCase(registerCategoryFacet, (state, action) => {
        const options = action.payload;
        const {facetId} = options;

        if (facetId in state) {
          return;
        }

        state[facetId] = buildCategoryFacetRequest(options);
      })
      .addCase(
        change.fulfilled,
        (_, action) => action.payload.categoryFacetSet
      );
  }
);

function buildCategoryFacetRequest(
  config: CategoryFacetRegistrationOptions
): CategoryFacetRequest {
  return {
    currentValues: [],
    delimitingCharacter: '|',
    filterFacetCount: false,
    injectionDepth: 1000,
    numberOfValues: 5,
    preventAutoSelect: false,
    sortCriteria: 'occurrences',
    type: 'hierarchical',
    basePath: [],
    filterByBasePath: true,
    ...config,
  };
}
