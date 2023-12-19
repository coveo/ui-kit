import {CommerceEngine} from '../../../../../app/commerce-engine/commerce-engine';
import {toggleSelectCommerceCategoryFacetValue} from '../../../../../features/commerce/facets/facet-set/facet-set-actions';
import {CommerceCategoryFacetValueRequest} from '../../../../../features/commerce/facets/facet-set/interfaces/request';
import {
  CategoryFacetValue,
  CoreCommerceFacet,
  CoreCommerceFacetOptions,
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
  CoreCommerceFacet<CommerceCategoryFacetValueRequest, CategoryFacetValue>,
  | 'isValueExcluded'
  | 'toggleExclude'
  | 'toggleSingleExclude'
  | 'toggleSingleSelect'
>;

/**
 * @internal
 *
 * **Important:** This initializer is meant for internal use by headless only.
 * As an implementer, you must not import or use this initializer directly in your code.
 * You will instead interact with `CommerceCategoryFacet` controller instances through the state of a `FacetGenerator`
 * controller.
 *
 * @param engine - The headless commerce engine.
 * @param props - The `CommerceCategoryFacet` options used internally.
 * @returns A `CommerceCategoryFacet` controller instance.
 * */
export function buildCommerceCategoryFacet(
  engine: CommerceEngine,
  options: CommerceCategoryFacetOptions
): CommerceCategoryFacet {
  const {
    deselectAll,
    isValueSelected,
    showLessValues,
    showMoreValues,
    state,
    subscribe,
    toggleSelect,
  } = buildCoreCommerceFacet<
    CommerceCategoryFacetValueRequest,
    CategoryFacetValue
  >(engine, {
    options: {
      ...options,
      toggleSelectActionCreator: toggleSelectCommerceCategoryFacetValue,
    },
  });
  return {
    deselectAll,
    isValueSelected,
    showLessValues,
    showMoreValues,
    state,
    subscribe,
    toggleSelect,
  };
}
