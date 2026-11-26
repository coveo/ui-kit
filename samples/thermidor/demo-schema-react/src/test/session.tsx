import {useSyncExternalStore, type ReactElement, type ReactNode} from 'react';
import {render, screen, waitFor} from '@testing-library/react';
import {expect, vi} from 'vitest';
import {createSession, type SerializedSession} from '@coveo/thermidor';
import {ComponentContractsSchema} from '@coveo/thermidor-schema/zod3';
import {SessionProvider, useSession, type DemoSession} from '../context/session.js';
import {createThermidorCatalog} from '../a2ui/components.js';
import {SessionRequestProvider} from '../a2ui/session-request.js';
import {ThermidorA2UIStream} from '../a2ui/surfaces.js';

/** A request the session sent to the converse endpoint. */
interface ConverseRequest {
  message: string | null;
  conversationSessionId?: string;
  action: {
    surfaceId?: string;
    sourceComponentId?: string;
    name: string;
    context: Record<string, unknown>;
  } | null;
}

export type ConverseHandler = (
  request: ConverseRequest,
  signal?: AbortSignal
) => Promise<Response> | Response;

export const SHELL_SURFACE_ID = 'shell-1';

const SESSION_KEYS = {conversationSessionId: 'session-1', conversationToken: 'token-1'};

const encoder = new TextEncoder();

let activitySequence = 0;

/** A converse response streaming the given AG-UI events, as server-sent events. */
export function sseResponse(events: readonly object[]): Response {
  const body = events.map((event) => `data: ${JSON.stringify(event)}\n\n`).join('');
  return new Response(encoder.encode(body), {headers: {'Content-Type': 'text/event-stream'}});
}

/**
 * A run carrying the session's keys and, unless empty, `messages` in one activity, with the AG-UI
 * `metadata` given.
 */
export function run(messages: readonly object[], metadata?: Record<string, unknown>): object[] {
  return [
    {type: 'RUN_STARTED', threadId: 'session-1', runId: 'run', ...SESSION_KEYS},
    ...(messages.length > 0
      ? [
          {
            type: 'ACTIVITY_SNAPSHOT',
            messageId: `activity-${++activitySequence}`,
            activityType: 'a2ui-surface',
            content: {messages},
            ...(metadata && {metadata}),
          },
        ]
      : []),
    {type: 'RUN_FINISHED', threadId: 'session-1', runId: 'run', ...SESSION_KEYS},
  ];
}

/**
 * The run a producer answers `initialize` with: the session shell and the session's keys, with the
 * AG-UI `metadata` given.
 */
export function shellRun(
  surfaceId = SHELL_SURFACE_ID,
  metadata?: Record<string, unknown>
): object[] {
  return run(
    [
      {
        version: '1.0',
        createSurface: {
          surfaceId,
          catalogId: 'https://schema.thermidor.coveo.com/a2-ui/catalog.json',
          components: [
            {id: 'root', component: 'SessionShell', children: ['search_box']},
            {id: 'search_box', component: 'SearchBox', suggestionsChild: 'query_suggestions'},
            {
              id: 'query_suggestions',
              component: 'QuerySuggestions',
              query: {'@path': '/state/query_suggestions/query'},
              recentQueries: {'@path': '/state/query_suggestions/recentQueries'},
              completions: {'@path': '/state/query_suggestions/completions'},
            },
          ],
          dataModel: {
            state: {query_suggestions: {query: '', recentQueries: [], completions: []}},
          },
        },
      },
    ],
    metadata
  );
}

/** The `metadata` of a producer announcing `fetchSuggestions` on `surfaceId` as concurrent. */
function concurrentSuggestions(surfaceId = SHELL_SURFACE_ID): Record<string, unknown> {
  return {concurrentActions: {[surfaceId]: {fetchSuggestions: {}}}};
}

export const INSTANT_PRODUCTS_ID = 'instant_products';

/**
 * The session shell with `InstantProducts` beside `QuerySuggestions`, announcing
 * `fetchInstantProducts` as concurrent and cached, as the producer does.
 */
function instantProductsShellRun(
  surfaceId = SHELL_SURFACE_ID,
  announced: Record<string, unknown> | null = {}
): object[] {
  return run(
    [
      {
        version: '1.0',
        createSurface: {
          surfaceId,
          catalogId: 'https://schema.thermidor.coveo.com/a2-ui/catalog.json',
          components: [
            {id: 'root', component: 'SessionShell', children: ['search_box']},
            {
              id: 'search_box',
              component: 'SearchBox',
              suggestionsChild: 'query_suggestions',
              instantProductsChild: INSTANT_PRODUCTS_ID,
            },
            {
              id: 'query_suggestions',
              component: 'QuerySuggestions',
              query: {'@path': '/state/query_suggestions/query'},
              recentQueries: {'@path': '/state/query_suggestions/recentQueries'},
              completions: {'@path': '/state/query_suggestions/completions'},
            },
            {
              id: INSTANT_PRODUCTS_ID,
              component: 'InstantProducts',
              query: {'@path': `/state/${INSTANT_PRODUCTS_ID}/query`},
              products: {'@path': `/state/${INSTANT_PRODUCTS_ID}/products`},
            },
          ],
          dataModel: {
            state: {
              query_suggestions: {query: '', recentQueries: [], completions: []},
              [INSTANT_PRODUCTS_ID]: {query: '', products: []},
            },
          },
        },
      },
    ],
    announced === null
      ? undefined
      : {
          concurrentActions: {
            [surfaceId]: {fetchInstantProducts: {cache: {ttlMs: 60_000}}, ...announced},
          },
        }
  );
}

/** The run a producer answers `fetchInstantProducts` with: the products named `names`, for `query`. */
export function instantProductsRun(surfaceId: string, query: string, names: string[]): object[] {
  return instantProductsRunOf(
    surfaceId,
    query,
    names.map((name) => ({
      permanentid: name,
      ec_name: name,
      clickUri: `https://example.com/${encodeURIComponent(name)}`,
      additionalFields: {},
    }))
  );
}

/** The run a producer answers `fetchInstantProducts` with: `products`, for `query`. */
export function instantProductsRunOf(
  surfaceId: string,
  query: string,
  products: object[]
): object[] {
  return run([
    {
      version: '1.0',
      updateDataModel: {
        surfaceId,
        path: `/state/${INSTANT_PRODUCTS_ID}`,
        value: {query, products},
      },
    },
  ]);
}

/**
 * The run a producer answers `fetchSuggestions` with: the recent queries and the completions of
 * `query`.
 */
export function suggestionsRun(
  surfaceId: string,
  query: string,
  expressions: string[],
  recentQueries: string[] = []
): object[] {
  return run([
    {
      version: '1.0',
      updateDataModel: {
        surfaceId,
        path: '/state/query_suggestions',
        value: {query, recentQueries, completions: expressions.map((expression) => ({expression}))},
      },
    },
  ]);
}

/**
 * Answers `initialize` with the shell, and `fetchSuggestions` with two completions that extend its
 * query, `<query> boards` and `<query> wax`, or none for an empty query. Anything else gets an empty
 * run.
 */
export const answerShell: ConverseHandler = (request) => {
  if (request.action?.name === 'initialize') {
    return sseResponse(shellRun());
  }
  return answerSuggestions(request);
};

/** Answers as {@link answerShell}, with the shell announcing `fetchSuggestions` as concurrent. */
export const answerConcurrentSuggestionsShell: ConverseHandler = (request) => {
  if (request.action?.name === 'initialize') {
    return sseResponse(shellRun(SHELL_SURFACE_ID, concurrentSuggestions()));
  }
  return answerSuggestions(request);
};

const answerSuggestions: ConverseHandler = (request) => {
  if (request.action?.name === 'fetchSuggestions') {
    const query = String(request.action.context['query']);
    return sseResponse(
      suggestionsRun(
        request.action.surfaceId!,
        query,
        query ? [`${query} boards`, `${query} wax`] : []
      )
    );
  }
  return sseResponse(run([]));
};

/**
 * Stubs the converse endpoint with `handler` and creates a real session on it, with the demo's
 * contract. The session sends `initialize` itself.
 */
export function createTestSession(handler: ConverseHandler = answerShell) {
  const {create, ...test} = createTestSessionFactory(handler);
  return {session: create(), ...test};
}

/**
 * Stubs the converse endpoint with `handler` and returns a factory of real sessions on it, with
 * the demo's contract, for a {@link SessionProvider}.
 */
export function createTestSessionFactory(handler: ConverseHandler = answerShell) {
  const requests: ConverseRequest[] = [];
  vi.stubGlobal(
    'fetch',
    vi.fn(async (_url: string, init: RequestInit) => {
      const request = JSON.parse(String(init.body)) as ConverseRequest;
      requests.push(request);
      return handler(request, init.signal ?? undefined);
    })
  );
  const create = (
    sessionToRestore?: SerializedSession,
    {initialize}: {initialize?: boolean} = {}
  ): DemoSession =>
    createSession({
      contracts: ComponentContractsSchema,
      organizationId: 'test-org',
      accessToken: 'test-token',
      endpoint: 'https://converse.test',
      agentConfigurationId: 'test-agent-configuration',
      trackingId: 'test-tracking',
      navigatorContextProvider: () => ({
        clientId: 'test-client',
        location: null,
        referrer: null,
        userAgent: null,
        language: 'en',
        country: 'US',
        currency: 'USD',
      }),
      sessionToRestore,
      initialize,
    });
  const actions = (name: string) =>
    requests.filter((request) => request.action?.name === name).map(({action}) => action!);
  return {create, requests, actions};
}

/**
 * Answers as {@link answerShell}, with the shell holding `InstantProducts`, and
 * `fetchInstantProducts` with one product named after its query.
 */
export const answerInstantProductsShell: ConverseHandler = (request) => {
  if (request.action?.name === 'initialize') {
    return sseResponse(instantProductsShellRun());
  }
  if (request.action?.name === 'fetchInstantProducts') {
    const query = String(request.action.context['query']);
    return sseResponse(instantProductsRun(request.action.surfaceId!, query, [`${query} product`]));
  }
  return answerShell(request);
};

/**
 * Answers as {@link answerInstantProductsShell}, with the shell announcing nothing as concurrent,
 * so it shows no products.
 */
export const answerUnannouncedInstantProductsShell: ConverseHandler = (request, signal) => {
  if (request.action?.name === 'initialize') {
    return sseResponse(instantProductsShellRun(SHELL_SURFACE_ID, null));
  }
  return answerInstantProductsShell(request, signal);
};

/**
 * Answers as {@link answerInstantProductsShell}, with the shell also announcing `fetchSuggestions`
 * as concurrent.
 */
export const answerConcurrentInstantProductsShell: ConverseHandler = (request, signal) => {
  if (request.action?.name === 'initialize') {
    return sseResponse(instantProductsShellRun(SHELL_SURFACE_ID, {fetchSuggestions: {}}));
  }
  return answerInstantProductsShell(request, signal);
};

/**
 * A converse response streaming `events`, then holding the last one back until `finish` is
 * called, as a turn whose answer is still streaming.
 */
export function streamingResponse(events: readonly object[]): {
  response: Response;
  finish: () => void;
} {
  let finish!: () => void;
  const finished = new Promise<void>((resolve) => {
    finish = resolve;
  });
  const chunk = (event: object) => encoder.encode(`data: ${JSON.stringify(event)}\n\n`);
  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      for (const event of events.slice(0, -1)) {
        controller.enqueue(chunk(event));
      }
      await finished;
      controller.enqueue(chunk(events[events.length - 1]));
      controller.close();
    },
  });
  return {
    response: new Response(body, {headers: {'Content-Type': 'text/event-stream'}}),
    finish,
  };
}

const catalog = createThermidorCatalog();

function SessionStream({children}: {children: ReactNode}) {
  const session = useSession();
  const {a2uiMessages} = useSyncExternalStore(
    session.subscribe,
    session.getSnapshot,
    session.getSnapshot
  );
  return (
    <SessionRequestProvider value={session}>
      <ThermidorA2UIStream
        catalog={catalog}
        messages={a2uiMessages}
        onAction={session.dispatchAction}
      >
        {children}
      </ThermidorA2UIStream>
    </SessionRequestProvider>
  );
}

/**
 * Renders `ui` as `AppShell` would: under a {@link SessionProvider} for `session`, a test session
 * by default, with the session's stream fed to the renderer.
 */
export function renderWithSession(ui: ReactElement, session = createTestSession().session) {
  return render(
    <SessionProvider session={session}>
      <SessionStream>{ui}</SessionStream>
    </SessionProvider>
  );
}

/** The page's prompt input, once the session shell's search box has replaced the disabled one. */
export async function findSearchBox(): Promise<HTMLTextAreaElement> {
  await waitFor(() =>
    expect((screen.getByLabelText('Prompt') as HTMLTextAreaElement).disabled).toBe(false)
  );
  return screen.getByLabelText('Prompt') as HTMLTextAreaElement;
}
