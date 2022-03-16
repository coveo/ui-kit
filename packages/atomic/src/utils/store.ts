import {
  NumericFacetValue,
  DateFacetValue,
  SortCriterion,
} from '@coveo/headless';
import {VNode} from '@stencil/core';
import {ObservableMap} from '@stencil/store';

interface FacetInfo {
  label: string;
}

interface FacetValueFormat<ValueType> {
  format(facetValue: ValueType): string;
  content?(facetValue: ValueType): VNode;
}

type FacetType = 'facets' | 'numericFacets' | 'dateFacets' | 'categoryFacets';
type FacetStore<F extends FacetInfo> = Record<string, F>;

export interface SortDropdownOption {
  expression: string;
  criteria: SortCriterion[];
  label: string;
}

export type AtomicStore = {
  facets: FacetStore<FacetInfo>;
  numericFacets: FacetStore<FacetInfo & FacetValueFormat<NumericFacetValue>>;
  dateFacets: FacetStore<FacetInfo & FacetValueFormat<DateFacetValue>>;
  categoryFacets: FacetStore<FacetInfo>;
  facetElements: HTMLElement[];
  sortOptions: SortDropdownOption[];
  iconAssetsPath: string;
};

export const initialStore: () => AtomicStore = () => ({
  facets: {},
  numericFacets: {},
  dateFacets: {},
  categoryFacets: {},
  facetElements: [],
  sortOptions: [],
  iconAssetsPath: '',
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

// https://terodox.tech/how-to-tell-if-an-element-is-in-the-dom-including-the-shadow-dom/
function isInDocument(element: Node) {
  let currentElement = element;
  while (currentElement && currentElement.parentNode) {
    if (currentElement.parentNode === document) {
      return true;
    } else if (currentElement.parentNode instanceof ShadowRoot) {
      currentElement = currentElement.parentNode.host;
    } else {
      currentElement = currentElement.parentNode;
    }
  }
  return false;
}

export const getFacetElements = (store: ObservableMap<AtomicStore>) => {
  return store.state.facetElements.filter((element) => isInDocument(element));
};
