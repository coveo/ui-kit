import {
  NumericFacetValue,
  DateFacetValue,
  SortCriterion,
} from '@coveo/headless';
import {ObservableMap} from '@stencil/store';

interface FacetInfo {
  label: string;
}

interface FacetValueFormat<ValueType> {
  format(facetValue: ValueType): string;
}

type FacetType = 'facets' | 'numericFacets' | 'dateFacets' | 'categoryFacets';
type FacetStore<F extends FacetInfo> = Record<string, F>;

export interface SortDropdownOption {
  expression: string;
  criteria: SortCriterion[];
  caption: string;
}

export type AtomicStore = {
  facets: FacetStore<FacetInfo>;
  numericFacets: FacetStore<FacetInfo & FacetValueFormat<NumericFacetValue>>;
  dateFacets: FacetStore<FacetInfo & FacetValueFormat<DateFacetValue>>;
  categoryFacets: FacetStore<FacetInfo>;
  facetElements: HTMLElement[];
  sortOptions: SortDropdownOption[];
};

export const initialStore: () => AtomicStore = () => ({
  facets: {},
  numericFacets: {},
  dateFacets: {},
  categoryFacets: {},
  facetElements: [],
  sortOptions: [],
});

export const registerFacetToStore = <T extends FacetType, U extends string>(
  store: ObservableMap<AtomicStore>,
  facetType: T,
  data: AtomicStore[T][U] & {facetId: U; element: HTMLElement}
) => {
  if (store.state[facetType][data.facetId]) {
    return;
  }

  store.state[facetType][data.facetId] = data;
  store.state.facetElements.push(data.element);
};

export const getFacetElements = (store: ObservableMap<AtomicStore>) => {
  return store.state.facetElements.filter((element) =>
    document.contains(element)
  );
};
