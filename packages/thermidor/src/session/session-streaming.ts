/**
 * The session's single request: sending it, one at a time, consuming its stream into its run, and
 * cancelling it.
 */

import type {NormalizedStreamEvent} from '@/src/internal/api/protocol/stream-types.js';
import type {UnifiedEndpointClient} from '@/src/internal/api/unified/unified-endpoint-client.js';
import type {ConverseRequestModel} from '@/src/internal/api/unified/unified-endpoint-types.js';
import {devWarn} from '@/src/internal/utils/dev-warn.js';
import {callWithConflictRetry} from './conflict-retry.js';
import type {RunRecorder} from './run-recording.js';
import {requestTarget, targetStatus, type RunTarget} from './session-surfaces.js';
import type {SessionViews} from './session-views.js';
import type {SessionStore} from './store.js';
import {actionStreamEvent, readStreamEvents} from './stream-events.js';
import type {ActionError, SessionRequest, SessionRuntimeConfig, Turn} from './types.js';

/** The action a request sends, which its failures are reported against. */
export type ActionSource = Omit<ActionError, 'message'>;

export interface RequestFailure {
  error: string;
  /** The endpoint kept rejecting it as concurrent, past the retry budget. */
  conflict: boolean;
}

export interface Streaming {
  /**
   * Sends `request` unless another is in flight, publishing it in the store until `send` ends.
   * `abandoned` holds the placeholders its run had abandoned when it started.
   */
  sendRequest(
    request: SessionRequest,
    send: (abortController: AbortController) => Promise<void>,
    abandoned?: ReadonlySet<string>
  ): Promise<void>;
  /**
   * Takes a builder so a throwing context provider fails the run inside the `try`. A request the
   * endpoint rejected before streaming is returned for the caller to report; anything later is
   * folded into `target` here. An `action` reports
   * every later failure in `actionError` instead and leaves the run as it is (ADR-018, as amended).
   */
  executeStream(
    target: RunTarget,
    buildRequest: () => ConverseRequestModel,
    abortController: AbortController,
    action?: ActionSource
  ): Promise<RequestFailure | undefined>;
  /**
   * Stops consuming the in-flight stream. A streaming prompt turn, or a streaming initialization, is
   * marked `error`, retaining whatever it has already folded; an action in flight leaves the run it
   * is recorded with unchanged. `request` is cleared once the stopped request has unwound, not here.
   * When nothing is in flight, it is a no-op that leaves every run unchanged.
   */
  cancel(): void;
}

export interface StreamingOptions {
  store: SessionStore<Turn>;
  client: UnifiedEndpointClient;
  config: Pick<SessionRuntimeConfig, 'organizationId' | 'accessToken' | 'endpoint'>;
  recorder: RunRecorder;
  views: SessionViews;
}

/** A dispatch refused before it was sent settles at once. */
export function withhold(): Promise<void> {
  return Promise.resolve();
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  if (typeof error === 'string' && error.trim()) {
    return error;
  }
  return 'An unexpected error occurred while reading the conversation stream.';
}

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === 'AbortError';
}

/**
 * True when a stream has been superseded by a newer one: a different stream is
 * now active. A plain cancel resets the active controller to `null` (no
 * successor), which is NOT superseded — that stream still reports its outcome.
 */
function isSuperseded(active: AbortController | null, streamController: AbortController): boolean {
  return active !== null && active !== streamController;
}

/**
 * Extracts the session continuity keys carried by turn-lifecycle events. These
 * are session-level (not turn-level) and so are captured by the runtime rather
 * than the fold.
 */
function readSessionKeys(
  event: NormalizedStreamEvent
): {sessionId?: string; sessionToken?: string} | undefined {
  if (
    event.type !== 'RUN_STARTED' &&
    event.type !== 'RUN_FINISHED' &&
    event.type !== 'turn_started' &&
    event.type !== 'turn_complete'
  ) {
    const raw = event as unknown as Record<string, unknown>;
    if (raw.type !== 'error') {
      return undefined;
    }
  }
  const raw = event as unknown as {
    conversationSessionId?: string;
    conversationToken?: string;
  };
  if (raw.conversationSessionId || raw.conversationToken) {
    return {sessionId: raw.conversationSessionId, sessionToken: raw.conversationToken};
  }
  return undefined;
}

export function createStreaming({
  store,
  client,
  config,
  recorder,
  views,
}: StreamingOptions): Streaming {
  // The currently in-flight stream's abort controller, or null when idle. Held
  // per session instance — never module-level — so two sessions never contend.
  let activeAbortController: AbortController | null = null;

  // One request at a time: the endpoint handles a single request per session, and each response
  // is a whole-node snapshot, so overlapping streams would let the last to ARRIVE win over a newer
  // action sent later. A dispatch made while a request is in flight is withheld.
  async function sendRequest(
    request: SessionRequest,
    send: (abortController: AbortController) => Promise<void>,
    abandoned?: ReadonlySet<string>
  ): Promise<void> {
    if (store.getState().request) {
      devWarn('dispatchAction: withheld: another request is in flight.');
      return withhold();
    }
    // Armed before it is published, so a listener's `cancel()` stops the request it was told about.
    const abortController = new AbortController();
    activeAbortController = abortController;
    views.trackAbandoned(request, abandoned);
    store.setState((current) => ({...current, request}));
    if (!abortController.signal.aborted) {
      try {
        await send(abortController);
      } catch (error) {
        devWarn(`dispatchAction: request failed: ${getErrorMessage(error)}`);
      }
    }
    if (activeAbortController === abortController) {
      activeAbortController = null;
    }
    store.setState((current) => ({...current, request: undefined}));
  }

  /**
   * An `action`'s stream folds only its surface snapshots into `target`, and its failure sets
   * `actionError` (ADR-018, as amended).
   */
  async function consumeStream(
    target: RunTarget,
    stream: ReadableStream<Uint8Array>,
    abortController: AbortController,
    action: ActionSource | undefined
  ): Promise<void> {
    let terminalEventReceived = false;
    const fail = (message: string) =>
      action ? recorder.setActionError({message, ...action}) : recorder.failRun(target, message);

    await readStreamEvents({
      stream,
      signal: abortController.signal,
      onEvent: (event) => {
        const keys = readSessionKeys(event);
        if (keys) {
          store.setState((current) => ({
            ...current,
            sessionId: keys.sessionId ?? current.sessionId,
            sessionToken: keys.sessionToken ?? current.sessionToken,
          }));
        }

        // The run an action streams into keeps its own status and response (ADR-018).
        if (action) {
          const actionEvent = actionStreamEvent(event);
          if (actionEvent.kind === 'runError') {
            terminalEventReceived = true;
            fail(actionEvent.message);
          } else if (actionEvent.kind === 'terminal') {
            terminalEventReceived = true;
          } else if (actionEvent.kind === 'snapshot') {
            recorder.foldEvent(target, event);
          }
          return;
        }

        recorder.foldEvent(target, event);

        const foldedStatus = targetStatus(store.getState(), target);
        if (foldedStatus === 'complete' || foldedStatus === 'error') {
          terminalEventReceived = true;
        }
      },
      onDone: () => {
        // A cancelled stream keeps its outcome, and a superseded one leaves it to the newer stream.
        if (
          !terminalEventReceived &&
          !abortController.signal.aborted &&
          !isSuperseded(activeAbortController, abortController)
        ) {
          fail('Stream ended without a terminal event.');
        }
      },
      onError: (error) => {
        if (terminalEventReceived || isSuperseded(activeAbortController, abortController)) {
          return;
        }
        if (isAbortError(error)) {
          recorder.cancelRun(target);
        } else {
          fail(getErrorMessage(error));
        }
      },
    });
  }

  async function executeStream(
    target: RunTarget,
    buildRequest: () => ConverseRequestModel,
    abortController: AbortController,
    action?: ActionSource
  ): Promise<RequestFailure | undefined> {
    try {
      // Rebuilt on every attempt, so context providers and session keys are read fresh.
      const result = await callWithConflictRetry(
        () =>
          client.call(
            buildRequest(),
            {
              organizationId: config.organizationId,
              accessToken: config.accessToken,
              endpoint: config.endpoint,
            },
            {signal: abortController.signal}
          ),
        abortController.signal
      );

      if (!result.success) {
        // The client reports an abort as a failed call rather than throwing it.
        if (abortController.signal.aborted) {
          if (!isSuperseded(activeAbortController, abortController)) {
            recorder.cancelRun(target);
          }
          return undefined;
        }
        return {error: result.error, conflict: result.conflict !== undefined};
      }

      await consumeStream(target, result.data.stream, abortController, action);
    } catch (error) {
      // A stream aborted because a NEWER stream superseded it must not touch the
      // turn: the newer stream owns the outcome. A plain cancel (controller reset
      // to null) still reports the failure.
      if (isSuperseded(activeAbortController, abortController)) {
        return;
      }
      if (isAbortError(error)) {
        recorder.cancelRun(target);
        return;
      }
      if (action) {
        recorder.setActionError({message: getErrorMessage(error), ...action});
      } else {
        recorder.failRun(target, getErrorMessage(error));
      }
    } finally {
      if (activeAbortController === abortController) {
        activeAbortController = null;
      }
    }
    return undefined;
  }

  function cancel(): void {
    if (!activeAbortController) {
      return;
    }

    activeAbortController.abort();
    activeAbortController = null;

    // The abort races the stream reader, so the run is settled here rather than on its error path.
    const {request} = store.getState();
    if (request) {
      recorder.cancelRun(requestTarget(request));
    }
  }

  return {sendRequest, executeStream, cancel};
}
