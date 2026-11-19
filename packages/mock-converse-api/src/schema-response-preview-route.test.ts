import http from 'node:http';
import {afterAll, beforeAll, describe, expect, it} from 'vitest';
import {createMockConverseServer} from './server.js';

// The snapshot was recorded before the public route existed (KIT-6643), so it proves the preview
// route still sends exactly what it sent then.
const PREVIEW_ROUTE =
  '/schema/api/preview/organizations/searchuisamples/agents/commerce/agui/converse';

const PROMPTS = [
  'build a beginner surfing kit with budget, mid-range, and premium options',
  'water sports',
  'water sprots',
  'swim gear',
  'i like cold-water surfing. compare wetsuits for it',
  'boating safety',
  'tell me more about the thermoflex winter wetsuit',
  'kayak',
  'something the catalog has nothing for',
];

let server: http.Server;

function post(body: Record<string, unknown>): Promise<string> {
  return new Promise((resolve, reject) => {
    const address = server.address();
    if (!address || typeof address === 'string') {
      reject(new Error('Server not listening'));
      return;
    }
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: address.port,
        method: 'POST',
        path: PREVIEW_ROUTE,
        headers: {'Content-Type': 'application/json'},
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => resolve(data));
      }
    );
    req.on('error', reject);
    req.write(JSON.stringify(body));
    req.end();
  });
}

// Leaves out what changes from one request to the next: timestamps, session keys, generated run
// ids and the sequence number suffixed to surface ids.
function normalize(body: string): unknown[] {
  return body
    .split('\n\n')
    .filter((chunk) => chunk.trim().length > 0)
    .map((chunk) => {
      const [eventLine, dataLine] = chunk.split('\n');
      const {
        timestamp: _timestamp,
        conversationSessionId: _sessionId,
        conversationToken: _token,
        ...data
      } = JSON.parse(dataLine.slice('data:'.length));
      const stable = JSON.stringify(data)
        .replace(/run-\d+-[a-z0-9]+/g, 'run-N')
        .replace(/-\d+(?=["/])/g, '-N');
      return {event: eventLine.slice('event:'.length), data: JSON.parse(stable)};
    });
}

const streams = new Map<string, unknown[]>();

beforeAll(async () => {
  server = createMockConverseServer().listen(0);
  await new Promise<void>((resolve) => server.once('listening', () => resolve()));
  for (const prompt of PROMPTS) {
    streams.set(prompt, normalize(await post({message: prompt})));
  }
}, 60_000);

afterAll(async () => {
  await new Promise<void>((resolve) => server.close(() => resolve()));
});

describe('the preview schema route', () => {
  it.each(PROMPTS)('sends what it sent before the public route for "%s"', (prompt) => {
    expect(streams.get(prompt)).toMatchSnapshot();
  });
});
