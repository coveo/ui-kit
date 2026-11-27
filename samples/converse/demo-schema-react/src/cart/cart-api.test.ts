import {afterEach, describe, expect, it, vi} from 'vitest';
import {addItem, CartApiError, getCart, purchase, removeItem} from './cart-api.js';

const ITEM = {productId: 'wax', name: 'Wax', unitPrice: 4.5, quantity: 2};

function stubFetch(response: Response) {
  const fetchMock = vi.fn(async (_url: string, _init?: RequestInit) => response);
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

describe('cart API client', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it.each([
    ['getCart', () => getCart(), undefined, '/api/cart', undefined],
    ['addItem', () => addItem(ITEM), 'POST', '/api/cart/items', ITEM],
    ['purchase', () => purchase(), 'POST', '/api/cart/purchase', undefined],
  ])('%s sends %s %s', async (_, send, method, url, body) => {
    const fetchMock = stubFetch(Response.json({ok: true}));

    await expect(send()).resolves.toEqual({ok: true});

    const [calledUrl, init] = fetchMock.mock.calls[0];
    expect(calledUrl).toBe(url);
    expect(init?.method).toBe(method);
    expect(init?.body === undefined ? undefined : JSON.parse(String(init.body))).toEqual(body);
  });

  it('URL-encodes the product id of a removal', async () => {
    const fetchMock = stubFetch(Response.json({}));

    await removeItem('gid://shopify/ProductVariant/123', 2);
    await removeItem('wax');

    expect(fetchMock.mock.calls.map(([url, init]) => [init?.method, url])).toEqual([
      ['DELETE', '/api/cart/items/gid%3A%2F%2Fshopify%2FProductVariant%2F123?quantity=2'],
      ['DELETE', '/api/cart/items/wax'],
    ]);
  });

  it.each([
    [Response.json({error: 'The cart is empty.'}, {status: 409}), 409, 'The cart is empty.'],
    [new Response('Bad gateway', {status: 502}), 502, 'Cart API request failed with status 502'],
  ])('throws a CartApiError for a non-2xx response', async (response, status, message) => {
    stubFetch(response);

    const error = await purchase().catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(CartApiError);
    expect(error).toMatchObject({status, message});
  });
});
