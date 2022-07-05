import {InsightEngine} from '@coveo/headless/insight';
import {
  AtomicCommonStoreData,
  createAtomicCommonStore,
} from '../../common/interface/store';

export interface AtomicSvgInsightStoreData extends AtomicCommonStoreData {}

export function createAtomicSvcInsightStore() {
  const commonStore = createAtomicCommonStore<AtomicSvgInsightStoreData>({
    loadingFlags: [],
    iconAssetsPath: '',
  });
  return {
    ...commonStore,
    getUniqueIDFromEngine(engine: InsightEngine): string {
      return engine.state.search.searchResponseId;
    },
  };
}
