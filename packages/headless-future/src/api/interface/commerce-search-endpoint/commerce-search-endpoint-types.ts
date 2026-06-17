export interface CommerceSearchRequest {
  trackingId: string;
  language: string;
  country: string;
  currency: string;
  query: string;
  context: CommerceSearchContext;
  clientId?: string;
  facets?: CommerceSearchFacetRequest[];
  page?: number;
  perPage?: number;
  sort?: CommerceSearchSortCriterion[];
  debug?: boolean;
  enableResults?: boolean;
  legacyFacetOptions?: {freezeFacetOrder?: boolean};
}

export interface CommerceSearchContext {
  view: {url: string};
  user?: {userAgent?: string};
  cart?: Array<{productId: string; quantity: number}>;
  source?: string[];
  capture?: boolean;
  labels?: Record<string, string>;
  custom?: Record<string, unknown>;
}

export interface CommerceSearchResponse {
  responseId: string;
  products: CommerceProduct[];
  results: CommerceResult[];
  facets: CommerceSearchFacetResponse[];
  pagination: CommerceSearchPagination;
  sort: CommerceSearchSort;
  triggers: CommerceSearchTrigger[];
  queryCorrection?: CommerceSearchQueryCorrection;
}

export interface CommerceProduct {
  permanentid: string;
  ec_name: string;
  ec_description?: string;
  ec_shortdesc?: string;
  ec_brand?: string;
  ec_category?: string[];
  ec_price?: number;
  ec_promo_price?: number;
  ec_images?: string[];
  ec_thumbnails?: string[];
  ec_in_stock?: boolean;
  ec_rating?: number | null;
  ec_color?: string;
  ec_item_group_id?: string;
  ec_item_group_name?: string;
  clickUri?: string;
  additionalFields: Record<string, unknown>;
  children?: CommerceProduct[];
}

export interface CommerceResult {
  uniqueId: string;
  title: string;
  uri: string;
  excerpt?: string;
  printableUri: string;
  clickUri: string;
  raw: Record<string, unknown>;
}

export interface CommerceSearchFacetRequest {
  field: string;
  type: string;
  numberOfValues?: number;
  currentValues?: Array<{value: string; state: 'selected' | 'idle'}>;
}

export interface CommerceSearchFacetResponse {
  facetId: string;
  field: string;
  type: string;
  values: Array<{value: string; numberOfResults: number; state: string}>;
}

export interface CommerceSearchPagination {
  page: number;
  perPage: number;
  totalEntries: number;
  totalPages: number;
}

export interface CommerceSearchSort {
  appliedSort: CommerceSearchSortCriterion;
  availableSorts: CommerceSearchSortCriterion[];
}

export interface CommerceSearchSortCriterion {
  sortCriteria: string;
}

export interface CommerceSearchTrigger {
  type: string;
  content: string;
}

export interface CommerceSearchQueryCorrection {
  correctedQuery: string;
  originalQuery: string;
}
