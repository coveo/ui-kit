import {createStore} from '@stencil/store';
import {isInDocument} from '../../../utils/utils';
import {AnyEngineType, CommonStencilStore} from './bindings';

export type AtomicCommonStoreData = {
  loadingFlags: string[];
  iconAssetsPath: string;
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
}

export function createAtomicCommonStore<
  StoreData extends AtomicCommonStoreData
>(initialStoreData: StoreData): AtomicCommonStore<StoreData> {
  const stencilStore = createStore(
    initialStoreData
  ) as CommonStencilStore<StoreData>;

  return {
    ...stencilStore,

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
