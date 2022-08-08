import {
  AtomicCommonStore,
  AtomicCommonStoreData,
  createAtomicCommonStore,
} from '../../common/interface/store';
import {
  InsightDateFacetValue,
  InsightEngine,
  InsightNumericFacetValue,
} from '..';
import {
  FacetInfo,
  FacetStore,
  FacetType,
  FacetValueFormat,
} from '../../common/facets/facet-common-store';

export interface AtomicInsightStoreData extends AtomicCommonStoreData {
  fieldsToInclude: string[];
  facets: FacetStore<FacetInfo>;
  numericFacets: FacetStore<
    FacetInfo & FacetValueFormat<InsightNumericFacetValue>
  >;
  dateFacets: FacetStore<FacetInfo & FacetValueFormat<InsightDateFacetValue>>;
  categoryFacets: FacetStore<FacetInfo>;
}

export interface AtomicInsightStore
  extends AtomicCommonStore<AtomicInsightStoreData> {
  registerFacet<T extends FacetType, U extends string>(
    facetType: T,
    data: AtomicInsightStoreData[T][U] & {facetId: U; element: HTMLElement}
  ): void;
}

export function createAtomicInsightStore(): AtomicInsightStore {
  const commonStore = createAtomicCommonStore<AtomicInsightStoreData>({
    facets: {},
    numericFacets: {},
    dateFacets: {},
    categoryFacets: {},
    loadingFlags: [],
    iconAssetsPath: '',
    fieldsToInclude: [],
    facetElements: [],
  });
  return {
    ...commonStore,

    registerFacet<T extends FacetType, U extends string>(
      facetType: T,
      data: AtomicInsightStoreData[T][U] & {facetId: U; element: HTMLElement}
    ) {
      if (commonStore.state[facetType][data.facetId]) {
        return;
      }

      commonStore.state[facetType][data.facetId] = data;
      commonStore.state.facetElements.push(data.element);
    },

    getUniqueIDFromEngine(engine: InsightEngine): string {
      return engine.state.search.searchResponseId;
    },
  };
}
