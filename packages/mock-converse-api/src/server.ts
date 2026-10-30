import {randomUUID} from 'node:crypto';
import {createServer as createHttpMiddlewareServer} from '@mswjs/http-middleware';
import {
  converseMultiSurfaceResponses,
  converseResponses,
  converseSchemaResponses,
} from '@coveo/platform-mock-api/converse';
import {http, HttpResponse} from 'msw';

export interface ServerOptions {
  port?: number;
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const SHORT_CONVERSE_ROUTE = '/converse';
const FULL_CONVERSE_ROUTE = '/rest/organizations/:orgId/commerce/unstable/agentic/converse';
const PREVIEW_CONVERSE_ROUTE = '/api/preview/organizations/:orgId/agents/commerce/agui/converse';
const SHORT_SCHEMA_CONVERSE_ROUTE = '/converse-schema';
const FULL_SCHEMA_CONVERSE_ROUTE =
  '/schema/rest/organizations/:orgId/commerce/unstable/agentic/converse';
const PREVIEW_SCHEMA_CONVERSE_ROUTE =
  '/schema/api/preview/organizations/:orgId/agents/commerce/agui/converse';
const MULTI_SURFACE_SESSIONS_ROUTE = '/multi-surface/sessions';

const withCors = <T extends Response>(response: T): T => {
  for (const [headerName, headerValue] of Object.entries(CORS_HEADERS)) {
    response.headers.set(headerName, headerValue);
  }
  return response;
};

const stringField = (record: Record<string, unknown> | undefined, field: string) => {
  const value = record?.[field];
  return typeof value === 'string' ? value : undefined;
};

const sessionsInFlight = new Map<string, symbol>();

const actionInFlightResponse = () =>
  HttpResponse.json(
    {
      errorCode: 'AGENT:ACTION_IN_FLIGHT',
      message: 'Another turn is in progress for this session.',
    },
    {status: 409}
  );

// Holds the session's turn slot until the response stream ends, even when the client cancels it,
// as Agent Gateway keeps the slot until the turn commits.
const holdSessionUntilStreamEnds = (sessionId: string, response: Response): Response => {
  const slot = Symbol(sessionId);
  sessionsInFlight.set(sessionId, slot);
  const release = () => {
    if (sessionsInFlight.get(sessionId) === slot) {
      sessionsInFlight.delete(sessionId);
    }
  };
  const reader = response.body!.getReader();
  let cancelled = false;
  const drainThenRelease = async () => {
    try {
      while (!(await reader.read()).done) {
        // The rest of the turn is read without being forwarded.
      }
    } catch {
      // A source that fails has ended the turn too.
    } finally {
      release();
    }
  };
  const body = new ReadableStream<Uint8Array>({
    async pull(controller) {
      try {
        const {done, value} = await reader.read();
        if (cancelled) {
          return;
        }
        if (done) {
          release();
          controller.close();
          return;
        }
        controller.enqueue(value);
      } catch (error) {
        release();
        if (!cancelled) {
          controller.error(error);
        }
      }
    },
    cancel() {
      cancelled = true;
      void drainThenRelease();
    },
  });
  return new HttpResponse(body, {status: response.status, headers: response.headers});
};

const handleConversePost = async ({request}: {request: Request}) => {
  const rawBody = await request.text();

  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch (error) {
    const details = error instanceof Error ? error.message : 'Unknown parse error';
    return withCors(
      HttpResponse.json(
        {
          error: 'Invalid JSON',
          details,
        },
        {status: 400}
      )
    );
  }

  if (
    typeof body !== 'object' ||
    body === null ||
    !('message' in body) ||
    typeof (body as Record<string, unknown>).message !== 'string'
  ) {
    return withCors(
      HttpResponse.json(
        {
          error: 'Missing required field: message',
        },
        {status: 400}
      )
    );
  }

  return withCors(converseResponses.baseResponse(body));
};

const handleSchemaConversePost = async ({request}: {request: Request}) => {
  const rawBody = await request.text();

  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch (error) {
    const details = error instanceof Error ? error.message : 'Unknown parse error';
    return withCors(
      HttpResponse.json(
        {
          error: 'Invalid JSON',
          details,
        },
        {status: 400}
      )
    );
  }

  // A request naming its view in `context.custom.surfaceId` shares one session with every view.
  if (converseMultiSurfaceResponses.isMultiSurfaceRequest(body)) {
    return withCors(converseMultiSurfaceResponses.multiSurfaceResponse(body));
  }

  const bodyRecord =
    typeof body === 'object' && body !== null ? (body as Record<string, unknown>) : undefined;
  const action = bodyRecord?.action;
  const hasAction = typeof action === 'object' && action !== null;
  const hasMessage = typeof bodyRecord?.message === 'string';

  // Accept either a prompt (`message` string) or a component action (non-null `action` object,
  // which arrives with `message: null`). Reject only when neither is present.
  if (!hasMessage && !hasAction) {
    return withCors(
      HttpResponse.json(
        {
          error: 'Missing required field: message or action',
        },
        {status: 400}
      )
    );
  }

  const schemaAction = hasAction ? (action as converseSchemaResponses.SchemaAction) : undefined;
  const sessionId = stringField(bodyRecord, 'conversationSessionId');
  const sessionToken = stringField(bodyRecord, 'conversationToken');

  if (schemaAction && converseSchemaResponses.isInitialize(schemaAction) && sessionToken) {
    return withCors(
      HttpResponse.json(
        {
          error: 'initialize opens a session: send it without a session token',
        },
        {status: 400}
      )
    );
  }

  if (sessionId && sessionsInFlight.has(sessionId)) {
    return withCors(actionInFlightResponse());
  }

  const session = {
    conversationSessionId: sessionId ?? randomUUID(),
    conversationToken: sessionToken ?? randomUUID(),
  };
  const response = schemaAction
    ? converseSchemaResponses.buildSchemaActionResponse(schemaAction, session)
    : converseSchemaResponses.schemaBaseResponse(body, session);

  return withCors(holdSessionUntilStreamEnds(session.conversationSessionId, response));
};

/** What the multi-surface mock keeps for each session. */
const multiSurfaceSessionsResponse = () =>
  withCors(HttpResponse.json(converseMultiSurfaceResponses.inspectSessions()));

const preflightResponse = () => withCors(new HttpResponse(null, {status: 204}));

const methodNotAllowedResponse = () =>
  withCors(
    HttpResponse.json(
      {
        error: 'Method Not Allowed',
      },
      {status: 405}
    )
  );

const notFoundResponse = () =>
  withCors(
    HttpResponse.json(
      {
        error: 'Not Found',
      },
      {status: 404}
    )
  );

const handlers = [
  http.options(SHORT_CONVERSE_ROUTE, preflightResponse),
  http.options(FULL_CONVERSE_ROUTE, preflightResponse),
  http.post(SHORT_CONVERSE_ROUTE, handleConversePost),
  http.post(FULL_CONVERSE_ROUTE, handleConversePost),
  http.all(SHORT_CONVERSE_ROUTE, methodNotAllowedResponse),
  http.all(FULL_CONVERSE_ROUTE, methodNotAllowedResponse),
  http.options(PREVIEW_CONVERSE_ROUTE, preflightResponse),
  http.post(PREVIEW_CONVERSE_ROUTE, handleConversePost),
  http.all(PREVIEW_CONVERSE_ROUTE, methodNotAllowedResponse),
  http.options(SHORT_SCHEMA_CONVERSE_ROUTE, preflightResponse),
  http.options(FULL_SCHEMA_CONVERSE_ROUTE, preflightResponse),
  http.options(PREVIEW_SCHEMA_CONVERSE_ROUTE, preflightResponse),
  http.post(SHORT_SCHEMA_CONVERSE_ROUTE, handleSchemaConversePost),
  http.post(FULL_SCHEMA_CONVERSE_ROUTE, handleSchemaConversePost),
  http.post(PREVIEW_SCHEMA_CONVERSE_ROUTE, handleSchemaConversePost),
  http.all(SHORT_SCHEMA_CONVERSE_ROUTE, methodNotAllowedResponse),
  http.all(FULL_SCHEMA_CONVERSE_ROUTE, methodNotAllowedResponse),
  http.all(PREVIEW_SCHEMA_CONVERSE_ROUTE, methodNotAllowedResponse),
  http.get(MULTI_SURFACE_SESSIONS_ROUTE, multiSurfaceSessionsResponse),
  http.all(/.*/, notFoundResponse),
] as unknown as Parameters<typeof createHttpMiddlewareServer>;

export function createMockConverseServer(_options?: ServerOptions) {
  return createHttpMiddlewareServer(...handlers);
}

if (process.env.NODE_ENV !== 'test') {
  const port = Number(process.env.PORT) || 3456;
  const server = createMockConverseServer({port});
  server.listen(port, () => {
    console.log(`Mock Converse API listening on port ${port}`);
  });
}
