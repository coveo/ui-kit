import type {IncomingMessage, ServerResponse} from 'node:http';
import {Readable} from 'node:stream';
import {runInNewContext} from 'node:vm';
import {beforeEach, describe, expect, it} from 'vitest';
import type {AddCartItemRequest, Cart, PurchaseResult} from '../../src/cart/cart-api.js';
import {createCartApiMiddleware, type CartApiMiddleware} from './cart-api-middleware.js';

interface FakeResponse {
  status: number;
  headers: Record<string, string>;
  body: unknown;
  passedToNext: boolean;
}

interface CallOptions {
  body?: unknown;
  rawBody?: string;
  cookie?: string | null;
}

const BOARD: AddCartItemRequest = {
  productId: 'gid://shopify/ProductVariant/123',
  name: 'Surfboard',
  imageUrl: 'https://example.com/board.png',
  clickUri: 'https://example.com/board',
  unitPrice: 199.99,
  quantity: 1,
};

const WAX: AddCartItemRequest = {productId: 'wax', name: 'Wax', unitPrice: 4.5, quantity: 2};

function call(
  handler: CartApiMiddleware,
  method: string,
  url: string,
  {body, rawBody, cookie = 'demo-cart-id=cart-1'}: CallOptions = {}
): Promise<FakeResponse> {
  const payload = rawBody ?? (body === undefined ? undefined : JSON.stringify(body));
  const req = Object.assign(Readable.from(payload === undefined ? [] : [Buffer.from(payload)]), {
    method,
    url,
    headers: cookie ? {cookie} : {},
  }) as unknown as IncomingMessage;

  return new Promise((resolve, reject) => {
    const response: FakeResponse = {status: 200, headers: {}, body: undefined, passedToNext: false};
    const res = {
      set statusCode(status: number) {
        response.status = status;
      },
      setHeader(name: string, value: string) {
        response.headers[name.toLowerCase()] = value;
      },
      end(text: string) {
        response.body =
          response.headers['content-type'] === 'application/json' ? JSON.parse(text) : text;
        resolve(response);
      },
    } as unknown as ServerResponse;
    handler(req, res, (error?: unknown) => {
      if (error) {
        reject(error);
        return;
      }
      response.passedToNext = true;
      resolve(response);
    });
  });
}

const productIds = (response: FakeResponse) =>
  (response.body as Cart).items.map(({productId}) => productId);

describe('createCartApiMiddleware', () => {
  let handler: CartApiMiddleware;

  beforeEach(() => {
    handler = createCartApiMiddleware();
  });

  it('adds a product, with null for its missing image and link', async () => {
    const response = await call(handler, 'POST', '/api/cart/items', {body: WAX});

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      currency: 'USD',
      items: [
        {
          productId: 'wax',
          name: 'Wax',
          imageUrl: null,
          clickUri: null,
          unitPrice: 4.5,
          quantity: 2,
          lineTotal: 9,
        },
      ],
      totalQuantity: 2,
      subtotal: 9,
      total: 9,
    });
  });

  it('adds to the line of a product already in the cart, keeping its details and order', async () => {
    await call(handler, 'POST', '/api/cart/items', {body: BOARD});
    await call(handler, 'POST', '/api/cart/items', {body: WAX});
    const response = await call(handler, 'POST', '/api/cart/items', {
      body: {...BOARD, name: 'Renamed', unitPrice: 1, quantity: 2},
    });

    const cart = response.body as Cart;
    expect(cart.items[0]).toEqual({
      productId: BOARD.productId,
      name: 'Surfboard',
      imageUrl: BOARD.imageUrl,
      clickUri: BOARD.clickUri,
      unitPrice: 199.99,
      quantity: 3,
      lineTotal: 599.97,
    });
    expect(productIds(response)).toEqual([BOARD.productId, 'wax']);
    expect(cart.totalQuantity).toBe(5);
  });

  it('rounds the amounts to cents', async () => {
    await call(handler, 'POST', '/api/cart/items', {
      body: {productId: 'a', name: 'A', unitPrice: 0.1, quantity: 3},
    });
    const response = await call(handler, 'POST', '/api/cart/items', {
      body: {productId: 'b', name: 'B', unitPrice: 1.005, quantity: 1},
    });

    const cart = response.body as Cart;
    expect(cart.items.map(({unitPrice, lineTotal}) => [unitPrice, lineTotal])).toEqual([
      [0.1, 0.3],
      [1, 1],
    ]);
    expect(cart.subtotal).toBe(1.3);
    expect(cart.total).toBe(1.3);
  });

  it('removes some units of a product, drops a line at 0, and the whole line without a quantity', async () => {
    await call(handler, 'POST', '/api/cart/items', {body: {...BOARD, quantity: 3}});
    await call(handler, 'POST', '/api/cart/items', {body: WAX});
    const board = encodeURIComponent(BOARD.productId);

    const partial = await call(handler, 'DELETE', `/api/cart/items/${board}?quantity=2`);
    expect((partial.body as Cart).items[0]).toMatchObject({quantity: 1});

    const dropped = await call(handler, 'DELETE', `/api/cart/items/${board}?quantity=5`);
    expect(productIds(dropped)).toEqual(['wax']);

    const whole = await call(handler, 'DELETE', '/api/cart/items/wax');
    expect(whole.body).toMatchObject({items: [], totalQuantity: 0, subtotal: 0, total: 0});
  });

  it('purchases the cart as the data of an ec.purchase event, and empties the cart', async () => {
    await call(handler, 'POST', '/api/cart/items', {body: BOARD});
    const {body: cart} = await call(handler, 'POST', '/api/cart/items', {body: WAX});
    const response = await call(handler, 'POST', '/api/cart/purchase');

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toBe('application/json');
    expect(response.body as PurchaseResult).toEqual({
      currency: 'USD',
      products: [
        {product: {productId: BOARD.productId, name: 'Surfboard', price: 199.99}, quantity: 1},
        {product: {productId: 'wax', name: 'Wax', price: 4.5}, quantity: 2},
      ],
      transaction: {id: expect.stringMatching(/^order-.+/), revenue: 208.99},
      purchasedAt: expect.any(String),
      cart,
    });

    const after = await call(handler, 'GET', '/api/cart');
    expect((after.body as Cart).items).toEqual([]);
  });

  describe('cart id cookie', () => {
    it('sets a new cart id cookie when the request has none', async () => {
      const response = await call(handler, 'GET', '/api/cart', {cookie: null});

      expect(response.headers['set-cookie']).toMatch(/^demo-cart-id=[^;]+; Path=\/; SameSite=Lax$/);
    });

    it('keeps a cart for each cookie', async () => {
      await call(handler, 'POST', '/api/cart/items', {body: BOARD, cookie: 'demo-cart-id=cart-1'});
      await call(handler, 'POST', '/api/cart/items', {body: WAX, cookie: 'demo-cart-id=cart-2'});

      const first = await call(handler, 'GET', '/api/cart', {cookie: 'demo-cart-id=cart-1'});
      const second = await call(handler, 'GET', '/api/cart', {cookie: 'demo-cart-id=cart-2'});
      expect(productIds(first)).toEqual([BOARD.productId]);
      expect(productIds(second)).toEqual(['wax']);
    });
  });

  describe('bootstrap script', () => {
    function runScript(source: string): unknown {
      const window: Record<string, unknown> = {};
      runInNewContext(source, {window});
      return window['__DEMO_CART__'];
    }

    it("sets window.__DEMO_CART__ to the cookie's cart, uncached, as JavaScript", async () => {
      const {body: cart} = await call(handler, 'POST', '/api/cart/items', {body: WAX});
      const response = await call(handler, 'GET', '/api/cart/bootstrap.js');

      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toBe('text/javascript; charset=utf-8');
      expect(response.headers['cache-control']).toBe('no-store');
      expect(response.body).toMatch(/^window\.__DEMO_CART__ = \{.*\};\n$/);
      expect(runScript(response.body as string)).toEqual(cart);
    });

    it('sets an empty cart, and the cart id cookie, on a first visit', async () => {
      const response = await call(handler, 'GET', '/api/cart/bootstrap.js', {cookie: null});

      expect(response.headers['set-cookie']).toMatch(/^demo-cart-id=[^;]+; Path=\//);
      expect(runScript(response.body as string)).toMatchObject({items: [], total: 0});
    });

    it('escapes a product name that could end the script or break its line', async () => {
      const name = 'Board </script><script>alert(1)</script> <!-- \u2028\u2029 end';
      await call(handler, 'POST', '/api/cart/items', {body: {...WAX, name}});
      const response = await call(handler, 'GET', '/api/cart/bootstrap.js');

      const source = response.body as string;
      expect(source).not.toContain('<');
      expect(source).not.toMatch(/[\u2028\u2029]/);
      expect((runScript(source) as Cart).items[0].name).toBe(name);
    });
  });

  describe('errors', () => {
    it.each([
      ['an invalid JSON body', {rawBody: '{nope'}],
      ['a body that is not an object', {body: [WAX]}],
      ['an empty productId', {body: {...WAX, productId: ''}}],
      ['a unitPrice that is not a number', {body: {...WAX, unitPrice: '4.50'}}],
      ['a zero quantity', {body: {...WAX, quantity: 0}}],
      ['a fractional quantity', {body: {...WAX, quantity: 1.5}}],
    ])('answers 400 to an item with %s', async (_, options: CallOptions) => {
      const response = await call(handler, 'POST', '/api/cart/items', options);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({error: expect.any(String)});
    });

    it.each(['0', '1.5', 'two'])('answers 400 to a removal of quantity %j', async (quantity) => {
      await call(handler, 'POST', '/api/cart/items', {body: WAX});
      const response = await call(handler, 'DELETE', `/api/cart/items/wax?quantity=${quantity}`);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({error: expect.any(String)});
    });

    it('answers 404 to removing a product that is not in the cart', async () => {
      const response = await call(handler, 'DELETE', '/api/cart/items/missing');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({error: expect.any(String)});
    });

    it('answers 409 to purchasing an empty cart', async () => {
      const response = await call(handler, 'POST', '/api/cart/purchase');

      expect(response.status).toBe(409);
      expect(response.body).toEqual({error: expect.any(String)});
    });

    it.each([
      ['POST', '/api/cart', 'GET'],
      ['GET', '/api/cart/items', 'POST'],
      ['POST', '/api/cart/items/wax', 'DELETE'],
      ['POST', '/api/cart/bootstrap.js', 'GET'],
    ])('answers 405 to %s %s', async (method, url, allowed) => {
      const response = await call(handler, method, url);

      expect(response.status).toBe(405);
      expect(response.headers['allow']).toBe(allowed);
      expect(response.body).toEqual({error: expect.any(String)});
    });

    it.each(['/api/cart/unknown', '/api/cart/items/wax/more'])(
      'answers 404 to the unknown route %s',
      async (url) => {
        const response = await call(handler, 'GET', url);

        expect(response.status).toBe(404);
        expect(response.body).toEqual({error: expect.any(String)});
      }
    );
  });

  it.each(['/', '/api/carts'])('passes %s to the next handler', async (url) => {
    const response = await call(handler, 'GET', url, {cookie: null});

    expect(response.passedToNext).toBe(true);
    expect(response.headers['set-cookie']).toBeUndefined();
  });
});
