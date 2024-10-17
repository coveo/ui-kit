import {
  InsightDateFacetValue,
  InsightEngine,
  InsightNumericFacetValue,
} from '..';
import {DEFAULT_MOBILE_BREAKPOINT} from '../../../utils/replace-breakpoint';
import {
  FacetInfo,
  FacetStore,
  FacetValueFormat,
} from '../../common/facets/facet-common-store';
import {
  AtomicCommonStore,
  AtomicCommonStoreData,
  createAtomicCommonStore,
} from '../../common/interface/store';
import {makeDesktopQuery} from '../../search/atomic-layout/search-layout';

export interface AtomicInsightStoreData extends AtomicCommonStoreData {
  fieldsToInclude: string[];
  facets: FacetStore<FacetInfo>;
  numericFacets: FacetStore<
    FacetInfo & FacetValueFormat<InsightNumericFacetValue>
  >;
  dateFacets: FacetStore<FacetInfo & FacetValueFormat<InsightDateFacetValue>>;
  categoryFacets: FacetStore<FacetInfo>;
  mobileBreakpoint: string;
}

export interface FacetInfoMap {
  [facetId: string]:
    | FacetInfo
    | (FacetInfo & FacetValueFormat<InsightNumericFacetValue>)
    | (FacetInfo & FacetValueFormat<InsightDateFacetValue>);
}

export interface AtomicInsightStore
  extends AtomicCommonStore<AtomicInsightStoreData> {
  getAllFacets(): FacetInfoMap;
  isMobile(): boolean;
}

export function createAtomicInsightStore(): AtomicInsightStore {
  const commonStore = createAtomicCommonStore<AtomicInsightStoreData>({
    facets: {},
    numericFacets: {},
    dateFacets: {},
    categoryFacets: {},
    loadingFlags: [],
    iconAssetsPath: '',
    fieldsToInclude: [],
    facetElements: [],
    mobileBreakpoint: DEFAULT_MOBILE_BREAKPOINT,
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

    getUniqueIDFromEngine(engine: InsightEngine): string {
      return engine.state.search.searchResponseId;
    },
  };
}
