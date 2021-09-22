import {
  RangeFacetResponse,
  RangeFacetRequest,
} from '../../../features/facets/range-facets/generic/interfaces/range-facet';
import {
  logFacetUpdateSort,
  logFacetClearAll,
} from '../../../features/facets/facet-set/facet-set-analytics-actions';
import {executeSearch} from '../../../features/search/search-actions';
import {RangeFacetSortCriterion} from '../../../features/facets/range-facets/generic/interfaces/request';
import {
  ConfigurationSection,
  SearchSection,
} from '../../../state/state-sections';
import {SearchEngine} from '../../../app/search-engine/search-engine';
import {buildCoreRangeFacet} from '../../core/facets/range-facet/headless-core-range-facet';

import {
  RangeFacet,
  RangeFacetProps,
  assertRangeFacetOptions,
} from '../../core/facets/range-facet/headless-core-range-facet';

export {RangeFacet, RangeFacetProps, assertRangeFacetOptions};

export function buildRangeFacet<
  T extends RangeFacetRequest,
  R extends RangeFacetResponse
>(
  engine: SearchEngine<ConfigurationSection & SearchSection>,
  props: RangeFacetProps<T>
) {
  const facetId = props.facetId;
  const coreController = buildCoreRangeFacet<T, R>(engine, props);
  const dispatch = engine.dispatch;

  return {
    ...coreController,

    deselectAll() {
      coreController.deselectAll();
      dispatch(executeSearch(logFacetClearAll(facetId)));
    },

    sortBy(criterion: RangeFacetSortCriterion) {
      coreController.sortBy(criterion);
      dispatch(executeSearch(logFacetUpdateSort({facetId, criterion})));
    },

    get state() {
      return {
        ...coreController.state,
      };
    },
  };
}
