import {createServer as createHttpMiddlewareServer} from '@mswjs/http-middleware';
import {converseResponses, converseSchemaResponses} from '@coveo/platform-mock-api/converse';
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

const withCors = <T extends Response>(response: T): T => {
  for (const [headerName, headerValue] of Object.entries(CORS_HEADERS)) {
    response.headers.set(headerName, headerValue);
  }
  return response;
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
          error: 'Missing required field: message',
        },
        {status: 400}
      )
    );
  }

  if (hasAction) {
    return withCors(
      converseSchemaResponses.buildSchemaActionResponse(
        action as {name: string; context: Record<string, unknown>; sourceComponentId?: string}
      )
    );
  }

  return withCors(converseSchemaResponses.schemaBaseResponse(body));
};

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
