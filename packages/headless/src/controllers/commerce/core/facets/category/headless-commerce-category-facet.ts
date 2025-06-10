import type {CommerceEngine} from '../../../../../app/commerce-engine/commerce-engine.js';
import {stateKey} from '../../../../../app/state-key.js';
import {
  toggleSelectCategoryFacetValue,
  updateCategoryFacetNumberOfValues,
} from '../../../../../features/commerce/facets/category-facet/category-facet-actions.js';
import {facetRequestSelector} from '../../../../../features/commerce/facets/facet-set/facet-set-selector.js';
import {
  CategoryFacetRequest,
  CategoryFacetValueRequest,
} from '../../../../../features/commerce/facets/facet-set/interfaces/request.js';
import {findActiveValueAncestry} from '../../../../../features/facets/category-facet-set/category-facet-utils.js';
import {categoryFacetSearchStateSelector} from '../../../../../features/facets/facet-search-set/category/category-facet-search-state-selector.js';
import {
  CategoryFacetValue,
  CoreCommerceFacet,
  CoreCommerceFacetOptions,
  CoreCommerceFacetState,
  FacetControllerType,
  buildCoreCommerceFacet,
} from '../headless-core-commerce-facet.js';
import {SearchableFacetOptions} from '../searchable/headless-commerce-searchable-facet.js';
import {
  CategoryFacetSearch,
  CategoryFacetSearchState,
  buildCategoryFacetSearch,
} from './headless-commerce-category-facet-search.js';

export type CategoryFacetOptions = Omit<
  CoreCommerceFacetOptions,
  'toggleExcludeActionCreator' | 'toggleSelectActionCreator'
> &
  SearchableFacetOptions;

/**
 * The state of the `CategoryFacet` sub-controller.
 *
 * @group Sub-controllers
 * @category CategoryFacet
 * */
export type CategoryFacetState = Omit<
  CoreCommerceFacetState<CategoryFacetValue>,
  'type'
> & {
  activeValue?: CategoryFacetValue;
  canShowLessValues: boolean;
  canShowMoreValues: boolean;
  hasActiveValues: boolean;
  selectedValueAncestry?: CategoryFacetValue[];
  facetSearch: CategoryFacetSearchState;
  type: 'hierarchical';
};

/**
 * The `CategoryFacet` sub-controller offers a high-level programming interface for implementing a commerce category
 * facet UI component.
 *
 * @group Sub-controllers
 * @category CategoryFacet
 */
export type CategoryFacet = Omit<
  CoreCommerceFacet<CategoryFacetValueRequest, CategoryFacetValue>,
  | 'isValueExcluded'
  | 'toggleExclude'
  | 'toggleSingleExclude'
  | 'toggleSingleSelect'
> & {
  facetSearch: Omit<CategoryFacetSearch, 'state'>;
  state: CategoryFacetState;
} & FacetControllerType<'hierarchical'>;

/**
 * @internal
 *
 * **Important:** This initializer is meant for internal use by headless only.
 * As an implementer, you must not import or use this initializer directly in your code.
 * You will instead interact with `CategoryFacet` sub-controller instances through the state of a `FacetGenerator`
 * sub-controller.
 *
 * @param engine - The headless commerce engine.
 * @param options - The `CategoryFacet` options used internally.
 * @returns A `CategoryFacet` sub-controller instance.
 * */
export function buildCategoryFacet(
  engine: CommerceEngine,
  options: CategoryFacetOptions
): CategoryFacet {
  const coreController = buildCoreCommerceFacet<
    CategoryFacetValueRequest,
    CategoryFacetValue
  >(engine, {
    options: {
      ...options,
      toggleSelectActionCreator: toggleSelectCategoryFacetValue,
    },
  });
  const {deselectAll, isValueSelected, subscribe, toggleSelect} =
    coreController;
  const {dispatch} = engine;
  const getFacetId = () => coreController.state.facetId;
  const facetSearch = buildCategoryFacetSearch(engine, {
    options: {facetId: getFacetId(), ...options.facetSearch},
    select: () => {
      dispatch(options.fetchProductsActionCreator());
    },
    isForFieldSuggestions: false,
  });
  const getRequest = () =>
    facetRequestSelector(
      engine[stateKey],
      getFacetId()
    ) as CategoryFacetRequest;

  return {
    deselectAll,
    isValueSelected,
    subscribe,
    toggleSelect,

    showMoreValues() {
      const request = getRequest();
      const {values} = coreController.state;
      const selectedValueAncestry = findActiveValueAncestry(values);
      const activeValue = selectedValueAncestry.length
        ? selectedValueAncestry[selectedValueAncestry.length - 1]
        : undefined;
      const numberInState = activeValue
        ? activeValue.numberOfResults
        : (request?.numberOfValues ?? 0);
      const initialNumberOfValues = request?.initialNumberOfValues ?? 0;
      const numberToNextMultipleOfConfigured =
        initialNumberOfValues - (numberInState % initialNumberOfValues);
      const numberOfValues = numberInState + numberToNextMultipleOfConfigured;
      const {facetId} = options;

      dispatch(updateCategoryFacetNumberOfValues({facetId, numberOfValues}));
      dispatch(options.fetchProductsActionCreator());
    },

    showLessValues() {
      const {facetId} = options;

      dispatch(
        updateCategoryFacetNumberOfValues({
          facetId,
          numberOfValues: getRequest()?.initialNumberOfValues,
        })
      );
      dispatch(options.fetchProductsActionCreator());
    },

    facetSearch,

    get state() {
      return getCategoryFacetState(
        coreController.state,
        categoryFacetSearchStateSelector(engine[stateKey], getFacetId()),
        getRequest()
      );
    },

    type: 'hierarchical',
  };
}

export const getCategoryFacetState = (
  coreState: CoreCommerceFacetState<CategoryFacetValue>,
  facetSearchSelector: ReturnType<typeof categoryFacetSearchStateSelector>,
  request: CategoryFacetRequest | undefined
): CategoryFacetState => {
  const {values} = coreState;
  const selectedValueAncestry = findActiveValueAncestry(values);
  const activeValue = selectedValueAncestry.length
    ? selectedValueAncestry[selectedValueAncestry.length - 1]
    : undefined;
  const initialNumberOfValues = request?.initialNumberOfValues ?? 0;
  const canShowLessValues = activeValue
    ? initialNumberOfValues < activeValue.children.length
    : initialNumberOfValues < values.length;
  const canShowMoreValues =
    activeValue?.moreValuesAvailable ?? coreState.canShowMoreValues ?? false;
  const hasActiveValues = !!activeValue;

  return {
    ...coreState,
    activeValue,
    canShowLessValues,
    canShowMoreValues,
    facetSearch: {
      isLoading: facetSearchSelector?.isLoading ?? false,
      moreValuesAvailable:
        facetSearchSelector?.response.moreValuesAvailable ?? false,
      query: facetSearchSelector?.options.query ?? '',
      values: facetSearchSelector?.response.values ?? [],
    },
    hasActiveValues,
    selectedValueAncestry,
    type: 'hierarchical',
    values,
  };
};
