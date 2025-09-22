import {
  type ChildProduct,
  type CommerceEngine,
  Selectors,
} from '@coveo/headless/commerce';
import {DEFAULT_MOBILE_BREAKPOINT} from '../../../utils/replace-breakpoint-utils';
import {
  type BaseStore,
  createBaseStore,
  type ResultListInfo,
  setLoadingFlag,
  unsetLoadingFlag,
} from '../../common/interface/store';
import {makeDesktopQuery} from '../../search/atomic-search-layout/search-layout';

interface Data {
  loadingFlags: string[];
  iconAssetsPath: string;
  resultList: ResultListInfo | undefined;
  mobileBreakpoint: string;
  activeProductChild: ChildProduct | undefined;
}

export type CommerceStore = BaseStore<Data> & {
  unsetLoadingFlag(loadingFlag: string): void;
  setLoadingFlag(flag: string): void;
  isMobile(): boolean;
  getUniqueIDFromEngine(engine: CommerceEngine): string;
};

export function createCommerceStore(
  type: 'search' | 'product-listing'
): CommerceStore {
  const store = createBaseStore({
    loadingFlags: [],
    iconAssetsPath: '',
    resultList: undefined,
    mobileBreakpoint: DEFAULT_MOBILE_BREAKPOINT,
    activeProductChild: undefined,
  });

  return {
    ...store,

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
