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
import {VNode} from '@stencil/core';
import {ObservableMap} from '@stencil/store';
import {DependencyCondition} from '../components/facets/facet-depends-on/facet-dependency-conditions';
import {FacetWithType} from '../components/facets/facet-depends-on/facet-union-types';

interface FacetInfo<
  F extends Facet | CategoryFacet | NumericFacet | DateFacet
> {
  label: string;
  facetId: string;
  facet?: F;
}

interface FacetValueFormat<ValueType> {
  format(facetValue: ValueType): string;
  content?(facetValue: ValueType): VNode;
}

export interface FacetDependency {
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
type FacetDependencyStore = FacetDependency[];

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
  const facetId = data.facetId;
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
  if (facetId in store.facets && store.facets[facetId].facet) {
    return {
      type: 'facets',
      facet: store.facets[facetId].facet!,
      request: engine.state.facetSet![facetId],
    };
  }
  if (facetId in store.categoryFacets && store.categoryFacets[facetId].facet) {
    return {
      type: 'categoryFacets',
      facet: store.categoryFacets[facetId].facet!,
      request: engine.state.categoryFacetSet![facetId]!.request,
    };
  }
  if (facetId in store.numericFacets && store.numericFacets[facetId].facet) {
    return {
      type: 'numericFacets',
      facet: store.numericFacets[facetId].facet!,
      request: engine.state.numericFacetSet![facetId],
    };
  }
  if (facetId in store.dateFacets && store.dateFacets[facetId].facet) {
    return {
      type: 'dateFacets',
      facet: store.dateFacets[facetId].facet!,
      request: engine.state.dateFacetSet![facetId],
    };
  }
  return null;
};
