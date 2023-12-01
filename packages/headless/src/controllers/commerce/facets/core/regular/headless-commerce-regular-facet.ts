import {CommerceEngine} from '../../../../../app/commerce-engine/commerce-engine';
import {
  toggleExcludeFacetValue,
  toggleSelectFacetValue,
} from '../../../../../features/facets/facet-set/facet-set-actions';
import {
  CoreCommerceFacet,
  CoreCommerceFacetProps,
  CoreCommerceFacetState,
  RegularFacetValue,
  buildCoreCommerceFacet,
} from '../headless-core-commerce-facet';

/**
 * A scoped and simplified part of the headless state that is relevant to the `CommerceRegularFacet` controller.
 */
type CommerceRegularFacetState = Omit<CoreCommerceFacetState, 'values'> & {
  /**
   * The facet values.
   */
  values: RegularFacetValue[];
};

/**
 * The `CommerceRegularFacet` controller offers a high-level programming interface for implementing a regular commerce
 * facet UI component.
 */
export type CommerceRegularFacet = Pick<
  CoreCommerceFacet,
  'deselectAll' | 'showLessValues' | 'showMoreValues' | 'subscribe'
> & {
  /**
   * Toggles selection of the specified facet value.
   *
   * @param selection The facet value to select.
   */
  toggleSelect(selection: RegularFacetValue): void;
  /**
   * Toggles exclusion of the specified facet value.
   *
   * @param selection The facet value to exclude.
   */
  toggleExclude(selection: RegularFacetValue): void;
  /**
   * Toggles selection of the specified facet value, deselecting all others.
   *
   * @param selection The facet value to single select.
   */
  toggleSingleSelect(selection: RegularFacetValue): void;
  /**
   * Toggles exclusion of the specified facet value, deselecting all others.
   *
   * @param selection The facet value to single exclude.
   */
  toggleSingleExclude(selection: RegularFacetValue): void;
  /**
   * Whether the specified facet value is selected.
   *
   * @param value The facet value to evaluate.
   */
  isValueSelected(value: RegularFacetValue): boolean;
  /**
   * Whether the specified facet value is excluded.
   *
   * @param value The facet value to evaluate.
   */
  isValueExcluded(value: RegularFacetValue): boolean;
  /**
   * The state of this `CommerceRegularFacet` controller instance.
   */
  state: CommerceRegularFacetState;
};

export type CommerceRegularFacetBuilder = typeof buildCommerceRegularFacet;

/**
 * @internal
 *
 * **Important:** This initializer is meant for internal use by headless only.
 * As an implementer, you must not import or use this initializer directly in your code.
 * You will instead interact with `CommerceRegularFacet` controller instances through the state of a `FacetGenerator`
 * controller.
 *
 * @param engine The headless commerce engine.
 * @param props The configurable `CommerceRegularFacet` properties used internally.
 * @returns A `CommerceRegularFacet` controller instance.
 * */
export function buildCommerceRegularFacet(
  engine: CommerceEngine,
  props: CoreCommerceFacetProps
): CommerceRegularFacet {
  const coreController = buildCoreCommerceFacet(engine, {
    options: {
      ...props.options,
      toggleSelectActionCreator: toggleSelectFacetValue,
      toggleExcludeActionCreator: toggleExcludeFacetValue,
    },
  });

  return {
    ...coreController,

    toggleSelect: (selection: RegularFacetValue) => {
      coreController.toggleSelect(selection);
    },

    toggleExclude: (selection: RegularFacetValue) => {
      coreController.toggleExclude(selection);
    },

    toggleSingleSelect(selection: RegularFacetValue) {
      coreController.toggleSingleSelect(selection);
    },

    toggleSingleExclude(selection: RegularFacetValue) {
      coreController.toggleSingleExclude(selection);
    },

    isValueSelected(value: RegularFacetValue) {
      return coreController.isValueSelected(value);
    },

    isValueExcluded(value: RegularFacetValue) {
      return coreController.isValueExcluded(value);
    },

    get state() {
      return coreController.state as CommerceRegularFacetState;
    },
  };
}
