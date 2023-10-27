import {CommerceEngine} from '../../../../../../app/commerce-engine/commerce-engine';
import {getAnalyticsActionForToggleProductListingRangeFacetSelect} from '../../../../../../features/commerce/facets/range-facets/commerce-range-facet-utils';
import {fetchProductListing} from '../../../../../../features/commerce/product-listing/product-listing-actions';
import {productListingV2Reducer as productListing} from '../../../../../../features/commerce/product-listing/product-listing-slice';
import {configurationReducer as configuration} from '../../../../../../features/configuration/configuration-slice';
import {logFacetClearAll} from '../../../../../../features/facets/facet-set/facet-set-product-listing-v2-analytics-actions';
import {dateFacetSetReducer as dateFacetSet} from '../../../../../../features/facets/range-facets/date-facet-set/date-facet-set-slice';
import {
  ConfigurationSection,
  DateFacetSection,
  ProductListingV2Section,
} from '../../../../../../state/state-sections';
import {loadReducerError} from '../../../../../../utils/errors';
import {
  DateFacet as CoreDateFacet,
  DateFacetOptions as CoreDateFacetOptions,
  DateFacetState as CoreDateFacetState,
  buildCoreDateFacet,
} from '../../../../../core/facets/range-facet/date-facet/headless-core-date-facet';

export type ProductListingDateFacet = Pick<
  CoreDateFacet,
  | 'deselectAll'
  | 'isValueSelected'
  | 'subscribe'
  | 'toggleExclude'
  | 'toggleSelect'
> & {state: ProductListingDateFacetState};

export type ProductListingDateFacetState = Pick<
  CoreDateFacetState,
  'facetId' | 'hasActiveValues' | 'isLoading' | 'values'
>;

export interface ProductListingDateFacetProps {
  options: ProductListingDateFacetOptions;
}

export type ProductListingDateFacetOptions = Pick<
  CoreDateFacetOptions,
  | 'currentValues'
  | 'facetId'
  | 'field'
  | 'generateAutomaticRanges'
  | 'numberOfValues'
>;

export function buildProductListingDateFacet(
  engine: CommerceEngine,
  props: ProductListingDateFacetProps
): ProductListingDateFacet {
  if (!loadProductListingDateFacetReducers(engine)) {
    throw loadReducerError;
  }

  const {dispatch} = engine;
  const coreController = buildCoreDateFacet(engine, props);
  const {
    disable,
    enable,
    isSortedBy,
    sortBy,
    toggleSingleSelect,
    ...restOfCoreController
  } = coreController;

  const getFacetId = (): string => coreController.state.facetId;

  return {
    ...restOfCoreController,

    toggleExclude(selection) {
      coreController.toggleExclude(selection);
      dispatch(fetchProductListing());
      dispatch(
        getAnalyticsActionForToggleProductListingRangeFacetSelect(
          getFacetId(),
          selection
        )
      );
    },

    toggleSelect(selection) {
      coreController.toggleSelect(selection);
      dispatch(fetchProductListing());
      dispatch(
        getAnalyticsActionForToggleProductListingRangeFacetSelect(
          getFacetId(),
          selection
        )
      );
    },

    deselectAll() {
      coreController.deselectAll();
      dispatch(fetchProductListing()).then(() => {
        dispatch(logFacetClearAll(getFacetId()));
      });
    },

    get state() {
      const {enabled, sortCriterion, ...state} = coreController.state;
      return state;
    },
  };
}

function loadProductListingDateFacetReducers(
  engine: CommerceEngine
): engine is CommerceEngine<
  ConfigurationSection & DateFacetSection & ProductListingV2Section
> {
  engine.addReducers({
    configuration,
    productListing,
    dateFacetSet,
  });
  return true;
}
