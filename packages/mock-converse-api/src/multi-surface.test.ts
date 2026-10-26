import {beforeEach, describe, expect, it} from 'vitest';
import {converseMultiSurfaceResponses} from '@coveo/platform-mock-api/converse';

const {inspectSessions, multiSurfaceResponse, resetMultiSurfaceSessions} =
  converseMultiSurfaceResponses;

const ASSISTANT = 'storefront-preview-assistant';
const HOME = 'storefront-preview-home';
const SHELL = 'storefront-preview';

type Event = Record<string, unknown>;
type Message = Record<string, Record<string, unknown>>;

interface Session {
  id: string;
  token: string;
}

function converse(view: string, input: {message?: string; action?: Event}, session?: Session) {
  return multiSurfaceResponse(
    {
      message: input.message ?? null,
      action: input.action ?? null,
      conversationSessionId: session?.id ?? null,
      conversationToken: session?.token ?? null,
      context: {cart: [], custom: {surfaceId: view}},
    },
    {paced: false}
  );
}

async function eventsOf(response: Response): Promise<Event[]> {
  return (await response.text())
    .split('\n')
    .filter((line) => line.startsWith('data:'))
    .map((line) => JSON.parse(line.slice('data:'.length)));
}

function surfaceMessages(events: Event[]): Message[] {
  return events
    .filter((event) => event.type === 'ACTIVITY_SNAPSHOT')
    .flatMap((event) => (event.content as {messages: Message[]}).messages);
}

/** The surfaces a turn created and did not delete again, such as a loading placeholder. */
function alive(events: Event[]) {
  const deleted = new Set(
    surfaceMessages(events)
      .filter((message) => message.deleteSurface)
      .map((message) => message.deleteSurface.surfaceId)
  );
  return surfaceMessages(events)
    .filter((message) => message.createSurface)
    .map((message) => String(message.createSurface.surfaceId))
    .filter((surfaceId) => !deleted.has(surfaceId));
}

function sessionOf(events: Event[]): Session {
  const runStarted = events.find((event) => event.type === 'RUN_STARTED')!;
  return {
    id: String(runStarted.conversationSessionId),
    token: String(runStarted.conversationToken),
  };
}

function searchOptionOf(events: Event[]): Event | undefined {
  return surfaceMessages(events)
    .map((message) => message.updateDataModel?.value as {suggestedActions?: Event[]} | undefined)
    .flatMap((value) => value?.suggestedActions ?? [])
    .find((action) => action.type === 'searchOption');
}

describe('multi-surface mock', () => {
  beforeEach(() => {
    resetMultiSurfaceSessions();
  });

  it.each(['storefront-preview-search', 'anything-else'])(
    'refuses a view it does not answer (%s) with a 400',
    (view) => {
      expect(converse(view, {message: 'kayak'}).status).toBe(400);
    }
  );

  it('refuses a request with neither a message nor an action', () => {
    expect(converse(HOME, {message: ''}).status).toBe(400);
  });

  it.each([HOME, SHELL])('answers %s with an empty run that opens the session', async (view) => {
    const events = await eventsOf(converse(view, {message: 'hello'}));

    expect(events.map((event) => event.type)).toEqual(['RUN_STARTED', 'RUN_FINISHED']);
    expect(sessionOf(events).id).toMatch(/^[0-9a-f-]{36}$/);
    expect(events[0].runId).toBe(events[1].runId);
  });

  it('requires the session token on a follow-up', async () => {
    const session = sessionOf(await eventsOf(converse(HOME, {message: 'hello'})));

    expect(converse(HOME, {message: 'hello'}, {...session, token: 'wrong'}).status).toBe(403);
    expect(converse(HOME, {message: 'hello'}, session).status).toBe(200);
  });

  it('streams an assistant answer with one run lifecycle', async () => {
    const types = (await eventsOf(converse(ASSISTANT, {message: 'boating safety'}))).map(
      (event) => event.type
    );

    expect(types[0]).toBe('RUN_STARTED');
    expect(types.at(-1)).toBe('RUN_FINISHED');
    expect(types.filter((type) => type === 'RUN_STARTED')).toHaveLength(1);
    expect(types).toContain('TEXT_MESSAGE_CONTENT');
  });

  it('keeps every surface of earlier turns until the agent deletes it', async () => {
    const first = await eventsOf(converse(ASSISTANT, {message: 'boating safety'}));
    const session = sessionOf(first);
    const second = await eventsOf(
      converse(ASSISTANT, {message: 'which kayak should I get?'}, session)
    );
    const stored = inspectSessions()[session.id].surfaces;

    for (const surfaceId of [...alive(first), ...alive(second)]) {
      expect(surfaceId).toMatch(/^ui-/);
      expect(stored[surfaceId]).toBe('agent');
    }
  });

  it('keeps the search behind a search option and sends only its id', async () => {
    const events = await eventsOf(converse(ASSISTANT, {message: 'which kayak should I get?'}));
    const option = searchOptionOf(events)!;

    expect(option).toEqual({
      text: 'See all kayaks',
      type: 'searchOption',
      optionId: expect.stringMatching(/^opt-/),
    });
    expect(inspectSessions()[sessionOf(events).id].searchOptions).toEqual({
      [String(option.optionId)]: 'kayak',
    });
  });

  describe('a search surface opened from a search option', () => {
    let session: Session;
    let surfaceId: string;

    beforeEach(async () => {
      const answer = await eventsOf(converse(ASSISTANT, {message: 'which kayak should I get?'}));
      session = sessionOf(answer);
      const opened = await eventsOf(
        converse(
          ASSISTANT,
          {
            action: {
              name: 'selectSearchOption',
              surfaceId: 'ui-next-actions',
              sourceComponentId: 'root',
              context: {optionId: searchOptionOf(answer)!.optionId},
            },
          },
          session
        )
      );
      surfaceId = String(
        surfaceMessages(opened).find((message) => message.createSurface)!.createSurface.surfaceId
      );
    });

    it('opens it on the kayaks category', () => {
      expect(inspectSessions()[session.id].surfaces[surfaceId]).toBe('search');
    });

    it('answers its actions from the stored search', async () => {
      const events = await eventsOf(
        converse(
          ASSISTANT,
          {
            action: {
              name: 'selectSort',
              surfaceId,
              sourceComponentId: 'sort-2',
              context: {sortCriteria: 'price_desc'},
            },
          },
          session
        )
      );

      expect(surfaceMessages(events).length).toBeGreaterThan(0);
      expect(surfaceMessages(events).every((message) => message.updateDataModel)).toBe(true);
    });

    it('tells the agent what the shopper is looking at', async () => {
      const reasoning = (await eventsOf(converse(ASSISTANT, {message: 'anything else?'}, session)))
        .filter((event) => event.type === 'REASONING_MESSAGE_CONTENT')
        .map((event) => event.delta)
        .join('');

      expect(reasoning).toContain('The shopper is looking at the results for "kayak"');
    });
  });

  it('refuses an action on a surface it does not answer', async () => {
    const session = sessionOf(await eventsOf(converse(HOME, {message: 'hello'})));

    expect(
      converse(
        ASSISTANT,
        {action: {name: 'selectPage', surfaceId: 'ui-unknown', context: {page: 1}}},
        session
      ).status
    ).toBe(400);
  });

  it('refuses a second assistant turn while one runs, and frees it once the turn ends', async () => {
    const session = sessionOf(await eventsOf(converse(HOME, {message: 'hello'})));

    const first = converse(ASSISTANT, {message: 'boating safety'}, session);

    expect(converse(ASSISTANT, {message: 'kayaks'}, session).status).toBe(409);
    expect(converse(HOME, {message: 'hello'}, session).status).toBe(200);

    await eventsOf(first);

    expect(converse(ASSISTANT, {message: 'kayaks'}, session).status).toBe(200);
  });

  it('keeps the cart from updateCart actions', async () => {
    const session = sessionOf(await eventsOf(converse(HOME, {message: 'hello'})));
    const events = await eventsOf(
      converse(
        ASSISTANT,
        {
          action: {
            name: 'updateCart',
            surfaceId: 'ui-cart',
            context: {productId: 'p-1', quantity: 2, operation: 'add'},
          },
        },
        session
      )
    );

    expect(surfaceMessages(events)).toEqual([]);
    expect(inspectSessions()[session.id].cart).toEqual({'p-1': 2});
  });

  it('answers a next-action chip with text as a message', async () => {
    const events = await eventsOf(
      converse(ASSISTANT, {
        action: {name: 'selectAction', context: {text: 'boating safety', type: 'followup'}},
      })
    );

    expect(events.map((event) => event.type)).toContain('TEXT_MESSAGE_CONTENT');
  });
});
