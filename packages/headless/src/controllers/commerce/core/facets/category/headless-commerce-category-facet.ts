import {createSelector} from '@reduxjs/toolkit';
import {
  CommerceEngine,
  CommerceEngineState,
} from '../../../../../app/commerce-engine/commerce-engine';
import {stateKey} from '../../../../../app/state-key';
import {
  toggleSelectCategoryFacetValue,
  updateCategoryFacetNumberOfValues,
} from '../../../../../features/commerce/facets/category-facet/category-facet-actions';
import {CategoryFacetValueRequest} from '../../../../../features/commerce/facets/facet-set/interfaces/request';
import {defaultNumberOfValuesIncrement} from '../../../../../features/facets/category-facet-set/category-facet-set-actions';
import {findActiveValueAncestry} from '../../../../../features/facets/category-facet-set/category-facet-utils';
import {
  CategoryFacetValue,
  CoreCommerceFacet,
  CoreCommerceFacetOptions,
  CoreCommerceFacetState,
  FacetControllerType,
  buildCoreCommerceFacet,
} from '../headless-core-commerce-facet';
import {SearchableFacetOptions} from '../searchable/headless-commerce-searchable-facet';
import {
  CategoryFacetSearch,
  CategoryFacetSearchState,
  buildCategoryFacetSearch,
} from './headless-commerce-category-facet-search';

export type CategoryFacetOptions = Omit<
  CoreCommerceFacetOptions,
  'toggleExcludeActionCreator' | 'toggleSelectActionCreator'
> &
  SearchableFacetOptions;

export type CategoryFacetState = CoreCommerceFacetState<CategoryFacetValue> & {
  activeValue?: CategoryFacetValue;
  canShowLessValues: boolean;
  canShowMoreValues: boolean;
  hasActiveValues: boolean;
  selectedValueAncestry?: CategoryFacetValue[];
  facetSearch: CategoryFacetSearchState;
};

/**
 * The `CategoryFacet` controller offers a high-level programming interface for implementing a commerce category
 * facet UI component.
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
 * You will instead interact with `CategoryFacet` controller instances through the state of a `FacetGenerator`
 * controller.
 *
 * @param engine - The headless commerce engine.
 * @param options - The `CategoryFacet` options used internally.
 * @returns A `CategoryFacet` controller instance.
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
  const createFacetSearch = () => {
    return buildCategoryFacetSearch(engine, {
      options: {facetId: getFacetId(), ...options.facetSearch},
      select: () => {
        dispatch(options.fetchProductsActionCreator());
      },
      isForFieldSuggestions: false,
    });
  };

  const facetSearch = createFacetSearch();
  const {state, ...restOfFacetSearch} = facetSearch;
  const facetSearchStateSelector = createSelector(
    (state: CommerceEngineState) => state.categoryFacetSearchSet[getFacetId()],
    (facetSearch) => ({
      isLoading: facetSearch.isLoading,
      moreValuesAvailable: facetSearch.response.moreValuesAvailable,
      query: facetSearch.options.query,
      values: facetSearch.response.values,
    })
  );

  return {
    deselectAll,
    isValueSelected,
    subscribe,
    toggleSelect,

    showMoreValues() {
      const {facetId} = options;
      const {activeValue, values} = this.state;
      const numberOfValues =
        (activeValue?.children.length ?? values.length) +
        defaultNumberOfValuesIncrement;

      dispatch(updateCategoryFacetNumberOfValues({facetId, numberOfValues}));
      dispatch(options.fetchProductsActionCreator());
    },

    showLessValues() {
      const {facetId} = options;

      dispatch(
        updateCategoryFacetNumberOfValues({
          facetId,
          numberOfValues: defaultNumberOfValuesIncrement,
        })
      );
      dispatch(options.fetchProductsActionCreator());
    },

    facetSearch: restOfFacetSearch,

    get state() {
      const selectedValueAncestry = findActiveValueAncestry(
        coreController.state.values
      );
      const activeValue = selectedValueAncestry.length
        ? selectedValueAncestry[selectedValueAncestry.length - 1]
        : undefined;
      const canShowLessValues = activeValue
        ? activeValue.children.length > defaultNumberOfValuesIncrement
        : false;
      const canShowMoreValues =
        activeValue?.moreValuesAvailable ??
        coreController.state.canShowMoreValues ??
        false;
      const hasActiveValues = !!activeValue;

      return {
        ...coreController.state,
        activeValue,
        canShowLessValues,
        canShowMoreValues,
        hasActiveValues,
        selectedValueAncestry,
        facetSearch: facetSearchStateSelector(engine[stateKey]),
      };
    },

    type: 'hierarchical',
  };
}
