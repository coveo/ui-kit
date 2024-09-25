import {
  CategoryFacetSection,
  DateFacetSection,
  FacetSection,
  NumericFacetSection,
} from '../../../../state/state-sections.js';
import {CategoryFacetSlice} from '../../category-facet-set/category-facet-set-state.js';
import {FacetSlice} from '../../facet-set/facet-set-state.js';
import {DateFacetSlice} from '../../range-facets/date-facet-set/date-facet-set-state.js';
import {NumericFacetSlice} from '../../range-facets/numeric-facet-set/numeric-facet-set-state.js';

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
