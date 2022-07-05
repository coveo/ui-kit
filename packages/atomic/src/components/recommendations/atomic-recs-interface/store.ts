import {RecommendationEngine} from '@coveo/headless/recommendation';
import {
  AtomicCommonStoreData,
  createAtomicCommonStore,
} from '../../common/interface/store';

export interface AtomicRecsStoreData extends AtomicCommonStoreData {}

export function createAtomicRecsStore() {
  const commonStore = createAtomicCommonStore<AtomicRecsStoreData>({
    loadingFlags: [],
    iconAssetsPath: '',
  });
  return {
    ...commonStore,
    getUniqueIDFromEngine(engine: RecommendationEngine): string {
      return engine.state.recommendation.searchUid;
    },
  };
}
