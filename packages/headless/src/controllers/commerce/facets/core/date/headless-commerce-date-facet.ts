import {CommerceEngine} from '../../../../../app/commerce-engine/commerce-engine';
import {
  toggleExcludeDateFacetValue,
  toggleSelectDateFacetValue,
} from '../../../../../features/facets/range-facets/date-facet-set/date-facet-actions';
import {
  CoreCommerceFacet,
  CoreCommerceFacetOptions,
  DateFacetValue,
  DateRangeRequest,
  buildCoreCommerceFacet,
} from '../headless-core-commerce-facet';

export type CommerceDateFacetOptions = Omit<
  CoreCommerceFacetOptions,
  'toggleSelectActionCreator' | 'toggleExcludeActionCreator'
>;

/**
 * The `CommerceDateFacet` controller offers a high-level programming interface for implementing date commerce
 * facet UI component.
 */
export type CommerceDateFacet = CoreCommerceFacet<
  DateRangeRequest,
  DateFacetValue
>;

/**
 * @internal
 *
 * **Important:** This initializer is meant for internal use by headless only.
 * As an implementer, you must not import or use this initializer directly in your code.
 * You will instead interact with `CommerceDateFacet` controller instances through the state of a `FacetGenerator`
 * controller.
 *
 * @param engine - The headless commerce engine.
 * @param options - The `CommerceDateFacet` options used internally.
 * @returns A `CommerceDateFacet` controller instance.
 */
export function buildCommerceDateFacet(
  engine: CommerceEngine,
  options: CommerceDateFacetOptions
): CommerceDateFacet {
  return buildCoreCommerceFacet<DateRangeRequest, DateFacetValue>(engine, {
    options: {
      ...options,
      toggleSelectActionCreator: toggleSelectDateFacetValue,
      toggleExcludeActionCreator: toggleExcludeDateFacetValue,
    },
  });
}
