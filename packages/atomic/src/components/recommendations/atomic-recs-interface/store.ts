import {RecommendationEngine} from '@coveo/headless/recommendation';
import {
  BaseStore,
  createBaseStore,
  ResultListInfo,
  setLoadingFlag,
  unsetLoadingFlag,
} from '../../common/interface/store';

interface Data {
  loadingFlags: string[];
  iconAssetsPath: string;
  resultList: ResultListInfo | undefined;
}

export type RecsStore = BaseStore<Data> & {
  isAppLoaded(): boolean;
  unsetLoadingFlag(loadingFlag: string): void;
  setLoadingFlag(flag: string): void;
};

export function createRecsStore(): RecsStore {
  const store = createBaseStore<Data>({
    loadingFlags: [],
    iconAssetsPath: '',
    resultList: undefined,
  });

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

    getUniqueIDFromEngine(engine: RecommendationEngine): string {
      return engine.state.recommendation.searchUid;
    },
  };
}
