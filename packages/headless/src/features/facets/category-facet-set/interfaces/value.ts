import {CategoryFacetValue} from './response';

export interface CategoryFacetValueNode extends CategoryFacetValue {
  /** Whether the facet value have more children values to display. */
  canShowMoreValue: boolean;
  /** Whether the facet value could have less children values to display. */
  canShowLessValue: boolean;
  /** The children of this facet value. */
  children: CategoryFacetValueNode[];
}
