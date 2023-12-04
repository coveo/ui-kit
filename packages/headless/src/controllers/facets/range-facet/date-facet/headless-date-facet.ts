import {SearchAnalyticsProvider} from '../../../../api/analytics/search-analytics';
import {SearchEngine} from '../../../../app/search-engine/search-engine';
import {SearchPageEvents} from '../../../../features/analytics/search-action-cause';
import {
  logFacetClearAll,
  logFacetUpdateSort,
} from '../../../../features/facets/facet-set/facet-set-analytics-actions';
import {DateRangeRequest} from '../../../../features/facets/range-facets/date-facet-set/interfaces/request';
import {DateFacetValue} from '../../../../features/facets/range-facets/date-facet-set/interfaces/response';
import {RangeFacetSortCriterion} from '../../../../features/facets/range-facets/generic/interfaces/request';
import {
  getLegacyAnalyticsActionForToggleRangeFacetExclude,
  getLegacyAnalyticsActionForToggleRangeFacetSelect,
  getAnalyticsActionForToggleFacetSelect,
} from '../../../../features/facets/range-facets/generic/range-facet-utils';
import {executeSearch} from '../../../../features/search/search-actions';
import {
  buildCoreDateFacet,
  buildDateRange,
  DateFacet,
  DateFacetProps,
  DateFacetState,
  DateRangeInput,
  DateRangeOptions,
} from '../../../core/facets/range-facet/date-facet/headless-core-date-facet';
import {DateFacetOptions} from '../../../core/facets/range-facet/date-facet/headless-date-facet-options';

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
          next: {
            actionCause: SearchPageEvents.facetClearAll,
            getEventExtraPayload: (state) =>
              new SearchAnalyticsProvider(() => state).getFacetClearAllMetadata(
                getFacetId()
              ),
          },
        })
      );
    },

    sortBy(criterion: RangeFacetSortCriterion) {
      coreController.sortBy(criterion);
      dispatch(
        executeSearch({
          legacy: logFacetUpdateSort({facetId: getFacetId(), criterion}),
          next: {
            actionCause: SearchPageEvents.facetUpdateSort,
            getEventExtraPayload: (state) =>
              new SearchAnalyticsProvider(() => state).getFacetSortMetadata(
                getFacetId(),
                criterion
              ),
          },
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
          next: getAnalyticsActionForToggleFacetSelect(getFacetId(), selection),
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
