import {
  CommerceEngine,
  Selectors,
  ChildProduct,
} from '@coveo/headless/commerce';
import {createStore} from '@stencil/store';
import {DEFAULT_MOBILE_BREAKPOINT} from '../../../utils/replace-breakpoint';
import {
  CommonStore,
  ResultListInfo,
  setLoadingFlag,
  unsetLoadingFlag,
} from '../../common/interface/store';
import {makeDesktopQuery} from '../../search/atomic-layout/search-layout';

interface Data {
  loadingFlags: string[];
  iconAssetsPath: string;
  resultList: ResultListInfo | undefined;
  mobileBreakpoint: string;
  activeProductChild: ChildProduct | undefined;
}

export type CommerceStore = CommonStore<Data> & {
  isAppLoaded(): boolean;
  unsetLoadingFlag(loadingFlag: string): void;
  setLoadingFlag(flag: string): void;
  isMobile(): boolean;
  getUniqueIDFromEngine(engine: CommerceEngine): string;
};

export function createCommerceStore(
  type: 'search' | 'product-listing'
): CommerceStore {
  const store = createStore({
    loadingFlags: [],
    iconAssetsPath: '',
    resultList: undefined,
    mobileBreakpoint: DEFAULT_MOBILE_BREAKPOINT,
    activeProductChild: undefined,
  }) as CommonStore<Data>;

  return {
    ...store,

    isAppLoaded() {
      return !store.state.loadingFlags.length;
    },

    unsetLoadingFlag(loadingFlag: string) {
      unsetLoadingFlag(store, loadingFlag);
    },

    setLoadingFlag(loadingFlag: string) {
      setLoadingFlag(store, loadingFlag);
    },

    isMobile() {
      return !window.matchMedia(makeDesktopQuery(store.state.mobileBreakpoint))
        .matches;
    },

    getUniqueIDFromEngine(engine: CommerceEngine): string {
      switch (type) {
        case 'search':
          return Selectors.Search.responseIdSelector(engine);
        case 'product-listing':
          return Selectors.ProductListing.responseIdSelector(engine);
      }
    },
  };
}
