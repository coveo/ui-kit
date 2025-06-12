import type {CommerceEngine} from '../../../../../app/commerce-engine/commerce-engine.js';
import {stateKey} from '../../../../../app/state-key.js';
import {
  toggleSelectCategoryFacetValue,
  updateCategoryFacetNumberOfValues,
} from '../../../../../features/commerce/facets/category-facet/category-facet-actions.js';
import {facetRequestSelector} from '../../../../../features/commerce/facets/facet-set/facet-set-selector.js';
import type {
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
import type {SearchableFacetOptions} from '../searchable/headless-commerce-searchable-facet.js';
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
  const {facetId} = options;

  const facetSearch = buildCategoryFacetSearch(engine, {
    options: {facetId, ...options.facetSearch},
    select: () => {
      dispatch(options.fetchProductsActionCreator());
    },
    isForFieldSuggestions: false,
  });

  const getRequest = () =>
    facetRequestSelector(engine[stateKey], facetId)! as CategoryFacetRequest;

  return {
    deselectAll,
    isValueSelected,
    subscribe,
    toggleSelect,

    showMoreValues() {
      const {initialNumberOfValues, values} = getRequest();

      const numberOfValues = values.length + (initialNumberOfValues ?? 1);

      dispatch(
        updateCategoryFacetNumberOfValues({
          facetId,
          numberOfValues,
        })
      );

      dispatch(options.fetchProductsActionCreator());
    },

    showLessValues() {
      const request = getRequest();
      const numberOfValues = request.initialNumberOfValues ?? 1;

      dispatch(
        updateCategoryFacetNumberOfValues({
          facetId,
          numberOfValues,
        })
      );

      dispatch(options.fetchProductsActionCreator());
    },

    facetSearch,

    get state() {
      return getCategoryFacetState(
        coreController.state,
        categoryFacetSearchStateSelector(engine[stateKey], facetId),
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
  const initialNumberOfValues = request?.initialNumberOfValues;

  const canShowLessValues =
    !!initialNumberOfValues &&
    (activeValue
      ? initialNumberOfValues < activeValue.children.length
      : initialNumberOfValues <
        (request!.numberOfValues ?? coreState.values.length));

  const canShowMoreValues = activeValue
    ? activeValue.moreValuesAvailable
    : coreState.canShowMoreValues;

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
    hasActiveValues: !!activeValue,
    selectedValueAncestry,
    type: 'hierarchical',
    values,
  };
};
