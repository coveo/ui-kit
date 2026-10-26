import {beforeEach, describe, expect, it, vi} from 'vitest';
import type {A2uiClientMessage, SessionRequest, SubmitPromptAction, Turn} from '@coveo/thermidor';
import {makeTurn} from '../../../demo-schema-react/src/test/turn-fixtures.js';
import {
  ASSISTANT_CONTEXT,
  HOME_CONTEXT,
  SEARCH_CONTEXT,
  createTurnScheduler,
  type TurnScheduler,
} from './turn-scheduler.js';

/**
 * A stand-in for a `@coveo/thermidor` session: one request at a time, published as `request`
 * before `dispatchAction` returns, a dispatch withheld while one is in flight, and a cancelled
 * request that unwinds a few microtasks after `cancel()`.
 */
function createFakeSession() {
  const turns: Turn[] = [];
  const listeners = new Set<() => void>();
  const contextsAtRequest: Array<string | undefined> = [];
  let request: SessionRequest | undefined;
  let scheduler: TurnScheduler | undefined;

  function setRequest(next: SessionRequest | undefined) {
    request = next;
    for (const listener of listeners) {
      listener();
    }
  }

  const session = {
    get turns() {
      return turns;
    },
    get request() {
      return request;
    },
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    dispatchAction: vi.fn(async (message: A2uiClientMessage | SubmitPromptAction) => {
      if (request) {
        return;
      }
      contextsAtRequest.push(scheduler?.currentContext);
      if ('name' in message) {
        const turnId = `t${turns.length + 1}`;
        turns.push(makeTurn({id: turnId, prompt: message.payload.prompt, status: 'streaming'}));
        setRequest({kind: 'prompt', turnId});
      } else {
        setRequest({
          kind: 'action',
          component: 'ProductCard',
          name: message.userAction!.name,
          surfaceId: message.userAction!.surfaceId,
          sourceComponentId: message.userAction!.sourceComponentId!,
          turnId: turns.at(-1)!.id,
        });
      }
    }),
    cancel: vi.fn(() => {
      const streaming = turns.find((turn) => turn.status === 'streaming');
      if (streaming) {
        streaming.status = 'error';
        streaming.error = 'Cancelled';
      }
      void Promise.resolve().then(() => setRequest(undefined));
    }),
  };

  return {
    session,
    contextsAtRequest,
    bind(next: TurnScheduler) {
      scheduler = next;
    },
    /** Ends the request in flight. */
    finish() {
      const streaming = turns.find((turn) => turn.status === 'streaming');
      if (streaming) {
        streaming.status = 'complete';
      }
      setRequest(undefined);
    },
    /** The prompts the session sent, withheld ones excluded. */
    prompts() {
      return turns.map((turn) => turn.input.prompt);
    },
  };
}

const unwind = () => Promise.resolve().then(() => Promise.resolve());

const cartAction = {
  userAction: {name: 'updateCart', surfaceId: 'ui-cart', sourceComponentId: 'root', context: {}},
};

describe('createTurnScheduler', () => {
  let fake: ReturnType<typeof createFakeSession>;
  let scheduler: TurnScheduler;

  beforeEach(() => {
    fake = createFakeSession();
    scheduler = createTurnScheduler(fake.session);
    fake.bind(scheduler);
  });

  it('names the view of each request while the session builds it', () => {
    scheduler.submitPagePrompt(HOME_CONTEXT, '', 7);

    expect(fake.contextsAtRequest).toEqual([HOME_CONTEXT]);
    expect(scheduler.turnContexts.get('t1')).toBe(HOME_CONTEXT);
    expect(scheduler.turnVisits.get('t1')).toBe(7);
  });

  it('cancels whatever is in flight for a new page, and sends it once the request unwinds', async () => {
    scheduler.submitPagePrompt(ASSISTANT_CONTEXT, 'boating safety', 1);
    scheduler.submitPagePrompt(HOME_CONTEXT, '', 2);

    expect(fake.session.cancel).toHaveBeenCalledTimes(1);
    expect(fake.prompts()).toEqual(['boating safety']);

    await unwind();

    expect(fake.prompts()).toEqual(['boating safety', '']);
    expect(scheduler.turnVisits.get('t2')).toBe(2);
  });

  it('sends only the latest of several page prompts made while one is in flight', async () => {
    scheduler.submitPagePrompt(HOME_CONTEXT, '', 1);
    scheduler.submitPagePrompt(ASSISTANT_CONTEXT, 'boating safety', 2);
    scheduler.submitPagePrompt(SEARCH_CONTEXT, 'kayak', 3);
    await unwind();

    expect(fake.prompts()).toEqual(['', 'kayak']);
    expect(fake.contextsAtRequest).toEqual([HOME_CONTEXT, SEARCH_CONTEXT]);
    expect(scheduler.turnVisits.get('t2')).toBe(3);
  });

  it('sends an action when the session is free, on behalf of its view', () => {
    scheduler.submitPagePrompt(HOME_CONTEXT, '', 1);
    fake.finish();
    scheduler.dispatchAction(ASSISTANT_CONTEXT, cartAction);

    expect(fake.session.dispatchAction).toHaveBeenLastCalledWith(cartAction);
    expect(fake.contextsAtRequest.at(-1)).toBe(ASSISTANT_CONTEXT);
  });

  it('withholds an action while a request is in flight, without queueing it', () => {
    scheduler.submitPagePrompt(HOME_CONTEXT, '', 1);
    scheduler.dispatchAction(HOME_CONTEXT, cartAction);
    fake.finish();

    expect(fake.session.dispatchAction).toHaveBeenCalledTimes(1);
  });
});
