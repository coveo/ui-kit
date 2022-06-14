import {
  NumericFacetValue,
  DateFacetValue,
  SortCriterion,
} from '@coveo/headless';
import {VNode} from '@stencil/core';
import {ObservableMap} from '@stencil/store';
import {makeDesktopQuery} from '../components/search/atomic-layout/search-layout';
import {DEFAULT_MOBILE_BREAKPOINT} from './replace-breakpoint';

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

export type AtomicStore = {
  facets: FacetStore<FacetInfo>;
  numericFacets: FacetStore<FacetInfo & FacetValueFormat<NumericFacetValue>>;
  dateFacets: FacetStore<FacetInfo & FacetValueFormat<DateFacetValue>>;
  categoryFacets: FacetStore<FacetInfo>;
  facetElements: HTMLElement[];
  sortOptions: SortDropdownOption[];
  iconAssetsPath: string;
  mobileBreakpoint: string;
  /**
   * Dynamic list of flags that allows for syncing various components loading state on initialization.
   * E.g., waiting for result template component to be rendered.
   *
   * This is a better indicator than only the "firstSearchExecuted" of the Headless search state.
   */
  loadingFlags: string[];
  resultList?: ResultListInfo;
};

export const initialStore: () => AtomicStore = () => ({
  facets: {},
  numericFacets: {},
  dateFacets: {},
  categoryFacets: {},
  facetElements: [],
  sortOptions: [],
  iconAssetsPath: '',
  mobileBreakpoint: DEFAULT_MOBILE_BREAKPOINT,
  loadingFlags: [],
});

export const registerFacetToStore = <T extends FacetType, U extends string>(
  store: ObservableMap<AtomicStore>,
  facetType: T,
  data: AtomicStore[T][U] & {facetId: U; element: HTMLElement}
) => {
  if (store.state[facetType][data.facetId]) {
    return;
  }

  store.state[facetType][data.facetId] = data;
  store.state.facetElements.push(data.element);
};

export const registerResultListToStore = (
  store: ObservableMap<AtomicStore>,
  data: ResultListInfo
) => {
  store.set('resultList', data);
};

// https://terodox.tech/how-to-tell-if-an-element-is-in-the-dom-including-the-shadow-dom/
function isInDocument(element: Node) {
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
}

export const getFacetElements = (store: ObservableMap<AtomicStore>) => {
  return store.state.facetElements.filter((element) => isInDocument(element));
};

export const getAllFacets = (store: ObservableMap<AtomicStore>) => ({
  ...store.state.facets,
  ...store.state.dateFacets,
  ...store.state.categoryFacets,
  ...store.state.numericFacets,
});

export const setLoadingFlag = (
  store: ObservableMap<AtomicStore>,
  flag: string
) => {
  const flags = store.get('loadingFlags');
  store.set('loadingFlags', flags.concat(flag));
};

export const unsetLoadingFlag = (
  store: ObservableMap<AtomicStore>,
  flag: string
) => {
  const flags = store.get('loadingFlags');
  store.set(
    'loadingFlags',
    flags.filter((value) => value !== flag)
  );
};

export const hasLoadingFlag = (
  store: ObservableMap<AtomicStore>,
  flag: string
) => store.get('loadingFlags').indexOf(flag) !== -1;

export const waitUntilAppLoaded = (
  store: ObservableMap<AtomicStore>,
  callback: () => void
) => {
  store.onChange('loadingFlags', (flags) => {
    if (!flags.length) {
      callback();
    }
  });
};

export const isAppLoaded = (store: ObservableMap<AtomicStore>) =>
  !store.get('loadingFlags').length;

export const isMobile = (store: ObservableMap<AtomicStore>) =>
  !window.matchMedia(makeDesktopQuery(store.state.mobileBreakpoint)).matches;
