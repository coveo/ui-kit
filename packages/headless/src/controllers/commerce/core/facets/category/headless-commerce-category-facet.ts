import {CommerceEngine} from '../../../../../app/commerce-engine/commerce-engine';
import {toggleSelectCommerceCategoryFacetValue} from '../../../../../features/commerce/facets/facet-set/facet-set-actions';
import {CommerceCategoryFacetValueRequest} from '../../../../../features/commerce/facets/facet-set/interfaces/request';
import {findActiveValueAncestry} from '../../../../../features/facets/category-facet-set/category-facet-utils';
import {
  CommerceCategoryFacetValue,
  CoreCommerceFacet,
  CoreCommerceFacetOptions,
  buildCoreCommerceFacet,
} from '../headless-core-commerce-facet';

export type CommerceCategoryFacetOptions = Omit<
  CoreCommerceFacetOptions,
  'toggleExcludeActionCreator' | 'toggleSelectActionCreator'
>;

export interface SelectedCategoryFacetValueWithAncestry {
  /**
   * The currently selected category facet value.
   */
  selected: CommerceCategoryFacetValue;
  /**
   * The ancestry tree of the currently selected category facet value.
   *
   * The first element is the root ancestor of the selected category facet value.
   *
   * The last element is the selected category facet value itself.
   */
  ancestry: CommerceCategoryFacetValue[];
}

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
> & {
  /**
   * The currently selected category facet value along with its ancestry tree.
   */
  selectedValueWithAncestry?: SelectedCategoryFacetValueWithAncestry;
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
    state,
    subscribe,
    toggleSelect,
  } = coreController;

  return {
    deselectAll,
    isValueSelected,
    showLessValues,
    showMoreValues,
    state,
    subscribe,
    toggleSelect,
    get canShowLessValues() {
      const selected = this.selectedValueWithAncestry?.selected;
      return selected
        ? selected.children.length >
            engine.state.commerceFacetSet[options.facetId].request
              .initialNumberOfValues!
        : coreController.canShowLessValues;
    },
    get canShowMoreValues() {
      const selected = this.selectedValueWithAncestry?.selected;

      return selected
        ? selected.moreValuesAvailable
        : coreController.canShowMoreValues;
    },
    get hasActiveValues() {
      return !!this.selectedValueWithAncestry;
    },
    get selectedValueWithAncestry() {
      const ancestry = this.state.values.length
        ? findActiveValueAncestry(this.state.values)
        : [];
      return ancestry.length
        ? {selected: ancestry[ancestry.length - 1], ancestry}
        : undefined;
    },
  };
}
