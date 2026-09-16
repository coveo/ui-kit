import fc from 'fast-check';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {z} from 'zod/v4';

/**
 * Absent vs. empty context.
 *
 * `createSession(config)` builds every request through `buildBaseRequest()`,
 * invoking the `commerceContextProvider` fresh at request-build time (ADR-012).
 * The two commerce-context encodings must be distinguishable on the wire even
 * when the provider returns an empty cart:
 *
 *   - ABSENT (no `commerceContextProvider`): `context = { view, user,
 *     cart: [] }` with NO `context.source`, NO `context.custom`, and NO
 *     top-level `pinnedProducts` field.
 *   - PRESENT (`commerceContextProvider` supplied): `context = { view,
 *     user, cart: <provider cart>, source, custom }` plus a top-level
 *     `pinnedProducts` field — structurally distinct from the absent encoding
 *     and round-tripping the provider's cart, even when that cart is `[]`.
 *
 * The request never leaves the process: the endpoint client is mocked (as in
 * `create-session.test.ts`) so `call`'s first argument — the built request —
 * can be captured and inspected. A `submit({prompt})` drives one turn, and a
 * `RUN_FINISHED` frame closes the stream so the submit promise settles.
 */

const callMock =
  vi.fn<
    (
      request: unknown,
      configuration: unknown,
      options?: {signal?: AbortSignal}
    ) => Promise<
      {success: true; data: {stream: ReadableStream<Uint8Array>}} | {success: false; error: string}
    >
  >();

vi.mock('@/src/internal/api/unified/unified-endpoint-client.js', () => ({
  createUnifiedEndpointClient: () => ({call: callMock}),
}));

import {createSession, type CommerceContext, type SessionConfig} from './create-session.js';

const encoder = new TextEncoder();

function sseFrame(activity: Record<string, unknown>): Uint8Array {
  return encoder.encode(`data: ${JSON.stringify(activity)}\n\n`);
}

/**
 * Queues a single-frame stream as the next `call` result: it emits a
 * `RUN_FINISHED` terminal event and closes, so the submitted turn completes and
 * the submit promise resolves without a real network.
 */
function queueCompletingStream(): void {
  callMock.mockImplementationOnce(async () => ({
    success: true,
    data: {
      stream: new ReadableStream<Uint8Array>({
        start(controller) {
          controller.enqueue(sseFrame({type: 'RUN_FINISHED'}));
          controller.close();
        },
      }),
    },
  }));
}

/**
 * Minimal contracts schema satisfying the generic `createSession` signature.
 * These tests don't exercise remote-controller typing — only the request the
 * session builds — so a single trivial component contract suffices.
 */
const contracts = z.discriminatedUnion('componentType', [
  z.strictObject({
    componentType: z.literal('pagination'),
    state: z.strictObject({page: z.number()}),
    actions: z.strictObject({
      selectPage: z.strictObject({payload: z.strictObject({page: z.number()})}),
    }),
  }),
]);

const baseConfig: SessionConfig<typeof contracts> = {
  organizationId: 'org-1',
  accessToken: 'token-1',
  contracts,
};

/** The commerce-context shape captured off the wire. */
interface CapturedContext {
  view: unknown;
  user: unknown;
  cart: CommerceContext['cart'];
  source?: unknown;
  custom?: unknown;
}

interface CapturedRequest {
  context: CapturedContext;
  pinnedProducts?: unknown;
}

/**
 * Drives one `submit` through a mocked stream and returns the request object
 * the session passed to the endpoint client's `call`.
 */
async function captureSubmitRequest(
  config: SessionConfig<typeof contracts>
): Promise<CapturedRequest> {
  queueCompletingStream();
  const session = createSession(config);
  await session.submit({prompt: 'find shoes'});
  expect(callMock).toHaveBeenCalledTimes(1);
  return callMock.mock.calls[0][0] as CapturedRequest;
}

const cartItemArbitrary = fc.record({
  productId: fc.string({minLength: 1, maxLength: 12}),
  name: fc.string({maxLength: 12}),
  price: fc.double({min: 0, max: 1000, noNaN: true}),
  quantity: fc.integer({min: 0, max: 10}),
});

/** Arbitrary commerce contexts, including empty carts and omitted optionals. */
const commerceContextArbitrary: fc.Arbitrary<CommerceContext> = fc.record(
  {
    cart: fc.array(cartItemArbitrary, {maxLength: 4}),
    pinnedProducts: fc.option(fc.array(fc.string({maxLength: 8}), {maxLength: 3}), {
      nil: undefined,
    }),
    source: fc.option(fc.array(fc.string({maxLength: 8}), {maxLength: 3}), {nil: undefined}),
    custom: fc.option(
      fc.dictionary(fc.string({maxLength: 6}), fc.string({maxLength: 8}), {maxKeys: 3}),
      {nil: undefined}
    ),
  },
  {requiredKeys: ['cart']}
);

describe('absent vs. empty context', () => {
  beforeEach(() => {
    callMock.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('sends the structural-empty "absent" encoding with no commerceContextProvider', async () => {
    const request = await captureSubmitRequest(baseConfig);

    // cart is an empty array...
    expect(request.context.cart).toEqual([]);
    // ...and source/custom/pinnedProducts are OMITTED (not merely empty).
    expect('source' in request.context).toBe(false);
    expect('custom' in request.context).toBe(false);
    expect('pinnedProducts' in request).toBe(false);
  });

  it('sends a distinguishable "present" encoding that round-trips the provider cart', async () => {
    await fc.assert(
      fc.asyncProperty(commerceContextArbitrary, async (providerContext) => {
        callMock.mockReset();

        const request = await captureSubmitRequest({
          ...baseConfig,
          commerceContextProvider: () => providerContext,
        });

        // Present encoding is structurally distinct from the absent encoding:
        // source, custom, and top-level pinnedProducts fields are all present.
        expect('source' in request.context).toBe(true);
        expect('custom' in request.context).toBe(true);
        expect('pinnedProducts' in request).toBe(true);

        // The provider's cart round-trips verbatim, even when empty.
        expect(request.context.cart).toEqual(providerContext.cart);

        // Optionals default to structural empties when the provider omits them.
        expect(request.context.source).toEqual(providerContext.source ?? []);
        expect(request.context.custom).toEqual(providerContext.custom ?? {});
        expect(request.pinnedProducts).toEqual(providerContext.pinnedProducts ?? []);
      }),
      {numRuns: 100}
    );
  });

  it('keeps the present-but-empty-cart encoding distinguishable from the absent encoding', async () => {
    await fc.assert(
      fc.asyncProperty(commerceContextArbitrary, async (providerContext) => {
        callMock.mockReset();
        const present = await captureSubmitRequest({
          ...baseConfig,
          commerceContextProvider: () => providerContext,
        });

        callMock.mockReset();
        const absent = await captureSubmitRequest(baseConfig);

        // Even when the provider's cart is empty, the present encoding differs
        // from the absent encoding: the presence of source/custom/pinnedProducts
        // is the discriminator the router relies on.
        const presentHasFields =
          'source' in present.context && 'custom' in present.context && 'pinnedProducts' in present;
        const absentHasFields =
          'source' in absent.context || 'custom' in absent.context || 'pinnedProducts' in absent;
        expect(presentHasFields).toBe(true);
        expect(absentHasFields).toBe(false);
      }),
      {numRuns: 50}
    );
  });
});
