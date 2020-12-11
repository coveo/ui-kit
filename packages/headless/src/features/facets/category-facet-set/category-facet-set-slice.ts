import {
  CategoryFacetRequest,
  CategoryFacetValueRequest,
} from './interfaces/request';
import {createReducer} from '@reduxjs/toolkit';
import {
  registerCategoryFacet,
  toggleSelectCategoryFacetValue,
  deselectAllCategoryFacetValues,
  updateCategoryFacetNumberOfValues,
  updateCategoryFacetSortCriterion,
} from './category-facet-set-actions';
import {
  CategoryFacetRegistrationOptions,
  CategoryFacetOptionalParameters,
} from './interfaces/options';
import {change} from '../../history/history-actions';
import {CategoryFacetValue} from './interfaces/response';
import {
  handleFacetDeselectAll,
  handleFacetUpdateNumberOfValues,
} from '../generic/facet-reducer-helpers';
import {selectCategoryFacetSearchResult} from '../facet-search-set/category/category-facet-search-actions';
import {
  CategoryFacetSetState,
  getCategoryFacetSetInitialState,
} from './category-facet-set-state';
import {deselectAllFacets} from '../generic/facet-actions';

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
      .addCase(change.fulfilled, (_, action) => action.payload.categoryFacetSet)
      .addCase(updateCategoryFacetSortCriterion, (state, action) => {
        const {facetId, criterion} = action.payload;
        const request = state[facetId];

        if (!request) {
          return;
        }

        request.sortCriteria = criterion;
      })
      .addCase(toggleSelectCategoryFacetValue, (state, action) => {
        const {facetId, selection, retrieveCount} = action.payload;
        const request = state[facetId];

        if (!request) {
          return;
        }

        let activeLevel = request.currentValues;
        const {path} = selection;
        const pathToSelection = path.slice(0, path.length - 1);

        for (const segment of pathToSelection) {
          const parent = activeLevel[0];

          if (segment !== parent.value) {
            return;
          }

          parent.retrieveChildren = false;
          parent.state = 'idle';
          activeLevel = parent.children;
        }

        if (activeLevel.length) {
          const parentSelection = activeLevel[0];

          parentSelection.retrieveChildren = true;
          parentSelection.state = 'selected';
          parentSelection.children = [];
          return;
        }

        const valueRequest = convertCategoryFacetValueToRequest(
          selection,
          retrieveCount
        );
        activeLevel.push(valueRequest);
        request.numberOfValues = 1;
      })
      .addCase(deselectAllCategoryFacetValues, (state, action) => {
        handleFacetDeselectAll<CategoryFacetRequest>(state, action.payload);
      })
      .addCase(deselectAllFacets, (state) => {
        Object.keys(state).forEach((facetId) => {
          handleFacetDeselectAll<CategoryFacetRequest>(state, facetId);
        });
      })
      .addCase(updateCategoryFacetNumberOfValues, (state, action) => {
        const {facetId} = action.payload;
        const request = state[facetId];
        if (!request) {
          return;
        }
        if (!request.currentValues.length) {
          return handleFacetUpdateNumberOfValues<CategoryFacetRequest>(
            state,
            action.payload
          );
        }
        handleCategoryFacetNestedNumberOfValuesUpdate(state, action.payload);
      })
      .addCase(selectCategoryFacetSearchResult, (state, action) => {
        const {facetId, value, retrieveCount} = action.payload;
        const request = state[facetId];

        if (!request) {
          return;
        }

        handleFacetDeselectAll(state, facetId);

        const path = [...value.path, value.rawValue];
        let curr = buildCategoryFacetValueRequest(path[0], retrieveCount);
        request.currentValues.push(curr);

        for (const segment of path.splice(1)) {
          const next = buildCategoryFacetValueRequest(segment, retrieveCount);
          curr.children.push(next);
          curr = next;
        }

        curr.state = 'selected';
        curr.retrieveChildren = true;

        request.numberOfValues = 1;
      });
  }
);

export const defaultCategoryFacetOptions: CategoryFacetOptionalParameters = {
  delimitingCharacter: ';',
  filterFacetCount: true,
  injectionDepth: 1000,
  numberOfValues: 5,
  sortCriteria: 'occurrences',
  basePath: [],
  filterByBasePath: true,
};

function buildCategoryFacetRequest(
  config: CategoryFacetRegistrationOptions
): CategoryFacetRequest {
  return {
    ...defaultCategoryFacetOptions,
    currentValues: [],
    preventAutoSelect: false,
    type: 'hierarchical',
    ...config,
  };
}

function buildCategoryFacetValueRequest(
  value: string,
  retrieveCount: number
): CategoryFacetValueRequest {
  return {
    value,
    retrieveCount,
    children: [],
    state: 'idle',
    retrieveChildren: false,
  };
}

function convertCategoryFacetValueToRequest(
  categoryFacetValue: CategoryFacetValue,
  retrieveCount: number
): CategoryFacetValueRequest {
  const {value} = categoryFacetValue;
  return {
    value,
    state: 'selected',
    children: [],
    retrieveChildren: true,
    retrieveCount,
  };
}

function handleCategoryFacetNestedNumberOfValuesUpdate(
  state: CategoryFacetSetState,
  payload: {facetId: string; numberOfValues: number}
) {
  const {facetId, numberOfValues} = payload;
  let selectedValue = state[facetId]?.currentValues[0];
  if (!selectedValue) {
    return;
  }

  while (selectedValue.children.length && selectedValue?.state !== 'selected') {
    selectedValue = selectedValue.children[0];
  }
  selectedValue.retrieveCount = numberOfValues;
}
