import {
  NumericFacetValue,
  DateFacetValue,
  SortCriterion,
  SearchEngine,
} from '@coveo/headless';
import {createStore} from '@stencil/store';
import {DEFAULT_MOBILE_BREAKPOINT} from '../../../utils/replace-breakpoint';
import {isInDocument} from '../../../utils/utils';
import {
  FacetInfo,
  FacetStore,
  FacetType,
  FacetValueFormat,
} from '../../common/facets/facet-common-store';
import {CommonStore, ResultListInfo} from '../../common/interface/store';
import {makeDesktopQuery} from '../atomic-layout/search-layout';

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
  mobileBreakpoint: string;
  facets: FacetStore<FacetInfo>;
  numericFacets: FacetStore<FacetInfo & FacetValueFormat<NumericFacetValue>>;
  dateFacets: FacetStore<FacetInfo & FacetValueFormat<DateFacetValue>>;
  categoryFacets: FacetStore<FacetInfo>;
  resultList?: ResultListInfo;
  loadingFlags: string[];
  facetElements: HTMLElement[];
  iconAssetsPath: string;
  fieldsToInclude: string[];
  sortOptions: SortDropdownOption[];
}

export type SearchStore = CommonStore<Data> & {
  hasLoadingFlag(loadingFlag: string): boolean;
  registerFacet<T extends FacetType, U extends string>(
    facetType: T,
    data: Data[T][U] & {facetId: U; element: HTMLElement}
  ): void;
  isAppLoaded(): boolean;
  getAllFacets(): FacetInfoMap;
  getFacetElements(): HTMLElement[];
  setLoadingFlag(flag: string): void;
  unsetLoadingFlag(loadingFlag: string): void;
  isMobile(): boolean;
  waitUntilAppLoaded(callback: () => void): void;
  getUniqueIDFromEngine(engine: SearchEngine): string;
  addFieldsToInclude(fields: string[]): void;
};

export const isRefineModalFacet = 'is-refine-modal';

export function createSearchStore(): SearchStore {
  const store = createStore({
    iconAssetsPath: '',
    loadingFlags: [],
    mobileBreakpoint: DEFAULT_MOBILE_BREAKPOINT,
    facets: {},
    numericFacets: {},
    dateFacets: {},
    categoryFacets: {},
    facetElements: [],
    fieldsToInclude: [],
    sortOptions: [],
  }) as CommonStore<Data>;

  const clearExistingFacetElement = (facetType: FacetType, facetId: string) => {
    if (store.state[facetType][facetId]) {
      store.state.facetElements = store.state.facetElements.filter(
        (facetElement) => facetElement.getAttribute('facet-id') !== facetId
      );
    }
  };

  return {
    ...store,

    registerFacet<T extends FacetType, U extends string>(
      facetType: T,
      data: Data[T][U] & {facetId: U; element: HTMLElement}
    ) {
      if (data.element.getAttribute(isRefineModalFacet) !== null) {
        return;
      }

      clearExistingFacetElement(facetType, data.facetId);
      store.state.facetElements.push(data.element);
      store.state[facetType][data.facetId] = data;
    },

    isAppLoaded() {
      return !store.state.loadingFlags.length;
    },

    getAllFacets() {
      return {
        ...store.state.facets,
        ...store.state.dateFacets,
        ...store.state.categoryFacets,
        ...store.state.numericFacets,
      };
    },

    getFacetElements() {
      return store.state.facetElements.filter((element) =>
        isInDocument(element)
      );
    },

    setLoadingFlag(loadingFlag: string) {
      const flags = store.state.loadingFlags;
      store.state.loadingFlags = flags.concat(loadingFlag);
    },

    unsetLoadingFlag(loadingFlag: string) {
      const flags = store.state.loadingFlags;
      store.state.loadingFlags = flags.filter((value) => value !== loadingFlag);
    },

    isMobile() {
      return !window.matchMedia(makeDesktopQuery(store.state.mobileBreakpoint))
        .matches;
    },

    waitUntilAppLoaded(callback: () => void) {
      if (!store.state.loadingFlags.length) {
        callback();
      } else {
        store.onChange('loadingFlags', (flags) => {
          if (!flags.length) {
            callback();
          }
        });
      }
    },

    //This does not makes sense in the store... should just be regular functions
    getUniqueIDFromEngine(engine: SearchEngine): string {
      return engine.state.search.response.searchUid;
    },

    addFieldsToInclude(fields) {
      const currentFields = store.state.fieldsToInclude;
      store.state.fieldsToInclude = [...currentFields, ...fields];
    },

    hasLoadingFlag(loadingFlag: string) {
      return store.state.loadingFlags.indexOf(loadingFlag) !== -1;
    },
  };
}
