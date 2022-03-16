import {
  SearchStatus,
  SearchStatusState,
  AnyFacetValuesCondition,
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
): value is FacetValueRequest {
  return (
    'value' in value &&
    typeof value.value === 'string' &&
    !('children' in value)
  );
}

function getSelectedCategoryFacetValueRequest(
  value: CategoryFacetValueRequest
): CategoryFacetValueRequest | null {
  if (value.state === 'selected') {
    return value;
  }
  for (const child of value.children) {
    const selectedValue = getSelectedCategoryFacetValueRequest(child);
    if (selectedValue !== null) {
      return selectedValue;
    }
  }
  return null;
}

export function parseDependsOn(
  dependsOn: Record<string, string>
): AnyFacetValuesCondition<AnyFacetValueRequest>[] {
  return Object.entries(dependsOn).map(([parentFacetId, expectedValue]) => {
    return {
      parentFacetId,
      condition: (values) => {
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

export function validateDependsOn(dependsOn: Record<string, string>) {
  if (Object.keys(dependsOn).length > 1) {
    throw "Depending on multiple facets isn't supported";
  }
}
