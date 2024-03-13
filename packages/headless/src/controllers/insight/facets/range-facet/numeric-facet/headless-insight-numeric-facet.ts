import {InsightEngine} from '../../../../../app/insight-engine/insight-engine';
import {
  logFacetClearAll,
  logFacetUpdateSort,
} from '../../../../../features/facets/facet-set/facet-set-insight-analytics-actions';
import {RangeFacetSortCriterion} from '../../../../../features/facets/range-facets/generic/interfaces/request';
import {getInsightAnalyticsActionForToggleRangeFacetSelect} from '../../../../../features/facets/range-facets/generic/range-facet-insight-utils';
import {NumericRangeRequest} from '../../../../../features/facets/range-facets/numeric-facet-set/interfaces/request';
import {NumericFacetValue} from '../../../../../features/facets/range-facets/numeric-facet-set/interfaces/response';
import {executeSearch} from '../../../../../features/insight-search/insight-search-actions';
import {
  buildCoreNumericFacet,
  buildNumericRange,
  NumericFacet,
  NumericFacetOptions,
  NumericFacetProps,
  NumericFacetState,
  NumericRangeOptions,
} from '../../../../core/facets/range-facet/numeric-facet/headless-core-numeric-facet';

export type {
  NumericRangeOptions,
  NumericRangeRequest,
  NumericFacetValue,
  NumericFacetOptions,
  NumericFacetProps,
  NumericFacet,
  NumericFacetState,
};
export {buildNumericRange};

/**
 * Creates an insight `NumericFacet` controller instance.
 *
 * @param engine - The insight engine.
 * @param props - The configurable `NumericFacet` properties.
 * @returns A `NumericFacet` controller instance.
 */
export function buildNumericFacet(
  engine: InsightEngine,
  props: NumericFacetProps
): NumericFacet {
  const coreController = buildCoreNumericFacet(engine, props);
  const dispatch = engine.dispatch;
  const getFacetId = () => coreController.state.facetId;

  return {
    ...coreController,

    deselectAll() {
      coreController.deselectAll();
      dispatch(executeSearch({legacy: logFacetClearAll(getFacetId())}));
    },

    sortBy(sortCriterion: RangeFacetSortCriterion) {
      coreController.sortBy(sortCriterion);
      dispatch(
        executeSearch({
          legacy: logFacetUpdateSort({facetId: getFacetId(), sortCriterion}),
        })
      );
    },

    toggleSelect: (selection: NumericFacetValue) => {
      coreController.toggleSelect(selection);
      dispatch(
        executeSearch({
          legacy: getInsightAnalyticsActionForToggleRangeFacetSelect(
            getFacetId(),
            selection
          ),
        })
      );
    },

    get state() {
      return {
        ...coreController.state,
      };
    },
  };
}
