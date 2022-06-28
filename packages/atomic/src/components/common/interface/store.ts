import {createStore} from '@stencil/store';
import {ExtensibleStencilStore} from './bindings';
import {AnyEngineType} from './interface-common';

export type AtomicCommonStoreData = {
  loadingFlags: string[];
  iconAssetsPath: string;
};

export function createAtomicCommonStore<
  StoreData extends AtomicCommonStoreData
>(initialStoreData: StoreData) {
  const stencilStore = createStore(
    initialStoreData
  ) as ExtensibleStencilStore<StoreData>;

  return {
    ...stencilStore,
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
      stencilStore.onChange('loadingFlags', (flags) => {
        if (!flags.length) {
          callback();
        }
      });
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
  };
}
