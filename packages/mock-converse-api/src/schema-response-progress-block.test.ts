import http from 'node:http';
import {afterAll, beforeAll, describe, expect, it} from 'vitest';
import {ProgressBlockSchema, ProgressBlockStateSchema} from '@coveo/thermidor-schema';
import {createMockConverseServer} from './server.js';

const PREVIEW_ROUTE =
  '/schema/api/preview/organizations/searchuisamples/agents/commerce/agui/converse';

const AGENT_PROMPTS = [
  'build a beginner surfing kit with budget, mid-range, and premium options',
  'i like cold-water surfing. compare wetsuits for it',
  'boating safety',
  'tell me more about the thermoflex winter wetsuit',
  'something the catalog has nothing for',
];

// Searches are answered by the gateway, without the agent: "kayak" is any other query that finds
// products.
const SEARCH_PROMPTS = ['water sports', 'water sprots', 'swim gear', 'kayak'];

interface SurfaceMessage {
  createSurface?: {
    components: Array<Record<string, unknown>>;
    dataModel?: {state?: Record<string, unknown>};
  };
  updateDataModel?: {path: string; value: unknown};
}

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

function progressMessages(body: string, messageId: string): SurfaceMessage[] {
  return [...body.matchAll(/^data:(.+)$/gm)]
    .map((match) => JSON.parse(match[1]))
    .filter((data) => data.messageId === messageId)
    .flatMap((data) => data.content.messages);
}

const bodies = new Map<string, string>();

beforeAll(async () => {
  server = createMockConverseServer().listen(0);
  await new Promise<void>((resolve) => server.once('listening', () => resolve()));
  await Promise.all(
    [...AGENT_PROMPTS, ...SEARCH_PROMPTS].map(async (prompt) => {
      bodies.set(prompt, await post({message: prompt}));
    })
  );
}, 30_000);

afterAll(async () => {
  await new Promise<void>((resolve) => server.close(() => resolve()));
});

describe('the progress block (ADR-028)', () => {
  it.each(AGENT_PROMPTS)(
    'is sent, valid against the schema, and ends complete for "%s"',
    (prompt) => {
      const body = bodies.get(prompt)!;
      const [create, ...otherCreates] = progressMessages(body, 'activity-progress-block');
      const updates = progressMessages(body, 'activity-progress-block-state');

      expect(otherCreates).toEqual([]);
      const [component] = create.createSurface!.components;
      expect(() => ProgressBlockSchema.parse(component)).not.toThrow();
      const states = [
        create.createSurface!.dataModel!.state!.root,
        ...updates.map(({updateDataModel}) => {
          expect(updateDataModel!.path).toBe('/state/root');
          return updateDataModel!.value;
        }),
      ].map((state) => ProgressBlockStateSchema.parse(state));
      const last = states.at(-1)!;
      expect(last.status).toBe('complete');
      expect(last.steps.every(({status}) => status === 'done')).toBe(true);
    }
  );

  it.each(SEARCH_PROMPTS)('is not sent for the search "%s"', (prompt) => {
    expect(bodies.get(prompt)).not.toContain('"component":"ProgressBlock"');
  });
});
