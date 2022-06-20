import {
  SearchStatus,
  SearchStatusState,
  AnyFacetValuesCondition,
  AnyFacetValueRequest,
  FacetValueRequest,
  CategoryFacetValueRequest,
  Facet,
  NumericFacet,
  CategoryFacet,
  DateFacet,
  FacetState,
  NumericFacetState,
  CategoryFacetState,
  DateFacetState,
  FacetSortCriterion,
  CategoryFacetSortCriterion,
  RangeFacetSortCriterion,
  FacetValue,
} from '@coveo/headless';
import {i18n} from 'i18next';

type AnyFacetType = Facet | NumericFacet | CategoryFacet | DateFacet;

export type BaseFacet<FacetType extends AnyFacetType> = {
  facet?: FacetType;
  searchStatus: SearchStatus;
  searchStatusState: SearchStatusState;
  error: Error;
} & PropsOnAllFacets &
  StateProp<FacetType> &
  SearchProp<FacetType> &
  NumberOfValuesProp<FacetType> &
  NumberOfIntervalsProp<FacetType> &
  SortCriterionProp<FacetType> &
  DisplayValuesAsProp &
  CollapsedProp &
  HeadingLevelProp;

type PropsOnAllFacets = {
  facetId?: string;
  label?: string;
  field: string;

  filterFacetCount: boolean;
  injectionDepth: number;
  dependsOn: Record<string, string>;
};

type StateProp<FacetType extends AnyFacetType> = FacetType extends Facet
  ? {facetState: FacetState}
  : FacetType extends NumericFacet
  ? {facetState: NumericFacetState}
  : FacetType extends CategoryFacet
  ? {facetState: CategoryFacetState}
  : FacetType extends DateFacet
  ? {facetState: DateFacetState}
  : {facetState: never};

type SearchProp<FacetType extends AnyFacetType> = FacetType extends
  | Facet
  | CategoryFacet
  ? {withSearch: boolean}
  : {};

type NumberOfValuesProp<FacetType extends AnyFacetType> = FacetType extends
  | Facet
  | CategoryFacet
  ? {numberOfValues: number}
  : {};

type NumberOfIntervalsProp<FacetType extends AnyFacetType> =
  FacetType extends NumericFacet ? {numberOfIntervals?: number} : {};

type SortCriterionProp<FacetType extends AnyFacetType> = FacetType extends
  | Facet
  | CategoryFacet
  ? {
      sortCriteria: FacetType extends Facet
        ? FacetSortCriterion
        : CategoryFacetSortCriterion;
    }
  : FacetType extends NumericFacet
  ? {sortCriteria?: RangeFacetSortCriterion}
  : {};

type DisplayValuesAsProp = {
  displayValueAs?: 'checkbox' | 'box' | 'link';
};

type CollapsedProp = {isCollapsed?: boolean};

type HeadingLevelProp = {headingLevel?: number};

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

export function shouldDisplayInputForFacetRange(facetRange: {
  hasInput: boolean;
  hasInputRange: boolean;
  searchStatusState: SearchStatusState;
  facetValues: Pick<FacetValue, 'numberOfResults' | 'state'>[];
}) {
  const {hasInput, hasInputRange, searchStatusState, facetValues} = facetRange;
  if (!hasInput) {
    return false;
  }

  if (hasInputRange) {
    return true;
  }

  if (!searchStatusState.hasResults) {
    return false;
  }

  const onlyValuesWithResultsOrActive =
    facetValues.filter(
      (value) => value.numberOfResults || value.state !== 'idle'
    ) || [];

  if (!onlyValuesWithResultsOrActive.length) {
    return false;
  }

  return true;
}
