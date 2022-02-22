import {SearchStatus, SearchStatusState} from '@coveo/headless';
import {i18n} from 'i18next';
import {DependsOnParam} from '../../utils/store';
import {
  buildFacetDependsOnAnyValueCondition,
  buildFacetDependsOnSpecificValueCondition,
} from './facet-depends-on/facet-dependency-conditions';

export interface BaseFacet<Facet, FacetState> {
  facet?: Facet;
  facetState?: FacetState;
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
  searchQuery?: string;
  class?: string;
  part?: string;
  buttonRef?: (element?: HTMLButtonElement) => void;
}

export function parseDependsOn(
  dependsOn: Record<string, string>
): DependsOnParam[] {
  return Object.entries(dependsOn).map(([facetId, value]) => {
    if (!value) {
      return {
        parentFacetId: facetId,
        isDependencyMet: buildFacetDependsOnAnyValueCondition(),
      };
    } else {
      return {
        parentFacetId: facetId,
        isDependencyMet: buildFacetDependsOnSpecificValueCondition(value),
      };
    }
  });
}
