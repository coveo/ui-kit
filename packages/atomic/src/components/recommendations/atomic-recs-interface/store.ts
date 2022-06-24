import {
  AtomicCommonStoreData,
  createAtomicCommonStore,
} from '@components/common/interface/store';

export interface AtomicRecsStoreData extends AtomicCommonStoreData {}

export function createAtomicRecsStore() {
  return createAtomicCommonStore<AtomicRecsStoreData>({
    loadingFlags: [],
    iconAssetsPath: '',
  });
}
