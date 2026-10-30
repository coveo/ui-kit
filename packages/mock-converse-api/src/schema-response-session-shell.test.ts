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

  it('creates the session shell with a search box, its query suggestions and instant products', async () => {
    const [message] = surfaceMessages(await initialize());

    expect(message).toEqual({
      version: 'v1.0',
      createSurface: {
        surfaceId: expect.stringMatching(/^session-shell-\d+$/),
        catalogId: 'https://schema.thermidor.coveo.com/a2-ui/catalog.json',
        components: [
          {id: 'root', component: 'SessionShell', children: ['search-box']},
          {
            id: 'search-box',
            component: 'SearchBox',
            suggestionsChild: 'query-suggestions',
            instantProductsChild: 'instant-products',
          },
          {
            id: 'query-suggestions',
            component: 'QuerySuggestions',
            query: {path: '/state/query-suggestions/query'},
            completions: {path: '/state/query-suggestions/completions'},
          },
          {
            id: 'instant-products',
            component: 'InstantProducts',
            query: {path: '/state/instant-products/query'},
            products: {path: '/state/instant-products/products'},
          },
        ],
        dataModel: {
          state: {
            'query-suggestions': {query: '', completions: []},
            'instant-products': {query: '', products: []},
          },
        },
      },
    });
  });

  it('announces fetchInstantProducts on the shell as concurrent and cached for a minute', async () => {
    const [snapshot] = (await initialize()).filter(({event}) => event === 'ACTIVITY_SNAPSHOT');
    const shellId = (surfaceMessages([snapshot])[0].createSurface as {surfaceId: string}).surfaceId;

    expect(snapshot.data.metadata).toEqual({
      concurrentActions: {[shellId]: ['fetchInstantProducts']},
      cachedActions: {[shellId]: {fetchInstantProducts: {ttlMs: 60000}}},
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

describe('fetchInstantProducts', () => {
  const PRODUCT_PROPERTIES = new Set([
    'permanentid',
    'ec_name',
    'ec_description',
    'ec_shortdesc',
    'ec_brand',
    'ec_category',
    'ec_price',
    'ec_promo_price',
    'ec_images',
    'ec_thumbnails',
    'ec_in_stock',
    'ec_rating',
    'ec_color',
    'ec_item_group_id',
    'ec_item_group_name',
    'clickUri',
    'additionalFields',
    'children',
    'badgePlacements',
  ]);

  async function openShell(keys = session) {
    const events = await readEvents(
      converseSchemaResponses.buildSchemaActionResponse({name: 'initialize', context: {}}, keys)
    );
    return (surfaceMessages(events)[0].createSurface as {surfaceId: string}).surfaceId;
  }

  function fetchInstantProducts(
    action: {surfaceId?: string; sourceComponentId?: string; query: string},
    keys = session
  ) {
    return converseSchemaResponses.buildSchemaActionResponse(
      {
        name: 'fetchInstantProducts',
        surfaceId: action.surfaceId,
        sourceComponentId: action.sourceComponentId ?? 'instant-products',
        context: {query: action.query},
      },
      keys
    );
  }

  async function instantProducts(surfaceId: string, query: string) {
    const events = await readEvents(fetchInstantProducts({surfaceId, query}));
    const snapshots = events.filter(({event}) => event === 'ACTIVITY_SNAPSHOT');
    expect(snapshots).toHaveLength(1);
    const messages = surfaceMessages(snapshots);
    expect(messages).toHaveLength(1);
    return messages[0].updateDataModel as {
      surfaceId: string;
      path: string;
      value: {query: string; products: Array<Record<string, unknown>>};
    };
  }

  it("writes the whole instant-products slice of the session's shell", async () => {
    const shellId = await openShell();

    const write = await instantProducts(shellId, 'wetsuits');

    expect(write).toMatchObject({
      surfaceId: shellId,
      path: '/state/instant-products',
      value: {query: 'wetsuits'},
    });
    expect(Object.keys(write.value)).toEqual(['query', 'products']);
    expect(write.value.products.map(({ec_name}) => ec_name)).toEqual([
      'HydroLite Sleeveless Wetsuit',
      'EcoWave Performance Wetsuit',
      'ArcticShield Full Drysuit',
      'SunSeeker Spring Wetsuit',
    ]);
    for (const product of write.value.products) {
      expect(Object.keys(product).filter((key) => !PRODUCT_PROPERTIES.has(key))).toEqual([]);
    }
  });

  it('matches every term of the query against name, brand and category', async () => {
    const shellId = await openShell();
    const names = async (query: string) =>
      (await instantProducts(shellId, query)).value.products.map(({ec_name}) => ec_name);

    expect(await names('  Kayak paddles ')).toEqual(['CarbonStroke Kayak Paddle']);
    expect(await names('life jackets')).toEqual([
      'SafeFloat Adult Life Jacket',
      'AquaGuard Kids Life Jacket',
    ]);
    expect(await names('cressi fins')).toEqual(['PowerKick Dive Fins']);
  });

  it('writes no products for an empty or unmatched query', async () => {
    const shellId = await openShell();

    expect((await instantProducts(shellId, 'snowboard')).value).toEqual({
      query: 'snowboard',
      products: [],
    });
    expect((await instantProducts(shellId, '  ')).value).toEqual({query: '  ', products: []});
  });

  it("runs on the session's keys and ends with a terminal event", async () => {
    const shellId = await openShell();

    const events = await readEvents(fetchInstantProducts({surfaceId: shellId, query: 'surf'}));

    expect(events.map(({event}) => event)).toEqual([
      'turn_started',
      'RUN_STARTED',
      'ACTIVITY_SNAPSHOT',
      'RUN_FINISHED',
      'turn_complete',
    ]);
    expect(events[0].data).toEqual(session);
  });

  it('refuses a session whose shell holds no instant products', async () => {
    const shellId = await openShell();
    const refusal = async (response: Response) => ({
      status: response.status,
      body: await response.json(),
    });
    const notApplicable = {
      status: 400,
      body: {errorCode: 'AGENT:ACTION_NOT_APPLICABLE', message: expect.any(String)},
    };

    expect(
      await refusal(
        fetchInstantProducts(
          {surfaceId: shellId, query: 'surf'},
          {conversationSessionId: 'session-without-shell', conversationToken: 'token-2'}
        )
      )
    ).toEqual(notApplicable);
    expect(
      await refusal(fetchInstantProducts({surfaceId: 'ui-commerce-water-sports-1', query: 'surf'}))
    ).toEqual(notApplicable);
    expect(
      await refusal(
        fetchInstantProducts({
          surfaceId: shellId,
          sourceComponentId: 'query-suggestions',
          query: 'surf',
        })
      )
    ).toEqual(notApplicable);
  });
});
