import type {SearchEngine} from '../../../../app/search-engine/search-engine.js';
import {
  facetClearAll,
  logFacetClearAll,
  logFacetUpdateSort,
} from '../../../../features/facets/facet-set/facet-set-analytics-actions.js';
import type {DateRangeRequest} from '../../../../features/facets/range-facets/date-facet-set/interfaces/request.js';
import type {DateFacetValue} from '../../../../features/facets/range-facets/date-facet-set/interfaces/response.js';
import type {RangeFacetSortCriterion} from '../../../../features/facets/range-facets/generic/interfaces/request.js';
import {
  getAnalyticsActionForToggleFacetSelect,
  getLegacyAnalyticsActionForToggleRangeFacetExclude,
  getLegacyAnalyticsActionForToggleRangeFacetSelect,
} from '../../../../features/facets/range-facets/generic/range-facet-utils.js';
import {executeSearch} from '../../../../features/search/search-actions.js';
import {
  buildCoreDateFacet,
  buildDateRange,
  type DateFacet,
  type DateFacetProps,
  type DateFacetState,
  type DateRangeInput,
  type DateRangeOptions,
} from '../../../core/facets/range-facet/date-facet/headless-core-date-facet.js';
import type {DateFacetOptions} from '../../../core/facets/range-facet/date-facet/headless-date-facet-options.js';

export type {
  DateFacetOptions,
  DateRangeInput,
  DateRangeOptions,
  DateRangeRequest,
  DateFacetProps,
  DateFacet,
  DateFacetState,
};
export {buildDateRange};

/**
 * Creates a `DateFacet` controller instance.
 *
 * @param engine - The headless engine.
 * @param props - The configurable `DateFacet` controller properties.
 * @returns A `DateFacet` controller instance.
 *
 * @group Controllers
 * @category DateFacet
 */
export function buildDateFacet(
  engine: SearchEngine,
  props: DateFacetProps
): DateFacet {
  const coreController = buildCoreDateFacet(engine, props);
  const dispatch = engine.dispatch;
  const getFacetId = () => coreController.state.facetId;

  return {
    ...coreController,

    deselectAll() {
      coreController.deselectAll();
      dispatch(
        executeSearch({
          legacy: logFacetClearAll(getFacetId()),
          next: facetClearAll(),
        })
      );
    },

    sortBy(criterion: RangeFacetSortCriterion) {
      coreController.sortBy(criterion);
      dispatch(
        executeSearch({
          legacy: logFacetUpdateSort({facetId: getFacetId(), criterion}),
        })
      );
    },

    toggleSelect: (selection: DateFacetValue) => {
      coreController.toggleSelect(selection);
      dispatch(
        executeSearch({
          legacy: getLegacyAnalyticsActionForToggleRangeFacetSelect(
            getFacetId(),
            selection
          ),
          next: getAnalyticsActionForToggleFacetSelect(selection),
        })
      );
    },

    toggleExclude: (selection: DateFacetValue) => {
      coreController.toggleExclude(selection);
      dispatch(
        executeSearch({
          legacy: getLegacyAnalyticsActionForToggleRangeFacetExclude(
            getFacetId(),
            selection
          ),
        })
      );
    },

    get state() {
      return coreController.state;
    },
  };
}
