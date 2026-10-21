import type {ReactElement} from 'react';
import {render} from '@testing-library/react';
import {vi} from 'vitest';
import {createSession} from '@coveo/thermidor';
import {ThermidorContract} from '@coveo/thermidor-schema/zod3';
import {SessionProvider, type DemoSession} from '../context/session.js';

/** A request the session sent to the converse endpoint. */
export interface ConverseRequest {
  surfaceTemplate?: string;
  message: string | null;
  action: {
    surfaceId: string;
    sourceComponentId: string;
    name: string;
    context: Record<string, unknown>;
  } | null;
}

type ConverseHandler = (request: ConverseRequest, signal?: AbortSignal) => Promise<Response>;

const encoder = new TextEncoder();

/** A converse response streaming the given AG-UI events, as server-sent events. */
export function sseResponse(events: readonly object[]): Response {
  const body = events.map((event) => `data: ${JSON.stringify(event)}\n\n`).join('');
  return new Response(encoder.encode(body), {headers: {'Content-Type': 'text/event-stream'}});
}

/** The run a producer answers a `fetchSuggestions` lookup with: completions only, no turn. */
export function suggestionsRun(surfaceId: string, query: string, expressions: string[]): object[] {
  return [
    {type: 'RUN_STARTED'},
    {
      type: 'ACTIVITY_SNAPSHOT',
      messageId: `suggestions-${query}`,
      activityType: 'a2ui-surface',
      content: {
        messages: [
          {
            version: 'v1.0',
            updateDataModel: {
              surfaceId,
              path: '/state/root',
              value: {query, completions: expressions.map((expression) => ({expression}))},
            },
          },
        ],
      },
    },
    {type: 'RUN_FINISHED'},
  ];
}

/** Answers a lookup with two completions that extend its query: `<query> boards`, `<query> wax`. */
export async function answerLookups(request: ConverseRequest): Promise<Response> {
  const query = String(request.action?.context['query']);
  return sseResponse(
    suggestionsRun(request.action!.surfaceId, query, [`${query} boards`, `${query} wax`])
  );
}

/**
 * Stubs the converse endpoint with `handler` and creates a real session on it, with the demo's
 * contract. By default every request answers with an empty run.
 */
export function createTestSession(
  handler: ConverseHandler = async () =>
    sseResponse([{type: 'RUN_STARTED'}, {type: 'RUN_FINISHED'}])
) {
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
    contract: ThermidorContract,
    organizationId: 'test-org',
    accessToken: 'test-token',
    endpoint: 'https://converse.test',
  });
  return {session, requests};
}

/** Renders `ui` under a {@link SessionProvider} for `session`, a test session by default. */
export function renderWithSession(ui: ReactElement, session = createTestSession().session) {
  return render(<SessionProvider session={session}>{ui}</SessionProvider>);
}
