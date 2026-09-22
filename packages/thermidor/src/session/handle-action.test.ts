import fc from 'fast-check';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

/**
 * Tests for the single consumer-facing action-dispatch entry point
 * `Session.dispatchAction` (Req 7.2, 7.6, 8.6, 8.7, 8.8, 8.9, 8.12, 8.13).
 *
 * The session POSTs through `createUnifiedEndpointClient()`. The client's
 * `call` is mocked so the test can assert whether an action request reached the
 * endpoint (dispatch sent) or not (dispatch withheld), without a real network.
 *
 * A concrete component — Pagination, with its real generated action schema
 * (`selectPage` → `{ page: int ≥ 0 }`; `setPageSize` → `{ pageSize: int ≥ 1 }`)
 * — represents the conforming / non-conforming payloads.
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

import {z} from 'zod/v4';
import type {ContractsSchema} from './contracts.js';
import {createSession, type A2uiClientMessage, type SessionConfig} from './create-session.js';

/**
 * A locally-built A2-UI contract, INJECTED as test data exactly as a real
 * consumer would inject it. Built with this package's own Zod so the test is
 * independent of any concrete contract package. Mirrors the generated Coveo
 * shape: a discriminated union on `component`. The Pagination member carries
 * the real generated action contract (`selectPage` → `{ page: int ≥ 0 }`;
 * `setPageSize` → `{ pageSize: int ≥ 1 }`); the CommerceSearch member is the
 * surface root that hosts it.
 */
const PaginationSchema = z.strictObject({
  component: z.literal('Pagination'),
  state: z
    .strictObject({
      page: z.number().int().min(0),
      pageSize: z.number().int().min(1),
      totalEntries: z.number().int().min(0),
      totalPages: z.number().int().min(0),
    })
    .optional(),
  actions: z
    .strictObject({
      selectPage: z.strictObject({payload: z.strictObject({page: z.number().int().min(0)})}),
      setPageSize: z.strictObject({payload: z.strictObject({pageSize: z.number().int().min(1)})}),
    })
    .optional(),
});

const CommerceSearchSchema = z.strictObject({
  component: z.literal('CommerceSearch'),
  state: z.strictObject({}).optional(),
});

const contracts = z.discriminatedUnion('component', [
  PaginationSchema,
  CommerceSearchSchema,
]) as unknown as ContractsSchema;

const encoder = new TextEncoder();

function sseFrame(activity: Record<string, unknown>): Uint8Array {
  return encoder.encode(`data: ${JSON.stringify(activity)}\n\n`);
}

/**
 * Queues a completing stream that emits a single commerce-search surface (with
 * a Pagination node), then `RUN_FINISHED`, and closes. After the submit
 * resolves, the active turn is COMPLETE (not streaming), so the streaming guard
 * does not interfere and `dispatchAction` can reach the private execute path.
 */
function queueSurfaceThenComplete(): void {
  callMock.mockImplementationOnce(async () => ({
    success: true,
    data: {
      stream: new ReadableStream<Uint8Array>({
        start(controller) {
          controller.enqueue(
            sseFrame({
              type: 'ACTIVITY_SNAPSHOT',
              activityType: 'a2ui-surface',
              messageId: 'surface-1',
              content: {
                messages: [
                  {
                    version: 'v1.0',
                    createSurface: {
                      surfaceId: SURFACE_ID,
                      rootId: 'root',
                      components: [
                        {id: 'root', component: 'CommerceSearch'},
                        {id: PAGINATION_ID, component: 'Pagination'},
                      ],
                    },
                  },
                ],
              },
            })
          );
          controller.enqueue(sseFrame({type: 'RUN_FINISHED'}));
          controller.close();
        },
      }),
    },
  }));
}

/** Queues a completing stream for the follow-up action POST. */
function queueActionAck(): void {
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

const SURFACE_ID = 'ui-1';
const PAGINATION_ID = 'pagination-1';

const baseConfig: SessionConfig = {
  contracts,
  organizationId: 'org-1',
  accessToken: 'token-1',
};

/**
 * Builds a session whose active, COMPLETE turn carries a commerce-search
 * surface with a Pagination node, ready to receive an action.
 */
async function sessionWithPaginationSurface() {
  queueSurfaceThenComplete();
  const session = createSession(baseConfig);
  await session.submit({prompt: 'find shoes'});
  callMock.mockClear();
  return session;
}

function paginationMessage(name: string, context: unknown): A2uiClientMessage {
  return {
    userAction: {
      name,
      surfaceId: SURFACE_ID,
      sourceComponentId: PAGINATION_ID,
      context: context as Record<string, unknown>,
    },
  };
}

describe('Session.dispatchAction', () => {
  beforeEach(() => {
    callMock.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Feature: a2ui-inline-state-data-model, Property 12: action-payload conformance gates dispatch', () => {
    it('POSTs an action iff the payload conforms to the component action contract', async () => {
      await fc.assert(
        fc.asyncProperty(
          // A conforming `selectPage` payload: `{ page: int ≥ 0 }`.
          fc.record({page: fc.integer({min: 0, max: 1_000})}),
          async (context) => {
            const session = await sessionWithPaginationSurface();
            queueActionAck();

            await session.dispatchAction(paginationMessage('selectPage', context));

            // A conforming payload → exactly one action POST reached the client.
            expect(callMock).toHaveBeenCalledTimes(1);
            const request = callMock.mock.calls[0][0] as {
              action: {name: string; sourceComponentId: string; context: unknown} | null;
              message: string | null;
            };
            expect(request.message).toBeNull();
            expect(request.action?.name).toBe('selectPage');
            expect(request.action?.sourceComponentId).toBe(PAGINATION_ID);
            expect(request.action?.context).toEqual(context);
          }
        ),
        {numRuns: 100}
      );
    });

    it('withholds the POST for a non-conforming payload and reports the failing field', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      try {
        await fc.assert(
          fc.asyncProperty(
            // A non-conforming `selectPage` payload: `page` is negative (schema
            // requires ≥ 0), so validation must reject it.
            fc.record({page: fc.integer({min: -1_000, max: -1})}),
            async (context) => {
              const session = await sessionWithPaginationSurface();
              warn.mockClear();

              await expect(
                session.dispatchAction(paginationMessage('selectPage', context))
              ).resolves.toBeUndefined();

              // A non-conforming payload → NOTHING sent (client not called).
              expect(callMock).not.toHaveBeenCalled();
              // The internal dispatch rejection surfaced as a dev-only warning
              // naming the failing field (`page`).
              expect(warn).toHaveBeenCalled();
              const warned = warn.mock.calls.map((call) => String(call[0])).join('\n');
              expect(warned).toContain('page');
            }
          ),
          {numRuns: 100}
        );
      } finally {
        warn.mockRestore();
      }
    });
  });

  describe('dispatchAction is fire-and-forget', () => {
    it('resolves (never rejects) for a message with no userAction; nothing sent', async () => {
      const session = await sessionWithPaginationSurface();
      await expect(session.dispatchAction({})).resolves.toBeUndefined();
      expect(callMock).not.toHaveBeenCalled();
    });

    it('resolves (never rejects) for a missing sourceComponentId; nothing sent', async () => {
      const session = await sessionWithPaginationSurface();
      await expect(
        session.dispatchAction({
          userAction: {name: 'selectPage', surfaceId: SURFACE_ID, context: {page: 1}},
        })
      ).resolves.toBeUndefined();
      expect(callMock).not.toHaveBeenCalled();
    });

    it('resolves (never rejects) when the node resolves to no component; nothing sent', async () => {
      const session = await sessionWithPaginationSurface();
      await expect(
        session.dispatchAction({
          userAction: {
            name: 'selectPage',
            surfaceId: SURFACE_ID,
            sourceComponentId: 'unknown-node',
            context: {page: 1},
          },
        })
      ).resolves.toBeUndefined();
      expect(callMock).not.toHaveBeenCalled();
    });

    it('resolves (never rejects) for an invalid payload; nothing sent', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      try {
        const session = await sessionWithPaginationSurface();
        await expect(
          session.dispatchAction(paginationMessage('selectPage', {page: 'not-a-number'}))
        ).resolves.toBeUndefined();
        expect(callMock).not.toHaveBeenCalled();
      } finally {
        warn.mockRestore();
      }
    });
  });

  describe('dispatch is a plain HTTP request (not A2-UI bidirectional binding)', () => {
    it('sends the action as a converse POST with a null message and an action envelope', async () => {
      const session = await sessionWithPaginationSurface();
      queueActionAck();

      await session.dispatchAction(paginationMessage('selectPage', {page: 3}));

      expect(callMock).toHaveBeenCalledTimes(1);
      const request = callMock.mock.calls[0][0] as {
        action: {
          surfaceId: string;
          name: string;
          sourceComponentId: string;
          wantResponse: boolean;
          actionId: string | null;
          context: unknown;
        } | null;
        message: string | null;
      };
      // A plain request/response POST: no bidirectional binding, no wantResponse.
      expect(request.message).toBeNull();
      expect(request.action).toMatchObject({
        surfaceId: SURFACE_ID,
        name: 'selectPage',
        sourceComponentId: PAGINATION_ID,
        wantResponse: false,
        actionId: null,
        context: {page: 3},
      });
    });
  });

  describe('the consumer never invokes Zod (validation is internal)', () => {
    it('accepts the raw renderer message and validates internally with no consumer glue', async () => {
      const session = await sessionWithPaginationSurface();
      queueActionAck();

      // The consumer passes the standard message straight through; it runs no
      // Zod and resolves no component itself.
      const message: A2uiClientMessage = paginationMessage('setPageSize', {pageSize: 24});
      await session.dispatchAction(message);

      expect(callMock).toHaveBeenCalledTimes(1);
      const request = callMock.mock.calls[0][0] as {action: {name: string} | null};
      expect(request.action?.name).toBe('setPageSize');
    });
  });
});
