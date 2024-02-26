import {
  FacetSearchSection,
  QuerySection,
} from '../../../../state/state-sections';
import {StateNeededByQueryCommerceAPI} from '../../common/actions';

export type StateNeededForCommerceFacetSearch = StateNeededByQueryCommerceAPI &
  FacetSearchSection &
  Partial<QuerySection>;
