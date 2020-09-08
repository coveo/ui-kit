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
        const {facetId, selection} = action.payload;
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

        const valueRequest = convertCategoryFacetValueToRequest(selection);
        activeLevel.push(valueRequest);
        request.numberOfValues = 1;
      })
      .addCase(deselectAllCategoryFacetValues, (state, action) => {
        handleFacetDeselectAll<CategoryFacetRequest>(state, action.payload);
      })
      .addCase(updateCategoryFacetNumberOfValues, (state, action) => {
        const {facetId} = action.payload;
        const request = state[facetId];
        if (!request.currentValues.length) {
          return handleFacetUpdateNumberOfValues<CategoryFacetRequest>(
            state,
            action.payload
          );
        }
        handleCategoryFacetNestedNumberOfValuesUpdate(state, action.payload);
      });
  }
);

export const defaultCategoryFacetOptions: CategoryFacetOptionalParameters = {
  delimitingCharacter: '|',
  filterFacetCount: false,
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

function convertCategoryFacetValueToRequest(
  categoryFacetValue: CategoryFacetValue
): CategoryFacetValueRequest {
  const {value} = categoryFacetValue;
  return {
    value,
    state: 'selected',
    children: [],
    retrieveChildren: true,
    retrieveCount: 5,
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
