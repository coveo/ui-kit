import {NumericFacetValue, DateFacetValue} from '@coveo/headless';

interface FacetLabel {
  label: string;
}

interface FacetValueFormat<ValueType> {
  format(facetValue: ValueType): string;
}

type FacetStore<F extends FacetLabel> = Record<string, F>;

export type AtomicStore = {
  facets: FacetStore<FacetLabel>;
  numericFacets: FacetStore<FacetLabel & FacetValueFormat<NumericFacetValue>>;
  dateFacets: FacetStore<FacetLabel & FacetValueFormat<DateFacetValue>>;
  categoryFacets: FacetStore<FacetLabel>;
};

export const initialStore: () => AtomicStore = () => ({
  facets: {},
  numericFacets: {},
  dateFacets: {},
  categoryFacets: {},
  refineEnabled: false,
});
