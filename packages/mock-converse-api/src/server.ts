import http from 'node:http';
import {handleRequest} from './router.js';

export interface ServerOptions {
  port?: number;
}

export function createMockConverseServer(
  _options?: ServerOptions
): http.Server {
  return http.createServer(handleRequest);
}

if (process.env.NODE_ENV !== 'test') {
  const port = Number(process.env.PORT) || 3456;
  const server = createMockConverseServer({port});
  server.listen(port, () => {
    console.log(`Mock Converse API listening on port ${port}`);
  });
}
