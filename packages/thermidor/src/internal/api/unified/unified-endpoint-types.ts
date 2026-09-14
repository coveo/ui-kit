// ─── Commerce agent input ──────────────────────────────────────────────────

export interface CommerceRequestModel {
  trackingId: string;
  language: string;
  country: string;
  currency: string;
  clientId?: string;
  message: string | null;
  action: A2uiAction | null;
  conversationSessionId?: string;
  conversationToken?: string;
  context: CommerceRequestContext;
  pinnedProducts: string[];
}

interface CommerceRequestContext {
  view: {url: string | null; referrer: string | null};
  user: Record<string, unknown>;
  cart: CommerceCartItem[];
  source: string[];
  custom: Record<string, unknown>;
}

interface CommerceCartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

// ─── Action envelope ───────────────────────────────────────────────────────

export interface A2uiAction<TContext = unknown> {
  surfaceId: string | null;
  name: string;
  sourceComponentId: string;
  timestamp: string;
  actionId: string | null;
  wantResponse: boolean;
  context: TContext;
}

// ─── Search action contexts ────────────────────────────────────────────────

export interface ExecuteSearchContext {
  query: string;
  display?: string | null;
  pinnedProducts?: string[];
}

export interface ToggleFacetContext {
  facetId: string;
  value: string;
}

export interface ToggleExcludeFacetContext {
  facetId: string;
  value: string;
}

export interface DeselectAllFacetsContext {
  facetId: string;
}

export interface ToggleNumericFacetContext {
  facetId: string;
  start: number;
  end: number;
  endInclusive: boolean;
}

export interface SetNumericFacetRangeContext {
  facetId: string;
  start: number;
  end: number;
  endInclusive: boolean;
}

export interface SelectPageContext {
  page: number;
}

export interface SetPageSizeContext {
  pageSize: number;
}

export interface SetSortContext {
  sortCriteria: string;
  fields?: SortField[];
}

interface SortField {
  field: string;
  direction: string;
}

export interface FetchMoreContext {}

export interface RestoreStateContext {
  query?: string;
  facets?: FacetRestore[];
  page: number;
  pageSize: number;
  sortCriteria?: string;
  pinnedProducts?: string[];
}

interface FacetRestore {
  facetId: string;
  values: string[];
  numericRanges: NumericRange[];
}

interface NumericRange {
  start: number;
  end: number;
  endInclusive: boolean;
}

export interface OverrideCorrectionContext {
  originalQuery: string;
}

export interface SelectProductsContext {
  productIds: string[];
}

// ─── Suggestion action contexts ────────────────────────────────────────────

interface FetchSuggestionsContext {
  query: string;
}

interface FacetSearchContext {
  facetId: string;
  query: string;
}

// ─── Analytics action contexts ─────────────────────────────────────────────

interface CartActionContext {
  productId: string;
  name?: string;
  price?: number;
  quantity: number;
  action: 'add' | 'remove';
}

interface ProductClickContext {
  productId: string;
  name?: string;
  price?: number;
  position: number;
}

interface ProductViewContext {
  productId: string;
  name?: string;
  price?: number;
}

interface PurchaseContext {
  products: PurchaseProduct[];
  transaction: Transaction;
}

interface PurchaseProduct {
  productId: string;
  name?: string;
  price?: number;
  quantity: number;
}

interface Transaction {
  id: string;
  revenue: number;
}
