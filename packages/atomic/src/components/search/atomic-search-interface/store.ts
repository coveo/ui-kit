import {
  NumericFacetValue,
  DateFacetValue,
  SortCriterion,
  SearchEngine,
} from '@coveo/headless';
import {makeDesktopQuery} from '../atomic-layout/search-layout';
import {DEFAULT_MOBILE_BREAKPOINT} from '../../../utils/replace-breakpoint';
import {
  createAtomicCommonStore,
  AtomicCommonStoreData,
  AtomicCommonStore,
} from '../../common/interface/store';
import {
  FacetInfo,
  FacetStore,
  FacetValueFormat,
} from '../../common/facets/facet-common';

export interface ResultListInfo {
  focusOnNextNewResult(): void;
}

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
  resultList?: ResultListInfo;
}

export interface AtomicStore extends AtomicCommonStore<AtomicStoreData> {
  registerResultList(data: ResultListInfo): void;

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
  });

  return {
    ...commonStore,

    registerResultList(data: ResultListInfo) {
      commonStore.set('resultList', data);
    },

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
