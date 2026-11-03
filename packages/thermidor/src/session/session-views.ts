/**
 * The session's derived views over its store: the surfaces, the live state and the snapshot, each
 * recomputed only when what it is derived from changes.
 */

import {EMPTY_RENDERER_STREAM} from './a2ui-v09-projection.js';
import {
  EMPTY_UNRECORDED_STATE,
  overlayUnrecordedState,
  type UnrecordedState,
} from './session-state.js';
import {deriveSessionSurfaces, requestTarget, type SessionSurfaceView} from './session-surfaces.js';
import type {SessionStore} from './store.js';
import type {
  A2uiState,
  A2uiV09Message,
  SessionInitialization,
  SessionRequest,
  SessionSnapshot,
  Turn,
} from './types.js';

export interface SessionViews {
  readSurfaceView(): SessionSurfaceView;
  readLiveState(): A2uiState;
  readA2uiMessages(): readonly A2uiV09Message[];
  getSnapshot(): SessionSnapshot;
  /** Records the placeholders `request`'s run had abandoned when the request started. */
  trackAbandoned(request: SessionRequest, ids: ReadonlySet<string> | undefined): void;
}

export function createSessionViews(store: SessionStore<Turn>): SessionViews {
  let surfaceView: SessionSurfaceView | undefined;
  let surfaceViewSource:
    | {turns: readonly Turn[]; initialization?: SessionInitialization; request?: SessionRequest}
    | undefined;
  // The placeholders the request's run had abandoned when the request started.
  let requestAbandoned: {request: SessionRequest; ids: ReadonlySet<string>} | undefined;
  function readSurfaceView(): SessionSurfaceView {
    const {turns, initialization, request} = store.getState();
    if (
      surfaceView === undefined ||
      surfaceViewSource?.turns !== turns ||
      surfaceViewSource.initialization !== initialization ||
      surfaceViewSource.request !== request
    ) {
      const abandoned =
        request && requestAbandoned?.request === request ? requestAbandoned.ids : undefined;
      surfaceView = deriveSessionSurfaces(
        {turns, initialization},
        request && requestTarget(request),
        abandoned
      );
      surfaceViewSource = {turns, initialization, request};
    }
    return surfaceView;
  }

  // The state of the live surfaces only, with the unrecorded writes on top, recomputed when the
  // state, those writes or the surfaces change.
  let liveState: A2uiState = {};
  let liveStateSource: {
    state?: A2uiState;
    unrecordedState?: UnrecordedState;
    view?: SessionSurfaceView;
  } = {};
  function readLiveState(): A2uiState {
    const {state = {}, unrecordedState = EMPTY_UNRECORDED_STATE} = store.getState();
    const view = readSurfaceView();
    if (
      liveStateSource.state !== state ||
      liveStateSource.unrecordedState !== unrecordedState ||
      liveStateSource.view !== view
    ) {
      const live = new Set(view.surfaces.map((surface) => surface.surfaceId));
      liveState = Object.fromEntries(
        Object.entries(overlayUnrecordedState(state, unrecordedState)).filter(([surfaceId]) =>
          live.has(surfaceId)
        )
      );
      liveStateSource = {state, unrecordedState, view};
    }
    return liveState;
  }

  function readA2uiMessages(): readonly A2uiV09Message[] {
    return (store.getState().rendererStream ?? EMPTY_RENDERER_STREAM).messages;
  }

  let snapshot: SessionSnapshot | undefined;
  function getSnapshot(): SessionSnapshot {
    const {turns, surfaces} = readSurfaceView();
    const a2uiMessages = readA2uiMessages();
    const state = readLiveState();
    const {initialization, request, actionError} = store.getState();
    if (
      snapshot === undefined ||
      snapshot.turns !== turns ||
      snapshot.initialization !== initialization ||
      snapshot.surfaces !== surfaces ||
      snapshot.a2uiMessages !== a2uiMessages ||
      snapshot.state !== state ||
      snapshot.request !== request ||
      snapshot.actionError !== actionError
    ) {
      snapshot = Object.freeze({
        turns,
        initialization,
        surfaces,
        a2uiMessages,
        state,
        request,
        actionError,
      });
    }
    return snapshot;
  }

  function trackAbandoned(request: SessionRequest, ids: ReadonlySet<string> | undefined): void {
    requestAbandoned = ids && {request, ids};
  }

  return {readSurfaceView, readLiveState, readA2uiMessages, getSnapshot, trackAbandoned};
}
