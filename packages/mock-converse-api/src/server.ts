import {createServer as createHttpMiddlewareServer} from '@mswjs/http-middleware';
import {baseResponse} from '@coveo/platform-mock-api/converse/generate-response';
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
const FULL_CONVERSE_ROUTE =
  '/rest/organizations/:orgId/commerce/unstable/agentic/converse';

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
    const details =
      error instanceof Error ? error.message : 'Unknown parse error';
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

  return withCors(baseResponse(body));
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
