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
  FacetValueFormat,
} from '../../common/facets/facet-common';
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
  extends AtomicCommonStore<AtomicInsightStoreData> {}

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

    getUniqueIDFromEngine(engine: InsightEngine): string {
      return engine.state.search.searchResponseId;
    },
  };
}
