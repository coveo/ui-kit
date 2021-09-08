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
  RegisterCategoryFacetActionCreatorPayload,
} from './category-facet-set-actions';
import {CategoryFacetOptionalParameters} from './interfaces/options';
import {change} from '../../history/history-actions';
import {CategoryFacetResponse, CategoryFacetValue} from './interfaces/response';
import {handleFacetUpdateNumberOfValues} from '../generic/facet-reducer-helpers';
import {selectCategoryFacetSearchResult} from '../facet-search-set/category/category-facet-search-actions';
import {
  CategoryFacetSetState,
  getCategoryFacetSetInitialState,
} from './category-facet-set-state';
import {deselectAllFacets} from '../generic/facet-actions';
import {restoreSearchParameters} from '../../search-parameters/search-parameter-actions';
import {selectPath} from './category-facet-reducer-helpers';
import {executeSearch} from '../../search/search-actions';
import {partitionIntoParentsAndValues} from './category-facet-utils';
import {AnyFacetResponse} from '../generic/interfaces/generic-facet-response';

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

        const request = buildCategoryFacetRequest(options);
        const initialNumberOfValues = request.numberOfValues;
        state[facetId] = {request, initialNumberOfValues};
      })
      .addCase(
        change.fulfilled,
        (state, action) => action.payload?.categoryFacetSet ?? state
      )
      .addCase(restoreSearchParameters, (state, action) => {
        const cf = action.payload.cf || {};

        Object.keys(state).forEach((id) => {
          const request = state[id]!.request;
          const path = cf[id] || [];
          if (path.length || request.currentValues.length) {
            selectPath(request, path, state[id]!.initialNumberOfValues);
          }
        });
      })
      .addCase(updateCategoryFacetSortCriterion, (state, action) => {
        const {facetId, criterion} = action.payload;
        const request = state[facetId]?.request;

        if (!request) {
          return;
        }

        request.sortCriteria = criterion;
      })
      .addCase(toggleSelectCategoryFacetValue, (state, action) => {
        const {facetId, selection, retrieveCount} = action.payload;
        const request = state[facetId]?.request;

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
        const facetId = action.payload;
        handleCategoryFacetDeselectAll(state, facetId);
      })
      .addCase(deselectAllFacets, (state) => {
        Object.keys(state).forEach((facetId) =>
          handleCategoryFacetDeselectAll(state, facetId)
        );
      })
      .addCase(updateCategoryFacetNumberOfValues, (state, action) => {
        const {facetId, numberOfValues} = action.payload;
        const request = state[facetId]?.request;
        if (!request) {
          return;
        }
        if (!request.currentValues.length) {
          return handleFacetUpdateNumberOfValues<CategoryFacetRequest>(
            request,
            numberOfValues
          );
        }
        handleCategoryFacetNestedNumberOfValuesUpdate(state, action.payload);
      })
      .addCase(selectCategoryFacetSearchResult, (state, action) => {
        const {facetId, value} = action.payload;
        const facet = state[facetId];

        if (!facet) {
          return;
        }

        const path = [...value.path, value.rawValue];
        selectPath(facet.request, path, facet.initialNumberOfValues);
      })
      .addCase(executeSearch.fulfilled, (state, action) => {
        const {facets} = action.payload.response;

        facets.forEach((response) => {
          if (!isCategoryFacetResponse(state, response)) {
            return;
          }

          const id = response.facetId;
          const request = state[id]?.request;

          if (!request) {
            return;
          }

          const requestWasInvalid = isRequestInvalid(request, response);

          request.currentValues = requestWasInvalid
            ? []
            : request.currentValues;
          request.preventAutoSelect = false;
        });
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
  config: RegisterCategoryFacetActionCreatorPayload
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
  let selectedValue = state[facetId]?.request.currentValues[0];
  if (!selectedValue) {
    return;
  }

  while (selectedValue.children.length && selectedValue?.state !== 'selected') {
    selectedValue = selectedValue.children[0];
  }
  selectedValue.retrieveCount = numberOfValues;
}

function isCategoryFacetResponse(
  state: CategoryFacetSetState,
  response: AnyFacetResponse
): response is CategoryFacetResponse {
  const id = response.facetId;
  return id in state;
}

function isRequestInvalid(
  request: CategoryFacetRequest,
  response: CategoryFacetResponse
) {
  const requestParents = partitionIntoParentsAndValues(
    request.currentValues
  ).parents;
  const responseParents = partitionIntoParentsAndValues(
    response.values
  ).parents;
  return requestParents.length !== responseParents.length;
}

function handleCategoryFacetDeselectAll(
  state: CategoryFacetSetState,
  facetId: string
) {
  const slice = state[facetId];

  if (!slice) {
    return;
  }

  slice.request.numberOfValues = slice.initialNumberOfValues;
  slice.request.currentValues = [];
  slice.request.preventAutoSelect = true;
}
