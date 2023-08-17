import {createReducer} from '@reduxjs/toolkit';
import {deselectAllBreadcrumbs} from '../../breadcrumb/breadcrumb-actions';
import {disableFacet} from '../../facet-options/facet-options-actions';
import {change} from '../../history/history-actions';
import {restoreSearchParameters} from '../../search-parameters/search-parameter-actions';
import {executeSearch, fetchFacetValues} from '../../search/search-actions';
import {selectCategoryFacetSearchResult} from '../facet-search-set/category/category-facet-search-actions';
import {updateFacetAutoSelection} from '../generic/facet-actions';
import {handleFacetUpdateNumberOfValues} from '../generic/facet-reducer-helpers';
import {AnyFacetResponse} from '../generic/interfaces/generic-facet-response';
import {
  handleCategoryFacetDeselectAll,
  selectPath,
} from './category-facet-reducer-helpers';
import {
  registerCategoryFacet,
  toggleSelectCategoryFacetValue,
  deselectAllCategoryFacetValues,
  updateCategoryFacetNumberOfValues,
  updateCategoryFacetSortCriterion,
  RegisterCategoryFacetActionCreatorPayload,
  updateCategoryFacetBasePath,
} from './category-facet-set-actions';
import {
  CategoryFacetSetState,
  getCategoryFacetSetInitialState,
} from './category-facet-set-state';
import {partitionIntoParentsAndValues} from './category-facet-utils';
import {CategoryFacetOptionalParameters} from './interfaces/options';
import {
  CategoryFacetRequest,
  CategoryFacetValueRequest,
} from './interfaces/request';
import {CategoryFacetResponse} from './interfaces/response';

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
      .addCase(updateCategoryFacetBasePath, (state, action) => {
        const {facetId, basePath} = action.payload;
        const request = state[facetId]?.request;

        if (!request) {
          return;
        }

        request.basePath = [...basePath];
      })
      .addCase(toggleSelectCategoryFacetValue, (state, action) => {
        const {facetId, selection, retrieveCount} = action.payload;
        const request = state[facetId]?.request;

        if (!request) {
          return;
        }

        const {path} = selection;
        const pathToSelection = path.slice(0, path.length - 1);
        const children = ensurePathAndReturnChildren(
          request,
          pathToSelection,
          retrieveCount
        );

        if (children.length) {
          const lastSelectedParent = children[0];

          lastSelectedParent.retrieveChildren = true;
          lastSelectedParent.state = 'selected';
          lastSelectedParent.children = [];
          return;
        }

        const newParent = buildCategoryFacetValueRequest(
          selection.value,
          retrieveCount
        );
        newParent.state = 'selected';
        children.push(newParent);
        request.numberOfValues = 1;
      })
      .addCase(deselectAllCategoryFacetValues, (state, action) => {
        const facetId = action.payload;
        handleCategoryFacetDeselectAll(state, facetId);
      })
      .addCase(deselectAllBreadcrumbs, (state) => {
        Object.keys(state).forEach((facetId) =>
          handleCategoryFacetDeselectAll(state, facetId)
        );
      })
      .addCase(updateFacetAutoSelection, (state, action) =>
        Object.keys(state).forEach((facetId) => {
          state[facetId]!.request.preventAutoSelect = !action.payload.allow;
        })
      )
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
      .addCase(fetchFacetValues.fulfilled, (state, action) => {
        handleCategoryFacetResponseUpdate(
          state,
          action.payload.response.facets
        );
      })
      .addCase(executeSearch.fulfilled, (state, action) => {
        handleCategoryFacetResponseUpdate(
          state,
          action.payload.response.facets
        );
      })
      .addCase(disableFacet, (state, action) => {
        handleCategoryFacetDeselectAll(state, action.payload);
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

function ensurePathAndReturnChildren(
  request: CategoryFacetRequest,
  path: string[],
  retrieveCount: number
) {
  let children = request.currentValues;

  for (const segment of path) {
    let parent = children[0];
    const missingParent = !parent;

    if (missingParent || segment !== parent.value) {
      parent = buildCategoryFacetValueRequest(segment, retrieveCount);
      children.length = 0;
      children.push(parent);
    }

    parent.retrieveChildren = false;
    parent.state = 'idle';
    children = parent.children;
  }

  return children;
}

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

function buildCategoryFacetValueRequest(
  value: string,
  retrieveCount: number
): CategoryFacetValueRequest {
  return {
    value,
    state: 'idle',
    children: [],
    retrieveChildren: true,
    retrieveCount,
  };
}

function handleCategoryFacetResponseUpdate(
  state: CategoryFacetSetState,
  facets: AnyFacetResponse[]
) {
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

    request.currentValues = requestWasInvalid ? [] : request.currentValues;
    request.preventAutoSelect = false;
  });
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
