import {
  NumericFilterOptions,
  NumericFilterInitialState,
  NumericFilterRange,
  NumericFilterProps,
  NumericFilterState,
  NumericFilter,
  buildCoreNumericFilter,
} from '../../../../core/facets/range-facet/numeric-facet/headless-core-numeric-filter';
import {InsightEngine} from '../../../../../app/insight-engine/insight-engine';
import {
  logFacetClearAll,
  logFacetSelect,
} from '../../../../../features/facets/facet-set/facet-set-insight-analytics-actions';
import {executeSearch} from '../../../../../features/insight-search/insight-search-actions';

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
 */
export function buildNumericFilter(
  engine: InsightEngine,
  props: NumericFilterProps
): NumericFilter {
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
