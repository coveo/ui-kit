import {DateRangeRequest} from '../../../../../features/facets/range-facets/date-facet-set/interfaces/request';
import {DateFacetValue} from '../../../../../features/facets/range-facets/date-facet-set/interfaces/response';

import {DateFacetOptions} from '../../../../core/facets/range-facet/date-facet/headless-date-facet-options';
import {
  buildCoreDateFacet,
  buildDateRange,
  DateFacet,
  DateFacetProps,
  DateFacetState,
  DateRangeInput,
  DateRangeOptions,
} from '../../../../core/facets/range-facet/date-facet/headless-core-date-facet';
import {RangeFacetSortCriterion} from '../../../../../features/facets/range-facets/generic/interfaces/request';
import {InsightEngine} from '../../../../../app/insight-engine/insight-engine';
import {executeSearch} from '../../../../../features/insight-search/insight-search-actions';
import {
  logFacetClearAll,
  logFacetUpdateSort,
} from '../../../../../features/facets/facet-set/facet-set-insight-analytics-actions';
import {getInsightAnalyticsActionForToggleRangeFacetSelect} from '../../../../../features/facets/range-facets/generic/range-facet-insight-utils';

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
      dispatch(executeSearch(logFacetClearAll(getFacetId())));
    },

    sortBy(sortCriterion: RangeFacetSortCriterion) {
      coreController.sortBy(sortCriterion);
      dispatch(
        executeSearch(
          logFacetUpdateSort({facetId: getFacetId(), sortCriterion})
        )
      );
    },

    toggleSelect: (selection: DateFacetValue) => {
      coreController.toggleSelect(selection);
      dispatch(
        executeSearch(
          getInsightAnalyticsActionForToggleRangeFacetSelect(
            getFacetId(),
            selection
          )
        )
      );
    },

    get state() {
      return coreController.state;
    },
  };
}
