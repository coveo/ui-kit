import {
  CommerceEngine,
  Selectors,
  ChildProduct,
} from '@coveo/headless/commerce';
import {createStore} from '@stencil/store';
import {DEFAULT_MOBILE_BREAKPOINT} from '../../../utils/replace-breakpoint';
import {CommonStore, ResultListInfo} from '../../common/interface/store';
import {makeDesktopQuery} from '../../search/atomic-layout/search-layout';

interface Data {
  mobileBreakpoint: string;
  activeProductChild: ChildProduct | undefined;
  resultList?: ResultListInfo;
  iconAssetsPath: string;
  loadingFlags: string[];
}

export type CommerceStore = CommonStore<Data> & {
  unsetLoadingFlag(loadingFlag: string): void;
  setLoadingFlag(flag: string): void;
  isAppLoaded(): boolean;
  isMobile(): boolean;
  getUniqueIDFromEngine(engine: CommerceEngine): string;
};

export function createCommerceStore(
  type: 'search' | 'product-listing'
): CommerceStore {
  const store = createStore({
    loadingFlags: [],
    mobileBreakpoint: DEFAULT_MOBILE_BREAKPOINT,
    activeProductChild: undefined,
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
        default:
          throw new Error(
            `getUniqueIDFromEngine not implemented for this interface type, ${type}`
          );
      }
    },
  };
}
