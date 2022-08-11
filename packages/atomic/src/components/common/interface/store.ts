import {createStore} from '@stencil/store';
import {isInDocument} from '../../../utils/utils';
import {
  FacetType,
  FacetInfo,
  FacetStore,
  FacetValueFormat,
} from '../facets/facet-common';
import {DateFacetValue, NumericFacetValue} from '../types';
import {AnyEngineType, CommonStencilStore} from './bindings';

export type AtomicCommonStoreData = {
  facets: FacetStore<FacetInfo>;
  numericFacets: FacetStore<FacetInfo & FacetValueFormat<NumericFacetValue>>;
  dateFacets: FacetStore<FacetInfo & FacetValueFormat<DateFacetValue>>;
  categoryFacets: FacetStore<FacetInfo>;
  loadingFlags: string[];
  iconAssetsPath: string;
  fieldsToInclude: string[];
  facetElements: HTMLElement[];
};

export interface AtomicCommonStore<StoreData extends AtomicCommonStoreData>
  extends CommonStencilStore<StoreData> {
  getIconAssetsPath(): string;
  setLoadingFlag(flag: string): void;
  unsetLoadingFlag(loadingFlag: string): void;
  hasLoadingFlag(loadingFlag: string): boolean;
  waitUntilAppLoaded(callback: () => void): void;
  isAppLoaded(): boolean;
  getUniqueIDFromEngine(engine: AnyEngineType): string;
  getFacetElements(): HTMLElement[];
  registerFacet<T extends FacetType, U extends string>(
    facetType: T,
    data: StoreData[T][U] & {facetId: U; element: HTMLElement}
  ): void;
}

export function createAtomicCommonStore<
  StoreData extends AtomicCommonStoreData
>(initialStoreData: StoreData): AtomicCommonStore<StoreData> {
  const stencilStore = createStore(
    initialStoreData
  ) as CommonStencilStore<StoreData>;

  return {
    ...stencilStore,

    registerFacet<T extends FacetType, U extends string>(
      facetType: T,
      data: StoreData[T][U] & {facetId: U; element: HTMLElement}
    ) {
      if (stencilStore.state[facetType][data.facetId]) {
        return;
      }

      stencilStore.state[facetType][data.facetId] = data;
      stencilStore.state.facetElements.push(data.element);
    },

    getIconAssetsPath() {
      return stencilStore.get('iconAssetsPath');
    },

    setLoadingFlag(loadingFlag: string) {
      const flags = stencilStore.get('loadingFlags');
      stencilStore.set('loadingFlags', flags.concat(loadingFlag));
    },

    unsetLoadingFlag(loadingFlag: string) {
      const flags = stencilStore.get('loadingFlags');
      stencilStore.set(
        'loadingFlags',
        flags.filter((value) => value !== loadingFlag)
      );
    },

    hasLoadingFlag(loadingFlag: string) {
      return stencilStore.get('loadingFlags').indexOf(loadingFlag) !== -1;
    },

    waitUntilAppLoaded(callback: () => void) {
      if (!stencilStore.get('loadingFlags').length) {
        callback();
      } else {
        stencilStore.onChange('loadingFlags', (flags) => {
          if (!flags.length) {
            callback();
          }
        });
      }
    },

    isAppLoaded() {
      return !stencilStore.get('loadingFlags').length;
    },

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getUniqueIDFromEngine(_engine: AnyEngineType): string {
      throw new Error(
        'getUniqueIDFromEngine not implemented at the common store level.'
      );
    },

    getFacetElements() {
      return stencilStore
        .get('facetElements')
        .filter((element) => isInDocument(element));
    },
  };
}
