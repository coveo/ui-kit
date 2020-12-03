import {
  CategoryFacetSection,
  DateFacetSection,
  FacetSection,
  NumericFacetSection,
} from '../../../../state/state-sections';

export type AllFacetSections = FacetSection &
  NumericFacetSection &
  DateFacetSection &
  CategoryFacetSection;
