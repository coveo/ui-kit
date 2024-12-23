import {InsightEngine} from '@coveo/headless/insight';
import {createStore} from '@stencil/store';
import {
  FacetInfo,
  FacetStore,
  FacetType,
  FacetValueFormat,
} from '../../common/facets/facet-common-store';
import {
  CommonStore,
  getFacetElements,
  registerFacet,
  ResultListInfo,
  setLoadingFlag,
  unsetLoadingFlag,
  waitUntilAppLoaded,
} from '../../common/interface/store';
import {DateFacetValue, NumericFacetValue} from '../../common/types';

interface Data {
  loadingFlags: string[];
  iconAssetsPath: string;
  resultList: ResultListInfo | undefined;
  facets: FacetStore<FacetInfo>;
  numericFacets: FacetStore<FacetInfo & FacetValueFormat<NumericFacetValue>>;
  dateFacets: FacetStore<FacetInfo & FacetValueFormat<DateFacetValue>>;
  categoryFacets: FacetStore<FacetInfo>;
  facetElements: HTMLElement[];
  fieldsToInclude: string[];
}

export type InsightStore = CommonStore<Data> & {
  isAppLoaded(): boolean;
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
  const store = createStore({
    loadingFlags: [],
    iconAssetsPath: '',
    resultList: undefined,
    facets: {},
    numericFacets: {},
    dateFacets: {},
    categoryFacets: {},
    facetElements: [],
    fieldsToInclude: [],
  }) as CommonStore<Data>;

  return {
    ...store,

    isAppLoaded() {
      return !store.state.loadingFlags.length;
    },

    unsetLoadingFlag(loadingFlag: string) {
      unsetLoadingFlag(store, loadingFlag);
    },

    setLoadingFlag(loadingFlag: string) {
      setLoadingFlag(store, loadingFlag);
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
