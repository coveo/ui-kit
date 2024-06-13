export type NumericFacetResponseExtraProperties = {
  domain?: NumericFacetDomain;
  interval: NumericFacetInterval;
};

export type NumericFacetRequestExtraProperties =
  NumericFacetResponseExtraProperties & {
    isCustomRange?: boolean;
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

export type FacetType =
  | 'regular'
  | 'dateRange'
  | 'numericalRange'
  | 'hierarchical';
