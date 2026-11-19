import http from 'node:http';
import {afterAll, beforeAll, describe, expect, it} from 'vitest';
import {
  ProgressBlockSchema,
  ProgressBlockStateSchema,
  type ProgressBlockState,
} from '@coveo/thermidor-schema';
import {createMockConverseServer} from './server.js';

const PREVIEW_ROUTE =
  '/schema/api/preview/organizations/searchuisamples/agents/commerce/agui/converse';
const SCHEMA_ROUTES = [
  '/converse-schema',
  '/schema/rest/organizations/searchuisamples/commerce/unstable/agentic/converse',
  PREVIEW_ROUTE,
];

const PROGRESS_ACTIVITY_ID = 'activity-progress-block';
const PROGRESS_STATE_ACTIVITY_ID = 'activity-progress-block-state';

const AGENT_ERROR_PROMPT = 'simulate an agent error';
const TIMEOUT_PROMPT = 'simulate a timeout';
const COMPARISON_PROMPT = 'i like cold-water surfing. compare wetsuits for it';

// Turns the agent runs and finishes.
const COMPLETE_PROMPTS = [
  'build a beginner surfing kit with budget, mid-range, and premium options',
  COMPARISON_PROMPT,
  'boating safety',
  'tell me more about the thermoflex winter wetsuit',
  'something the catalog has nothing for',
];

const AGENT_PROMPTS = [...COMPLETE_PROMPTS, AGENT_ERROR_PROMPT, TIMEOUT_PROMPT];

// Searches, answered by the gateway without the agent: "kayak" is any other query that finds
// products.
const SEARCH_PROMPTS = ['water sports', 'water sprots', 'swim gear', 'kayak'];

const ALL_PROMPTS = [...AGENT_PROMPTS, ...SEARCH_PROMPTS];

interface SseEvent {
  event: string;
  data: Record<string, unknown>;
}

interface SurfaceMessage {
  createSurface?: {
    surfaceId: string;
    components: Array<Record<string, unknown>>;
    dataModel?: {state?: Record<string, unknown>};
  };
  updateDataModel?: {surfaceId: string; path: string; value: unknown};
  deleteSurface?: {surfaceId: string};
}

let server: http.Server;

function post(path: string, body: Record<string, unknown>): Promise<string> {
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
        path,
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

function parseEvents(body: string): SseEvent[] {
  return body
    .split('\n\n')
    .filter((chunk) => chunk.trim().length > 0)
    .map((chunk) => {
      const [eventLine, dataLine] = chunk.split('\n');
      return {
        event: eventLine.slice('event:'.length),
        data: JSON.parse(dataLine.slice('data:'.length)),
      };
    });
}

const typeOf = ({event, data}: SseEvent) => (data.type as string | undefined) ?? event;

const messagesOf = ({data}: SseEvent) =>
  ((data.content as {messages?: SurfaceMessage[]} | undefined)?.messages ?? []) as SurfaceMessage[];

const isProgressEvent = (event: SseEvent) =>
  event.data.messageId === PROGRESS_ACTIVITY_ID ||
  event.data.messageId === PROGRESS_STATE_ACTIVITY_ID;

const isToolCall = (event: SseEvent) => typeOf(event).startsWith('TOOL_CALL_');

function progressCreates(events: SseEvent[]) {
  return events
    .flatMap(messagesOf)
    .filter((message) =>
      message.createSurface?.components.some((node) => node.component === 'ProgressBlock')
    );
}

function progressStates(events: SseEvent[]): ProgressBlockState[] {
  return events
    .filter((event) => event.data.messageId === PROGRESS_STATE_ACTIVITY_ID)
    .flatMap(messagesOf)
    .map((message) => message.updateDataModel!.value as ProgressBlockState);
}

const turns = new Map<string, SseEvent[]>();

beforeAll(async () => {
  server = createMockConverseServer().listen(0);
  await new Promise<void>((resolve) => server.once('listening', () => resolve()));
  await Promise.all(
    ALL_PROMPTS.map(async (prompt) => {
      turns.set(prompt, parseEvents(await post(PREVIEW_ROUTE, {message: prompt})));
    })
  );
}, 30_000);

afterAll(async () => {
  await new Promise<void>((resolve) => server.close(() => resolve()));
});

describe('the progress block of an agent turn (ADR-028)', () => {
  it.each(AGENT_PROMPTS)(
    'creates one ProgressBlock right after RUN_STARTED, valid against the schema, for "%s"',
    (prompt) => {
      const events = turns.get(prompt)!;
      const runStarted = events.findIndex((event) => typeOf(event) === 'RUN_STARTED');
      const create = events[runStarted + 1];

      expect(create.data).toMatchObject({
        type: 'ACTIVITY_SNAPSHOT',
        activityType: 'a2ui-surface',
        messageId: PROGRESS_ACTIVITY_ID,
        replace: true,
      });
      expect(progressCreates(events)).toHaveLength(1);
      const [{createSurface}] = messagesOf(create);
      expect(createSurface!.components).toEqual([
        {
          id: 'root',
          component: 'ProgressBlock',
          steps: {path: '/state/root/steps'},
          status: {path: '/state/root/status'},
        },
      ]);
      expect(() => ProgressBlockSchema.parse(createSurface!.components[0])).not.toThrow();
      const initialState = ProgressBlockStateSchema.parse(createSurface!.dataModel!.state!.root);
      expect(initialState.status).toBe('running');
    }
  );

  it.each(AGENT_PROMPTS)(
    'updates the block with whole states on /state/root of the same surface for "%s"',
    (prompt) => {
      const events = turns.get(prompt)!;
      const [{createSurface}] = progressCreates(events);
      const updates = events
        .filter((event) => event.data.messageId === PROGRESS_STATE_ACTIVITY_ID)
        .map((event) => {
          expect(event.data).toMatchObject({activityType: 'a2ui-surface', replace: true});
          return messagesOf(event);
        });

      expect(updates.length).toBeGreaterThan(0);
      for (const messages of updates) {
        expect(messages).toHaveLength(1);
        const [{updateDataModel}] = messages;
        expect(updateDataModel!.surfaceId).toBe(createSurface!.surfaceId);
        expect(updateDataModel!.path).toBe('/state/root');
        expect(() => ProgressBlockStateSchema.parse(updateDataModel!.value)).not.toThrow();
      }
    }
  );

  it.each(AGENT_PROMPTS)('lists the steps in the order they started for "%s"', (prompt) => {
    const events = turns.get(prompt)!;
    const [{createSurface}] = progressCreates(events);
    const states = [
      createSurface!.dataModel!.state!.root as ProgressBlockState,
      ...progressStates(events),
    ];
    let previousIds: string[] = [];
    for (const {steps} of states) {
      const ids = steps.map(({id}) => id);
      expect(new Set(ids).size).toBe(ids.length);
      expect(ids.slice(0, previousIds.length)).toEqual(previousIds);
      previousIds = ids;
    }
  });

  it.each(COMPLETE_PROMPTS)(
    'ends the block complete, every step done, right before RUN_FINISHED for "%s"',
    (prompt) => {
      const events = turns.get(prompt)!;
      const runFinished = events.findIndex((event) => typeOf(event) === 'RUN_FINISHED');
      const lastProgress = events.findLastIndex(isProgressEvent);
      const last = progressStates(events).at(-1)!;

      expect(lastProgress).toBe(runFinished - 1);
      expect(last.status).toBe('complete');
      expect(last.steps.every(({status}) => status === 'done')).toBe(true);
      expect(
        progressStates(events)
          .slice(0, -1)
          .map(({status}) => status)
      ).not.toContain('complete');
    }
  );

  it.each(SEARCH_PROMPTS)('sends no ProgressBlock for the search "%s"', (prompt) => {
    const events = turns.get(prompt)!;

    expect(events.filter(isProgressEvent)).toEqual([]);
    expect(progressCreates(events)).toEqual([]);
    expect(events.map(typeOf)).toContain('RUN_FINISHED');
  });

  it('runs two steps at once in the comparison turn', () => {
    const states = progressStates(turns.get(COMPARISON_PROMPT)!);
    const activeCounts = states.map(
      ({steps}) => steps.filter(({status}) => status === 'active').length
    );

    expect(Math.max(...activeCounts)).toBe(2);
  });

  it('ends the block in error right before the RUN_ERROR of a failing agent', () => {
    const events = turns.get(AGENT_ERROR_PROMPT)!;
    const runError = events.findIndex((event) => typeOf(event) === 'RUN_ERROR');
    const last = progressStates(events).at(-1)!;

    expect(runError).toBe(events.length - 1);
    expect(events.findLastIndex(isProgressEvent)).toBe(runError - 1);
    expect(last.status).toBe('error');
    expect(last.steps.some(({status}) => status === 'active')).toBe(true);
    expect(events.map(typeOf)).not.toContain('RUN_FINISHED');
    expect(events.map(typeOf)).not.toContain('turn_complete');
  });

  it('leaves the block running when the gateway ends the turn with RUN_ERROR', () => {
    const events = turns.get(TIMEOUT_PROMPT)!;
    const runError = events.at(-1)!;

    expect(typeOf(runError)).toBe('RUN_ERROR');
    expect(runError.data.code).toBe('AGENT:UPSTREAM_TIMEOUT');
    expect(progressStates(events).at(-1)!.status).toBe('running');
  });
});

describe('the schema routes', () => {
  it.each(SCHEMA_ROUTES)('send the progress block of an agent turn on %s', async (route) => {
    const events = parseEvents(await post(route, {message: AGENT_ERROR_PROMPT}));

    expect(progressCreates(events)).toHaveLength(1);
  });

  it('keep the tool calls a template sends', () => {
    expect(turns.get(COMPARISON_PROMPT)!.filter(isToolCall).length).toBeGreaterThan(0);
  });
});
