import {createServer} from 'node:http';
import {classifyQueryLocally} from './classify.js';

const PORT = parseInt(process.env.PORT ?? '3100', 10);

const server = createServer((req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.url === '/api/heuristics/classify' && req.method === 'POST') {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => {
      let body: {query?: string};
      try {
        body = JSON.parse(Buffer.concat(chunks).toString()) as {
          query?: string;
        };
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
    return;
  }

  // Health check
  if (req.url === '/health' && req.method === 'GET') {
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify({status: 'ok'}));
    return;
  }

  res.writeHead(404, {'Content-Type': 'application/json'});
  res.end(JSON.stringify({error: 'Not found'}));
});

server.listen(PORT, () => {
  console.log(`Classify service running on http://localhost:${PORT}`);
  console.log(`  POST /api/heuristics/classify`);
  console.log(`  GET  /health`);
});
