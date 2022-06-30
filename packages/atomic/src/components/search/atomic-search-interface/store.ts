import {
  NumericFacetValue,
  DateFacetValue,
  SortCriterion,
  SearchEngine,
} from '@coveo/headless';
import {VNode} from '@stencil/core';
import {makeDesktopQuery} from '../atomic-layout/search-layout';
import {DEFAULT_MOBILE_BREAKPOINT} from '@utils/replace-breakpoint';
import {
  createAtomicCommonStore,
  AtomicCommonStoreData,
} from '@components/common/interface/store';

interface FacetInfo {
  label: string;
}

export interface ResultListInfo {
  focusOnNextNewResult(): void;
}

interface FacetValueFormat<ValueType> {
  format(facetValue: ValueType): string;
  content?(facetValue: ValueType): VNode;
}

type FacetType = 'facets' | 'numericFacets' | 'dateFacets' | 'categoryFacets';
type FacetStore<F extends FacetInfo> = Record<string, F>;

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
  facetElements: HTMLElement[];
  sortOptions: SortDropdownOption[];
  mobileBreakpoint: string;
  fieldsToInclude: string[];
  resultList?: ResultListInfo;
}

export function createAtomicStore() {
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

  // https://terodox.tech/how-to-tell-if-an-element-is-in-the-dom-including-the-shadow-dom/
  const isInDocument = (element: Node) => {
    let currentElement = element;
    while (currentElement && currentElement.parentNode) {
      if (currentElement.parentNode === document) {
        return true;
      } else if (currentElement.parentNode instanceof ShadowRoot) {
        currentElement = currentElement.parentNode.host;
      } else {
        currentElement = currentElement.parentNode;
      }
    }
    return false;
  };

  return {
    ...commonStore,
    registerFacet<T extends FacetType, U extends string>(
      facetType: T,
      data: AtomicStoreData[T][U] & {facetId: U; element: HTMLElement}
    ) {
      if (commonStore.state[facetType][data.facetId]) {
        return;
      }

      commonStore.state[facetType][data.facetId] = data;
      commonStore.state.facetElements.push(data.element);
    },

    registerResultList(data: ResultListInfo) {
      commonStore.set('resultList', data);
    },

    getFacetElements() {
      return commonStore.state.facetElements.filter((element) =>
        isInDocument(element)
      );
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
