import {CommerceEngine} from '../../../../app/commerce-engine/commerce-engine';
import {facetsReducer as commerceFacets} from '../../../../features/commerce/facets/facets-slice';
import {fetchProductListing} from '../../../../features/commerce/product-listing/product-listing-actions';
import {
  logFacetClearAll,
  logFacetShowLess,
  logFacetShowMore,
} from '../../../../features/facets/facet-set/facet-set-product-listing-analytics-actions';
import {
  getProductListingAnalyticsActionForToggleFacetExclude,
  getProductListingAnalyticsActionForToggleFacetSelect,
} from '../../../../features/facets/facet-set/facet-set-product-listing-utils';
import {facetSetReducer as facetSet} from '../../../../features/facets/facet-set/facet-set-slice';
import {
  CommerceFacetSection,
  FacetSection,
} from '../../../../state/state-sections';
import {loadReducerError} from '../../../../utils/errors';
import {
  buildCoreFacet,
  CoreFacet,
  CoreFacetState,
  FacetValue,
} from '../../../core/facets/facet/headless-core-facet';

export type Facet = Omit<
  CoreFacet,
  'sortBy' | 'isSortedBy' | 'enable' | 'disable' | 'state'
> & {
  state: FacetState;
};

export type FacetState = Omit<
  CoreFacetState,
  'enabled' | 'sortCriterion' | 'isLoading'
>;

export interface FacetProps {
  options: FacetOptions;
}

export interface FacetOptions {
  facetId: string;
  field: string;
}

export function buildFacet(engine: CommerceEngine, props: FacetProps): Facet {
  if (!loadFacetReducers(engine)) {
    throw loadReducerError;
  }

  const {dispatch} = engine;
  const coreController = buildCoreFacet(engine, props);
  const {sortBy, isSortedBy, ...restOfCoreController} = coreController;
  const getFacetId = () => coreController.state.facetId;

  return {
    ...restOfCoreController,

    toggleSelect: (selection: FacetValue) => {
      coreController.toggleSelect(selection);
      dispatch(fetchProductListing());
      dispatch(
        getProductListingAnalyticsActionForToggleFacetSelect(
          getFacetId(),
          selection
        )
      );
    },

    toggleExclude: (selection: FacetValue) => {
      coreController.toggleExclude(selection);
      dispatch(fetchProductListing());
      dispatch(
        getProductListingAnalyticsActionForToggleFacetExclude(
          getFacetId(),
          selection
        )
      );
    },

    deselectAll() {
      coreController.deselectAll();
      dispatch(fetchProductListing());
      dispatch(logFacetClearAll(getFacetId()));
    },

    showMoreValues() {
      coreController.showMoreValues();
      dispatch(fetchProductListing()).then(() =>
        dispatch(logFacetShowMore(getFacetId()))
      );
    },

    showLessValues() {
      coreController.showLessValues();
      dispatch(fetchProductListing()).then(() =>
        dispatch(logFacetShowLess(getFacetId()))
      );
    },

    get state() {
      const {isLoading, enabled, sortCriterion, ...state} =
        coreController.state;
      return state;
    },
  };
}

function loadFacetReducers(
  engine: CommerceEngine
): engine is CommerceEngine<FacetSection & CommerceFacetSection> {
  engine.addReducers({facetSet, commerceFacets});
  return true;
}
