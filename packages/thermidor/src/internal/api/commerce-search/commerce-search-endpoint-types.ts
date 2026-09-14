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
  sort?: {
    sortCriteria: 'relevance' | 'fields';
    fields?: Array<{field: string; direction?: 'asc' | 'desc'; displayName?: string}>;
  };
  debug?: boolean;
  enableResults?: boolean;
  legacyFacetOptions?: {freezeFacetOrder?: boolean};
}

interface CommerceSearchContext {
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

interface CommerceProduct {
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

interface CommerceResult {
  uniqueId: string;
  title: string;
  uri: string;
  excerpt?: string;
  printableUri: string;
  clickUri: string;
  raw: Record<string, unknown>;
}

interface CommerceSearchFacetRequest {
  field: string;
  type: string;
  numberOfValues?: number;
  currentValues?: Array<{value: string; state: 'selected' | 'idle'}>;
}

interface CommerceSearchFacetResponse {
  facetId: string;
  field: string;
  type: string;
  values: Array<{value: string; numberOfResults: number; state: string}>;
}

interface CommerceSearchPagination {
  page: number;
  perPage?: number;
  pageSize?: number;
  totalEntries: number;
  totalPages: number;
}

interface CommerceSearchSort {
  appliedSort: CommerceSearchSortCriterion;
  availableSorts: CommerceSearchSortCriterion[];
}

interface CommerceSearchSortCriterion {
  sortCriteria?: string;
  fields?: Array<{field: string; direction?: string; displayName?: string}>;
}

interface CommerceSearchTrigger {
  type: string;
  content: string;
}

interface CommerceSearchQueryCorrection {
  correctedQuery: string;
  originalQuery: string;
}
