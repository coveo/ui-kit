import type {A2uiClientMessage, Session} from '@coveo/thermidor';

/**
 * The area of the page a request comes from. It is sent to the server in
 * `context.custom.surfaceId`, the field agent-gateway's private route reads today.
 */
export type StorefrontContext =
  | 'storefront-preview'
  | 'storefront-preview-home'
  | 'storefront-preview-assistant';

export const SHELL_CONTEXT: StorefrontContext = 'storefront-preview';
export const HOME_CONTEXT: StorefrontContext = 'storefront-preview-home';
export const ASSISTANT_CONTEXT: StorefrontContext = 'storefront-preview-assistant';

type SchedulerSession = Pick<Session, 'dispatchAction' | 'cancel' | 'turns'>;

/**
 * What a new request does when another one is still streaming:
 * - `cancel`: stop it and start right away;
 * - `queue`: start once it ends. Only the latest queued prompt of each context is kept; every
 *   queued action is kept.
 */
type Policy = 'cancel' | 'queue';

interface Task {
  context: StorefrontContext;
  message: Parameters<Session['dispatchAction']>[0];
  /** The prompt, for a prompt request. */
  prompt?: string;
}

interface Running extends Task {
  turnId: string | undefined;
}

export interface TurnScheduler {
  /**
   * Search-as-you-type from the header. Cancels a streaming shell turn, but waits for a page turn
   * rather than cutting its answer short. A prompt identical to the last shell prompt that did
   * not fail is not resent.
   */
  searchAsYouType(prompt: string): void;
  /** A page's own prompt. The page replaces whatever was streaming, so it cancels it. */
  submitPagePrompt(context: StorefrontContext, prompt: string): void;
  /** A component action. Sent once nothing is streaming. */
  dispatchAction(context: StorefrontContext, message: A2uiClientMessage): void;
  /** Drops a queued shell request and stops a streaming shell turn. */
  cancelSearch(): void;
  /** The context the request being built belongs to, for the session's context provider. */
  readonly currentContext: StorefrontContext;
  /** The context of each turn this scheduler opened, keyed by turn id. */
  readonly turnContexts: ReadonlyMap<string, StorefrontContext>;
}

/**
 * Serializes the requests of every area of the page onto one session.
 *
 * A `@coveo/thermidor` session streams one turn at a time: it ignores a new prompt while a turn
 * is streaming, and drops an action. With one session for the whole page, the header and the
 * page therefore take turns, and this scheduler decides who waits and who interrupts.
 */
export function createTurnScheduler(
  session: SchedulerSession,
  initialContext: StorefrontContext = HOME_CONTEXT
): TurnScheduler {
  let currentContext = initialContext;
  let running: Running | null = null;
  const queue = new Map<string, Task>();
  let actionCount = 0;
  const turnContexts = new Map<string, StorefrontContext>();
  let lastShellPrompt: {prompt: string; turnId: string | undefined} | null = null;

  function start(task: Task): void {
    currentContext = task.context;
    const turnCount = session.turns.length;
    // The session opens a prompt's turn, and reads the context providers, before its first
    // `await`, so the new turn and the request both exist once this call returns.
    const done = session.dispatchAction(task.message);
    const turnId = session.turns.length > turnCount ? session.turns.at(-1)?.id : undefined;
    if (turnId !== undefined) {
      turnContexts.set(turnId, task.context);
    }
    if (task.context === SHELL_CONTEXT && task.prompt !== undefined) {
      lastShellPrompt = {prompt: task.prompt, turnId};
    }
    const current: Running = {...task, turnId};
    running = current;
    void done.then(() => {
      if (running === current) {
        running = null;
        flush();
      }
    });
  }

  function flush(): void {
    if (running) {
      return;
    }
    const [next] = queue.entries();
    if (next) {
      queue.delete(next[0]);
      start(next[1]);
    }
  }

  function cancelRunning(): void {
    if (running) {
      running = null;
      session.cancel();
    }
  }

  function promptKey(context: StorefrontContext): string {
    return `prompt:${context}`;
  }

  function schedule(key: string, task: Task, policy: Policy): void {
    if (running && policy === 'cancel') {
      cancelRunning();
    }
    if (running) {
      queue.delete(key);
      queue.set(key, task);
      return;
    }
    start(task);
  }

  function isRepeatedShellPrompt(prompt: string): boolean {
    if (!lastShellPrompt || lastShellPrompt.prompt !== prompt) {
      return false;
    }
    const turnId = lastShellPrompt.turnId;
    const turn = session.turns.find((candidate) => candidate.id === turnId);
    return turn !== undefined && turn.status !== 'error';
  }

  return {
    searchAsYouType(prompt) {
      if (isRepeatedShellPrompt(prompt)) {
        queue.delete(promptKey(SHELL_CONTEXT));
        return;
      }
      schedule(
        promptKey(SHELL_CONTEXT),
        {context: SHELL_CONTEXT, prompt, message: {name: 'submitPrompt', payload: {prompt}}},
        running?.context === SHELL_CONTEXT ? 'cancel' : 'queue'
      );
    },
    submitPagePrompt(context, prompt) {
      queue.delete(promptKey(SHELL_CONTEXT));
      schedule(
        promptKey(context),
        {context, prompt, message: {name: 'submitPrompt', payload: {prompt}}},
        'cancel'
      );
    },
    dispatchAction(context, message) {
      actionCount += 1;
      schedule(`action:${actionCount}`, {context, message}, 'queue');
    },
    cancelSearch() {
      queue.delete(promptKey(SHELL_CONTEXT));
      if (running?.context === SHELL_CONTEXT) {
        cancelRunning();
        flush();
      }
    },
    get currentContext() {
      return currentContext;
    },
    turnContexts,
  };
}
