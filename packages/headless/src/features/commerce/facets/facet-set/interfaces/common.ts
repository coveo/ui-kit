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
 * The type of a commerce facet.
 *
 * The `'dateRange'` type is deprecated: the Commerce API removes date range facets in June 2027, with no
 * replacement, and the next major version removes it from this type.
 */
export type FacetType = 'regular' | 'dateRange' | 'numericalRange' | 'hierarchical';
