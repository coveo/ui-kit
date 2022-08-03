import {RecommendationEngine} from '@coveo/headless/recommendation';
import {
  AtomicCommonStore,
  AtomicCommonStoreData,
  createAtomicCommonStore,
} from '../../common/interface/store';

export interface AtomicRecsStoreData extends AtomicCommonStoreData {}
export interface AtomicRecsStore
  extends AtomicCommonStore<AtomicRecsStoreData> {}

export function createAtomicRecsStore(): AtomicRecsStore {
  const commonStore = createAtomicCommonStore<AtomicRecsStoreData>({
    loadingFlags: [],
    iconAssetsPath: '',
    facetElements: [],
  });
  return {
    ...commonStore,
    getUniqueIDFromEngine(engine: RecommendationEngine): string {
      return engine.state.recommendation.searchUid;
    },
  };
}
