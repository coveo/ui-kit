export type NumericFacetDomain = {
  domain: NumericFacetDomainProperties;
};

type NumericFacetDomainProperties = {
  min: number;
  max: number;
  increment: number;
};

export type CategoryFacetDelimitingCharacter = {
  delimitingCharacter: string;
};

export type FacetType =
  | 'regular'
  | 'dateRange'
  | 'numericalRange'
  | 'hierarchical';
