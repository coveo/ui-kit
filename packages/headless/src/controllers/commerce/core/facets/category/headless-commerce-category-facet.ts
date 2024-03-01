import {CommerceEngine} from '../../../../../app/commerce-engine/commerce-engine';
import {CommerceCategoryFacetValueRequest} from '../../../../../features/commerce/facets/facet-set/interfaces/request';
import {
  toggleSelectCategoryFacetValue,
  updateCategoryFacetNumberOfValues,
} from '../../../../../features/facets/category-facet-set/category-facet-set-actions';
import {findActiveValueAncestry} from '../../../../../features/facets/category-facet-set/category-facet-utils';
import {
  CommerceCategoryFacetValue,
  CoreCommerceFacet,
  CoreCommerceFacetOptions,
  CoreCommerceFacetState,
  buildCoreCommerceFacet,
} from '../headless-core-commerce-facet';

export type CommerceCategoryFacetOptions = Omit<
  CoreCommerceFacetOptions,
  'toggleExcludeActionCreator' | 'toggleSelectActionCreator'
>;

export type CommerceCategoryFacetState =
  CoreCommerceFacetState<CommerceCategoryFacetValue> & {
    activeValue?: CommerceCategoryFacetValue;
    canShowLessValues: boolean;
    canShowMoreValues: boolean;
    hasActiveValues: boolean;
    selectedValueAncestry?: CommerceCategoryFacetValue[];
  };

/**
 * The `CommerceCategoryFacet` controller offers a high-level programming interface for implementing a category commerce
 * facet UI component.
 */
export type CommerceCategoryFacet = Omit<
  CoreCommerceFacet<
    CommerceCategoryFacetValueRequest,
    CommerceCategoryFacetValue
  >,
  | 'isValueExcluded'
  | 'toggleExclude'
  | 'toggleSingleExclude'
  | 'toggleSingleSelect'
  | 'state'
> & {
  state: CommerceCategoryFacetState;
};

/**
 * @internal
 *
 * **Important:** This initializer is meant for internal use by headless only.
 * As an implementer, you must not import or use this initializer directly in your code.
 * You will instead interact with `CommerceCategoryFacet` controller instances through the state of a `FacetGenerator`
 * controller.
 *
 * @param engine - The headless commerce engine.
 * @param options - The `CommerceCategoryFacet` options used internally.
 * @returns A `CommerceCategoryFacet` controller instance.
 * */
export function buildCommerceCategoryFacet(
  engine: CommerceEngine,
  options: CommerceCategoryFacetOptions
): CommerceCategoryFacet {
  const coreController = buildCoreCommerceFacet<
    CommerceCategoryFacetValueRequest,
    CommerceCategoryFacetValue
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
    showLessValues() {
      const {facetId} = options;

      engine.dispatch(
        updateCategoryFacetNumberOfValues({facetId, numberOfValues: 1})
      );
      engine.dispatch(options.fetchResultsActionCreator());
    },
    showMoreValues() {
      const {facetId} = options;
      const {activeValue, values} = this.state;
      const numberOfValues =
        (activeValue?.children.length ?? values.length) + 5;

      engine.dispatch(
        updateCategoryFacetNumberOfValues({facetId, numberOfValues})
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
        coreController.state.canShowMoreValues;
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
