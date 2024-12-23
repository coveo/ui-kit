import {createStore} from '@stencil/store';
import {CommonStore, ResultListInfo} from '../../common/interface/store';

interface Data {
  iconAssetsPath: string;
  loadingFlags: string[];
  resultList?: ResultListInfo;
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
  }) as CommonStore<Data>;

  return {
    ...store,

    isAppLoaded() {
      return !store.state.loadingFlags.length;
    },

    unsetLoadingFlag(loadingFlag: string) {
      const flags = store.state.loadingFlags;
      store.state.loadingFlags = flags.filter((value) => value !== loadingFlag);
    },

    setLoadingFlag(loadingFlag: string) {
      const flags = store.state.loadingFlags;
      store.state.loadingFlags = flags.concat(loadingFlag);
    },

    // getUniqueIDFromEngine(engine: CommerceEngine): string {
    //   return null;
    // },
  };
}
