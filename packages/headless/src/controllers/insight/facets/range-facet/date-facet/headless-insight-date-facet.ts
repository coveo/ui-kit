import type {InsightEngine} from '../../../../../app/insight-engine/insight-engine.js';
import {facetClearAll} from '../../../../../features/facets/facet-set/facet-set-analytics-actions.js';
import {
  logFacetClearAll,
  logFacetUpdateSort,
} from '../../../../../features/facets/facet-set/facet-set-insight-analytics-actions.js';
import type {DateRangeRequest} from '../../../../../features/facets/range-facets/date-facet-set/interfaces/request.js';
import type {DateFacetValue} from '../../../../../features/facets/range-facets/date-facet-set/interfaces/response.js';
import type {RangeFacetSortCriterion} from '../../../../../features/facets/range-facets/generic/interfaces/request.js';
import {getInsightAnalyticsActionForToggleRangeFacetSelect} from '../../../../../features/facets/range-facets/generic/range-facet-insight-utils.js';
import {getAnalyticsActionForToggleFacetSelect} from '../../../../../features/facets/range-facets/generic/range-facet-utils.js';
import {executeSearch} from '../../../../../features/insight-search/insight-search-actions.js';
import {
  buildCoreDateFacet,
  buildDateRange,
  type DateFacet,
  type DateFacetProps,
  type DateFacetState,
  type DateRangeInput,
  type DateRangeOptions,
} from '../../../../core/facets/range-facet/date-facet/headless-core-date-facet.js';
import type {DateFacetOptions} from '../../../../core/facets/range-facet/date-facet/headless-date-facet-options.js';

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
 * Creates an insight `DateFacet` controller instance.
 *
 * @param engine - The insight engine.
 * @param props - The configurable `DateFacet` controller properties.
 * @returns A `DateFacet` controller instance.
 *
 * @group Controllers
 * @category DateFacet
 */
export function buildDateFacet(
  engine: InsightEngine,
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

    sortBy(sortCriterion: RangeFacetSortCriterion) {
      coreController.sortBy(sortCriterion);
      dispatch(
        executeSearch({
          legacy: logFacetUpdateSort({facetId: getFacetId(), sortCriterion}),
        })
      );
    },

    toggleSelect: (selection: DateFacetValue) => {
      coreController.toggleSelect(selection);
      dispatch(
        executeSearch({
          legacy: getInsightAnalyticsActionForToggleRangeFacetSelect(
            getFacetId(),
            selection
          ),
          next: getAnalyticsActionForToggleFacetSelect(selection),
        })
      );
    },

    get state() {
      return coreController.state;
    },
  };
}
