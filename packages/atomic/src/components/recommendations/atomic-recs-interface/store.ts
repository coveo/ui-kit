import {createStore} from '@stencil/store';
import {DEFAULT_MOBILE_BREAKPOINT} from '../../../utils/replace-breakpoint';
import {CommonStore, ResultListInfo} from '../../common/interface/store';

interface Data {
  mobileBreakpoint: string;
  loadingFlags: string[];
  iconAssetsPath: string;
  resultList?: ResultListInfo;
}

export type RecsStore = CommonStore<Data> & {
  unsetLoadingFlag(loadingFlag: string): void;
  setLoadingFlag(flag: string): void;
  isAppLoaded(): boolean;
};

export function createRecsStore(): RecsStore {
  const store = createStore({
    loadingFlags: [],
    mobileBreakpoint: DEFAULT_MOBILE_BREAKPOINT,
    iconAssetsPath: '',
  }) as CommonStore<Data>;

  return {
    ...store,

    unsetLoadingFlag(loadingFlag: string) {
      const flags = store.state.loadingFlags;
      store.state.loadingFlags = flags.filter((value) => value !== loadingFlag);
    },

    setLoadingFlag(loadingFlag: string) {
      const flags = store.state.loadingFlags;
      store.state.loadingFlags = flags.concat(loadingFlag);
    },

    isAppLoaded() {
      return !store.state.loadingFlags.length;
    },
  };
}
