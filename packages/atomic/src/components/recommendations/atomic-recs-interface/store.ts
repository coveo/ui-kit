import type {RecommendationEngine} from '@coveo/headless/recommendation';
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
  fieldsToInclude: string[];
  resultList: ResultListInfo | undefined;
}

export type RecsStore = BaseStore<Data> & {
  unsetLoadingFlag(loadingFlag: string): void;
  setLoadingFlag(flag: string): void;
  addFieldsToInclude(fields: string[]): void;
};

export function createRecsStore(): RecsStore {
  const store = createBaseStore<Data>({
    loadingFlags: [],
    iconAssetsPath: '',
    fieldsToInclude: [],
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

    getUniqueIDFromEngine(engine: RecommendationEngine): string {
      return engine.state.recommendation.searchUid;
    },

    addFieldsToInclude(fields) {
      const currentFields = store.state.fieldsToInclude;
      store.state.fieldsToInclude = [...currentFields, ...fields];
    },
  };
}
