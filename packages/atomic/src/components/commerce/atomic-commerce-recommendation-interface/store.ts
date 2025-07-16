import {
  type BaseStore,
  createBaseStore,
  type ResultListInfo,
  setLoadingFlag,
  unsetLoadingFlag,
} from '../../common/interface/store';

interface Data {
  loadingFlags: string[];
  iconAssetsPath: string;
  resultList: ResultListInfo | undefined;
}

export type CommerceRecommendationStore = BaseStore<Data> & {
  unsetLoadingFlag(loadingFlag: string): void;
  setLoadingFlag(flag: string): void;
};

export function createCommerceRecommendationStore(): CommerceRecommendationStore {
  const store = createBaseStore<Data>({
    loadingFlags: [],
    iconAssetsPath: '',
    resultList: undefined,
  });

  return {
    ...store,

    unsetLoadingFlag(loadingFlag: string) {
      unsetLoadingFlag(store, loadingFlag);
    },

    setLoadingFlag(loadingFlag: string) {
      setLoadingFlag(store, loadingFlag);
    },
  };
}
