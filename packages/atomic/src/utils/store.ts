import {
  NumericFacetValue,
  DateFacetValue,
  SortCriterion,
  Facet,
  CategoryFacet,
  NumericFacet,
  DateFacet,
  SearchEngine,
} from '@coveo/headless';
import {CategoryFacetRequest} from '@coveo/headless/dist/definitions/features/facets/category-facet-set/interfaces/request';
import {FacetRequest} from '@coveo/headless/dist/definitions/features/facets/facet-set/interfaces/request';
import {DateFacetRequest} from '@coveo/headless/dist/definitions/features/facets/range-facets/date-facet-set/interfaces/request';
import {NumericFacetRequest} from '@coveo/headless/dist/definitions/features/facets/range-facets/numeric-facet-set/interfaces/request';
import {VNode} from '@stencil/core';
import {ObservableMap} from '@stencil/store';

interface FacetInfo<
  F extends Facet | CategoryFacet | NumericFacet | DateFacet
> {
  label: string;
  facet: F;
}

interface FacetValueFormat<ValueType> {
  format(facetValue: ValueType): string;
  content?(facetValue: ValueType): VNode;
}

export type FacetRequestWithType =
  | {type: 'facets'; request: FacetRequest}
  | {
      type: 'categoryFacets';
      request: CategoryFacetRequest;
    }
  | {type: 'numericFacets'; request: NumericFacetRequest}
  | {type: 'dateFacets'; request: DateFacetRequest};

export type FacetWithType =
  | {type: 'facets'; facet: Facet; request: FacetRequest}
  | {
      type: 'categoryFacets';
      facet: CategoryFacet;
      request: CategoryFacetRequest;
    }
  | {type: 'numericFacets'; facet: NumericFacet; request: NumericFacetRequest}
  | {type: 'dateFacets'; facet: DateFacet; request: DateFacetRequest};

export type DependencyCondition = (state: FacetRequestWithType) => boolean;

export interface DependantFacet {
  parentFacetId: string;
  dependantFacetId: string;
  isDependencyMet: DependencyCondition;
}

export interface DependsOnParam {
  parentFacetId: string;
  isDependencyMet: DependencyCondition;
}

type FacetType = 'facets' | 'numericFacets' | 'dateFacets' | 'categoryFacets';
type FacetStore<F extends FacetInfo<any>> = Record<string, F>;
type FacetDependencyStore = DependantFacet[];

export interface SortDropdownOption {
  expression: string;
  criteria: SortCriterion[];
  label: string;
}

export type AtomicStore = {
  facets: FacetStore<FacetInfo<Facet>>;
  numericFacets: FacetStore<
    FacetInfo<NumericFacet> & FacetValueFormat<NumericFacetValue>
  >;
  dateFacets: FacetStore<
    FacetInfo<DateFacet> & FacetValueFormat<DateFacetValue>
  >;
  categoryFacets: FacetStore<FacetInfo<CategoryFacet>>;
  facetElements: HTMLElement[];
  facetDependencies: FacetDependencyStore;
  sortOptions: SortDropdownOption[];
};

export const initialStore: () => AtomicStore = () => ({
  facets: {},
  numericFacets: {},
  dateFacets: {},
  categoryFacets: {},
  facetElements: [],
  facetDependencies: [],
  sortOptions: [],
});

export const registerFacetToStore = <T extends FacetType, U extends string>(
  store: ObservableMap<AtomicStore>,
  facetType: T,
  data: AtomicStore[T][U] & {element: HTMLElement},
  dependencies: DependsOnParam[]
) => {
  const facetId = data.facet.state.facetId;
  if (store.state[facetType][facetId]) {
    return;
  }

  store.state[facetType][facetId] = data;
  store.state.facetElements.push(data.element);
  store.state.facetDependencies.push(
    ...dependencies.map(({parentFacetId, isDependencyMet}) => ({
      parentFacetId,
      dependantFacetId: facetId,
      isDependencyMet,
    }))
  );
};

export const getFacetElements = (store: ObservableMap<AtomicStore>) => {
  return store.state.facetElements.filter((element) =>
    document.contains(element)
  );
};

export const getFacet: (
  engine: SearchEngine,
  store: AtomicStore,
  facetId: string
) => FacetWithType | null = (engine, store, facetId) => {
  if (facetId in store.facets) {
    return {
      type: 'facets',
      facet: store.facets[facetId].facet,
      request: engine.state.facetSet![facetId],
    };
  }
  if (facetId in store.categoryFacets) {
    return {
      type: 'categoryFacets',
      facet: store.categoryFacets[facetId].facet,
      request: engine.state.categoryFacetSet![facetId]!.request,
    };
  }
  if (facetId in store.numericFacets) {
    return {
      type: 'numericFacets',
      facet: store.numericFacets[facetId].facet,
      request: engine.state.numericFacetSet![facetId],
    };
  }
  if (facetId in store.dateFacets) {
    return {
      type: 'dateFacets',
      facet: store.dateFacets[facetId].facet,
      request: engine.state.dateFacetSet![facetId],
    };
  }
  return null;
};
