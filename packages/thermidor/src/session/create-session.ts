/**
 * Session factory + runtime.
 *
 * `createSession(config)` returns a {@link Session}: the lean client handle for
 * one continuous, token-carrying interaction with the unified converse
 * endpoint.
 *
 * The session owns a plain {@link SessionStore} and wires the modules that drive it: the derived
 * views (`session-views.ts`), run recording (`run-recording.ts`), request building
 * (`session-requests.ts`), the single request and its stream (`session-streaming.ts`), dispatch
 * (`session-dispatch.ts`) and the concurrent lane (`concurrent-actions.ts`).
 *
 * The runtime ({@link createSessionRuntime}) receives the fields that scope every
 * request as an input: `createSession` passes its required `agentConfigurationId` and
 * `trackingId`, and the private entry point's `createPrivateSession` passes whichever of
 * its optional ids and locale fields are set.
 *
 * There are no singletons and no module-level mutable state: every call to
 * `createSession` builds a fresh store, so two sessions created from identical
 * configuration share no mutable state.
 */

import {createUnifiedEndpointClient} from '@/src/internal/api/unified/unified-endpoint-client.js';
import type {RequestScopeFields} from '@/src/internal/api/unified/unified-endpoint-types.js';
import {EMPTY_RENDERER_STREAM} from './a2ui-v09-projection.js';
import {createConcurrentActions} from './concurrent-actions.js';
import type {ContractsSchema} from './contracts.js';
import {createRunRecorder} from './run-recording.js';
import {restoreSession, serializeSession, type SerializedSession} from './serialize.js';
import {createDispatch} from './session-dispatch.js';
import {createRequestBuilder} from './session-requests.js';
import {createStreaming} from './session-streaming.js';
import {createSessionViews} from './session-views.js';
import {createSessionStore, type SessionStore, type SessionStoreState} from './store.js';
import type {Session, SessionConfig, SessionRuntimeConfig, Turn} from './types.js';

export type {
  A2uiClientMessage,
  Session,
  SessionConfig,
  SessionRuntimeConfig,
  SessionSnapshot,
  SubmitPromptAction,
} from './types.js';

/**
 * Creates a {@link Session} over a fresh observable store + fold.
 */
export function createSession<TContracts extends ContractsSchema>(
  config: SessionConfig<TContracts>
): Session<TContracts> {
  for (const key of ['agentConfigurationId', 'trackingId'] as const) {
    if (!config[key]?.trim()) {
      throw new Error(`createSession requires a non-blank ${key}.`);
    }
  }
  const {agentConfigurationId, trackingId} = config;
  return createSessionRuntime(config, {agentConfigurationId, trackingId});
}

/**
 * The session runtime both entry points share. `requestScope` holds the fields sent with
 * every request besides the ones the session builds itself.
 */
export function createSessionRuntime<TContracts extends ContractsSchema>(
  config: SessionRuntimeConfig<TContracts>,
  requestScope: Readonly<RequestScopeFields>
): Session<TContracts> {
  const initialState: SessionStoreState<Turn> = config.sessionToRestore
    ? restoreSession(config.sessionToRestore)
    : {
        turns: [],
        activeTurnId: undefined,
        sessionId: undefined,
        sessionToken: undefined,
        state: {},
        rendererStream: EMPTY_RENDERER_STREAM,
      };

  const store: SessionStore<Turn> = createSessionStore<Turn>(initialState);
  const views = createSessionViews(store);
  const client = createUnifiedEndpointClient();
  const recorder = createRunRecorder(store, config.contracts);
  const requests = createRequestBuilder(config, requestScope, store);
  const concurrentActions = createConcurrentActions({
    store,
    client,
    config,
    buildActionRequest: requests.buildActionRequest,
  });
  const streaming = createStreaming({store, client, config, recorder, views});
  const dispatch = createDispatch({
    store,
    config,
    requests,
    streaming,
    recorder,
    concurrentActions,
  });

  function serialize(): SerializedSession {
    return serializeSession(store.getState());
  }

  if (config.initialize !== false && !config.sessionToRestore) {
    queueMicrotask(() => {
      const {sessionToken, request} = store.getState();
      // A prompt dispatched in the same task already opens the session.
      if (!sessionToken && !request) {
        void dispatch.initialize();
      }
    });
  }

  return {
    contracts: config.contracts,
    get turns() {
      return views.readSurfaceView().turns;
    },
    get initialization() {
      return store.getState().initialization;
    },
    get surfaces() {
      return views.readSurfaceView().surfaces;
    },
    get a2uiMessages() {
      return views.readA2uiMessages();
    },
    get state() {
      return views.readLiveState();
    },
    get actionError() {
      return store.getState().actionError;
    },
    get request() {
      return store.getState().request;
    },
    subscribe(listener) {
      return store.subscribe(listener);
    },
    getSnapshot: views.getSnapshot,
    dispatchAction: dispatch.dispatchAction,
    cancel: streaming.cancel,
    retry: dispatch.retry,
    serialize,
  };
}
