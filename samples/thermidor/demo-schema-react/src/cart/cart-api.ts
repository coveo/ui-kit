export interface CartLine {
  productId: string;
  name: string;
  imageUrl: string | null;
  clickUri: string | null;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface Cart {
  currency: 'USD';
  items: CartLine[];
  totalQuantity: number;
  subtotal: number;
  /** Equal to `subtotal`: the demo charges no tax or shipping. */
  total: number;
}

export interface AddCartItemRequest {
  productId: string;
  name: string;
  imageUrl?: string | null;
  clickUri?: string | null;
  unitPrice: number;
  quantity: number;
}

/** The `data` of a Coveo `ec.purchase` event, plus the purchase time and the purchased cart. */
export interface PurchaseResult {
  currency: 'USD';
  /** `product` holds only the properties the `ec/product` schema allows. */
  products: {product: {productId: string; name: string; price: number}; quantity: number}[];
  transaction: {id: string; revenue: number};
  purchasedAt: string;
  cart: Cart;
}

export const CART_API_PATH = '/api/cart';

/** The global `GET /api/cart/bootstrap.js` sets to the cart before the app starts. */
export const BOOTSTRAPPED_CART_GLOBAL = '__DEMO_CART__';

export class CartApiError extends Error {
  constructor(
    readonly status: number,
    message: string
  ) {
    super(message);
    this.name = 'CartApiError';
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${CART_API_PATH}${path}`, {
    credentials: 'same-origin',
    ...init,
    headers: {Accept: 'application/json', ...init?.headers},
  });
  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const error = (body as {error?: unknown} | null)?.error;
    throw new CartApiError(
      response.status,
      typeof error === 'string' ? error : `Cart API request failed with status ${response.status}`
    );
  }
  return body as T;
}

export function getCart(): Promise<Cart> {
  return request<Cart>('');
}

export function addItem(item: AddCartItemRequest): Promise<Cart> {
  return request<Cart>('/items', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(item),
  });
}

/** Removes `quantity` units of a product, or its whole line when `quantity` is omitted. */
export function removeItem(productId: string, quantity?: number): Promise<Cart> {
  const query = quantity === undefined ? '' : `?quantity=${quantity}`;
  return request<Cart>(`/items/${encodeURIComponent(productId)}${query}`, {method: 'DELETE'});
}

export function purchase(): Promise<PurchaseResult> {
  return request<PurchaseResult>('/purchase', {method: 'POST'});
}
