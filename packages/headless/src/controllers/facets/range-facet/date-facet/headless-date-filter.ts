import {configuration} from '../../../../app/common-reducers.js';
import type {SearchEngine} from '../../../../app/search-engine/search-engine.js';
import {
  facetClearAll,
  facetSelect,
  logFacetClearAll,
  logFacetSelect,
} from '../../../../features/facets/facet-set/facet-set-analytics-actions.js';
import {dateFacetSetReducer as dateFacetSet} from '../../../../features/facets/range-facets/date-facet-set/date-facet-set-slice.js';
import {executeSearch} from '../../../../features/search/search-actions.js';
import {searchReducer as search} from '../../../../features/search/search-slice.js';
import type {
  ConfigurationSection,
  DateFacetSection,
  SearchSection,
} from '../../../../state/state-sections.js';
import {loadReducerError} from '../../../../utils/errors.js';
import {
  buildCoreDateFilter,
  type DateFilter,
  type DateFilterInitialState,
  type DateFilterOptions,
  type DateFilterProps,
  type DateFilterRange,
  type DateFilterState,
} from '../../../core/facets/range-facet/date-facet/headless-core-date-filter.js';

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
 *
 * @group Controllers
 * @category DateFilter
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
      dispatch(
        executeSearch({
          legacy: logFacetClearAll(getFacetId()),
          next: facetClearAll(),
        })
      );
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
            next: facetSelect(),
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
