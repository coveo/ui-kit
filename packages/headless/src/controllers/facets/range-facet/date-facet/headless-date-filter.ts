import {SearchAnalyticsProvider} from '../../../../api/analytics/search-analytics';
import {configuration} from '../../../../app/common-reducers';
import {SearchEngine} from '../../../../app/search-engine/search-engine';
import {SearchPageEvents} from '../../../../features/analytics/search-action-cause';
import {
  logFacetClearAll,
  logFacetSelect,
} from '../../../../features/facets/facet-set/facet-set-analytics-actions';
import {dateFacetSetReducer as dateFacetSet} from '../../../../features/facets/range-facets/date-facet-set/date-facet-set-slice';
import {executeSearch} from '../../../../features/search/search-actions';
import {searchReducer as search} from '../../../../features/search/search-slice';
import {
  ConfigurationSection,
  DateFacetSection,
  SearchSection,
} from '../../../../state/state-sections';
import {loadReducerError} from '../../../../utils/errors';
import {
  buildCoreDateFilter,
  DateFilter,
  DateFilterInitialState,
  DateFilterOptions,
  DateFilterProps,
  DateFilterRange,
  DateFilterState,
} from '../../../core/facets/range-facet/date-facet/headless-core-date-filter';

export type {
  DateFilterOptions,
  DateFilterInitialState,
  DateFilterRange,
  DateFilterProps,
  DateFilterState,
  DateFilter,
};

/**
 * Creates a `DateFilter` controller instance.
 * @param engine - The headless engine.
 * @param props - The configurable `DateFilter` controller properties.
 * @returns A `DateFilter` controller instance.
 */
export function buildDateFilter(
  engine: SearchEngine,
  props: DateFilterProps
): DateFilter {
  if (!loadDateFilterReducer(engine)) {
    throw loadReducerError;
  }

  const coreController = buildCoreDateFilter(engine, props);
  const {dispatch} = engine;
  const getFacetId = () => coreController.state.facetId;

  return {
    ...coreController,
    clear: () => {
      coreController.clear();
      dispatch(executeSearch({legacy: logFacetClearAll(getFacetId())}));
    },
    setRange: (range) => {
      const success = coreController.setRange(range);
      if (success) {
        dispatch(
          executeSearch({
            legacy: logFacetSelect({
              facetId: getFacetId(),
              facetValue: `${range.start}..${range.end}`,
            }),
            next: {
              actionCause: SearchPageEvents.facetSelect,
              getEventExtraPayload: (state) =>
                new SearchAnalyticsProvider(() => state).getFacetMetadata(
                  getFacetId(),
                  `${range.start}..${range.end}`
                ),
            },
          })
        );
      }
      return success;
    },

    get state() {
      return {
        ...coreController.state,
      };
    },
  };
}

function loadDateFilterReducer(
  engine: SearchEngine
): engine is SearchEngine<
  DateFacetSection & ConfigurationSection & SearchSection
> {
  engine.addReducers({dateFacetSet, configuration, search});
  return true;
}
