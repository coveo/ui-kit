import {VNode} from '@stencil/core';
import {
  SearchStatus,
  SearchStatusState,
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
} from '@coveo/headless';
export interface FacetInfo {
  label: string;
}

export type FacetType =
  | 'facets'
  | 'numericFacets'
  | 'dateFacets'
  | 'categoryFacets';

export interface FacetValueFormat<ValueType> {
  format(facetValue: ValueType): string;
  content?(facetValue: ValueType): VNode;
}

export type FacetStore<F extends FacetInfo> = Record<string, F>;

export type PropsOnAllFacets = {
  facetId?: string;
  label?: string;
  field: string;
  filterFacetCount: boolean;
  injectionDepth: number;
  dependsOn: Record<string, string>;
};

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

export type BaseFacetElement<FacetType extends AnyFacetType = AnyFacetType> =
  HTMLElement &
    Required<PropsOnAllFacets> &
    SearchProp<FacetType> &
    NumberOfValuesProp<FacetType> &
    NumberOfIntervalsProp<FacetType> &
    SortCriterionProp<FacetType> &
    DisplayValuesAsProp &
    CollapsedProp &
    HeadingLevelProp;

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
