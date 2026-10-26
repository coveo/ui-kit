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
  /** The page visit the prompt belongs to. */
  visitId: number;
}

export interface TurnScheduler {
  /**
   * A page's own prompt, for one visit of that page. The page replaces whatever was in flight,
   * so it cancels it and is sent once the session is free.
   */
  submitPagePrompt(context: StorefrontContext, prompt: string, visitId: number): void;
  /** The shopper opened a page with no prompt: the prompt of the page they left is not sent. */
  leavePage(): void;
  /**
   * A component action. The surfaces are locked while a request is in flight, so one that
   * arrives anyway is withheld, as the session would.
   */
  dispatchAction(context: StorefrontContext, message: A2uiClientMessage): void;
  /** The context the request being sent belongs to, for the session's context provider. */
  readonly currentContext: StorefrontContext;
  /** The context of each turn this scheduler opened, keyed by turn id. */
  readonly turnContexts: ReadonlyMap<string, StorefrontContext>;
  /** The page visit of each turn, keyed by turn id. */
  readonly turnVisits: ReadonlyMap<string, number>;
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
  let waitingPage: PromptTask | null = null;
  const turnContexts = new Map<string, StorefrontContext>();
  const turnVisits = new Map<string, number>();

  function send(context: StorefrontContext, message: Parameters<Session['dispatchAction']>[0]) {
    currentContext = context;
    // The session publishes the request, and opens a prompt's turn, before its first `await`.
    void session.dispatchAction(message);
    return session.request;
  }

  function sendPrompt(task: PromptTask): void {
    const request = send(task.context, {name: 'submitPrompt', payload: {prompt: task.prompt}});
    if (request?.kind === 'prompt') {
      turnContexts.set(request.turnId, task.context);
      turnVisits.set(request.turnId, task.visitId);
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
    submitPagePrompt(context, prompt, visitId) {
      waitingPage = {context, prompt, visitId};
      if (session.request) {
        session.cancel();
      }
      flush();
    },
    leavePage() {
      waitingPage = null;
    },
    dispatchAction(context, message) {
      if (!session.request) {
        send(context, message);
      }
    },
    get currentContext() {
      return currentContext;
    },
    turnContexts,
    turnVisits,
  };
}
