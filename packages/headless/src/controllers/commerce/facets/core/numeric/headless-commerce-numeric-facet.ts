import {CommerceEngine} from '../../../../../app/commerce-engine/commerce-engine';
import {
  toggleExcludeNumericFacetValue,
  toggleSelectNumericFacetValue,
} from '../../../../../features/facets/range-facets/numeric-facet-set/numeric-facet-actions';
import {
  CoreCommerceFacet,
  CoreCommerceFacetProps,
  CoreCommerceFacetState,
  NumericFacetValue,
  buildCoreCommerceFacet,
} from '../headless-core-commerce-facet';

/**
 * A scoped and simplified part of the headless state that is relevant to the `CommerceNumericFacet` controller.
 */
type CommerceNumericFacetState = Omit<CoreCommerceFacetState, 'values'> & {
  /**
   * The facet values.
   */
  values: NumericFacetValue[];
};

/**
 * The `CommerceNumericFacet` controller offers a high-level programming interface for implementing numeric commerce
 * facet UI component.
 */
export type CommerceNumericFacet = Pick<
  CoreCommerceFacet,
  'deselectAll' | 'showLessValues' | 'showMoreValues' | 'subscribe'
> & {
  /**
   * Toggles selection of the specified facet value.
   *
   * @param selection The facet value to select.
   */
  toggleSelect(selection: NumericFacetValue): void;
  /**
   * Toggles exclusion of the specified facet value.
   *
   * @param selection The facet value to exclude.
   */
  toggleExclude(selection: NumericFacetValue): void;
  /**
   * Toggles selection of the specified facet value, deselecting all others.
   *
   * @param selection The facet value to single select.
   */
  toggleSingleSelect(selection: NumericFacetValue): void;
  /**
   * Toggles exclusion of the specified facet value, deselecting all others.
   *
   * @param selection The facet value to single exclude.
   */
  toggleSingleExclude(selection: NumericFacetValue): void;
  /**
   * Whether the specified facet value is selected.
   *
   * @param value The facet value to evaluate.
   */
  isValueSelected(value: NumericFacetValue): boolean;
  /**
   * Whether the specified facet value is excluded.
   *
   * @param value The facet value to evaluate.
   */
  isValueExcluded(value: NumericFacetValue): boolean;
  /**
   * The state of this `CommerceNumericFacet` controller instance.
   */
  state: CommerceNumericFacetState;
};

export type CommerceNumericFacetBuilder = typeof buildCommerceNumericFacet;

/**
 * @internal
 *
 * **Important:** This initializer is meant for internal use by headless only.
 * As an implementer, you must not import or use this initializer directly in your code.
 * You will instead interact with `CommerceNumericFacet` controller instances through the state of a `FacetGenerator`
 * controller.
 *
 * @param engine The headless commerce engine.
 * @param props The configurable `CommerceNumericFacet` properties used internally.
 * @returns A `CommerceNumericFacet` controller instance.
 */
export function buildCommerceNumericFacet(
  engine: CommerceEngine,
  props: CoreCommerceFacetProps
): CommerceNumericFacet {
  const coreController = buildCoreCommerceFacet(engine, {
    options: {
      ...props.options,
      toggleSelectActionCreator: toggleSelectNumericFacetValue,
      toggleExcludeActionCreator: toggleExcludeNumericFacetValue,
    },
  });

  return {
    ...coreController,

    toggleSelect(selection: NumericFacetValue) {
      coreController.toggleSelect(selection);
    },

    toggleExclude(selection: NumericFacetValue) {
      coreController.toggleExclude(selection);
    },

    toggleSingleSelect(selection: NumericFacetValue) {
      coreController.toggleSingleSelect(selection);
    },

    toggleSingleExclude(selection: NumericFacetValue) {
      coreController.toggleSingleExclude(selection);
    },

    isValueSelected(value: NumericFacetValue) {
      return coreController.isValueSelected(value);
    },

    isValueExcluded(value: NumericFacetValue) {
      return coreController.isValueExcluded(value);
    },

    get state() {
      return coreController.state as CommerceNumericFacetState;
    },
  };
}
