import {DEFAULT_MOBILE_BREAKPOINT} from '@/src/utils/replace-breakpoint';
import {InsightEngine} from '@coveo/headless/insight';
import {
  FacetInfo,
  FacetStore,
  FacetType,
  FacetValueFormat,
} from '../../common/facets/facet-common-store';
import {
  BaseStore,
  createBaseStore,
  getFacetElements,
  registerFacet,
  ResultListInfo,
  setLoadingFlag,
  unsetLoadingFlag,
  waitUntilAppLoaded,
} from '../../common/interface/store';
import {DateFacetValue, NumericFacetValue} from '../../common/types';
import {makeDesktopQuery} from '../atomic-insight-layout/insight-layout';

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
