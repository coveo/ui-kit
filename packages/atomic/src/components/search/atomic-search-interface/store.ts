import {
  NumericFacetValue,
  DateFacetValue,
  SortCriterion,
  SearchEngine,
} from '@coveo/headless';
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
import {makeDesktopQuery} from '../atomic-layout/search-layout';

export interface SortDropdownOption {
  tabs: {included: string[] | string; excluded: string[] | string};
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
  getAllFacets(): FacetInfoMap;

  isMobile(): boolean;
}

export interface FacetInfoMap {
  [facetId: string]:
    | FacetInfo
    | (FacetInfo & FacetValueFormat<NumericFacetValue>)
    | (FacetInfo & FacetValueFormat<DateFacetValue>);
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

    getUniqueIDFromEngine(engine: SearchEngine): string {
      return engine.state.search.response.searchUid;
    },
  };
}
