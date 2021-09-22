import {SearchEngine} from '../../../../app/search-engine/search-engine';
import {
  ConfigurationSection,
  NumericFacetSection,
  SearchSection,
} from '../../../../state/state-sections';
import {loadReducerError} from '../../../../utils/errors';
import {configuration, numericFacetSet, search} from '../../../../app/reducers';
import {NumericFacetValue} from '../../../../features/facets/range-facets/numeric-facet-set/interfaces/response';
import {updateFacetOptions} from '../../../../features/facet-options/facet-options-actions';
import {executeSearch} from '../../../../features/search/search-actions';
import {
  logFacetClearAll,
  logFacetSelect,
} from '../../../../features/facets/facet-set/facet-set-analytics-actions';
import {updateNumericFacetValues} from '../../../../features/facets/range-facets/numeric-facet-set/numeric-facet-actions';

import {
  NumericFilterOptions,
  NumericFilterInitialState,
  NumericFilterRange,
  NumericFilterProps,
  NumericFilterState,
  NumericFilter,
  buildCoreNumericFilter,
} from '../../../core/facets/range-facet/numeric-facet/headless-core-numeric-filter';

export {
  NumericFilterOptions,
  NumericFilterInitialState,
  NumericFilterRange,
  NumericFilterProps,
  NumericFilterState,
  NumericFilter,
};

export function buildNumericFilter(
  engine: SearchEngine,
  props: NumericFilterProps
): NumericFilter {
  if (!loadNumericFilterReducer(engine)) {
    throw loadReducerError;
  }

  const coreController = buildCoreNumericFilter(engine, props);
  const {dispatch} = engine;
  const getFacetId = () => coreController.state.facetId;

  return {
    ...coreController,
    clear: () => {
      coreController.clear();
      dispatch(executeSearch(logFacetClearAll(getFacetId())));
    },
    setRange: (range) => {
      const facetValue: NumericFacetValue = {
        ...range,
        state: 'selected',
        numberOfResults: 0,
        endInclusive: true,
      };

      const updateFacetValuesAction = updateNumericFacetValues({
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

function loadNumericFilterReducer(
  engine: SearchEngine
): engine is SearchEngine<
  NumericFacetSection & ConfigurationSection & SearchSection
> {
  engine.addReducers({numericFacetSet, configuration, search});
  return true;
}
