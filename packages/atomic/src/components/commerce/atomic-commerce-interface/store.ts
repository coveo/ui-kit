import {
  CommerceEngine,
  Selectors,
  NumericFacetValue,
  DateFacetValue,
  SortCriterion,
} from '@coveo/headless/commerce';
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
import {makeDesktopQuery} from '../../search/atomic-layout/search-layout';

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
  activeProductChild: {parentPermanentId: string; childPermanentId: string};
}

export interface AtomicCommerceStore
  extends AtomicCommonStore<AtomicStoreData> {
  getAllFacets(): FacetInfoMap;
  isMobile(): boolean;
}

export interface FacetInfoMap {
  [facetId: string]:
    | FacetInfo
    | (FacetInfo & FacetValueFormat<NumericFacetValue>)
    | (FacetInfo & FacetValueFormat<DateFacetValue>);
}

export function createAtomicCommerceStore(
  type: 'search' | 'product-listing'
): AtomicCommerceStore {
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
    activeProductChild: {parentPermanentId: '', childPermanentId: ''},
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

    getUniqueIDFromEngine(engine: CommerceEngine): string {
      switch (type) {
        case 'search':
          return Selectors.Search.responseIdSelectorFromEngine(engine);
        case 'product-listing':
          return Selectors.ProductListing.responseIdSelectorFromEngine(engine);
        default:
          throw new Error(
            `getUniqueIDFromEngine not implemented for this interface type, ${type}`
          );
      }
    },
  };
}
