import {configuration} from '../../../../app/common-reducers.js';
import type {FrankensteinEngine} from '../../../../app/frankenstein-engine/frankenstein-engine.js';
import {ensureSearchEngine} from '../../../../app/frankenstein-engine/frankenstein-engine-utils.js';
import type {SearchEngine} from '../../../../app/search-engine/search-engine.js';
import {
  facetClearAll,
  logFacetClearAll,
  logFacetUpdateSort,
} from '../../../../features/facets/facet-set/facet-set-analytics-actions.js';
import type {RangeFacetSortCriterion} from '../../../../features/facets/range-facets/generic/interfaces/request.js';
import {
  getAnalyticsActionForToggleFacetSelect,
  getLegacyAnalyticsActionForToggleRangeFacetSelect,
} from '../../../../features/facets/range-facets/generic/range-facet-utils.js';
import type {NumericRangeRequest} from '../../../../features/facets/range-facets/numeric-facet-set/interfaces/request.js';
import type {NumericFacetValue} from '../../../../features/facets/range-facets/numeric-facet-set/interfaces/response.js';
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
  buildCoreNumericFacet,
  buildNumericRange,
  type NumericFacet,
  type NumericFacetOptions,
  type NumericFacetProps,
  type NumericFacetState,
  type NumericRangeOptions,
} from '../../../core/facets/range-facet/numeric-facet/headless-core-numeric-facet.js';

export type {
  NumericFacet,
  NumericFacetOptions,
  NumericFacetProps,
  NumericFacetState,
  NumericFacetValue,
  NumericRangeOptions,
  NumericRangeRequest,
};
export {buildNumericRange};

/**
 * Creates a `NumericFacet` controller instance.
 *
 * @param engine - The headless engine.
 * @param props - The configurable `NumericFacet` properties.
 * @returns A `NumericFacet` controller instance.
 *
 * @group Controllers
 * @category NumericFacet
 */
export function buildNumericFacet(
  engine: SearchEngine | FrankensteinEngine,
  props: NumericFacetProps
): NumericFacet {
  const searchEngine = ensureSearchEngine(engine);
  if (!loadNumericFacetReducers(searchEngine)) {
    throw loadReducerError;
  }

  const coreController = buildCoreNumericFacet(searchEngine, props);
  const dispatch = searchEngine.dispatch;
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

    sortBy(criterion: RangeFacetSortCriterion) {
      coreController.sortBy(criterion);
      dispatch(
        executeSearch({
          legacy: logFacetUpdateSort({facetId: getFacetId(), criterion}),
        })
      );
    },

    toggleSelect: (selection: NumericFacetValue) => {
      coreController.toggleSelect(selection);
      dispatch(
        executeSearch({
          legacy: getLegacyAnalyticsActionForToggleRangeFacetSelect(
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

function loadNumericFacetReducers(
  engine: SearchEngine
): engine is SearchEngine<
  NumericFacetSection & ConfigurationSection & SearchSection
> {
  engine.addReducers({numericFacetSet, configuration, search});
  return true;
}
