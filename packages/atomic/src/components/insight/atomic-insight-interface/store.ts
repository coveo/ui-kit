import {
  AtomicCommonStoreData,
  createAtomicCommonStore,
} from '../../common/search-interface/store';

export interface AtomicSvgInsightStoreData extends AtomicCommonStoreData {}

export function createAtomicSvcInsightStore() {
  return createAtomicCommonStore<AtomicSvgInsightStoreData>({
    loadingFlags: [],
    iconAssetsPath: '',
  });
}
