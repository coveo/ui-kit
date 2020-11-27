import {CategoryFacetSetState} from '../../category-facet-set/category-facet-set-state';
import {FacetSetState} from '../../facet-set/facet-set-state';
import {DateFacetSetState} from '../../range-facets/date-facet-set/date-facet-set-state';
import {NumericFacetSetState} from '../../range-facets/numeric-facet-set/numeric-facet-set-state';

export type AnyFacetSetState =
  | FacetSetState
  | NumericFacetSetState
  | DateFacetSetState
  | CategoryFacetSetState;
