import {NumericRangeRequest} from '../../../../features/facets/range-facets/numeric-facet-set/interfaces/request';
import {NumericFacetValue} from '../../../../features/facets/range-facets/numeric-facet-set/interfaces/response';
import {
  ConfigurationSection,
  NumericFacetSection,
  SearchSection,
} from '../../../../state/state-sections';
import {configuration, numericFacetSet, search} from '../../../../app/reducers';
import {loadReducerError} from '../../../../utils/errors';
import {SearchEngine} from '../../../../app/search-engine/search-engine';
import {executeSearch} from '../../../../features/search/search-actions';
import {getAnalyticsActionForToggleRangeFacetSelect} from '../../../../features/facets/range-facets/generic/range-facet-utils';
import {
  buildCoreNumericFacet,
  buildNumericRange,
  NumericFacet,
  NumericFacetOptions,
  NumericFacetProps,
  NumericFacetState,
  NumericRangeOptions,
} from '../../../core/facets/range-facet/numeric-facet/headless-core-numeric-facet';

export {
  buildNumericRange,
  NumericRangeOptions,
  NumericRangeRequest,
  NumericFacetValue,
  NumericFacetOptions,
  NumericFacetProps,
  NumericFacet,
  NumericFacetState,
};

/**
 * Creates a `NumericFacet` controller instance.
 *
 * @param engine - The headless engine.
 * @param props - The configurable `NumericFacet` properties.
 * @returns A `NumericFacet` controller instance.
 */
export function buildNumericFacet(
  engine: SearchEngine,
  props: NumericFacetProps
): NumericFacet {
  if (!loadNumericFacetReducers(engine)) {
    throw loadReducerError;
  }

  const coreController = buildCoreNumericFacet(engine, props);
  const dispatch = engine.dispatch;
  const getFacetId = () => coreController.state.facetId;

  return {
    ...coreController,

    toggleSelect: (selection: NumericFacetValue) => {
      coreController.toggleSelect(selection);
      dispatch(
        executeSearch(
          getAnalyticsActionForToggleRangeFacetSelect(getFacetId(), selection)
        )
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
