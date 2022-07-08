import {
  AtomicCommonStore,
  AtomicCommonStoreData,
  createAtomicCommonStore,
} from '../../common/interface/store';
import {InsightEngine} from '..';
export interface AtomicInsightStoreData extends AtomicCommonStoreData {
  fieldsToInclude: string[];
}

export interface AtomicInsightStore
  extends AtomicCommonStore<AtomicInsightStoreData> {}

export function createAtomicInsightStore(): AtomicInsightStore {
  const commonStore = createAtomicCommonStore<AtomicInsightStoreData>({
    loadingFlags: [],
    iconAssetsPath: '',
    fieldsToInclude: [],
  });
  return {
    ...commonStore,
    getUniqueIDFromEngine(engine: InsightEngine): string {
      return engine.state.search.searchResponseId;
    },
  };
}
