import {CommerceEngine} from '../../../../../app/commerce-engine/commerce-engine';
import {
  toggleExcludeDateFacetValue,
  toggleSelectDateFacetValue,
} from '../../../../../features/facets/range-facets/date-facet-set/date-facet-actions';
import {
  CoreCommerceFacet,
  CoreCommerceFacetOptions,
  CoreCommerceFacetState,
  DateFacetValue,
  DateRangeRequest,
  buildCoreCommerceFacet,
} from '../headless-core-commerce-facet';

export type DateFacetOptions = Omit<
  CoreCommerceFacetOptions,
  'toggleSelectActionCreator' | 'toggleExcludeActionCreator'
>;

export type DateFacetState = CoreCommerceFacetState<DateFacetValue>;

/**
 * The `DateFacet` controller offers a high-level programming interface for implementing date commerce
 * facet UI component.
 */
export type DateFacet = CoreCommerceFacet<
  DateRangeRequest,
  DateFacetValue,
  DateFacetState
>;

/**
 * @internal
 *
 * **Important:** This initializer is meant for internal use by headless only.
 * As an implementer, you must not import or use this initializer directly in your code.
 * You will instead interact with `DateFacet` controller instances through the state of a `FacetGenerator`
 * controller.
 *
 * @param engine - The headless commerce engine.
 * @param options - The `DateFacet` options used internally.
 * @returns A `DateFacet` controller instance.
 */
export function buildCommerceDateFacet(
  engine: CommerceEngine,
  options: DateFacetOptions
): DateFacet {
  return buildCoreCommerceFacet<
    DateRangeRequest,
    DateFacetValue,
    DateFacetState
  >(engine, {
    options: {
      ...options,
      toggleSelectActionCreator: toggleSelectDateFacetValue,
      toggleExcludeActionCreator: toggleExcludeDateFacetValue,
    },
  });
}
