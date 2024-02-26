import {CommerceEngine} from '../../../../../app/commerce-engine/commerce-engine';
import {toggleSelectCommerceCategoryFacetValue} from '../../../../../features/commerce/facets/facet-set/facet-set-actions';
import {CommerceCategoryFacetValueRequest} from '../../../../../features/commerce/facets/facet-set/interfaces/request';
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
  state: CoreCommerceFacetState<CommerceCategoryFacetValue> & {
    activeValue?: CommerceCategoryFacetValue;
    canShowLessValues: boolean;
    canShowMoreValues: boolean;
    hasActiveValues: boolean;
    selectedValueAncestry: CommerceCategoryFacetValue[];
  };
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
      toggleSelectActionCreator: toggleSelectCommerceCategoryFacetValue,
    },
  });
  const {
    deselectAll,
    isValueSelected,
    showLessValues,
    showMoreValues,
    subscribe,
    toggleSelect,
  } = coreController;

  return {
    deselectAll,
    isValueSelected,
    showLessValues,
    showMoreValues,
    subscribe,
    toggleSelect,
    get state() {
      const selectedValueAncestry = findActiveValueAncestry(
        coreController.state.values
      );
      const activeValue = selectedValueAncestry.length
        ? selectedValueAncestry[selectedValueAncestry.length - 1]
        : undefined;
      const canShowLessValues = activeValue
        ? activeValue.children.length > 1
        : coreController.state.canShowLessValues;
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
