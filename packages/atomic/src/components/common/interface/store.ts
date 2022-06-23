import {createStore} from '@stencil/store';

export type AtomicCommonStoreData = {
  loadingFlags: string[];
  iconAssetsPath: string;
};

export function createAtomicCommonStore<
  StoreData extends AtomicCommonStoreData
>(initialStoreData: StoreData) {
  const stencilStore = createStore(initialStoreData);

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
  };
}
