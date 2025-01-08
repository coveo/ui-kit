import {DateFacetValue, NumericFacetValue} from '@coveo/headless';
import {createStore} from '@stencil/store';
import {isInDocument} from '../../../utils/utils';
import {
  FacetInfo,
  FacetStore,
  FacetType,
  FacetValueFormat,
} from '../facets/facet-common-store';
import {AnyEngineType} from './bindings';

export interface CommonStore<StoreData> {
  state: StoreData;
  get: <PropName extends keyof StoreData>(
    propName: PropName
  ) => StoreData[PropName];
  set: <PropName extends keyof StoreData>(
    propName: PropName,
    value: StoreData[PropName]
  ) => void;
  onChange: <PropName extends keyof StoreData>(
    propName: PropName,
    cb: (newValue: StoreData[PropName]) => void
  ) => () => void;
}

export type BaseStore<T> = CommonStore<T> & {
  getUniqueIDFromEngine(engine: unknown): string | undefined;
};

export function createBaseStore<T extends {}>(initialState: T): BaseStore<T> {
  const store = createStore(initialState) as CommonStore<T>;

  return {
    ...store,

    getUniqueIDFromEngine(_engine: AnyEngineType) {
      throw new Error(
        'getUniqueIDFromEngine not implemented at the base store level.'
      );
    },
  };
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
