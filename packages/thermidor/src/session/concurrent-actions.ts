/**
 * The concurrent lane (ADR-020): actions the producer announces as concurrent, sent beside the
 * session's single request, one lane per action and source node. Only the latest dispatch of a
 * lane is applied, and its answer is applied without being recorded in a run. The session lists
 * each lane whose latest dispatch awaits its answer, and each lane whose latest dispatch failed.
 */

import {readEventStream} from '@/src/internal/api/protocol/stream.js';
import {parseSSEEvent} from '@/src/internal/api/protocol/sse-parser.js';
import type {NormalizedStreamEvent, RawSSEEvent} from '@/src/internal/api/protocol/stream-types.js';
import type {UnifiedEndpointClient} from '@/src/internal/api/unified/unified-endpoint-client.js';
import type {
  A2uiAction,
  ConverseRequestModel,
  RequestLocale,
} from '@/src/internal/api/unified/unified-endpoint-types.js';
import type {NavigatorContext} from '@/src/internal/context/index.js';
import {devWarn} from '@/src/internal/utils/dev-warn.js';
import {actionCacheKey, createActionCache, type ActionOrigin} from './action-cache.js';
import type {CachePolicy} from './announced-actions.js';
import type {ContractsSchema} from './contracts.js';
import {SURFACE_ACTIVITY_KIND} from './fold.js';
import {EMPTY_RENDERER_STREAM, appendToRendererStream} from './renderer-stream.js';
import {sessionActivities} from './session-surfaces.js';
import {
  EMPTY_UNRECORDED_STATE,
  acceptUnrecordedWrites,
  applyUnrecordedWrites,
} from './session-state.js';
import type {SessionStore, SessionStoreState} from './store.js';
import type {ConcurrentFailure, ConcurrentRequest, Turn} from './types.js';

export interface ConcurrentActionsOptions {
  store: SessionStore<Turn>;
  client: UnifiedEndpointClient;
  config: {
    contracts: ContractsSchema;
    organizationId: string;
    accessToken: string;
    endpoint?: string;
  };
  /** The navigator context and its locale; throws when the locale is missing or blank. */
  readNavigatorContext: () => {navigatorContext: NavigatorContext; locale: RequestLocale};
  buildActionRequest: (
    action: A2uiAction,
    navigatorContext: NavigatorContext
  ) => ConverseRequestModel;
}

export interface ConcurrentActions {
  /**
   * Sends a validated action, or answers it from the cache when `policy` allows. Resolves once
   * its answer is applied or dropped, after its failure is reported; never rejects.
   */
  issue(
    dispatch: ConcurrentRequest,
    context: unknown,
    policy: CachePolicy | undefined
  ): Promise<void>;
  /**
   * Hands the lane of `dispatch` over to the session's request, which sends it now that the
   * producer no longer announces it as concurrent: in one store update, no earlier concurrent
   * dispatch of the lane is the latest any more, its uncached request is aborted, and the lane
   * leaves `concurrentRequests` and `concurrentFailures`. That request brings the outcome.
   */
  supersede(dispatch: ConcurrentRequest): void;
}

interface Lanes {
  /**
   * Makes `key` the latest dispatch of its lane, and aborts the lane's uncached request. Without
   * a key, no dispatch of the lane is the latest.
   */
  claim(origin: ActionOrigin, key?: string): void;
  isLatest(origin: ActionOrigin, key: string): boolean;
  /** Sends a request the lane's next claim aborts. */
  sendUncached(origin: ActionOrigin, run: (signal: AbortSignal) => Promise<void>): Promise<void>;
  /**
   * Sends a request that runs to the end, unless one with the same key is in flight: joins it.
   * `run` reads whether another dispatch joined its request. Every dispatch that joined it gets
   * its settlement, a rejection included.
   */
  sendCachedMiss(key: string, run: (joined: () => boolean) => Promise<void>): Promise<void>;
}

function laneKey(origin: ActionOrigin): string {
  return JSON.stringify([origin.surfaceId, origin.sourceComponentId, origin.name]);
}

function createLanes(): Lanes {
  const latest = new Map<string, string | undefined>();
  const uncached = new Map<string, AbortController>();
  const misses = new Map<string, {done: Promise<void>; joined: boolean}>();

  return {
    claim(origin, key) {
      const lane = laneKey(origin);
      latest.set(lane, key);
      uncached.get(lane)?.abort();
      uncached.delete(lane);
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
    sendCachedMiss(key, run) {
      const inFlight = misses.get(key);
      if (inFlight) {
        inFlight.joined = true;
        return inFlight.done;
      }
      const miss = {done: Promise.resolve(), joined: false};
      miss.done = run(() => miss.joined).finally(() => misses.delete(key));
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

export const NO_CONCURRENT_REQUESTS: readonly ConcurrentRequest[] = Object.freeze([]);
export const NO_CONCURRENT_FAILURES: readonly ConcurrentFailure[] = Object.freeze([]);

type Update = (state: SessionStoreState<Turn>) => SessionStoreState<Turn>;

/** A `RUN_ERROR`'s message, with its code when the gateway sent one. */
type RunError = Error & {errorCode?: string};

export function createConcurrentActions({
  store,
  client,
  config,
  readNavigatorContext,
  buildActionRequest,
}: ConcurrentActionsOptions): ConcurrentActions {
  const cache = createActionCache();
  const lanes = createLanes();
  // The requests whose failure was reported: dispatches that joined one report it once.
  const reported = new WeakSet<Promise<unknown>>();
  // The entries the store's `concurrentRequests` and `concurrentFailures` list, by lane. A listed
  // lane holds its latest dispatch that awaits its answer, the entry of an earlier one in the store.
  const requests = new Map<string, ConcurrentRequest>();
  const failures = new Map<string, ConcurrentFailure>();

  function failureOf(dispatch: ConcurrentRequest, error: unknown): ConcurrentFailure {
    const message = error instanceof Error ? error.message : String(error);
    devWarn(`dispatchAction: ${dispatch.name} failed: ${message}`);
    const errorCode = (error as RunError | undefined)?.errorCode;
    return {...dispatch, message, ...(errorCode ? {errorCode} : {})};
  }

  /**
   * Publishes what became of the lane of `dispatch` in one store update: whether it is listed as
   * awaiting its answer, its failure replaced, or cleared with `null`, and `update`, such as a
   * cached answer's writes. What is left `undefined` stays as it is. Subscribers run synchronously
   * and may dispatch on the lane, so a dispatch publishes once its own bookkeeping is done and does
   * nothing more after it.
   */
  function publish(
    dispatch: ConcurrentRequest,
    listed?: boolean,
    failure?: ConcurrentFailure | null,
    update?: Update
  ): void {
    const lane = laneKey(dispatch);
    const relist = listed !== undefined && requests.has(lane) !== listed;
    const refail = failure !== undefined && (failure !== null || failures.has(lane));
    if (listed) {
      requests.set(lane, dispatch);
    } else if (relist) {
      requests.delete(lane);
    }
    if (refail) {
      // A failure moves to the end, as the latest to fail.
      failures.delete(lane);
      if (failure) {
        failures.set(lane, failure);
      }
    }
    if (relist || refail || update) {
      store.setState((latest) => ({
        ...(update ? update(latest) : latest),
        ...(relist && {concurrentRequests: Object.freeze([...requests.values()])}),
        ...(refail && {concurrentFailures: Object.freeze([...failures.values()])}),
      }));
    }
  }

  /**
   * Starts `work`, then lists `dispatch` as awaiting its answer, its lane's last failure cleared,
   * until `work` settles, unless a later dispatch of its lane awaits one meanwhile. A later cache
   * hit or failure before sending unlists it itself.
   */
  function awaitAnswer(dispatch: ConcurrentRequest, work: () => Promise<void>): Promise<void> {
    const settled = work().finally(() => {
      if (requests.get(laneKey(dispatch)) === dispatch) {
        publish(dispatch, false);
      }
    });
    publish(dispatch, true, null);
    return settled;
  }

  /**
   * Reports the failure of `work` once, through the dispatch its lane still lists as awaiting its
   * answer: an earlier one with the same key, such as a cached miss sent again uncached, reports
   * nothing, and a miss that dispatches joined reports through the latest of them.
   */
  async function settle(
    dispatch: ConcurrentRequest,
    key: string,
    work: Promise<unknown>,
    signal?: AbortSignal
  ): Promise<void> {
    try {
      await work;
    } catch (error) {
      if (
        !signal?.aborted &&
        lanes.isLatest(dispatch, key) &&
        requests.get(laneKey(dispatch)) === dispatch &&
        !reported.has(work)
      ) {
        reported.add(work);
        publish(dispatch, undefined, failureOf(dispatch, error));
      }
    }
  }

  function accept(messages: readonly unknown[]) {
    return acceptUnrecordedWrites(messages, sessionActivities(store.getState()), config.contracts);
  }

  // A cache hit, or an answer applied again, reuses its messages, so each apply delivers copies:
  // a renderer can then tell a write from a render by identity.
  function applying(messages: readonly unknown[]): Update | undefined {
    const accepted = accept(structuredClone(messages));
    if (accepted.messages.length < messages.length) {
      devWarn(
        'dispatchAction: a concurrent answer may only update the data model of known nodes; the rest is dropped.'
      );
    }
    if (accepted.writes.length === 0) {
      return undefined;
    }
    return (latest) => ({
      ...latest,
      unrecordedState: applyUnrecordedWrites(
        latest.unrecordedState ?? EMPTY_UNRECORDED_STATE,
        accepted.writes
      ),
      rendererStream: appendToRendererStream(
        latest.rendererStream ?? EMPTY_RENDERER_STREAM,
        accepted.messages
      ),
    });
  }

  function apply(messages: readonly unknown[]): void {
    const update = applying(messages);
    if (update) {
      store.setState(update);
    }
  }

  /**
   * Applies each surface snapshot only while the dispatch is its node's latest. When a snapshot was
   * passed over, or another dispatch joined the request, the node may show something else since
   * (A, B, then A, or a recorded write in between), so the whole answer is applied again once the
   * stream ends, if the dispatch is still the latest. Its session keys and metadata are not read.
   */
  async function stream(
    action: A2uiAction,
    navigatorContext: NavigatorContext,
    origin: ActionOrigin,
    key: string,
    {signal, joined = () => false}: {signal?: AbortSignal; joined?: () => boolean} = {}
  ): Promise<readonly unknown[]> {
    const result = await client.call(
      buildActionRequest(action, navigatorContext),
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
    let runError: RunError | undefined;
    await readEventStream({
      stream: result.data.stream,
      signal,
      onEvent: (rawEvent: RawSSEEvent) => {
        // A read that resolved before the abort can still deliver the rest of its chunk.
        if (signal?.aborted) {
          return;
        }
        const event = parseSSEEvent(rawEvent);
        if (event.type === 'RUN_ERROR') {
          const {message, code} = event as {message?: string; code?: unknown};
          runError = Object.assign(new Error(message || 'An error occurred during the action.'), {
            errorCode: typeof code === 'string' ? code : undefined,
          });
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
    }).catch((error: unknown) => {
      // Once the run reported its outcome, a later transport error does not replace it.
      if (signal?.aborted || (!finished && runError === undefined)) {
        throw error;
      }
    });
    if (runError !== undefined) {
      throw runError;
    }
    if (!finished) {
      throw new Error('Stream ended without a terminal event.');
    }
    if ((passedOver || joined()) && lanes.isLatest(origin, key)) {
      apply(answer);
    }
    return answer;
  }

  return {
    supersede(dispatch) {
      lanes.claim(dispatch);
      publish(dispatch, false, null);
    },
    issue(dispatch, context, policy) {
      let navigatorRead: ReturnType<typeof readNavigatorContext>;
      let key: string;
      try {
        navigatorRead = readNavigatorContext();
        key = actionCacheKey(dispatch, context, navigatorRead.locale);
      } catch (error) {
        lanes.claim(dispatch);
        publish(dispatch, false, failureOf(dispatch, error));
        return Promise.resolve();
      }

      lanes.claim(dispatch, key);
      const cached = policy && cache.get(key, policy.ttlMs);
      if (cached) {
        // The answer and the lane's unlisting reach subscribers in one update, before any of them
        // can dispatch on the lane again.
        publish(dispatch, false, null, applying(cached));
        return Promise.resolve();
      }

      const action: A2uiAction = {
        surfaceId: dispatch.surfaceId,
        name: dispatch.name,
        sourceComponentId: dispatch.sourceComponentId,
        timestamp: new Date().toISOString(),
        context,
      };
      if (!policy) {
        return awaitAnswer(dispatch, () =>
          lanes.sendUncached(dispatch, (signal) =>
            settle(
              dispatch,
              key,
              stream(action, navigatorRead.navigatorContext, dispatch, key, {signal}),
              signal
            )
          )
        );
      }
      return awaitAnswer(dispatch, () =>
        settle(
          dispatch,
          key,
          lanes.sendCachedMiss(key, (joined) =>
            stream(action, navigatorRead.navigatorContext, dispatch, key, {joined}).then(
              (messages) => cache.set(key, accept(messages).messages)
            )
          )
        )
      );
    },
  };
}
