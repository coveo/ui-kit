import {useSyncExternalStore, type ReactElement, type ReactNode} from 'react';
import {render, screen, waitFor} from '@testing-library/react';
import {expect, vi} from 'vitest';
import {A2UIProvider} from '@copilotkit/a2ui-renderer';
import {createSession} from '@coveo/thermidor';
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

/** A run carrying the session's keys and, unless empty, `messages` in one activity. */
export function run(messages: readonly object[]): object[] {
  return [
    {type: 'RUN_STARTED', threadId: 'session-1', runId: 'run', ...SESSION_KEYS},
    ...(messages.length > 0
      ? [
          {
            type: 'ACTIVITY_SNAPSHOT',
            messageId: `activity-${++activitySequence}`,
            activityType: 'a2ui-surface',
            content: {messages},
          },
        ]
      : []),
    {type: 'RUN_FINISHED', threadId: 'session-1', runId: 'run', ...SESSION_KEYS},
  ];
}

/** The run a producer answers `initialize` with: the session shell and the session's keys. */
export function shellRun(surfaceId = SHELL_SURFACE_ID): object[] {
  return run([
    {
      version: 'v1.0',
      createSurface: {
        surfaceId,
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
    },
  ]);
}

/** The run a producer answers `fetchSuggestions` with: the completions of `query`. */
export function suggestionsRun(surfaceId: string, query: string, expressions: string[]): object[] {
  return run([
    {
      version: 'v1.0',
      updateDataModel: {
        surfaceId,
        path: '/state/query-suggestions',
        value: {query, completions: expressions.map((expression) => ({expression}))},
      },
    },
  ]);
}

/**
 * Answers `initialize` with the shell, and `fetchSuggestions` with two completions that extend its
 * query: `<query> boards`, `<query> wax`. Anything else gets an empty run.
 */
export const answerShell: ConverseHandler = (request) => {
  if (request.action?.name === 'initialize') {
    return sseResponse(shellRun());
  }
  if (request.action?.name === 'fetchSuggestions') {
    const query = String(request.action.context['query']);
    return sseResponse(
      suggestionsRun(request.action.surfaceId!, query, [`${query} boards`, `${query} wax`])
    );
  }
  return sseResponse(run([]));
};

/**
 * Stubs the converse endpoint with `handler` and creates a real session on it, with the demo's
 * contract. The session sends `initialize` itself.
 */
export function createTestSession(handler: ConverseHandler = answerShell) {
  const requests: ConverseRequest[] = [];
  vi.stubGlobal(
    'fetch',
    vi.fn(async (_url: string, init: RequestInit) => {
      const request = JSON.parse(String(init.body)) as ConverseRequest;
      requests.push(request);
      return handler(request, init.signal ?? undefined);
    })
  );
  const session: DemoSession = createSession({
    contracts: ComponentContractsSchema,
    organizationId: 'test-org',
    accessToken: 'test-token',
    endpoint: 'https://converse.test',
  });
  const actions = (name: string) =>
    requests.filter((request) => request.action?.name === name).map(({action}) => action!);
  return {session, requests, actions};
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
      <A2UIProvider catalog={catalog} onAction={session.dispatchAction}>
        <ThermidorA2UIStream messages={a2uiMessages}>{children}</ThermidorA2UIStream>
      </A2UIProvider>
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
