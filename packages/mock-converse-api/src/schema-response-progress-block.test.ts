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
    surfaceId: string;
    components: Array<Record<string, unknown>>;
    dataModel?: {state?: Record<string, unknown>};
  };
  updateDataModel?: {surfaceId: string; path: string; value: unknown};
}

interface Activity {
  type: string;
  messageId: string;
  content: {messages: SurfaceMessage[]};
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

function streamData(body: string): Array<Record<string, unknown>> {
  return [...body.matchAll(/^data:(.+)$/gm)].map((match) => JSON.parse(match[1]));
}

// The block is the surface whose root is a ProgressBlock; its updates are those on its surface id.
function progressBlock(body: string) {
  const activities = streamData(body).filter(
    (data): data is Activity & Record<string, unknown> => data.type === 'ACTIVITY_SNAPSHOT'
  );
  const creates = activities.filter(({content}) =>
    content.messages.some(({createSurface}) =>
      createSurface?.components.some(({component}) => component === 'ProgressBlock')
    )
  );
  const [create] = creates;
  const createSurface = create?.content.messages[0].createSurface;
  const updates = activities.filter(({content}) =>
    content.messages.some(
      ({updateDataModel}) => updateDataModel?.surfaceId === createSurface?.surfaceId
    )
  );
  return {creates, createSurface, updates};
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
      const {creates, createSurface, updates} = progressBlock(bodies.get(prompt)!);

      expect(creates).toHaveLength(1);
      const [component] = createSurface!.components;
      expect(() => ProgressBlockSchema.parse(component)).not.toThrow();
      const states = [
        createSurface!.dataModel!.state!.root,
        ...updates.map(({messageId, content: {messages}}) => {
          expect(messageId).not.toBe(creates[0].messageId);
          const [{updateDataModel}] = messages;
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

  it('gets its own surface id and activity ids on each agent turn of a session', async () => {
    const opened = streamData(
      await post({message: null, action: {name: 'initialize', context: {}}})
    ).find((data) => 'conversationSessionId' in data);
    const {conversationSessionId, conversationToken} = opened as Record<string, string>;
    expect(conversationSessionId).toEqual(expect.any(String));
    const ids = [];
    for (const prompt of ['something the catalog has nothing for', 'boating safety']) {
      const {creates, createSurface, updates} = progressBlock(
        await post({message: prompt, conversationSessionId, conversationToken})
      );
      ids.push(
        createSurface!.surfaceId,
        creates[0].messageId,
        ...new Set(updates.map(({messageId}) => messageId))
      );
    }

    expect(ids).toHaveLength(6);
    expect(new Set(ids).size).toBe(6);
  }, 30_000);
});
