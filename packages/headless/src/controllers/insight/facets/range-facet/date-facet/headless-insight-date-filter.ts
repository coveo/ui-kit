import {configuration} from '../../../../../app/common-reducers';
import {InsightEngine} from '../../../../../app/insight-engine/insight-engine';
import {
  logFacetClearAll,
  logFacetSelect,
} from '../../../../../features/facets/facet-set/facet-set-insight-analytics-actions';
import {dateFacetSetReducer as dateFacetSet} from '../../../../../features/facets/range-facets/date-facet-set/date-facet-set-slice';
import {executeSearch} from '../../../../../features/insight-search/insight-search-actions';
import {searchReducer as search} from '../../../../../features/search/search-slice';
import {
  ConfigurationSection,
  DateFacetSection,
  SearchSection,
} from '../../../../../state/state-sections';
import {loadReducerError} from '../../../../../utils/errors';
import {
  buildCoreDateFilter,
  DateFilter,
  DateFilterInitialState,
  DateFilterOptions,
  DateFilterProps,
  DateFilterRange,
  DateFilterState,
} from '../../../../core/facets/range-facet/date-facet/headless-core-date-filter';

export type {
  DateFilterOptions,
  DateFilterInitialState,
  DateFilterRange,
  DateFilterProps,
  DateFilterState,
  DateFilter,
};

/**
 * Creates an insight `DateFilter` controller instance.
 * @param engine - The insight engine.
 * @param props - The configurable `DateFilter` controller properties.
 * @returns A `DateFilter` controller instance.
 */
export function buildDateFilter(
  engine: InsightEngine,
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
  engine: InsightEngine
): engine is InsightEngine<
  DateFacetSection & ConfigurationSection & SearchSection
> {
  engine.addReducers({dateFacetSet, configuration, search});
  return true;
}
