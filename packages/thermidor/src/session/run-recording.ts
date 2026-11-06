/**
 * Records in the store what a request's stream brings to its run: a turn, or the initialization.
 */

import type {NormalizedStreamEvent} from '@/src/internal/api/protocol/stream-types.js';
import {
  EMPTY_RENDERER_STREAM,
  appendToRendererStream,
  convertA2uiMessages,
} from './a2ui-v09-projection.js';
import type {ContractsSchema} from './contracts.js';
import {createTurn, foldActivity, foldInitialization} from './fold.js';
import {applyInboundOps, releaseUnrecordedState} from './session-state.js';
import {sessionActivities, type RunTarget} from './session-surfaces.js';
import type {SessionStore, SessionStoreState} from './store.js';
import {surfaceSnapshot} from './stream-events.js';
import type {ActionError, Turn, TurnInput} from './types.js';

export interface RunRecorder {
  /**
   * Folds `event` into its run and, for a surface snapshot, applies its validated ops to the
   * session's state and appends its messages to the renderer stream, in one change.
   */
  foldEvent(target: RunTarget, event: NormalizedStreamEvent): void;
  failRun(target: RunTarget, error: string): void;
  /** Marks a streaming run as cancelled, and leaves any other as it is. */
  cancelRun(target: RunTarget): void;
  /** Appends a streaming turn for `input` and makes it the active turn. */
  openTurn(turnId: string, input: TurnInput): void;
  /** Resets a turn to a fresh streaming turn carrying its original input, and makes it active. */
  restartTurn(turnId: string): void;
  setActionError(actionError: ActionError | undefined): void;
}

/** Folds `event` into the run `target` records, or returns `current` when that run is gone. */
function foldIntoRun(
  current: SessionStoreState<Turn>,
  target: RunTarget,
  event: NormalizedStreamEvent
): SessionStoreState<Turn> {
  if (target.kind === 'initialization') {
    return current.initialization
      ? {...current, initialization: foldInitialization(current.initialization, event)}
      : current;
  }
  const index = current.turns.findIndex((turn) => turn.id === target.turnId);
  if (index === -1) {
    return current;
  }
  const turns = current.turns.slice();
  turns[index] = foldActivity(turns[index], event);
  return {...current, turns};
}

export function createRunRecorder(
  store: SessionStore<Turn>,
  contracts: ContractsSchema
): RunRecorder {
  function setActionError(actionError: ActionError | undefined): void {
    if (store.getState().actionError !== actionError) {
      store.setState((current) => ({...current, actionError}));
    }
  }

  function replaceTurn(turnId: string, update: (turn: Turn) => Turn): void {
    store.setState((current) => {
      const index = current.turns.findIndex((turn) => turn.id === turnId);
      if (index === -1) {
        return current;
      }
      const nextTurns = current.turns.slice();
      nextTurns[index] = update(nextTurns[index]);
      return {...current, turns: nextTurns};
    });
  }

  function foldEvent(target: RunTarget, event: NormalizedStreamEvent): void {
    store.setState((current) => {
      const next = foldIntoRun(current, target, event);
      if (next === current) {
        return current;
      }
      const snapshot = surfaceSnapshot(event);
      if (snapshot) {
        const activities = sessionActivities(next);
        next.state = applyInboundOps(current.state ?? {}, activities, snapshot.content, contracts);
        if (current.unrecordedState) {
          next.unrecordedState = releaseUnrecordedState(
            current.unrecordedState,
            activities,
            snapshot.content,
            contracts
          );
        }
        next.rendererStream = appendToRendererStream(
          current.rendererStream ?? EMPTY_RENDERER_STREAM,
          convertA2uiMessages(snapshot.messages)
        );
      }
      return next;
    });
  }

  function settleRun(
    target: RunTarget,
    settle: (run: Pick<Turn, 'status' | 'error'>) => Pick<Turn, 'status' | 'error'>
  ): void {
    if (target.kind === 'turn') {
      replaceTurn(target.turnId, (turn) => ({...turn, ...settle(turn)}));
      return;
    }
    store.setState((current) =>
      current.initialization
        ? {
            ...current,
            initialization: {...current.initialization, ...settle(current.initialization)},
          }
        : current
    );
  }

  function failRun(target: RunTarget, error: string): void {
    settleRun(target, () => ({status: 'error', error}));
  }

  // An action streams into a run that is already complete; cancelling it must leave that run be.
  function cancelRun(target: RunTarget): void {
    settleRun(target, (run) =>
      run.status === 'streaming' ? {status: 'error', error: 'Cancelled'} : run
    );
  }

  function openTurn(turnId: string, input: TurnInput): void {
    store.setState((current) => ({
      ...current,
      turns: [...current.turns, createTurn(turnId, input)],
      activeTurnId: turnId,
    }));
  }

  function restartTurn(turnId: string): void {
    replaceTurn(turnId, (previous) => ({
      ...createTurn(previous.id, previous.input),
    }));
    store.setState((current) => ({...current, activeTurnId: turnId}));
  }

  return {foldEvent, failRun, cancelRun, openTurn, restartTurn, setActionError};
}
