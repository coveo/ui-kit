/**
 * Dispatch: what `initialize`, a prompt, a component action and a retry send, and which run
 * their answers are recorded with.
 */

import type {A2uiAction} from '@/src/internal/api/unified/unified-endpoint-types.js';
import {devWarn} from '@/src/internal/utils/dev-warn.js';
import {generateId} from '@/src/internal/utils/id-generator.js';
import type {ActionOrigin} from './action-cache.js';
import {validateActionPayload} from './action-payload-validation.js';
import {concurrentAction, type CachePolicy} from './announced-actions.js';
import type {ConcurrentActions} from './concurrent-actions.js';
import type {ContractsSchema} from './contracts.js';
import {deriveNodeIdentityRegistry} from './in-transit-validation.js';
import type {RunRecorder} from './run-recording.js';
import {toA2uiAction, type RequestBuilder} from './session-requests.js';
import {getErrorMessage, withhold, type ActionSource, type Streaming} from './session-streaming.js';
import {
  INITIALIZATION,
  abandonedPlaceholderIds,
  sessionActivities,
  turnTarget,
  type RunTarget,
} from './session-surfaces.js';
import type {SessionStore} from './store.js';
import {isTurnOpeningAction} from './turn-opening.js';
import type {
  A2uiClientMessage,
  SessionRequest,
  SubmitPromptAction,
  Turn,
  TurnAction,
} from './types.js';

export interface Dispatch {
  /** See {@link Session.dispatchAction}. */
  dispatchAction: (message: A2uiClientMessage | SubmitPromptAction) => Promise<void>;
  /** See {@link Session.retry}. */
  retry(turnId: string): void;
  /** Its run is recorded as the initialization, never as a turn. */
  initialize(): Promise<void>;
}

export interface DispatchOptions {
  store: SessionStore<Turn>;
  config: {contracts: ContractsSchema};
  requests: RequestBuilder;
  streaming: Streaming;
  recorder: RunRecorder;
  concurrentActions: ConcurrentActions;
}

/** A dispatched action, with the discriminant of the node it came from. */
interface RecoveredAction extends ActionOrigin {
  discriminant: string;
  context: unknown;
}

function isSubmitPromptAction(
  message: A2uiClientMessage | SubmitPromptAction
): message is SubmitPromptAction {
  return 'name' in message && message.name === 'submitPrompt';
}

export function createDispatch({
  store,
  config,
  requests,
  streaming,
  recorder,
  concurrentActions,
}: DispatchOptions): Dispatch {
  const {sendRequest, executeStream} = streaming;

  async function streamPrompt(
    turnId: string,
    prompt: string,
    abortController: AbortController
  ): Promise<void> {
    recorder.setActionError(undefined);
    const target = turnTarget(turnId);
    const failure = await executeStream(
      target,
      () => requests.buildConversationRequest(prompt),
      abortController
    );
    if (failure) {
      recorder.failRun(target, failure.error);
    }
  }

  function initialize(): Promise<void> {
    return sendRequest({kind: 'initialize'}, async (abortController) => {
      store.setState((current) => ({
        ...current,
        initialization: {activities: [], status: 'streaming'},
      }));
      const failure = await executeStream(
        INITIALIZATION,
        () =>
          requests.buildActionRequest({
            name: 'initialize',
            timestamp: new Date().toISOString(),
            context: {},
          }),
        abortController
      );
      if (failure) {
        recorder.failRun(INITIALIZATION, failure.error);
      }
    });
  }

  /**
   * Opens a new turn for `prompt` and streams its response. Needs no active turn, so it also
   * opens the first turn of a session.
   */
  function startPromptTurn(prompt: string | undefined): Promise<void> {
    const turnId = generateId();
    return sendRequest({kind: 'prompt', turnId}, async (abortController) => {
      recorder.openTurn(turnId, {prompt});
      await streamPrompt(turnId, prompt ?? '', abortController);
    });
  }

  /**
   * Validates the action payload against the component's generated Zod action schema before the
   * POST. A non-conforming payload is withheld (nothing sent).
   */
  function hasValidPayload(recovered: RecoveredAction): boolean {
    const validation = validateActionPayload(
      recovered.discriminant,
      recovered.name,
      recovered.context,
      config.contracts
    );
    if (!validation.valid) {
      devWarn(
        `dispatchAction: dispatch withheld: Invalid payload for action "${recovered.name}" on component "${recovered.discriminant}": ${validation.reason}`
      );
    }
    return validation.valid;
  }

  /**
   * Private validate-and-send path. Withholds an action whose payload fails
   * {@link hasValidPayload}; targets the action's own
   * originating surface, any live surface of the session (ADR-018). An action the producer
   * announced as opening a turn opens one, even before the first turn (ADR-019); any other is
   * recorded with the active turn, or with the initialization before the first turn.
   * Withholds when there is neither to stream the answer into.
   */
  function issueAction(recovered: RecoveredAction): Promise<void> {
    const current = store.getState();
    const activities = sessionActivities(current);
    const opensTurn = isTurnOpeningAction(activities, recovered.surfaceId, recovered.name);
    const concurrent = concurrentAction(activities, recovered.surfaceId, recovered.name);
    if (concurrent) {
      if (opensTurn) {
        devWarn(
          `dispatchAction: ${recovered.name} is announced as both concurrent and turn-opening; it is sent as concurrent.`
        );
      }
      return issueConcurrentAction(recovered, concurrent.cache);
    }
    const {activeTurnId, initialization} = current;
    if (!opensTurn && !activeTurnId && !initialization) {
      return withhold();
    }

    // `recovered.surfaceId` is already validated upstream by `recoverDiscriminant`
    // (it resolves a discriminant only for a `(surfaceId, sourceComponentId)` in
    // the session's registry, built from every turn), so the origin surface is used
    // as-is — no re-check, and a conversation-only surface reaches itself, not a
    // commerce one.
    const surfaceId = recovered.surfaceId;

    if (!hasValidPayload(recovered)) {
      return withhold();
    }

    const a2uiAction = toA2uiAction(recovered);

    const target: RunTarget = opensTurn
      ? turnTarget(generateId())
      : activeTurnId
        ? turnTarget(activeTurnId)
        : INITIALIZATION;
    const request: SessionRequest = {
      kind: 'action',
      component: recovered.discriminant,
      name: recovered.name,
      surfaceId,
      sourceComponentId: recovered.sourceComponentId,
      ...(target.kind === 'turn' ? {turnId: target.turnId} : {}),
    };
    // An answer streamed into an earlier run must not bring back what that run left behind.
    const abandoned = opensTurn ? undefined : abandonedPlaceholderIds(current, target);
    return sendRequest(
      request,
      async (abortController) => {
        if (opensTurn && target.kind === 'turn') {
          recorder.openTurn(target.turnId, {
            action: {
              component: recovered.discriminant,
              name: recovered.name,
              surfaceId: recovered.surfaceId,
              sourceComponentId: recovered.sourceComponentId,
              ...(recovered.context === undefined ? {} : {context: recovered.context}),
            },
          });
        }
        await streamAction(
          target,
          a2uiAction,
          {
            component: recovered.discriminant,
            name: recovered.name,
            surfaceId,
            sourceComponentId: recovered.sourceComponentId,
          },
          opensTurn,
          abortController
        );
      },
      abandoned
    );
  }

  function issueConcurrentAction(
    recovered: RecoveredAction,
    policy: CachePolicy | undefined
  ): Promise<void> {
    if (!store.getState().sessionToken) {
      devWarn(`dispatchAction: ${recovered.name} withheld: the session has no token yet.`);
      return withhold();
    }
    if (!hasValidPayload(recovered)) {
      return withhold();
    }
    return concurrentActions.issue(recovered, policy);
  }

  /**
   * Streams the answer to a component action into the run `target` records. Only an action that
   * opened that turn changes it: its failure fails the turn, and a concurrency conflict also sets
   * `actionError`. Any other action, including one recorded with the initialization, only updates
   * the surfaces, and `actionError` reports its failure (ADR-018, as amended).
   */
  async function streamAction(
    target: RunTarget,
    action: A2uiAction,
    source: ActionSource,
    ownsTurn: boolean,
    abortController: AbortController
  ): Promise<void> {
    recorder.setActionError(undefined);
    const failure = await executeStream(
      target,
      () => requests.buildActionRequest(action),
      abortController,
      ownsTurn ? undefined : source
    );
    if (!failure) {
      return;
    }
    if (!ownsTurn || failure.conflict) {
      recorder.setActionError({message: failure.error, ...source});
    }
    if (ownsTurn) {
      recorder.failRun(target, failure.error);
    }
  }

  /**
   * Recovers the PascalCase `component` discriminant of the dispatching node by
   * routing `(surfaceId, sourceComponentId)` through the session's node-identity
   * registry, derived from the session's activity log (ADR-018): any live surface
   * resolves, whichever run created it. Returns `undefined` when the node
   * resolves to no component.
   */
  function recoverDiscriminant(surfaceId: string, sourceComponentId: string): string | undefined {
    const registry = deriveNodeIdentityRegistry(sessionActivities(store.getState()));
    return registry.get(surfaceId)?.get(sourceComponentId);
  }

  /** Every refusal settles at once, so no caller is left waiting. */
  function issue(message: A2uiClientMessage): Promise<void> {
    const userAction = message.userAction;
    if (!userAction) {
      devWarn('dispatchAction: message carries no userAction; nothing sent.');
      return withhold();
    }

    const {name, surfaceId, sourceComponentId, context} = userAction;
    if (!sourceComponentId) {
      devWarn('dispatchAction: userAction has no sourceComponentId; nothing sent.');
      return withhold();
    }

    const discriminant = recoverDiscriminant(surfaceId, sourceComponentId);
    if (discriminant === undefined) {
      devWarn(
        `dispatchAction: node "${sourceComponentId}" on surface "${surfaceId}" resolves to no component; nothing sent.`
      );
      return withhold();
    }

    return issueAction({discriminant, name, sourceComponentId, surfaceId, context});
  }

  /**
   * The single consumer-facing action-dispatch entry point. See
   * {@link Session.dispatchAction}. Pre-bound arrow field so
   * `onAction={session.dispatchAction}` works when passed by reference.
   *
   * FIRE-AND-FORGET: every refusal is swallowed into a dev-only warning; the
   * returned Promise always resolves.
   */
  const dispatchAction = async (message: A2uiClientMessage | SubmitPromptAction): Promise<void> => {
    if (isSubmitPromptAction(message)) {
      try {
        await startPromptTurn(message.payload.prompt);
      } catch (error) {
        devWarn(`dispatchAction: submitPrompt withheld: ${getErrorMessage(error)}`);
      }
      return;
    }

    try {
      await issue(message);
    } catch (error) {
      devWarn(`dispatchAction: action withheld: ${getErrorMessage(error)}`);
    }
  };

  function retry(turnId: string): void {
    // Re-submit only the last turn, when it errored; any other turnId (unknown, non-error, or an
    // earlier turn, whose answer would land before later turns' surfaces) is a no-op that leaves all
    // turns' statuses unchanged.
    const turn = store.getState().turns.at(-1);
    if (!turn || turn.id !== turnId || turn.status !== 'error') {
      return;
    }
    if (turn.input.action) {
      retryAction(turnId, turn.input.action);
      return;
    }

    void sendRequest({kind: 'prompt', turnId}, async (abortController) => {
      recorder.restartTurn(turnId);
      await streamPrompt(turnId, turn.input.prompt ?? '', abortController);
    });
  }

  /**
   * Re-sends the action that opened an errored turn, from the surface it was dispatched from in an
   * earlier turn, and streams its answer into that turn again. The producer accepts an action on
   * any surface of the session, so it is not resolved against the active turn.
   */
  function retryAction(turnId: string, action: TurnAction): void {
    const a2uiAction = toA2uiAction(action);
    const request: SessionRequest = {
      kind: 'action',
      component: action.component,
      name: action.name,
      surfaceId: action.surfaceId,
      sourceComponentId: action.sourceComponentId,
      turnId,
    };
    void sendRequest(request, async (abortController) => {
      recorder.restartTurn(turnId);
      await streamAction(
        turnTarget(turnId),
        a2uiAction,
        {
          component: action.component,
          name: action.name,
          surfaceId: action.surfaceId,
          sourceComponentId: action.sourceComponentId,
        },
        true,
        abortController
      );
    });
  }

  return {dispatchAction, retry, initialize};
}
