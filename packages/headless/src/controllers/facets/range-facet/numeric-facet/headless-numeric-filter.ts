import {configuration} from '../../../../app/common-reducers.js';
import type {SearchEngine} from '../../../../app/search-engine/search-engine.js';
import {
  facetClearAll,
  facetSelect,
  logFacetClearAll,
  logFacetSelect,
} from '../../../../features/facets/facet-set/facet-set-analytics-actions.js';
import {numericFacetSetReducer as numericFacetSet} from '../../../../features/facets/range-facets/numeric-facet-set/numeric-facet-set-slice.js';
import {executeSearch} from '../../../../features/search/search-actions.js';
import {searchReducer as search} from '../../../../features/search/search-slice.js';
import type {
  ConfigurationSection,
  NumericFacetSection,
  SearchSection,
} from '../../../../state/state-sections.js';
import {loadReducerError} from '../../../../utils/errors.js';
import {
  buildCoreNumericFilter,
  type NumericFilter,
  type NumericFilterInitialState,
  type NumericFilterOptions,
  type NumericFilterProps,
  type NumericFilterRange,
  type NumericFilterState,
} from '../../../core/facets/range-facet/numeric-facet/headless-core-numeric-filter.js';

export type {
  NumericFilterOptions,
  NumericFilterInitialState,
  NumericFilterRange,
  NumericFilterProps,
  NumericFilterState,
  NumericFilter,
};

/**
 * Creates a `NumericFilter` controller instance.
 * @param engine - The headless engine.
 * @param props - The configurable `NumericFilter` controller properties.
 * @returns A `NumericFilter` controller instance.
 *
 * @group Controllers
 * @category NumericFilter
 */
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

function loadNumericFilterReducer(
  engine: SearchEngine
): engine is SearchEngine<
  NumericFacetSection & ConfigurationSection & SearchSection
> {
  engine.addReducers({numericFacetSet, configuration, search});
  return true;
}
