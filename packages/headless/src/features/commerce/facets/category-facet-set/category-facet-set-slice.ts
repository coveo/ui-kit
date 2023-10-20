import {createReducer} from '@reduxjs/toolkit';
import {
  RegisterCategoryFacetActionCreatorPayload,
  deselectAllCategoryFacetValues,
  registerCategoryFacet,
  toggleSelectCategoryFacetValue,
  updateCategoryFacetNumberOfValues,
} from '../../../facets/category-facet-set/category-facet-set-actions';
import {findActiveValueAncestry} from '../../../facets/category-facet-set/category-facet-utils';
import {CategoryFacetResponse} from '../../../facets/category-facet-set/interfaces/response';
import {handleFacetUpdateNumberOfValues} from '../../../facets/generic/facet-reducer-helpers';
import {AnyFacetResponse} from '../../../facets/generic/interfaces/generic-facet-response';
import {fetchProductListing} from '../../product-listing/product-listing-actions';
import {handleCategoryFacetDeselectAll} from './category-facet-reducer-helpers';
import {
  CommerceCategoryFacetSetState,
  getCommerceCategoryFacetSetInitialState,
} from './category-facet-set-state';
import {
  CommerceCategoryFacetRequest,
  CommerceCategoryFacetValueRequest,
} from './interfaces/request';

export const commerceCategoryFacetSetReducer = createReducer(
  getCommerceCategoryFacetSetInitialState(),
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
      .addCase(toggleSelectCategoryFacetValue, (state, action) => {
        const {facetId, selection} = action.payload;
        const request = state[facetId]?.request;

        if (!request) {
          return;
        }

        const {path} = selection;
        const pathToSelection = path.slice(0, path.length - 1);
        const children = ensurePathAndReturnChildren(request, pathToSelection);

        if (children.length) {
          const lastSelectedParent = children[0];

          lastSelectedParent.state = 'selected';
          lastSelectedParent.children = [];
          return;
        }

        const newParent = buildCategoryFacetValueRequest(selection.value);
        newParent.state = 'selected';
        children.push(newParent);
        request.numberOfValues = 1;
      })
      .addCase(deselectAllCategoryFacetValues, (state, action) => {
        const facetId = action.payload;
        handleCategoryFacetDeselectAll(state, facetId);
      })

      .addCase(updateCategoryFacetNumberOfValues, (state, action) => {
        const {facetId, numberOfValues} = action.payload;
        const request = state[facetId]?.request;
        if (!request) {
          return;
        }
        if (!request.currentValues.length) {
          return handleFacetUpdateNumberOfValues<CommerceCategoryFacetRequest>(
            request,
            numberOfValues
          );
        }
      })

      .addCase(fetchProductListing.fulfilled, (state, action) => {
        handleCategoryFacetResponseUpdate(
          state,
          action.payload.response.facets
        );
      });
  }
);

export const defaultCommerceCategoryFacetOptions: Pick<
  CommerceCategoryFacetRequest,
  'numberOfValues'
> = {
  numberOfValues: 5,
};

function ensurePathAndReturnChildren(
  request: CommerceCategoryFacetRequest,
  path: string[]
) {
  let children = request.currentValues;

  for (const segment of path) {
    let parent = children[0];
    const missingParent = !parent;

    if (missingParent || segment !== parent.value) {
      parent = buildCategoryFacetValueRequest(segment);
      children.length = 0;
      children.push(parent);
    }

    parent.state = 'idle';
    children = parent.children;
  }

  return children;
}

function buildCategoryFacetRequest(
  config: Pick<
    RegisterCategoryFacetActionCreatorPayload,
    'facetId' | 'field' | 'numberOfValues'
  >
): CommerceCategoryFacetRequest {
  return {
    ...defaultCommerceCategoryFacetOptions,
    currentValues: [],
    type: 'hierarchical',
    ...config,
  };
}

function buildCategoryFacetValueRequest(
  value: string
): CommerceCategoryFacetValueRequest {
  return {
    value,
    state: 'idle',
    children: [],
  };
}

function handleCategoryFacetResponseUpdate(
  state: CommerceCategoryFacetSetState,
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
  });
}

function isCategoryFacetResponse(
  state: CommerceCategoryFacetSetState,
  response: AnyFacetResponse
): response is CategoryFacetResponse {
  const id = response.facetId;
  return id in state;
}

function isRequestInvalid(
  request: CommerceCategoryFacetRequest,
  response: CategoryFacetResponse
) {
  const requestParents = findActiveValueAncestry(request.currentValues);
  const responseParents = findActiveValueAncestry(response.values);
  return requestParents.length !== responseParents.length;
}
