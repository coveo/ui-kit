import {
  NumericFacetValue,
  DateFacetValue,
  SortCriterion,
  SearchEngine,
} from '@coveo/headless';
import {DEFAULT_MOBILE_BREAKPOINT} from '../../../utils/replace-breakpoint';
import {
  FacetInfo,
  FacetStore,
  FacetValueFormat,
} from '../../common/facets/facet-common-store';
import {
  createAtomicCommonStore,
  AtomicCommonStoreData,
  AtomicCommonStore,
  ResultListInfo,
} from '../../common/interface/store';
import {makeDesktopQuery} from '../atomic-layout/search-layout';

export interface SortDropdownOption {
  expression: string;
  criteria: SortCriterion[];
  label: string;
}

export interface AtomicStoreData extends AtomicCommonStoreData {
  facets: FacetStore<FacetInfo>;
  numericFacets: FacetStore<FacetInfo & FacetValueFormat<NumericFacetValue>>;
  dateFacets: FacetStore<FacetInfo & FacetValueFormat<DateFacetValue>>;
  categoryFacets: FacetStore<FacetInfo>;
  sortOptions: SortDropdownOption[];
  mobileBreakpoint: string;
  currentQuickviewPosition: number;
}

export interface AtomicStore extends AtomicCommonStore<AtomicStoreData> {
  getAllFacets(): {
    [facetId: string]:
      | FacetInfo
      | (FacetInfo & FacetValueFormat<NumericFacetValue>)
      | (FacetInfo & FacetValueFormat<DateFacetValue>);
  };

  isMobile(): boolean;

  nextQuickview(): void;
  previousQuickview(): void;
}

export function createAtomicStore(): AtomicStore {
  const commonStore = createAtomicCommonStore<AtomicStoreData>({
    loadingFlags: [],
    facets: {},
    numericFacets: {},
    dateFacets: {},
    categoryFacets: {},
    facetElements: [],
    sortOptions: [],
    iconAssetsPath: '',
    mobileBreakpoint: DEFAULT_MOBILE_BREAKPOINT,
    fieldsToInclude: [],
    currentQuickviewPosition: -1,
  });

  const getMaxPositionForQuickviews = (
    quickviewsInfoFromResultList?: ResultListInfo['quickviews']
  ) => {
    if (quickviewsInfoFromResultList) {
      return quickviewsInfoFromResultList.position.length - 1;
    }

    return 0;
  };

  return {
    ...commonStore,

    getAllFacets() {
      return {
        ...commonStore.state.facets,
        ...commonStore.state.dateFacets,
        ...commonStore.state.categoryFacets,
        ...commonStore.state.numericFacets,
      };
    },

    isMobile() {
      return !window.matchMedia(
        makeDesktopQuery(commonStore.state.mobileBreakpoint)
      ).matches;
    },

    getUniqueIDFromEngine(engine: SearchEngine): string {
      return engine.state.search.response.searchUid;
    },

    nextQuickview() {
      const maxPos = getMaxPositionForQuickviews(
        this.get('resultList')?.quickviews
      );

      let nextPos = this.get('currentQuickviewPosition') + 1;
      if (nextPos > maxPos) {
        nextPos = 0;
      }

      this.set('currentQuickviewPosition', nextPos);
    },

    previousQuickview() {
      const maxPos = getMaxPositionForQuickviews(
        this.get('resultList')?.quickviews
      );

      let previousPos = this.get('currentQuickviewPosition') - 1;
      if (previousPos < 0) {
        previousPos = maxPos;
      }
      this.set('currentQuickviewPosition', previousPos);
    },
  };
}
