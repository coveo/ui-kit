// ─── Top-level request envelope ────────────────────────────────────────────

export interface AgUiPayloadRequest {
  session: AgUiSession;
  messages: AgUiMessage[];
  requestContext: Record<string, unknown>;
  forwardedProps: Record<string, unknown>;
  agentInput: CommerceAguiRequestModel;
}

export interface AgUiSession {
  threadId: string;
  continuationTokens: Record<string, unknown>;
  runId?: string;
  clientMessageId?: string;
}

export interface AgUiMessage {
  id: string;
  role: string;
  content: string;
}

// ─── Commerce agent input ──────────────────────────────────────────────────

export interface CommerceAguiRequestModel {
  trackingId: string;
  language: string;
  country: string;
  currency: string;
  clientId?: string;
  message: string | null;
  action: A2uiAction | null;
  conversationSessionId?: string;
  conversationToken?: string;
  context: CommerceAguiContext;
  pinnedProducts: string[];
}

export interface CommerceAguiContext {
  view: {url: string | null; referrer: string | null};
  user: Record<string, unknown>;
  cart: CommerceAguiCartItem[];
  source: string[];
  custom: Record<string, unknown>;
}

export interface CommerceAguiCartItem {
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

export interface SortField {
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

export interface FacetRestore {
  facetId: string;
  values: string[];
  numericRanges: NumericRange[];
}

export interface NumericRange {
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

export interface FetchSuggestionsContext {
  query: string;
}

export interface FacetSearchContext {
  facetId: string;
  query: string;
}

// ─── Analytics action contexts ─────────────────────────────────────────────

export interface CartActionContext {
  productId: string;
  name?: string;
  price?: number;
  quantity: number;
  action: 'add' | 'remove';
}

export interface ProductClickContext {
  productId: string;
  name?: string;
  price?: number;
  position: number;
}

export interface ProductViewContext {
  productId: string;
  name?: string;
  price?: number;
}

export interface PurchaseContext {
  products: PurchaseProduct[];
  transaction: Transaction;
}

export interface PurchaseProduct {
  productId: string;
  name?: string;
  price?: number;
  quantity: number;
}

export interface Transaction {
  id: string;
  revenue: number;
}
