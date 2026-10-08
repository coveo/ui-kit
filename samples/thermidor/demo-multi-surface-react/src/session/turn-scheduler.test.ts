import {beforeEach, describe, expect, it, vi} from 'vitest';
import type {A2uiClientMessage, SubmitPromptAction, Turn} from '@coveo/thermidor';
import {makeTurn} from '../../../demo-schema-react/src/test/turn-fixtures.js';
import {
  ASSISTANT_CONTEXT,
  HOME_CONTEXT,
  SHELL_CONTEXT,
  createTurnScheduler,
  type TurnScheduler,
} from './turn-scheduler.js';

/**
 * A stand-in for a `@coveo/thermidor` session: a prompt opens a streaming turn synchronously and
 * resolves once the test finishes it, and `cancel()` fails the streaming turn.
 */
function createFakeSession() {
  const turns: Turn[] = [];
  const pending: Array<() => void> = [];
  const contextsAtRequest: Array<string | undefined> = [];
  let scheduler: TurnScheduler | undefined;

  const session = {
    get turns() {
      return turns;
    },
    dispatchAction: vi.fn((message: A2uiClientMessage | SubmitPromptAction) => {
      contextsAtRequest.push(scheduler?.currentContext);
      if ('name' in message) {
        turns.push(
          makeTurn({
            id: `t${turns.length + 1}`,
            prompt: message.payload.prompt,
            status: 'streaming',
          })
        );
      }
      return new Promise<void>((resolve) => pending.push(resolve));
    }),
    cancel: vi.fn(() => {
      const streaming = turns.find((turn) => turn.status === 'streaming');
      if (streaming) {
        streaming.status = 'error';
        streaming.error = 'Cancelled';
      }
    }),
  };

  return {
    session,
    contextsAtRequest,
    bind(next: TurnScheduler) {
      scheduler = next;
    },
    /** Completes the oldest pending request. */
    async finish() {
      const streaming = turns.find((turn) => turn.status === 'streaming');
      if (streaming) {
        streaming.status = 'complete';
      }
      pending.shift()?.();
      await Promise.resolve();
      await Promise.resolve();
    },
    prompts() {
      return session.dispatchAction.mock.calls.map(([message]) =>
        'name' in message ? message.payload.prompt : undefined
      );
    },
  };
}

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

  it('names the area of each request while the session builds it', () => {
    scheduler.submitPagePrompt(HOME_CONTEXT, '');

    expect(fake.contextsAtRequest).toEqual([HOME_CONTEXT]);
    expect(scheduler.turnContexts.get('t1')).toBe(HOME_CONTEXT);
  });

  it('cancels a streaming shell turn for a new keystroke', () => {
    scheduler.searchAsYouType('life');
    scheduler.searchAsYouType('life jackets');

    expect(fake.session.cancel).toHaveBeenCalledTimes(1);
    expect(fake.prompts()).toEqual(['life', 'life jackets']);
  });

  it('does not resend a prompt identical to the last shell prompt', async () => {
    scheduler.searchAsYouType('life');
    await fake.finish();
    scheduler.searchAsYouType('life');

    expect(fake.prompts()).toEqual(['life']);
  });

  it('resends the last shell prompt when its turn failed', async () => {
    scheduler.searchAsYouType('life');
    scheduler.cancelSearch();
    scheduler.searchAsYouType('life');

    expect(fake.prompts()).toEqual(['life', 'life']);
  });

  it('lets a page turn finish before a keystroke, keeping only the latest one', async () => {
    scheduler.submitPagePrompt(ASSISTANT_CONTEXT, 'boating safety');
    scheduler.searchAsYouType('li');
    scheduler.searchAsYouType('life');

    expect(fake.session.cancel).not.toHaveBeenCalled();
    expect(fake.prompts()).toEqual(['boating safety']);

    await fake.finish();

    expect(fake.prompts()).toEqual(['boating safety', 'life']);
    expect(fake.contextsAtRequest.at(-1)).toBe(SHELL_CONTEXT);
  });

  it('cancels whatever is streaming for a new page', () => {
    scheduler.submitPagePrompt(ASSISTANT_CONTEXT, 'boating safety');
    scheduler.submitPagePrompt(HOME_CONTEXT, '');

    expect(fake.session.cancel).toHaveBeenCalledTimes(1);
    expect(fake.prompts()).toEqual(['boating safety', '']);
  });

  it('drops a queued keystroke when a page is opened', async () => {
    scheduler.submitPagePrompt(HOME_CONTEXT, '');
    scheduler.searchAsYouType('life');
    scheduler.submitPagePrompt(ASSISTANT_CONTEXT, 'life jackets');
    await fake.finish();

    expect(fake.prompts()).toEqual(['', 'life jackets']);
  });

  it('sends every queued action once the session is idle, in order', async () => {
    scheduler.submitPagePrompt(HOME_CONTEXT, '');
    scheduler.dispatchAction(SHELL_CONTEXT, cartAction);
    scheduler.dispatchAction(SHELL_CONTEXT, cartAction);

    expect(fake.session.dispatchAction).toHaveBeenCalledTimes(1);

    await fake.finish();
    await fake.finish();

    expect(fake.session.dispatchAction).toHaveBeenCalledTimes(3);
    expect(fake.session.dispatchAction.mock.calls.slice(1).map(([message]) => message)).toEqual([
      cartAction,
      cartAction,
    ]);
  });

  it('stops a streaming shell turn on cancelSearch, but not a page turn', () => {
    scheduler.submitPagePrompt(HOME_CONTEXT, '');
    scheduler.cancelSearch();
    expect(fake.session.cancel).not.toHaveBeenCalled();
  });
});
