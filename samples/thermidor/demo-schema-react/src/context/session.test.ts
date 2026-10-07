import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {createSession} from '@coveo/thermidor';
import {demoContracts} from './session.js';

/**
 * The session withholds an action whose component has no contract. `SearchOptions` is not
 * published by `@coveo/thermidor-schema` yet, so the sample injects its own contract: a tapped
 * search option must reach the gateway as `selectSearchOption {optionId}`.
 */

const SURFACE_ID = 'agent-1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed';
const OPTION_ID = 'opt-7f3e1c2a-4b5d-4e6f-8a9b-0c1d2e3f4a5b';

const fetchMock = vi.fn<typeof fetch>();
const encoder = new TextEncoder();

function sseResponse(events: Array<Record<string, unknown>>): Response {
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      for (const event of events) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
      }
      controller.close();
    },
  });
  return new Response(body, {status: 200, headers: {'Content-Type': 'text/event-stream'}});
}

const agentAnswerWithSearchOptions = [
  {type: 'RUN_STARTED'},
  {
    type: 'ACTIVITY_SNAPSHOT',
    activityType: 'a2ui-surface',
    messageId: 'agent-message-1',
    content: {
      messages: [
        {
          version: 'v1.0',
          createSurface: {
            surfaceId: SURFACE_ID,
            catalogId: 'https://schema.thermidor.coveo.com/a2-ui/catalog.json',
            components: [
              {id: 'root', component: 'SearchOptions', items: {path: '/state/root/items'}},
            ],
            dataModel: {
              state: {root: {items: [{optionId: OPTION_ID, label: 'Salomon trail shoes'}]}},
            },
          },
        },
      ],
    },
  },
  {type: 'RUN_FINISHED'},
];

function requestBody(callIndex: number): Record<string, unknown> {
  const init = fetchMock.mock.calls[callIndex][1];
  return JSON.parse(String(init?.body));
}

async function sessionWithAgentAnswer() {
  fetchMock.mockResolvedValueOnce(sseResponse(agentAnswerWithSearchOptions));
  const session = createSession({
    contracts: demoContracts,
    organizationId: 'myorg',
    accessToken: 'test-token',
    endpoint: 'http://localhost:8990',
  });
  await session.dispatchAction({name: 'submitPrompt', payload: {prompt: 'trail shoes'}});
  return session;
}

function userAction(name: string, context: Record<string, unknown>) {
  return {
    version: 'v0.9',
    userAction: {
      name,
      surfaceId: SURFACE_ID,
      sourceComponentId: 'root',
      timestamp: new Date().toISOString(),
      context,
    },
  } as unknown as Parameters<
    Awaited<ReturnType<typeof sessionWithAgentAnswer>>['dispatchAction']
  >[0];
}

describe('demo session contracts', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    fetchMock.mockReset();
  });

  it('sends selectSearchOption from an agent SearchOptions component', async () => {
    const session = await sessionWithAgentAnswer();
    fetchMock.mockResolvedValueOnce(sseResponse([{type: 'RUN_FINISHED'}]));

    await session.dispatchAction(userAction('selectSearchOption', {optionId: OPTION_ID}));

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(requestBody(1)).toMatchObject({
      action: {
        surfaceId: SURFACE_ID,
        name: 'selectSearchOption',
        sourceComponentId: 'root',
        context: {optionId: OPTION_ID},
      },
    });
  });

  it('withholds a selectSearchOption without an option id', async () => {
    const session = await sessionWithAgentAnswer();
    vi.spyOn(console, 'warn').mockImplementation(() => {});

    await session.dispatchAction(userAction('selectSearchOption', {}));

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
