import {Result} from './result';
import {FacetResponse} from '../../../features/facets/facet-set/facet-set-interfaces';
import {QueryCorrection} from './query-corrections';

export interface SearchResponse {
  results: Result[];
  searchUid: string;
  totalCountFiltered: number;
  facets: FacetResponse[];
  queryCorrections: QueryCorrection[];
}
