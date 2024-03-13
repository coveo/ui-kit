import {CommerceEngine} from '../../../../../app/commerce-engine/commerce-engine';
import {CategoryFacetValueRequest} from '../../../../../features/commerce/facets/facet-set/interfaces/request';
import {
  defaultNumberOfValuesIncrement,
  toggleSelectCategoryFacetValue,
  updateCategoryFacetNumberOfValues,
} from '../../../../../features/facets/category-facet-set/category-facet-set-actions';
import {findActiveValueAncestry} from '../../../../../features/facets/category-facet-set/category-facet-utils';
import {
  CategoryFacetValue,
  CoreCommerceFacet,
  CoreCommerceFacetOptions,
  CoreCommerceFacetState,
  buildCoreCommerceFacet,
} from '../headless-core-commerce-facet';

export type CategoryFacetOptions = Omit<
  CoreCommerceFacetOptions,
  'toggleExcludeActionCreator' | 'toggleSelectActionCreator'
>;

export type CategoryFacetState = CoreCommerceFacetState<CategoryFacetValue> & {
  activeValue?: CategoryFacetValue;
  canShowLessValues: boolean;
  canShowMoreValues: boolean;
  hasActiveValues: boolean;
  selectedValueAncestry?: CategoryFacetValue[];
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
  | 'state'
> & {
  state: CategoryFacetState;
};

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

      engine.dispatch(
        updateCategoryFacetNumberOfValues({facetId, numberOfValues})
      );
      engine.dispatch(options.fetchResultsActionCreator());
    },

    showLessValues() {
      const {facetId} = options;

      engine.dispatch(
        updateCategoryFacetNumberOfValues({
          facetId,
          numberOfValues: defaultNumberOfValuesIncrement,
        })
      );
      engine.dispatch(options.fetchResultsActionCreator());
    },

    get state() {
      const selectedValueAncestry = findActiveValueAncestry(
        coreController.state.values
      );
      const activeValue = selectedValueAncestry.length
        ? selectedValueAncestry[selectedValueAncestry.length - 1]
        : undefined;
      const canShowLessValues = activeValue
        ? activeValue.children.length > 1
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
      };
    },
  };
}
