import {
  CategoryFacetSection,
  DateFacetSection,
  FacetSection,
  NumericFacetSection,
} from '../../../state/state-sections';
import {RangeFacetSortCriterion} from '../range-facets/generic/interfaces/request';
import {FacetSortCriterion} from './interfaces/request';

export type SectionNeededForFacetMetadata = FacetSection &
  CategoryFacetSection &
  DateFacetSection &
  NumericFacetSection;

export type FacetUpdateSortMetadata = {
  facetId: string;
  criterion: FacetSortCriterion | RangeFacetSortCriterion;
};

export type FacetSelectionChangeMetadata = {
  facetId: string;
  facetValue: string;
};
