import {
  ProductListingEngine,
  SortCriterion,
  NumericFacetValue,
  DateFacetValue,
} from '@coveo/headless/product-listing';
import {
  FacetInfo,
  FacetStore,
  FacetValueFormat,
} from '../../common/facets/facet-common-store';
import {
  createAtomicCommonStore,
  AtomicCommonStoreData,
  AtomicCommonStore,
} from '../../common/interface/store';

export interface SortDropdownOption {
  expression: string;
  criteria: SortCriterion[];
  label: string;
}

export interface AtomicProductListingStoreData extends AtomicCommonStoreData {
  facets: FacetStore<FacetInfo>;
  numericFacets: FacetStore<FacetInfo & FacetValueFormat<NumericFacetValue>>;
  dateFacets: FacetStore<FacetInfo & FacetValueFormat<DateFacetValue>>;
  categoryFacets: FacetStore<FacetInfo>;
  url: string;
}

export interface AtomicProductListingStore
  extends AtomicCommonStore<AtomicProductListingStoreData> {
  getFieldsToInclude(): string[];
}

export function createAtomicProductListingStore(): AtomicProductListingStore {
  const commonStore = createAtomicCommonStore<AtomicProductListingStoreData>({
    loadingFlags: [],
    facets: {},
    numericFacets: {},
    dateFacets: {},
    categoryFacets: {},
    facetElements: [],
    iconAssetsPath: '',
    fieldsToInclude: [],
    url: '',
  });

  return {
    ...commonStore,
    getUniqueIDFromEngine(engine: ProductListingEngine): string {
      return engine.state.productListing.responseId;
    },
  };
}
