import type {IncomingMessage, ServerResponse} from 'node:http';
import {classifyQueryLocally} from '../../core/src/lib/classifyHeuristics.js';

interface ClassifyRequestBody {
  query?: string;
}

export function classifyQueryMiddleware(
  req: IncomingMessage,
  res: ServerResponse
): void {
  if (req.method !== 'POST') {
    res.writeHead(405, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({error: 'Method not allowed'}));
    return;
  }

  const chunks: Buffer[] = [];
  req.on('data', (chunk: Buffer) => chunks.push(chunk));
  req.on('end', () => {
    let body: ClassifyRequestBody;
    try {
      body = JSON.parse(
        Buffer.concat(chunks).toString()
      ) as ClassifyRequestBody;
    } catch {
      res.writeHead(400, {'Content-Type': 'application/json'});
      res.end(JSON.stringify({error: 'Invalid JSON'}));
      return;
    }

    if (typeof body.query !== 'string') {
      res.writeHead(400, {'Content-Type': 'application/json'});
      res.end(JSON.stringify({error: 'Missing "query" string field'}));
      return;
    }

    const decision = classifyQueryLocally(body.query);

    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({decision}));
  });
}
