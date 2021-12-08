import {SearchEngine} from '../../../../app/search-engine/search-engine';
import {
  ConfigurationSection,
  DateFacetSection,
  SearchSection,
} from '../../../../state/state-sections';
import {loadReducerError} from '../../../../utils/errors';
import {configuration, dateFacetSet, search} from '../../../../app/reducers';
import {executeSearch} from '../../../../features/search/search-actions';
import {
  logFacetClearAll,
  logFacetSelect,
} from '../../../../features/facets/facet-set/facet-set-analytics-actions';
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
      dispatch(executeSearch(logFacetClearAll(getFacetId())));
    },
    setRange: (range) => {
      const success = coreController.setRange(range);
      if (success) {
        dispatch(
          executeSearch(
            logFacetSelect({
              facetId: getFacetId(),
              facetValue: `${range.start}..${range.end}`,
            })
          )
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
