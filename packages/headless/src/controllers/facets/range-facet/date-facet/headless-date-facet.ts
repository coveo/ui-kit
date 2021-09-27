import {DateRangeRequest} from '../../../../features/facets/range-facets/date-facet-set/interfaces/request';
import {DateFacetValue} from '../../../../features/facets/range-facets/date-facet-set/interfaces/response';

import {SearchEngine} from '../../../../app/search-engine/search-engine';
import {executeSearch} from '../../../../features/search/search-actions';
import {getAnalyticsActionForToggleRangeFacetSelect} from '../../../../features/facets/range-facets/generic/range-facet-utils';
import {DateFacetOptions} from '../../../core/facets/range-facet/date-facet/headless-date-facet-options';
import {
  buildCoreDateFacet,
  buildDateRange,
  DateFacet,
  DateFacetProps,
  DateFacetState,
  DateRangeInput,
  DateRangeOptions,
} from '../../../core/facets/range-facet/date-facet/headless-core-date-facet';
import {
  logFacetClearAll,
  logFacetUpdateSort,
} from '../../../../features/facets/facet-set/facet-set-analytics-actions';
import {RangeFacetSortCriterion} from '../../../../features/facets/range-facets/generic/interfaces/request';

export {
  DateFacetOptions,
  DateRangeInput,
  DateRangeOptions,
  DateRangeRequest,
  buildDateRange,
  DateFacetProps,
  DateFacet,
  DateFacetState,
};

/**
 * Creates a `DateFacet` controller instance.
 *
 * @param engine - The headless engine.
 * @param props - The configurable `DateFacet` controller properties.
 * @returns A `DateFacet` controller instance.
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
      dispatch(executeSearch(logFacetClearAll(getFacetId())));
    },

    sortBy(criterion: RangeFacetSortCriterion) {
      coreController.sortBy(criterion);
      dispatch(
        executeSearch(logFacetUpdateSort({facetId: getFacetId(), criterion}))
      );
    },

    toggleSelect: (selection: DateFacetValue) => {
      coreController.toggleSelect(selection);
      dispatch(
        executeSearch(
          getAnalyticsActionForToggleRangeFacetSelect(getFacetId(), selection)
        )
      );
    },

    get state() {
      return coreController.state;
    },
  };
}
