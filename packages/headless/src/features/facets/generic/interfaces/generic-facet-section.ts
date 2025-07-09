import type {
  CategoryFacetSection,
  DateFacetSection,
  FacetSection,
  NumericFacetSection,
} from '../../../../state/state-sections.js';
import type {CategoryFacetSlice} from '../../category-facet-set/category-facet-set-state.js';
import type {FacetSlice} from '../../facet-set/facet-set-state.js';
import type {DateFacetSlice} from '../../range-facets/date-facet-set/date-facet-set-state.js';
import type {NumericFacetSlice} from '../../range-facets/numeric-facet-set/numeric-facet-set-state.js';

export type AllFacetSections = FacetSection &
  NumericFacetSection &
  DateFacetSection &
  CategoryFacetSection;

export type AnyFacetSlice =
  | FacetSlice
  | NumericFacetSlice
  | DateFacetSlice
  | CategoryFacetSlice;

export type AnyFacetSetState = Record<string, AnyFacetSlice>;
