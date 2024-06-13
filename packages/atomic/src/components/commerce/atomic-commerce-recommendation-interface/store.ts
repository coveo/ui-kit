import {DEFAULT_MOBILE_BREAKPOINT} from '../../../utils/replace-breakpoint';
import {
  AtomicCommonStore,
  AtomicCommonStoreData,
  createAtomicCommonStore,
} from '../../common/interface/store';
import {makeDesktopQuery} from '../atomic-commerce-layout/commerce-layout';

export interface AtomicStoreData extends AtomicCommonStoreData {
  mobileBreakpoint: string;
  currentQuickviewPosition: number;
  activeProductChild: {parentPermanentId: string; childPermanentId: string};
}

export interface AtomicCommerceRecommendationStore
  extends AtomicCommonStore<AtomicStoreData> {
  isMobile(): boolean;
}

export function createAtomicCommerceRecommendationStore(): AtomicCommerceRecommendationStore {
  const commonStore = createAtomicCommonStore<AtomicStoreData>({
    loadingFlags: [],
    facets: {},
    numericFacets: {},
    dateFacets: {},
    categoryFacets: {},
    facetElements: [],
    iconAssetsPath: '',
    mobileBreakpoint: DEFAULT_MOBILE_BREAKPOINT,
    fieldsToInclude: [],
    currentQuickviewPosition: -1,
    activeProductChild: {parentPermanentId: '', childPermanentId: ''},
  });

  return {
    ...commonStore,

    isMobile() {
      return !window.matchMedia(
        makeDesktopQuery(commonStore.state.mobileBreakpoint)
      ).matches;
    },
  };
}
