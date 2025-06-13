import type {DateFacetValue, NumericFacetValue} from '@coveo/headless';
import {isInDocument} from '../../../utils/utils';
import type {
  FacetInfo,
  FacetStore,
  FacetType,
  FacetValueFormat,
} from '../facets/facet-common-store';
import type {AnyEngineType} from './bindings';

export const isRefineModalFacet = 'is-refine-modal';

export type BaseStore<T> = CommonStore<T> & {
  getUniqueIDFromEngine(engine: unknown): string | undefined;
};

export interface ResultListInfo {
  focusOnNextNewResult(): void;
  focusOnFirstResultAfterNextSearch(): Promise<void>;
}

export function createAppLoadedListener(
  store: CommonStore<{loadingFlags: string[]}>,
  callback: (isAppLoaded: boolean) => void
) {
  const updateIsAppLoaded = () => {
    const isAppLoaded = store.state.loadingFlags.length === 0;
    callback(isAppLoaded);
  };

  store.onChange('loadingFlags', updateIsAppLoaded);
  updateIsAppLoaded();
}

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

export function setLoadingFlag(
  store: CommonStore<{loadingFlags: string[]}>,
  loadingFlag: string
) {
  const flags = store.state.loadingFlags;
  store.state.loadingFlags = flags.concat(loadingFlag);
}

export function unsetLoadingFlag(
  store: CommonStore<{loadingFlags: string[]}>,
  loadingFlag: string
) {
  const flags = store.state.loadingFlags;
  store.state.loadingFlags = flags.filter((value) => value !== loadingFlag);
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

interface CommonStore<StoreData> {
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

interface Facets {
  facets: FacetStore<FacetInfo>;
  numericFacets: FacetStore<FacetInfo & FacetValueFormat<NumericFacetValue>>;
  dateFacets: FacetStore<FacetInfo & FacetValueFormat<DateFacetValue>>;
  categoryFacets: FacetStore<FacetInfo>;
  facetElements: HTMLElement[];
}

function createStore<StoreData extends Record<string, unknown>>(
  initialState: StoreData
): CommonStore<StoreData> {
  const listeners = new Map<
    keyof StoreData,
    Set<(newValue: unknown) => void>
  >();

  const state = new Proxy(initialState, {
    set(target, prop: string, value) {
      const oldValue = target[prop];
      if (oldValue !== value) {
        (target as Record<string, unknown>)[prop] = value;

        if (listeners.has(prop)) {
          for (const cb of listeners.get(prop)!) {
            cb(value);
          }
        }
      }
      return true;
    },
  });

  const get = <PropName extends keyof StoreData>(
    propName: PropName
  ): StoreData[PropName] => {
    return state[propName];
  };

  const set = <PropName extends keyof StoreData>(
    propName: PropName,
    value: StoreData[PropName]
  ): void => {
    state[propName] = value;
  };

  const onChange = <PropName extends keyof StoreData>(
    propName: PropName,
    callback: (newValue: StoreData[PropName]) => void
  ): (() => void) => {
    if (!listeners.has(propName)) {
      listeners.set(propName, new Set());
    }
    listeners.get(propName)!.add(callback as (newValue: unknown) => void);

    return () => {
      listeners.get(propName)!.delete(callback as (newValue: unknown) => void);
      if (listeners.get(propName)!.size === 0) {
        listeners.delete(propName);
      }
    };
  };

  return {
    state,
    get,
    set,
    onChange,
  };
}
