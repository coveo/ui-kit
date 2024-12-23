import {InsightEngine} from '@coveo/headless/insight';
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
import {DateFacetValue, NumericFacetValue} from '../../common/types';

interface Data {
  mobileBreakpoint: string;
  loadingFlags: string[];
  facets: FacetStore<FacetInfo>;
  numericFacets: FacetStore<FacetInfo & FacetValueFormat<NumericFacetValue>>;
  dateFacets: FacetStore<FacetInfo & FacetValueFormat<DateFacetValue>>;
  categoryFacets: FacetStore<FacetInfo>;
  iconAssetsPath: string;
  facetElements: HTMLElement[];
  resultList?: ResultListInfo;
  fieldsToInclude: string[];
}

export type InsightStore = CommonStore<Data> & {
  registerFacet<T extends FacetType, U extends string>(
    facetType: T,
    data: Data[T][U] & {facetId: U; element: HTMLElement}
  ): void;
  setLoadingFlag(flag: string): void;
  unsetLoadingFlag(loadingFlag: string): void;
  isAppLoaded(): boolean;
  getFacetElements(): HTMLElement[];
  waitUntilAppLoaded(callback: () => void): void;
  registerResultList(data: ResultListInfo): void;
  getUniqueIDFromEngine(engine: InsightEngine): string;
};

export const isRefineModalFacet = 'is-refine-modal';

export function createInsightStore(): InsightStore {
  const store = createStore({
    mobileBreakpoint: DEFAULT_MOBILE_BREAKPOINT,
    loadingFlags: [],
    iconAssetsPath: '',
    facets: {},
    numericFacets: {},
    dateFacets: {},
    categoryFacets: {},
    facetElements: [],
    fieldsToInclude: [],
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

    setLoadingFlag(loadingFlag: string) {
      const flags = store.state.loadingFlags;
      store.state.loadingFlags = flags.concat(loadingFlag);
    },

    unsetLoadingFlag(loadingFlag: string) {
      const flags = store.state.loadingFlags;
      store.state.loadingFlags = flags.filter((value) => value !== loadingFlag);
    },

    isAppLoaded() {
      return !store.state.loadingFlags.length;
    },

    getFacetElements() {
      return store.state.facetElements.filter((element) =>
        isInDocument(element)
      );
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

    registerResultList(data: ResultListInfo) {
      store.state.resultList = data;
    },

    getUniqueIDFromEngine(engine: InsightEngine): string {
      return engine.state.search.searchResponseId;
    },
  };
}
