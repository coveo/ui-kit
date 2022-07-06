import {InsightEngine} from '@coveo/headless/insight';
import {
  AtomicCommonStore,
  AtomicCommonStoreData,
  createAtomicCommonStore,
} from '../../common/interface/store';

export interface AtomicSvcInsightStoreData extends AtomicCommonStoreData {
  fieldsToInclude: string[];
}

export interface AtomicSvcInsightStore
  extends AtomicCommonStore<AtomicSvcInsightStoreData> {}

export function createAtomicSvcInsightStore(): AtomicSvcInsightStore {
  const commonStore = createAtomicCommonStore<AtomicSvcInsightStoreData>({
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
