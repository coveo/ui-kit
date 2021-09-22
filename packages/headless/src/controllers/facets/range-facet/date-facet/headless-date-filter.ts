import {SearchEngine} from '../../../../app/search-engine/search-engine';
import {
  ConfigurationSection,
  DateFacetSection,
  SearchSection,
} from '../../../../state/state-sections';
import {loadReducerError} from '../../../../utils/errors';
import {configuration, dateFacetSet, search} from '../../../../app/reducers';
import {DateFacetValue} from '../../../../features/facets/range-facets/date-facet-set/interfaces/response';
import {updateFacetOptions} from '../../../../features/facet-options/facet-options-actions';
import {executeSearch} from '../../../../features/search/search-actions';
import {
  logFacetClearAll,
  logFacetSelect,
} from '../../../../features/facets/facet-set/facet-set-analytics-actions';
import {updateDateFacetValues} from '../../../../features/facets/range-facets/date-facet-set/date-facet-actions';
import {
  buildCoreDateFilter,
  DateFilter,
  DateFilterInitialState,
  DateFilterOptions,
  DateFilterProps,
  DateFilterRange,
  DateFilterState,
} from '../../../core/facets/range-facet/date-facet/headless-core-date-filter';

export {
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
      const facetValue: DateFacetValue = {
        ...range,
        state: 'selected',
        numberOfResults: 0,
        endInclusive: true,
      };

      const updateFacetValuesAction = updateDateFacetValues({
        facetId: getFacetId(),
        values: [facetValue],
      });

      if (updateFacetValuesAction.error) {
        return false;
      }

      dispatch(updateFacetValuesAction);
      dispatch(updateFacetOptions({freezeFacetOrder: true}));
      dispatch(
        executeSearch(
          logFacetSelect({
            facetId: getFacetId(),
            facetValue: `${facetValue.start}..${facetValue.end}`,
          })
        )
      );
      return true;
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
