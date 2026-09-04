import {createServer} from 'node:http';

const send = (response, status, headers = {}, body = '') => {
  response.writeHead(status, headers);
  response.end(body);
};

export const startMockCache = async ({host = '127.0.0.1', port = 8787} = {}) => {
  const origin = `http://${host}:${port}`;
  const artifacts = new Map();
  const issuedLocations = [];
  const operations = [];

  const server = createServer(async (request, response) => {
    try {
      const chunks = [];
      for await (const chunk of request) {
        chunks.push(chunk);
      }

      const body = Buffer.concat(chunks);
      const method = request.method ?? 'UNKNOWN';
      const requestTarget = request.url ?? '/';
      const url = new URL(requestTarget, origin);

      if (method === 'GET' && url.pathname === '/v8/artifacts/status') {
        send(response, 200, {'content-type': 'application/json'}, '{"status":"enabled"}');
        return;
      }

      if (url.pathname === '/v8/artifacts/events') {
        send(
          response,
          200,
          method === 'OPTIONS'
            ? {'access-control-allow-headers': 'authorization, content-type'}
            : {'content-type': 'application/json'},
          method === 'OPTIONS' ? '' : '{}'
        );
        return;
      }

      if (method === 'OPTIONS' && url.pathname.startsWith('/v8/artifacts/')) {
        const hash = decodeURIComponent(url.pathname.slice('/v8/artifacts/'.length));
        const requestedMethod = String(
          request.headers['access-control-request-method'] ?? 'UNKNOWN'
        ).toUpperCase();
        const signedMethod = requestedMethod.toLowerCase();
        const location = new URL(`/signed/${signedMethod}/${encodeURIComponent(hash)}`, origin);
        location.searchParams.set('X-Amz-Algorithm', 'AWS4-HMAC-SHA256');
        location.searchParams.set('X-Amz-Signature', `${signedMethod}-${hash}`);

        issuedLocations.push({
          consumed: false,
          expectedLocation: `${location.pathname}${location.search}`,
          hash,
          preflightUrl: requestTarget,
          requestedMethod,
          signedMethod,
        });
        send(response, 200, {
          'access-control-allow-headers': 'content-type',
          location: location.href,
        });
        return;
      }

      if (url.pathname.startsWith('/signed/')) {
        const [, , signedMethod, encodedHash] = url.pathname.split('/');
        const hash = decodeURIComponent(encodedHash ?? '');
        const issuance = issuedLocations
          .toReversed()
          .find(
            (candidate) =>
              !candidate.consumed &&
              candidate.hash === hash &&
              candidate.signedMethod === signedMethod
          );

        if (issuance) {
          issuance.consumed = true;
        }

        operations.push({
          actualLocation: requestTarget,
          expectedLocation: issuance?.expectedLocation ?? null,
          method,
          preflightUrl: issuance?.preflightUrl ?? null,
          requestedMethod: issuance?.requestedMethod ?? null,
        });

        if (method === 'PUT') {
          artifacts.set(hash, body);
          send(response, 200);
          return;
        }

        const artifact = artifacts.get(hash);
        if (!artifact) {
          send(response, 404);
          return;
        }

        if (method === 'HEAD') {
          send(response, 200, {'content-length': String(artifact.length)});
          return;
        }

        if (method === 'GET') {
          send(
            response,
            200,
            {
              'content-length': String(artifact.length),
              'content-type': 'application/octet-stream',
              'x-artifact-duration': '1',
            },
            artifact
          );
          return;
        }
      }

      send(response, 404, {'content-type': 'text/plain'}, 'unexpected endpoint');
    } catch (error) {
      send(response, 500, {'content-type': 'text/plain'}, String(error));
    }
  });

  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, host, resolve);
  });

  return {
    close: () => new Promise((resolve) => server.close(resolve)),
    getOperations: () => operations.map((operation) => ({...operation})),
    origin,
  };
};
