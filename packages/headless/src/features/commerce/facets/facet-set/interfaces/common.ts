export type NumericFacetExtraProperties = {
  domain?: NumericFacetDomain;
  interval: NumericFacetInterval;
};

type NumericFacetDomain = {
  min: number;
  max: number;
  increment: number;
};

type NumericFacetInterval = 'continuous' | 'discrete' | 'even' | 'equiprobable';

export type CategoryFacetDelimitingCharacter = {
  delimitingCharacter: string;
};

/**
 * @group Core types and interfaces
 * @category Facets
 */
export type FacetType =
  | 'regular'
  | 'dateRange'
  | 'numericalRange'
  | 'hierarchical';
