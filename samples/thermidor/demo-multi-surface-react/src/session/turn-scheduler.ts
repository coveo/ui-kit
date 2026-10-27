import type {A2uiClientMessage, Session} from '@coveo/thermidor';

/**
 * The view of the page a request comes from. It is sent to the server in
 * `context.custom.surfaceId`, with the values of the published contract.
 */
export type StorefrontContext =
  | 'storefront-preview-home'
  | 'storefront-preview-assistant'
  | 'storefront-preview-search';

export const HOME_CONTEXT: StorefrontContext = 'storefront-preview-home';
export const ASSISTANT_CONTEXT: StorefrontContext = 'storefront-preview-assistant';
export const SEARCH_CONTEXT: StorefrontContext = 'storefront-preview-search';

type SchedulerSession = Pick<
  Session,
  'dispatchAction' | 'cancel' | 'turns' | 'request' | 'subscribe'
>;

interface PromptTask {
  context: StorefrontContext;
  prompt: string;
  /** The surface the page showed, which the server sends again instead of answering the prompt. */
  restoreSurfaceId?: string;
}

export interface TurnScheduler {
  /**
   * The prompt of the page being shown. The page replaces whatever was in flight, so it cancels it
   * and is sent once the session is free. A page shown again from its URL names the surface it
   * showed in `restoreSurfaceId`.
   */
  submitPagePrompt(context: StorefrontContext, prompt: string, restoreSurfaceId?: string): void;
  /** The shopper opened a page with no prompt: the prompt of the page they left is not sent. */
  leavePage(): void;
  /**
   * A component action. The surfaces are locked while a request is in flight, so one that
   * arrives anyway is withheld, as the session would.
   */
  dispatchAction(context: StorefrontContext, message: A2uiClientMessage): void;
  /** The context the request being sent belongs to, for the session's context provider. */
  readonly currentContext: StorefrontContext;
  /** The surface the request being sent asks the server to restore, if any. */
  readonly currentRestoreSurfaceId: string | undefined;
  /** The context of each turn this scheduler opened, keyed by turn id. */
  readonly turnContexts: ReadonlyMap<string, StorefrontContext>;
  /** The turn the prompt of the page being shown opened, once the session has sent it. */
  readonly pageTurnId: string | undefined;
}

/**
 * Lets every view of the page share one session.
 *
 * `@coveo/thermidor` sends one request at a time, exposes it as `session.request`, and withholds
 * any dispatch made while it is in flight. It keeps no queue, so this scheduler keeps the latest
 * page prompt and sends it once `session.request` clears.
 */
export function createTurnScheduler(
  session: SchedulerSession,
  initialContext: StorefrontContext = HOME_CONTEXT
): TurnScheduler {
  let currentContext = initialContext;
  let currentRestoreSurfaceId: string | undefined;
  let waitingPage: PromptTask | null = null;
  let pageTurnId: string | undefined;
  const turnContexts = new Map<string, StorefrontContext>();

  function send(
    context: StorefrontContext,
    message: Parameters<Session['dispatchAction']>[0],
    restoreSurfaceId?: string
  ) {
    currentContext = context;
    currentRestoreSurfaceId = restoreSurfaceId;
    // The session publishes the request, and opens a prompt's turn, before its first `await`.
    void session.dispatchAction(message);
    return session.request;
  }

  function sendPrompt(task: PromptTask): void {
    const request = send(
      task.context,
      {name: 'submitPrompt', payload: {prompt: task.prompt}},
      task.restoreSurfaceId
    );
    if (request?.kind === 'prompt') {
      turnContexts.set(request.turnId, task.context);
      pageTurnId = request.turnId;
    }
  }

  function flush(): void {
    if (session.request || !waitingPage) {
      return;
    }
    const next = waitingPage;
    waitingPage = null;
    sendPrompt(next);
  }

  // A cancelled request unwinds a few microtasks after `cancel()`; the next prompt goes once it has.
  session.subscribe(flush);

  return {
    submitPagePrompt(context, prompt, restoreSurfaceId) {
      waitingPage = {context, prompt, restoreSurfaceId};
      pageTurnId = undefined;
      if (session.request) {
        session.cancel();
      }
      flush();
    },
    leavePage() {
      waitingPage = null;
      pageTurnId = undefined;
    },
    dispatchAction(context, message) {
      if (!session.request) {
        send(context, message);
      }
    },
    get currentContext() {
      return currentContext;
    },
    get currentRestoreSurfaceId() {
      return currentRestoreSurfaceId;
    },
    turnContexts,
    get pageTurnId() {
      return pageTurnId;
    },
  };
}
