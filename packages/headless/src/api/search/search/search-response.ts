import {Result} from './result';
import {FacetResponse} from '../../../features/facets/facet-set/facet-set-interfaces';

export interface SearchResponse {
  results: Result[];
  searchUid: string;
  totalCountFiltered: number;
  facets: FacetResponse[];
}
