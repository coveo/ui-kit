import {DateFacetValue, NumericFacetValue} from '@coveo/headless';
import {isInDocument} from '../../../utils/utils';
import {
  FacetInfo,
  FacetStore,
  FacetType,
  FacetValueFormat,
} from '../facets/facet-common-store';

export interface CommonStore<StoreData> {
  state: StoreData;
  onChange: <PropName extends keyof StoreData>(
    propName: PropName,
    cb: (newValue: StoreData[PropName]) => void
  ) => () => void;
}

export interface ResultListInfo {
  focusOnNextNewResult(): void;
  focusOnFirstResultAfterNextSearch(): Promise<void>;
}

export function unsetLoadingFlag(
  store: CommonStore<{loadingFlags: string[]}>,
  loadingFlag: string
) {
  const flags = store.state.loadingFlags;
  store.state.loadingFlags = flags.filter((value) => value !== loadingFlag);
}

export function setLoadingFlag(
  store: CommonStore<{loadingFlags: string[]}>,
  loadingFlag: string
) {
  const flags = store.state.loadingFlags;
  store.state.loadingFlags = flags.concat(loadingFlag);
}

interface Facets {
  facets: FacetStore<FacetInfo>;
  numericFacets: FacetStore<FacetInfo & FacetValueFormat<NumericFacetValue>>;
  dateFacets: FacetStore<FacetInfo & FacetValueFormat<DateFacetValue>>;
  categoryFacets: FacetStore<FacetInfo>;
  facetElements: HTMLElement[];
}

export const isRefineModalFacet = 'is-refine-modal';

export function registerFacet<T extends FacetType, U extends string>(
  store: CommonStore<Facets>,
  facetType: T,
  data: Facets[T][U] & {facetId: U; element: HTMLElement}
) {
  const clearExistingFacetElement = (facetType: FacetType, facetId: string) => {
    if (store.state[facetType][facetId]) {
      store.state.facetElements = store.state.facetElements.filter(
        (facetElement) => facetElement.getAttribute('facet-id') !== facetId
      );
    }
  };

  if (data.element.getAttribute(isRefineModalFacet) !== null) {
    return;
  }

  clearExistingFacetElement(facetType, data.facetId);
  store.state.facetElements.push(data.element);
  store.state[facetType][data.facetId] = data;
}

export function getFacetElements(store: CommonStore<Facets>) {
  return store.state.facetElements.filter((element) => isInDocument(element));
}

export function waitUntilAppLoaded(
  store: CommonStore<{loadingFlags: string[]}>,
  callback: () => void
) {
  if (!store.state.loadingFlags.length) {
    callback();
  } else {
    store.onChange('loadingFlags', (flags) => {
      if (!flags.length) {
        callback();
      }
    });
  }
}
