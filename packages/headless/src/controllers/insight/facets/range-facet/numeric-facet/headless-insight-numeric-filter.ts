import {InsightEngine} from '../../../../../app/insight-engine/insight-engine';
import {
  facetClearAll,
  facetSelect,
} from '../../../../../features/facets/facet-set/facet-set-analytics-actions';
import {
  logFacetClearAll,
  logFacetSelect,
} from '../../../../../features/facets/facet-set/facet-set-insight-analytics-actions';
import {executeSearch} from '../../../../../features/insight-search/insight-search-actions';
import {
  NumericFilterOptions,
  NumericFilterInitialState,
  NumericFilterRange,
  NumericFilterProps,
  NumericFilterState,
  NumericFilter,
  buildCoreNumericFilter,
} from '../../../../core/facets/range-facet/numeric-facet/headless-core-numeric-filter';

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
