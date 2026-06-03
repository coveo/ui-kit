import type {
  DateFacetValue,
  NumericFacetValue,
  SearchEngine,
  SortCriterion,
} from '@coveo/headless';
import {DEFAULT_MOBILE_BREAKPOINT} from '../../../utils/replace-breakpoint-utils';
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
import {makeDesktopQuery} from '../atomic-search-layout/search-layout';

export interface SortDropdownOption {
  tabs: {included: string[] | string; excluded: string[] | string};
  expression: string;
  criteria: SortCriterion[];
  label: string;
}

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
  sortOptions: SortDropdownOption[];
}

export type SearchStore = BaseStore<Data> & {
  unsetLoadingFlag(loadingFlag: string): void;
  setLoadingFlag(flag: string): void;
  isMobile(): boolean;
  registerFacet<T extends FacetType, U extends string>(
    facetType: T,
    data: Data[T][U] & {facetId: U; element: HTMLElement}
  ): void;
  getFacetElements(): HTMLElement[];
  waitUntilAppLoaded(callback: () => void): void;
  getUniqueIDFromEngine(engine: SearchEngine): string;
  hasLoadingFlag(loadingFlag: string): boolean;
  getAllFacets(): FacetInfoMap;
  addFieldsToInclude(fields: string[]): void;
};

export function createSearchStore(): SearchStore {
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
    sortOptions: [],
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

    getUniqueIDFromEngine(engine: SearchEngine): string {
      return engine.state.search.response.searchUid;
    },

    hasLoadingFlag(loadingFlag: string) {
      return store.state.loadingFlags.indexOf(loadingFlag) !== -1;
    },

    getAllFacets() {
      return {
        ...store.state.facets,
        ...store.state.dateFacets,
        ...store.state.categoryFacets,
        ...store.state.numericFacets,
      };
    },

    addFieldsToInclude(fields) {
      const currentFields = store.state.fieldsToInclude;
      store.state.fieldsToInclude = [...currentFields, ...fields];
    },
  };
}
