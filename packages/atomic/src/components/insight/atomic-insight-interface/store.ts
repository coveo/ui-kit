import type {
  DateFacetValue,
  InsightEngine,
  NumericFacetValue,
} from '@coveo/headless/insight';
import {DEFAULT_MOBILE_BREAKPOINT} from '@/src/utils/replace-breakpoint-utils';
import type {
  FacetInfo,
  FacetStore,
  FacetType,
  FacetValueFormat,
} from '../../common/facets/facet-common-store';
import {
  type BaseStore,
  createBaseStore,
  getFacetElements,
  type ResultListInfo,
  registerFacet,
  setLoadingFlag,
  unsetLoadingFlag,
  waitUntilAppLoaded,
} from '../../common/interface/store';
import {makeDesktopQuery} from '../atomic-insight-layout/insight-layout';

interface FacetInfoMap {
  [facetId: string]:
    | FacetInfo
    | (FacetInfo & FacetValueFormat<NumericFacetValue>)
    | (FacetInfo & FacetValueFormat<DateFacetValue>);
}

interface Data {
  loadingFlags: string[];
  iconAssetsPath: string;
  resultList: ResultListInfo | undefined;
  mobileBreakpoint: string;
  facets: FacetStore<FacetInfo>;
  numericFacets: FacetStore<FacetInfo & FacetValueFormat<NumericFacetValue>>;
  dateFacets: FacetStore<FacetInfo & FacetValueFormat<DateFacetValue>>;
  categoryFacets: FacetStore<FacetInfo>;
  facetElements: HTMLElement[];
  fieldsToInclude: string[];
}

export type InsightStore = BaseStore<Data> & {
  isMobile(): boolean;
  unsetLoadingFlag(loadingFlag: string): void;
  setLoadingFlag(flag: string): void;
  registerFacet<T extends FacetType, U extends string>(
    facetType: T,
    data: Data[T][U] & {facetId: U; element: HTMLElement}
  ): void;
  getFacetElements(): HTMLElement[];
  waitUntilAppLoaded(callback: () => void): void;
  getUniqueIDFromEngine(engine: InsightEngine): string;
  getAllFacets(): FacetInfoMap;
};

export function createInsightStore(): InsightStore {
  const store = createBaseStore<Data>({
    loadingFlags: [],
    iconAssetsPath: '',
    resultList: undefined,
    mobileBreakpoint: DEFAULT_MOBILE_BREAKPOINT,
    facets: {},
    numericFacets: {},
    dateFacets: {},
    categoryFacets: {},
    facetElements: [],
    fieldsToInclude: [],
  });

  return {
    ...store,

    unsetLoadingFlag(loadingFlag: string) {
      unsetLoadingFlag(store, loadingFlag);
    },

    setLoadingFlag(loadingFlag: string) {
      setLoadingFlag(store, loadingFlag);
    },

    getAllFacets() {
      return {
        ...store.state.facets,
        ...store.state.dateFacets,
        ...store.state.categoryFacets,
        ...store.state.numericFacets,
      };
    },

    isMobile() {
      return !window.matchMedia(makeDesktopQuery(store.state.mobileBreakpoint))
        .matches;
    },

    registerFacet<T extends FacetType, U extends string>(
      facetType: T,
      data: Data[T][U] & {facetId: U; element: HTMLElement}
    ) {
      registerFacet(store, facetType, data);
    },

    getFacetElements() {
      return getFacetElements(store);
    },

    waitUntilAppLoaded(callback: () => void) {
      waitUntilAppLoaded(store, callback);
    },

    getUniqueIDFromEngine(engine: InsightEngine): string {
      return engine.state.search.searchResponseId;
    },
  };
}
