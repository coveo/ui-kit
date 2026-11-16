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
    value: {
      query: string;
      recentQueries: string[];
      completions: Array<{expression: string; score: number}>;
    };
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
            recentQueries: {path: '/state/query-suggestions/recentQueries'},
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
            'query-suggestions': {query: '', recentQueries: [], completions: []},
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
      concurrentActions: {[shellId]: {fetchInstantProducts: {cache: {ttlMs: 60000}}}},
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
        recentQueries: [],
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
    expect(await completions('')).toMatchObject({
      value: {query: '', recentQueries: [], completions: []},
    });
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

describe('recent queries', () => {
  let sessionCount = 0;

  async function openSession() {
    sessionCount += 1;
    const keys = {
      conversationSessionId: `recent-queries-session-${sessionCount}`,
      conversationToken: `recent-queries-token-${sessionCount}`,
    };
    const events = await readEvents(
      converseSchemaResponses.buildSchemaActionResponse({name: 'initialize', context: {}}, keys)
    );
    const shellId = (surfaceMessages(events)[0].createSurface as {surfaceId: string}).surfaceId;

    const prompt = async (message: string) => {
      const answer = await readEvents(converseSchemaResponses.schemaBaseResponse({message}, keys));
      return surfaceMessages(answer)
        .map((message) => (message.createSurface as {surfaceId: string} | undefined)?.surfaceId)
        .find((surfaceId) => surfaceId?.startsWith('ui-commerce-water-sports-'));
    };

    const act = (
      name: string,
      context: Record<string, unknown>,
      surfaceId: string | undefined = shellId,
      sourceComponentId = 'query-suggestions'
    ) =>
      converseSchemaResponses.buildSchemaActionResponse(
        {name, surfaceId, sourceComponentId, context},
        keys
      );

    const suggestions = async (query: string) => {
      const [message] = surfaceMessages(await readEvents(act('fetchSuggestions', {query})));
      return (message.updateDataModel as {value: Record<string, unknown>}).value as {
        query: string;
        recentQueries: string[];
        completions: Array<{expression: string}>;
      };
    };

    const recentQueries = async (query = '') => (await suggestions(query)).recentQueries;

    // The session records each query as its search is sent, so the answers can stream side by side.
    const restore = (surfaceId: string, ...queries: string[]) =>
      Promise.all(
        queries
          .map((query) => act('restoreState', {query, page: 0, pageSize: 12}, surfaceId, 'root'))
          .map(readEvents)
      );

    return {keys, shellId, prompt, act, suggestions, recentQueries, restore};
  }

  async function searchSurface(session: Awaited<ReturnType<typeof openSession>>) {
    const surfaceId = await session.prompt('water sports');
    expect(surfaceId).toBeDefined();
    return surfaceId!;
  }

  it('records the query each search ran, normalized and newest first', async () => {
    const session = await openSession();

    await session.prompt('swim gear');
    expect(await session.recentQueries()).toEqual(['water sports']);

    await session.prompt('  Life JACKETS ');
    expect(await session.recentQueries()).toEqual(['life jackets', 'water sports']);

    await session.prompt('  WATER Sprots ');
    expect(await session.recentQueries()).toEqual(['water sports', 'life jackets']);
  });

  it('records a restored search under its query', async () => {
    const session = await openSession();
    const surfaceId = await searchSurface(session);

    await session.restore(surfaceId, '  Surf Wax ');

    expect(await session.recentQueries()).toEqual(['surf wax', 'water sports']);
  });

  it("moves a re-run search's query back to the top", async () => {
    const session = await openSession();
    const surfaceId = await searchSurface(session);
    await session.restore(surfaceId, 'kayaks');

    await readEvents(
      session.act('selectSort', {sort: {sortCriteria: 'relevance'}}, surfaceId, 'sort-2')
    );

    expect(await session.recentQueries()).toEqual(['kayaks', 'water sports']);
  });

  it('records no agent answer, no search without products and no facet value search', async () => {
    const session = await openSession();
    const surfaceId = await searchSurface(session);
    await readEvents(session.act('clearRecentQueries', {}));

    const [, , , emptyRange] = await Promise.all(
      [
        converseSchemaResponses.schemaBaseResponse({message: 'boating safety'}, session.keys),
        converseSchemaResponses.schemaBaseResponse({message: 'hello'}, session.keys),
        session.act('search', {query: 'aqua'}, surfaceId, 'facet-brand-2'),
        session.act('applyCustomRange', {start: 100000, end: 200000}, surfaceId, 'facet-price-2'),
      ].map(readEvents)
    );

    const querySummary = surfaceMessages(emptyRange)
      .map(({updateDataModel}) => updateDataModel as {path: string; value: unknown})
      .find(({path}) => path === '/state/query-summary-2');
    expect(querySummary?.value).toMatchObject({totalEntries: 0});
    expect(await session.recentQueries()).toEqual([]);
  }, 15_000);

  it('records no action that runs no search', async () => {
    const session = await openSession();
    const corrected = (await session.prompt('water sprots'))!;
    await readEvents(session.act('clearRecentQueries', {}));

    await Promise.all(
      [
        session.act('overrideCorrection', {}, corrected, 'query-summary-2'),
        session.act('selectSearchOption', {text: 'kayaks'}, corrected, 'root'),
      ].map(readEvents)
    );

    expect(await session.recentQueries()).toEqual([]);
  });

  it('keeps the ten newest queries of each session', async () => {
    const session = await openSession();
    const other = await openSession();
    const surfaceId = await searchSurface(session);

    const queries = [
      'wetsuits',
      'drysuits',
      'surfboards',
      'bodyboards',
      'skimboards',
      'paddleboards',
      'kayaks',
      'canoes',
      'paddles',
      'life jackets',
      'snorkels',
      'dry bags',
    ];
    await session.restore(surfaceId, ...queries);

    const tenNewest = queries.slice(2).reverse();
    expect(await session.recentQueries()).toEqual(tenNewest.slice(0, 8));
    expect(await session.recentQueries('PADDLE')).toEqual(['paddles', 'paddleboards']);
    expect(await session.recentQueries('dr')).toEqual(['dry bags']);
    expect(await session.recentQueries('wet')).toEqual([]);
    expect(await other.recentQueries()).toEqual([]);
  });

  it('lists the matching recent queries, and the completions without them', async () => {
    const session = await openSession();
    const surfaceId = await searchSurface(session);
    await session.restore(surfaceId, 'surf wax', 'snorkel mask', 'surfboards');

    expect(await session.suggestions('Surf')).toMatchObject({
      query: 'Surf',
      recentQueries: ['surfboards', 'surf wax'],
      completions: [
        {expression: 'surfboard leash'},
        {expression: 'surfboard bag'},
        {expression: 'surf shorts'},
      ],
    });
  });

  it('caps recent queries at three while typing, and all suggestions at eight', async () => {
    const session = await openSession();
    const surfaceId = await searchSurface(session);
    await session.restore(surfaceId, 'sandskater', 'safefloat', 'snorkels', 'skimboards');

    const typed = await session.suggestions('s');

    expect(typed.recentQueries).toEqual(['skimboards', 'snorkels', 'safefloat']);
    expect(await session.recentQueries('  ')).toHaveLength(5);
    expect(await session.recentQueries(' SA ')).toEqual(['safefloat', 'sandskater']);
    expect(typed.completions.map(({expression}) => expression)).toEqual([
      'surfboards',
      'surfboard leash',
      'surfboard bag',
      'surf wax',
      'surf shorts',
    ]);
  });

  describe('clearRecentQueries', () => {
    it("empties the session's list and writes only the recentQueries field", async () => {
      const session = await openSession();
      await searchSurface(session);

      const events = await readEvents(session.act('clearRecentQueries', {}));

      expect(events.map(({event}) => event)).toEqual([
        'turn_started',
        'RUN_STARTED',
        'ACTIVITY_SNAPSHOT',
        'RUN_FINISHED',
        'turn_complete',
      ]);
      expect(events[0].data).toEqual(session.keys);
      expect(surfaceMessages(events)).toEqual([
        {
          version: 'v1.0',
          updateDataModel: {
            surfaceId: session.shellId,
            path: '/state/query-suggestions/recentQueries',
            value: [],
          },
        },
      ]);
      expect(await session.recentQueries()).toEqual([]);
    });

    it('refuses a surface or component other than the shell query suggestions', async () => {
      const session = await openSession();
      const surfaceId = await searchSurface(session);

      const refusals = [
        session.act('clearRecentQueries', {}, surfaceId),
        session.act('clearRecentQueries', {}, session.shellId, 'instant-products'),
      ];

      for (const refusal of refusals) {
        expect(refusal.status).toBe(400);
        expect(await refusal.json()).toEqual({
          errorCode: 'AGENT:ACTION_NOT_APPLICABLE',
          message: expect.any(String),
        });
      }
      expect(await session.recentQueries()).toEqual(['water sports']);
    });
  });

  describe('removeRecentQuery', () => {
    it('removes the entry, trimmed and compared case-insensitively, without a state write', async () => {
      const session = await openSession();
      const surfaceId = await searchSurface(session);
      await session.restore(surfaceId, 'kayaks');

      const events = await readEvents(session.act('removeRecentQuery', {query: ' Water Sports '}));

      expect(events.map(({event}) => event)).toEqual([
        'turn_started',
        'RUN_STARTED',
        'RUN_FINISHED',
        'turn_complete',
      ]);
      expect(events[0].data).toEqual(session.keys);
      expect(await session.recentQueries()).toEqual(['kayaks']);
    });

    it('succeeds without a change when the list does not hold the entry', async () => {
      const session = await openSession();
      await searchSurface(session);

      const response = session.act('removeRecentQuery', {query: 'surfboards'});

      expect(response.status).toBe(200);
      await readEvents(response);
      expect(await session.recentQueries()).toEqual(['water sports']);
    });

    it('lets a later search record the entry again', async () => {
      const session = await openSession();
      await searchSurface(session);
      await readEvents(session.act('removeRecentQuery', {query: 'water sports'}));

      await searchSurface(session);

      expect(await session.recentQueries()).toEqual(['water sports']);
    });
  });
});
