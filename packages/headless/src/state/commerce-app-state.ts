import {
  CommercePaginationSection,
  CartSection,
  CommerceContextSection,
  ConfigurationSection,
  ProductListingV2Section,
  VersionSection,
  CommerceSortSection,
  CommerceSearchSection,
  CommerceQuerySection,
  CommerceFacetSetSection,
  FacetOrderSection,
  QuerySuggestionSection,
  QuerySetSection,
  FacetSearchSection,
  CategoryFacetSearchSection,
} from './state-sections';

// eslint-disable-next-line @cspell/spellchecker
// TODO CAPI-546: Handle only the query param for now. Add facets, sort, pagination later.
export type CommerceSearchParametersState = CommerceQuerySection;
export type CommerceProductListingParametersState = {};

export type CommerceAppState = ConfigurationSection &
  ProductListingV2Section &
  CommerceSearchSection &
  CommerceQuerySection &
  FacetOrderSection &
  FacetSearchSection &
  CategoryFacetSearchSection &
  CommerceFacetSetSection &
  CommercePaginationSection &
  CommerceSortSection &
  CommerceContextSection &
  CartSection &
  QuerySuggestionSection &
  QuerySetSection &
  VersionSection;
