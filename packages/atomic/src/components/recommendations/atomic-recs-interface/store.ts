import {createStore} from '@stencil/store';
import {DEFAULT_MOBILE_BREAKPOINT} from '../../../utils/replace-breakpoint';
import {CommonStore, ResultListInfo} from '../../common/interface/store';

interface Data {
  //IMPORTANT does mobileBreakpoint work in commerce-layout ?? it does not get updated...
  mobileBreakpoint: string;
  loadingFlags: string[];
  // activeProductChild: ChildProduct | undefined;
  // why is this undefined I don't like
  // resultList?: ResultListInfo;
  iconAssetsPath: string;
  resultList?: ResultListInfo;

  // loadingFlags: string[];
}

export type RecsStore = CommonStore<Data> & {
  // hasLoadingFlag(loadingFlag: string): boolean;
  unsetLoadingFlag(loadingFlag: string): void;
  setLoadingFlag(flag: string): void;
  isAppLoaded(): boolean;
  registerResultList(data: ResultListInfo): void;
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

    // This is not necessary, we could just do store.state.resultList = data;
    registerResultList(data: ResultListInfo) {
      store.state.resultList = data;
    },
  };
}
