import {Schema, StringValue} from '@coveo/bueno';
import {
  facetSortCriteria,
  FacetSortCriterion,
} from '../../../features/facets/facet-set/interfaces/request';
import {
  facetId,
  field,
  delimitingCharacter,
  filterFacetCount,
  injectionDepth,
  numberOfValues,
  facetSearch,
} from '../_common/facet-option-definitions';

export type FacetOptions = {
  field: string;
  facetId?: string;
  delimitingCharacter?: string;
  filterFacetCount?: boolean;
  injectionDepth?: number;
  numberOfValues?: number;
  sortCriteria?: FacetSortCriterion;
  facetSearch?: FacetSearchOptions;
};

type FacetSearchOptions = {
  captions?: Record<string, string>;
  numberOfValues?: number;
  query?: string;
};

export const facetOptionsSchema = new Schema<Required<FacetOptions>>({
  facetId,
  field,
  delimitingCharacter,
  filterFacetCount,
  injectionDepth,
  numberOfValues,
  sortCriteria: new StringValue({constrainTo: facetSortCriteria}),
  facetSearch,
});
