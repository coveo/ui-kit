import {
  ProductListingEngine,
  SortCriterion,
  NumericFacetValue,
  DateFacetValue,
} from '@coveo/headless/product-listing';
import {DEFAULT_MOBILE_BREAKPOINT} from '../../../utils/replace-breakpoint';
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

export interface AtomicStoreData extends AtomicCommonStoreData {
  facets: FacetStore<FacetInfo>;
  numericFacets: FacetStore<FacetInfo & FacetValueFormat<NumericFacetValue>>;
  dateFacets: FacetStore<FacetInfo & FacetValueFormat<DateFacetValue>>;
  categoryFacets: FacetStore<FacetInfo>;
  sortOptions: SortDropdownOption[];
  mobileBreakpoint: string;
  currentQuickviewPosition: number;
}

export interface AtomicStore extends AtomicCommonStore<AtomicStoreData> {
  getAllFacets(): {
    [facetId: string]:
      | FacetInfo
      | (FacetInfo & FacetValueFormat<NumericFacetValue>)
      | (FacetInfo & FacetValueFormat<DateFacetValue>);
  };

  isMobile(): boolean;
}

export function createAtomicStore(): AtomicStore {
  const commonStore = createAtomicCommonStore<AtomicStoreData>({
    loadingFlags: [],
    facets: {},
    numericFacets: {},
    dateFacets: {},
    categoryFacets: {},
    facetElements: [],
    sortOptions: [],
    iconAssetsPath: '',
    mobileBreakpoint: DEFAULT_MOBILE_BREAKPOINT,
    fieldsToInclude: [],
    currentQuickviewPosition: -1,
  });

  return {
    ...commonStore,

    getAllFacets() {
      return {
        ...commonStore.state.facets,
        ...commonStore.state.dateFacets,
        ...commonStore.state.categoryFacets,
        ...commonStore.state.numericFacets,
      };
    },

    isMobile() {
      return !window.matchMedia(
        makeDesktopQuery(commonStore.state.mobileBreakpoint)
      ).matches;
    },

    getUniqueIDFromEngine(engine: ProductListingEngine): string {
      return engine.state.productListing.responseId;
    },
  };
}

export function makeDesktopQuery(mobileBreakpoint: string) {
  return `only screen and (min-width: ${mobileBreakpoint})`;
}
