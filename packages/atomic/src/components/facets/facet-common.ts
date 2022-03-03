import {
  SearchStatus,
  SearchStatusState,
  AnyFacetDependency,
  AnyFacetValueRequest,
  FacetValueRequest,
  CategoryFacetValueRequest,
} from '@coveo/headless';
import {i18n} from 'i18next';

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

function isCategoryFacetValueRequest(
  value: AnyFacetValueRequest
): value is CategoryFacetValueRequest {
  return 'children' in value && Array.isArray(value.children);
}

function isFacetValueRequest(
  value: AnyFacetValueRequest
): value is FacetValueRequest | CategoryFacetValueRequest {
  return (
    'value' in value &&
    typeof value.value === 'string' &&
    !('children' in value)
  );
}

function getSelectedCategoryFacetValueRequest(
  ancestor: CategoryFacetValueRequest
): CategoryFacetValueRequest | null {
  if (ancestor.state === 'selected') {
    return ancestor;
  }
  for (const child of ancestor.children) {
    const selectedValue = getSelectedCategoryFacetValueRequest(child);
    if (selectedValue !== null) {
      return selectedValue;
    }
  }
  return null;
}

export function parseDependsOn(
  dependsOn: Record<string, string>
): AnyFacetDependency<AnyFacetValueRequest>[] {
  return Object.entries(dependsOn).map(([parentFacetId, expectedValue]) => {
    return {
      parentFacetId,
      isDependencyMet: (values) => {
        return values.some((value) => {
          if (isCategoryFacetValueRequest(value)) {
            const selectedValue = getSelectedCategoryFacetValueRequest(value);
            if (!selectedValue) {
              return false;
            }
            if (!expectedValue) {
              return true;
            }
            return selectedValue.value === expectedValue;
          }
          if (isFacetValueRequest(value)) {
            if (value.state !== 'selected') {
              return false;
            }
            if (!expectedValue) {
              return true;
            }
            return value.value === expectedValue;
          }
          return false;
        });
      },
    };
  });
}
