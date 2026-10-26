import {describe, it, expect} from 'vitest';
import {converseSchemaResponses} from '@coveo/platform-mock-api/converse';

const session = {conversationSessionId: 'session-1', conversationToken: 'token-1'};

interface SseEvent {
  event: string;
  data: Record<string, unknown>;
}

async function readEvents(response: Response): Promise<SseEvent[]> {
  const body = await response.text();
  return body
    .split('\n\n')
    .filter((chunk) => chunk.trim().length > 0)
    .map((chunk) => {
      const [eventLine, dataLine] = chunk.split('\n');
      return {
        event: eventLine.slice('event:'.length),
        data: JSON.parse(dataLine.slice('data:'.length)),
      };
    });
}

function surfaceMessages(events: SseEvent[]): Array<Record<string, unknown>> {
  return events
    .filter((event) => event.event === 'ACTIVITY_SNAPSHOT')
    .flatMap(
      (event) => (event.data.content as {messages: Array<Record<string, unknown>>}).messages
    );
}

async function initialize() {
  return readEvents(
    converseSchemaResponses.buildSchemaActionResponse({name: 'initialize', context: {}}, session)
  );
}

async function completions(query: string) {
  const events = await readEvents(
    converseSchemaResponses.buildSchemaActionResponse(
      {
        name: 'fetchSuggestions',
        surfaceId: 'session-shell-1',
        sourceComponentId: 'query-suggestions',
        context: {query},
      },
      session
    )
  );
  const [message] = surfaceMessages(events);
  return message.updateDataModel as {
    surfaceId: string;
    path: string;
    value: {query: string; completions: Array<{expression: string; score: number}>};
  };
}

async function expressions(query: string) {
  return (await completions(query)).value.completions.map(({expression}) => expression);
}

describe('isInitialize', () => {
  it('recognizes initialize only without a surface or source component', () => {
    expect(converseSchemaResponses.isInitialize({name: 'initialize', context: {}})).toBe(true);
    expect(
      converseSchemaResponses.isInitialize({name: 'initialize', surfaceId: 's', context: {}})
    ).toBe(false);
    expect(
      converseSchemaResponses.isInitialize({
        name: 'initialize',
        sourceComponentId: 'root',
        context: {},
      })
    ).toBe(false);
    expect(converseSchemaResponses.isInitialize({name: 'selectPage', context: {}})).toBe(false);
  });
});

describe('initialize', () => {
  it('opens the session with its keys', async () => {
    const events = await initialize();

    expect(events.map(({event}) => event)).toEqual([
      'turn_started',
      'RUN_STARTED',
      'ACTIVITY_SNAPSHOT',
      'RUN_FINISHED',
      'turn_complete',
    ]);
    expect(events[0].data).toEqual(session);
    expect(events.at(-1)!.data).toEqual(session);
  });

  it('creates the session shell with a search box and its query suggestions', async () => {
    const [message] = surfaceMessages(await initialize());

    expect(message).toEqual({
      version: 'v1.0',
      createSurface: {
        surfaceId: expect.stringMatching(/^session-shell-\d+$/),
        catalogId: 'https://schema.thermidor.coveo.com/a2-ui/catalog.json',
        components: [
          {id: 'root', component: 'SessionShell', children: ['search-box']},
          {id: 'search-box', component: 'SearchBox', suggestionsChild: 'query-suggestions'},
          {
            id: 'query-suggestions',
            component: 'QuerySuggestions',
            query: {path: '/state/query-suggestions/query'},
            completions: {path: '/state/query-suggestions/completions'},
          },
        ],
        dataModel: {state: {'query-suggestions': {query: '', completions: []}}},
      },
    });
  });

  it('mints a new shell surface id each time', async () => {
    const surfaceId = async () =>
      (surfaceMessages(await initialize())[0].createSurface as {surfaceId: string}).surfaceId;

    expect(await surfaceId()).not.toBe(await surfaceId());
  });
});

describe('fetchSuggestions', () => {
  it("writes the completions at the source component's state on the action's surface", async () => {
    expect(await completions('surf')).toEqual({
      surfaceId: 'session-shell-1',
      path: '/state/query-suggestions',
      value: {
        query: 'surf',
        completions: [
          {expression: 'surfboards', score: 100},
          {expression: 'surfboard leash', score: 95},
          {expression: 'surfboard bag', score: 90},
          {expression: 'surf wax', score: 85},
          {expression: 'surf shorts', score: 80},
        ],
      },
    });
  });

  it('lists prefix matches before substring matches, at most six', async () => {
    expect(await expressions('wetsuit')).toEqual([
      'wetsuits',
      'wetsuit gloves',
      'wetsuit boots',
      'winter wetsuit',
    ]);
    expect(await expressions('s')).toHaveLength(6);
    expect(await expressions('  Kayak ')).toEqual(['kayaks', 'kayak paddles', 'kayak spray skirt']);
  });

  it('returns no completions for an empty query or no match', async () => {
    expect(await completions('')).toMatchObject({value: {query: '', completions: []}});
    expect(await expressions('   ')).toEqual([]);
    expect(await expressions('snowboard')).toEqual([]);
  });

  it("runs on the session's keys", async () => {
    const events = await readEvents(
      converseSchemaResponses.buildSchemaActionResponse(
        {
          name: 'fetchSuggestions',
          surfaceId: 'session-shell-1',
          sourceComponentId: 'query-suggestions',
          context: {query: 'surf'},
        },
        session
      )
    );

    expect(events[0]).toEqual({event: 'turn_started', data: session});
  });
});
