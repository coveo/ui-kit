import {randomUUID} from 'node:crypto';
import type {IncomingMessage, ServerResponse} from 'node:http';
import {
  BOOTSTRAPPED_CART_GLOBAL,
  CART_API_PATH,
  type AddCartItemRequest,
  type Cart,
  type CartLine,
  type PurchaseResult,
} from '../../src/cart/cart-api.js';

const CART_ID_COOKIE = 'demo-cart-id';

type StoredLine = Omit<CartLine, 'lineTotal'>;

export type CartApiMiddleware = (
  req: IncomingMessage,
  res: ServerResponse,
  next: (error?: unknown) => void
) => void;

class Script {
  constructor(readonly source: string) {}
}

class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly headers: Record<string, string> = {}
  ) {
    super(message);
  }
}

export function createCartApiMiddleware(): CartApiMiddleware {
  const carts = new Map<string, StoredLine[]>();

  return (req, res, next) => {
    const url = new URL(req.url ?? '/', 'http://localhost');
    if (url.pathname !== CART_API_PATH && !url.pathname.startsWith(`${CART_API_PATH}/`)) {
      next();
      return;
    }

    const cookieCartId = readCookie(req.headers.cookie, CART_ID_COOKIE);
    const cartId = cookieCartId ?? randomUUID();
    if (!cookieCartId) {
      res.setHeader('Set-Cookie', `${CART_ID_COOKIE}=${cartId}; Path=/; SameSite=Lax`);
    }
    const lines = () => carts.get(cartId) ?? [];
    const setLines = (next: StoredLine[]) => carts.set(cartId, next);

    handle(req, url, lines, setLines).then(
      (body) =>
        body instanceof Script
          ? send(res, 200, 'text/javascript; charset=utf-8', body.source)
          : send(res, 200, 'application/json', JSON.stringify(body)),
      (error: unknown) => {
        if (error instanceof HttpError) {
          for (const [name, value] of Object.entries(error.headers)) {
            res.setHeader(name, value);
          }
          send(res, error.status, 'application/json', JSON.stringify({error: error.message}));
          return;
        }
        next(error);
      }
    );
  };
}

async function handle(
  req: IncomingMessage,
  url: URL,
  lines: () => StoredLine[],
  setLines: (lines: StoredLine[]) => void
): Promise<Cart | PurchaseResult | Script> {
  const route = url.pathname.slice(CART_API_PATH.length);
  const method = req.method ?? 'GET';

  if (route === '' || route === '/') {
    assertMethod(method, 'GET');
    return toCart(lines());
  }

  if (route === '/bootstrap.js') {
    assertMethod(method, 'GET');
    return new Script(
      `window.${BOOTSTRAPPED_CART_GLOBAL} = ${toScriptLiteral(toCart(lines()))};\n`
    );
  }

  if (route === '/items') {
    assertMethod(method, 'POST');
    const item = parseAddItem(await readJson(req));
    const current = lines();
    const existing = current.find((line) => line.productId === item.productId);
    setLines(
      existing
        ? current.map((line) =>
            line === existing ? {...line, quantity: line.quantity + item.quantity} : line
          )
        : [
            ...current,
            {
              productId: item.productId,
              name: item.name,
              imageUrl: item.imageUrl ?? null,
              clickUri: item.clickUri ?? null,
              unitPrice: roundToCents(item.unitPrice),
              quantity: item.quantity,
            },
          ]
    );
    return toCart(lines());
  }

  if (/^\/items\/[^/]+$/.test(route)) {
    assertMethod(method, 'DELETE');
    const productId = decodeURIComponent(route.slice('/items/'.length));
    const quantityParam = url.searchParams.get('quantity');
    const quantity = quantityParam === null ? undefined : parseQuantityParam(quantityParam);
    const current = lines();
    const existing = current.find((line) => line.productId === productId);
    if (!existing) {
      throw new HttpError(404, `Product ${productId} is not in the cart.`);
    }
    const remaining = quantity === undefined ? 0 : existing.quantity - quantity;
    setLines(
      remaining > 0
        ? current.map((line) => (line === existing ? {...line, quantity: remaining} : line))
        : current.filter((line) => line !== existing)
    );
    return toCart(lines());
  }

  if (route === '/purchase') {
    assertMethod(method, 'POST');
    const cart = toCart(lines());
    if (cart.items.length === 0) {
      throw new HttpError(409, 'The cart is empty.');
    }
    setLines([]);
    return {
      currency: cart.currency,
      products: cart.items.map(({productId, name, unitPrice, quantity}) => ({
        product: {productId, name, price: unitPrice},
        quantity,
      })),
      transaction: {id: `order-${randomUUID()}`, revenue: cart.total},
      purchasedAt: new Date().toISOString(),
      cart,
    };
  }

  throw new HttpError(404, `No cart API route at ${url.pathname}.`);
}

function toCart(lines: readonly StoredLine[]): Cart {
  const items = lines.map((line) => ({
    ...line,
    lineTotal: roundToCents(line.unitPrice * line.quantity),
  }));
  const subtotal = roundToCents(items.reduce((sum, item) => sum + item.lineTotal, 0));
  return {
    currency: 'USD',
    items,
    totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0),
    subtotal,
    total: subtotal,
  };
}

/** JSON that no `</script>`, `<!--` or line separator in a string can break out of. */
function toScriptLiteral(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

function roundToCents(amount: number): number {
  return Math.round(amount * 100) / 100;
}

function assertMethod(method: string, allowed: string) {
  if (method !== allowed) {
    throw new HttpError(405, `Method ${method} is not allowed.`, {Allow: allowed});
  }
}

function parseAddItem(body: unknown): AddCartItemRequest {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    throw new HttpError(400, 'The body must be a JSON object.');
  }
  const {productId, name, imageUrl, clickUri, unitPrice, quantity} = body as Record<
    string,
    unknown
  >;
  if (typeof productId !== 'string' || productId === '') {
    throw new HttpError(400, '`productId` must be a non-empty string.');
  }
  if (typeof name !== 'string') {
    throw new HttpError(400, '`name` must be a string.');
  }
  for (const [field, value] of Object.entries({imageUrl, clickUri})) {
    if (value !== undefined && value !== null && typeof value !== 'string') {
      throw new HttpError(400, `\`${field}\` must be a string.`);
    }
  }
  if (typeof unitPrice !== 'number' || !Number.isFinite(unitPrice) || unitPrice < 0) {
    throw new HttpError(400, '`unitPrice` must be a non-negative number.');
  }
  if (!isPositiveInteger(quantity)) {
    throw new HttpError(400, '`quantity` must be a positive integer.');
  }
  return {
    productId,
    name,
    imageUrl: imageUrl as string | null | undefined,
    clickUri: clickUri as string | null | undefined,
    unitPrice,
    quantity,
  };
}

function parseQuantityParam(value: string): number {
  const quantity = /^\d+$/.test(value) ? Number(value) : Number.NaN;
  if (!isPositiveInteger(quantity)) {
    throw new HttpError(400, '`quantity` must be a positive integer.');
  }
  return quantity;
}

function isPositiveInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value > 0;
}

async function readJson(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : (chunk as Buffer));
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    throw new HttpError(400, 'The body is not valid JSON.');
  }
}

function readCookie(header: string | undefined, name: string): string | undefined {
  for (const part of header?.split(';') ?? []) {
    const separator = part.indexOf('=');
    if (separator !== -1 && part.slice(0, separator).trim() === name) {
      return part.slice(separator + 1).trim() || undefined;
    }
  }
  return undefined;
}

function send(res: ServerResponse, status: number, contentType: string, body: string) {
  res.statusCode = status;
  res.setHeader('Content-Type', contentType);
  res.setHeader('Cache-Control', 'no-store');
  res.end(body);
}
