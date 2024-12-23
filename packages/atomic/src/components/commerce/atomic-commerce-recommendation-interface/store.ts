import {createStore} from '@stencil/store';
import {
  CommonStore,
  ResultListInfo,
  setLoadingFlag,
  unsetLoadingFlag,
} from '../../common/interface/store';

interface Data {
  loadingFlags: string[];
  iconAssetsPath: string;
  resultList: ResultListInfo | undefined;
}

export type CommerceRecommendationStore = CommonStore<Data> & {
  isAppLoaded(): boolean;
  unsetLoadingFlag(loadingFlag: string): void;
  setLoadingFlag(flag: string): void;
  // getUniqueIDFromEngine(engine: CommerceEngine): string;
};

export function createCommerceRecommendationStore(): CommerceRecommendationStore {
  const store = createStore({
    loadingFlags: [],
    iconAssetsPath: '',
    resultList: undefined,
  }) as CommonStore<Data>;

  return {
    ...store,

    isAppLoaded() {
      return !store.state.loadingFlags.length;
    },

    unsetLoadingFlag(loadingFlag: string) {
      unsetLoadingFlag(store, loadingFlag);
    },

    setLoadingFlag(loadingFlag: string) {
      setLoadingFlag(store, loadingFlag);
    },

    // getUniqueIDFromEngine(engine: CommerceEngine): string {
    //   return null;
    // },
  };
}
