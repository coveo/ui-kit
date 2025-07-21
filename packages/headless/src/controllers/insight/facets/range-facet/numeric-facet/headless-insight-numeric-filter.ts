import type {InsightEngine} from '../../../../../app/insight-engine/insight-engine.js';
import {
  facetClearAll,
  facetSelect,
} from '../../../../../features/facets/facet-set/facet-set-analytics-actions.js';
import {
  logFacetClearAll,
  logFacetSelect,
} from '../../../../../features/facets/facet-set/facet-set-insight-analytics-actions.js';
import {executeSearch} from '../../../../../features/insight-search/insight-search-actions.js';
import {
  buildCoreNumericFilter,
  type NumericFilter,
  type NumericFilterInitialState,
  type NumericFilterOptions,
  type NumericFilterProps,
  type NumericFilterRange,
  type NumericFilterState,
} from '../../../../core/facets/range-facet/numeric-facet/headless-core-numeric-filter.js';

export type {
  NumericFilterOptions,
  NumericFilterInitialState,
  NumericFilterRange,
  NumericFilterProps,
  NumericFilterState,
  NumericFilter,
};

/**
 * Creates an insight `NumericFilter` controller instance.
 * @param engine - The insight engine.
 * @param props - The configurable `NumericFilter` controller properties.
 * @returns A `NumericFilter` controller instance.
 *
 * @group Controllers
 * @category NumericFilter
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
