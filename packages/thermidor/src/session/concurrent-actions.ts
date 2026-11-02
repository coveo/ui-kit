/**
 * The concurrent lane (ADR-020): actions the producer announces as concurrent, sent beside the
 * session's single request, one lane per action and source node. Only the latest dispatch of a
 * lane is applied, and its answer is applied without being recorded in a run.
 */

import {readEventStream} from '@/src/internal/api/protocol/stream.js';
import {parseSSEEvent} from '@/src/internal/api/protocol/sse-parser.js';
import type {NormalizedStreamEvent, RawSSEEvent} from '@/src/internal/api/protocol/stream-types.js';
import type {UnifiedEndpointClient} from '@/src/internal/api/unified/unified-endpoint-client.js';
import type {
  A2uiAction,
  CommerceRequestModel,
} from '@/src/internal/api/unified/unified-endpoint-types.js';
import {devWarn} from '@/src/internal/utils/dev-warn.js';
import {
  EMPTY_RENDERER_STREAM,
  appendToRendererStream,
  convertA2uiMessages,
} from './a2ui-v09-projection.js';
import {actionCacheKey, createActionCache, type ActionOrigin} from './action-cache.js';
import type {CachePolicy} from './announced-actions.js';
import type {ContractsSchema} from './contracts.js';
import {SURFACE_ACTIVITY_KIND} from './fold.js';
import {sessionActivities} from './session-surfaces.js';
import {
  EMPTY_UNRECORDED_STATE,
  acceptUnrecordedWrites,
  applyUnrecordedWrites,
} from './session-state.js';
import type {SessionStore} from './store.js';
import type {Turn} from './types.js';

export interface ConcurrentActionsOptions {
  store: SessionStore<Turn>;
  client: UnifiedEndpointClient;
  config: {
    contracts: ContractsSchema;
    organizationId: string;
    accessToken: string;
    endpoint?: string;
  };
  buildActionRequest: (action: A2uiAction) => CommerceRequestModel;
}

export interface ConcurrentActions {
  /**
   * Sends a validated action, or answers it from the cache when `policy` allows. Resolves once
   * its answer is applied or dropped; never rejects.
   */
  issue(action: ActionOrigin & {context: unknown}, policy: CachePolicy | undefined): Promise<void>;
}

interface Lanes {
  /**
   * Makes `key` the latest dispatch of its lane, and aborts the lane's uncached request. Returns
   * whether another key was the latest.
   */
  claim(origin: ActionOrigin, key: string): boolean;
  isLatest(origin: ActionOrigin, key: string): boolean;
  /** Sends a request the lane's next claim aborts. */
  sendUncached(origin: ActionOrigin, run: (signal: AbortSignal) => Promise<void>): Promise<void>;
  /**
   * Sends a request that runs to the end, unless one with the same key is in flight: joins it.
   * `rejoins` is whether this dispatch took the lane back from another key, and `run` reads
   * whether such a dispatch joined its request.
   */
  sendCachedMiss(
    key: string,
    rejoins: boolean,
    run: (rejoined: () => boolean) => Promise<void>
  ): Promise<void>;
}

function laneKey(origin: ActionOrigin): string {
  return JSON.stringify([origin.surfaceId, origin.sourceComponentId, origin.name]);
}

function createLanes(): Lanes {
  const latest = new Map<string, string>();
  const uncached = new Map<string, AbortController>();
  const misses = new Map<string, {done: Promise<void>; rejoined: boolean}>();

  return {
    claim(origin, key) {
      const lane = laneKey(origin);
      const previous = latest.get(lane);
      latest.set(lane, key);
      uncached.get(lane)?.abort();
      uncached.delete(lane);
      return previous !== undefined && previous !== key;
    },
    isLatest(origin, key) {
      return latest.get(laneKey(origin)) === key;
    },
    async sendUncached(origin, run) {
      const lane = laneKey(origin);
      const controller = new AbortController();
      uncached.set(lane, controller);
      try {
        await run(controller.signal);
      } finally {
        if (uncached.get(lane) === controller) {
          uncached.delete(lane);
        }
      }
    },
    sendCachedMiss(key, rejoins, run) {
      const inFlight = misses.get(key);
      if (inFlight) {
        inFlight.rejoined ||= rejoins;
        return inFlight.done;
      }
      const miss = {done: Promise.resolve(), rejoined: false};
      miss.done = run(() => miss.rejoined).finally(() => misses.delete(key));
      misses.set(key, miss);
      return miss.done;
    },
  };
}

function surfaceSnapshotMessages(event: NormalizedStreamEvent): readonly unknown[] | undefined {
  const snapshot = event as unknown as {activityType?: string; content?: unknown};
  const messages = (snapshot.content as Record<string, unknown> | undefined)?.['messages'];
  return snapshot.activityType === SURFACE_ACTIVITY_KIND && Array.isArray(messages)
    ? messages
    : undefined;
}

async function quietly(
  origin: ActionOrigin,
  work: Promise<unknown>,
  signal?: AbortSignal
): Promise<void> {
  try {
    await work;
  } catch (error) {
    if (!signal?.aborted) {
      const message = error instanceof Error ? error.message : String(error);
      devWarn(`dispatchAction: ${origin.name} failed: ${message}`);
    }
  }
}

export function createConcurrentActions({
  store,
  client,
  config,
  buildActionRequest,
}: ConcurrentActionsOptions): ConcurrentActions {
  const cache = createActionCache();
  const lanes = createLanes();

  function accept(messages: readonly unknown[]) {
    return acceptUnrecordedWrites(messages, sessionActivities(store.getState()), config.contracts);
  }

  function apply(messages: readonly unknown[]): void {
    const accepted = accept(messages);
    if (accepted.messages.length < messages.length) {
      devWarn(
        'dispatchAction: a concurrent answer may only update the data model of known nodes; the rest is dropped.'
      );
    }
    if (accepted.writes.length === 0) {
      return;
    }
    store.setState((latest) => ({
      ...latest,
      unrecordedState: applyUnrecordedWrites(
        latest.unrecordedState ?? EMPTY_UNRECORDED_STATE,
        accepted.writes
      ),
      rendererStream: appendToRendererStream(
        latest.rendererStream ?? EMPTY_RENDERER_STREAM,
        convertA2uiMessages(accepted.messages)
      ),
    }));
  }

  /**
   * Applies each surface snapshot only while the dispatch is its node's latest. When it became the
   * latest again after another dispatch (A, B, then A), the whole answer is applied once the stream
   * ends. Its session keys and metadata are not read.
   */
  async function stream(
    action: A2uiAction,
    origin: ActionOrigin,
    key: string,
    {signal, rejoined = () => false}: {signal?: AbortSignal; rejoined?: () => boolean} = {}
  ): Promise<readonly unknown[]> {
    const result = await client.call(
      buildActionRequest(action),
      {
        organizationId: config.organizationId,
        accessToken: config.accessToken,
        endpoint: config.endpoint,
      },
      {signal}
    );
    if (!result.success) {
      throw new Error(result.error);
    }

    const answer: unknown[] = [];
    let passedOver = false;
    let finished = false;
    let runError: string | undefined;
    await readEventStream({
      stream: result.data.stream,
      signal,
      onEvent: (rawEvent: RawSSEEvent) => {
        const event = parseSSEEvent(rawEvent);
        if (event.type === 'RUN_ERROR') {
          runError =
            (event as {message?: string}).message || 'An error occurred during the action.';
        } else if (event.type === 'RUN_FINISHED' || event.type === 'turn_complete') {
          finished = true;
        } else if (event.type === 'ACTIVITY_SNAPSHOT') {
          const messages = surfaceSnapshotMessages(event);
          if (messages) {
            answer.push(...messages);
            if (lanes.isLatest(origin, key)) {
              apply(messages);
            } else {
              passedOver = true;
            }
          }
        }
      },
    });
    if (runError !== undefined) {
      throw new Error(runError);
    }
    if (!finished) {
      throw new Error('Stream ended without a terminal event.');
    }
    if ((passedOver || rejoined()) && lanes.isLatest(origin, key)) {
      apply(answer);
    }
    return answer;
  }

  return {
    issue(origin, policy) {
      const key = actionCacheKey(origin, origin.context);
      const tookLaneBack = lanes.claim(origin, key);
      const cached = policy && cache.get(key, policy.ttlMs);
      if (cached) {
        apply(cached);
        return Promise.resolve();
      }

      const action: A2uiAction = {
        surfaceId: origin.surfaceId,
        name: origin.name,
        sourceComponentId: origin.sourceComponentId,
        timestamp: new Date().toISOString(),
        context: origin.context,
      };
      if (!policy) {
        return lanes.sendUncached(origin, (signal) =>
          quietly(origin, stream(action, origin, key, {signal}), signal)
        );
      }
      return lanes.sendCachedMiss(key, tookLaneBack, (rejoined) =>
        quietly(
          origin,
          stream(action, origin, key, {rejoined}).then((messages) =>
            cache.set(key, accept(messages).messages)
          )
        )
      );
    },
  };
}
