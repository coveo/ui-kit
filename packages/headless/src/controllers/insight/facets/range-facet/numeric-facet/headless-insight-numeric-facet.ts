import type {InsightEngine} from '../../../../../app/insight-engine/insight-engine.js';
import {facetClearAll} from '../../../../../features/facets/facet-set/facet-set-analytics-actions.js';
import {
  logFacetClearAll,
  logFacetUpdateSort,
} from '../../../../../features/facets/facet-set/facet-set-insight-analytics-actions.js';
import type {RangeFacetSortCriterion} from '../../../../../features/facets/range-facets/generic/interfaces/request.js';
import {getInsightAnalyticsActionForToggleRangeFacetSelect} from '../../../../../features/facets/range-facets/generic/range-facet-insight-utils.js';
import {getAnalyticsActionForToggleFacetSelect} from '../../../../../features/facets/range-facets/generic/range-facet-utils.js';
import type {NumericRangeRequest} from '../../../../../features/facets/range-facets/numeric-facet-set/interfaces/request.js';
import type {NumericFacetValue} from '../../../../../features/facets/range-facets/numeric-facet-set/interfaces/response.js';
import {executeSearch} from '../../../../../features/insight-search/insight-search-actions.js';
import {
  buildCoreNumericFacet,
  buildNumericRange,
  type NumericFacet,
  type NumericFacetOptions,
  type NumericFacetProps,
  type NumericFacetState,
  type NumericRangeOptions,
} from '../../../../core/facets/range-facet/numeric-facet/headless-core-numeric-facet.js';

export type {
  NumericRangeOptions,
  NumericRangeRequest,
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
 *
 * @group Controllers
 * @category NumericFacet
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
      dispatch(
        executeSearch({
          legacy: logFacetClearAll(getFacetId()),
          next: facetClearAll(),
        })
      );
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
          next: getAnalyticsActionForToggleFacetSelect(selection),
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
