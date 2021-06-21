import {SearchStatus, SearchStatusState} from '@coveo/headless';
import {i18n} from 'i18next';

export interface BaseFacet<Facet, FacetState> {
  facet: Facet;
  facetState: FacetState;
  searchStatus: SearchStatus;
  searchStatusState: SearchStatusState;
  error: Error;
  isCollapsed: Boolean;
  label: string;
  field: string;
}

export interface FacetValueProps {
  i18n: i18n;
  displayValue: string;
  numberOfResults: number;
  isSelected: boolean;
  onClick(): void;
}
