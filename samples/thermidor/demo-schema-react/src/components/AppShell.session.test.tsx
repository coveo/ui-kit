import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import {afterEach, describe, expect, it, vi} from 'vitest';
import {AppShell} from './AppShell.js';
import {SessionProvider} from '../context/session.js';
import {
  answerShell,
  createTestSession,
  findSearchBox,
  sseResponse,
  SHELL_SURFACE_ID,
  type ConverseHandler,
} from '../test/session.js';

afterEach(() => {
  vi.unstubAllGlobals();
});

const SESSION_KEYS = {conversationSessionId: 'session-1', conversationToken: 'token-1'};

function answerRun(surfaceId: string): object[] {
  return [
    {type: 'RUN_STARTED', threadId: 'session-1', runId: 'answer', ...SESSION_KEYS},
    {
      type: 'ACTIVITY_SNAPSHOT',
      messageId: `activity-${surfaceId}`,
      activityType: 'a2ui-surface',
      content: {
        messages: [
          {
            version: 'v1.0',
            createSurface: {
              surfaceId,
              catalogId: 'https://schema.thermidor.coveo.com/a2-ui/catalog.json',
              components: [
                {
                  id: 'root',
                  component: 'NextActionsBar',
                  suggestedActions: {path: '/state/root/suggestedActions'},
                },
              ],
            },
          },
          {
            version: 'v1.0',
            updateDataModel: {
              surfaceId,
              path: '/state/root',
              value: {suggestedActions: [{text: 'Show me kayaks', type: 'followup'}]},
            },
          },
        ],
      },
    },
    {type: 'RUN_FINISHED', threadId: 'session-1', runId: 'answer', ...SESSION_KEYS},
  ];
}

const answerPrompts: ConverseHandler = (request, signal) =>
  typeof request.message === 'string'
    ? sseResponse(answerRun('answer-1'))
    : answerShell(request, signal);

function renderApp(handler: ConverseHandler = answerPrompts) {
  const test = createTestSession(handler);
  render(
    <SessionProvider session={test.session}>
      <AppShell />
    </SessionProvider>
  );
  return test;
}

describe('AppShell with the session shell', () => {
  it("draws the shell's search box once, never among the turn's surfaces", async () => {
    renderApp();

    const textarea = await findSearchBox();
    fireEvent.change(textarea, {target: {value: 'kayaks'}});
    fireEvent.keyDown(textarea, {key: 'Enter', code: 'Enter'});

    await screen.findByLabelText('A2-UI surface answer-1');
    expect(screen.getByRole('button', {name: 'Show me kayaks'})).toBeDefined();
    expect(screen.queryByLabelText(`A2-UI surface ${SHELL_SURFACE_ID}`)).toBeNull();
    expect(screen.getAllByLabelText('Prompt')).toHaveLength(1);
    expect((await findSearchBox()).disabled).toBe(false);
  });

  it('cancels a suggestion in flight to send the submitted prompt', async () => {
    const {requests} = renderApp((request, signal) => {
      if (request.action?.name === 'fetchSuggestions') {
        return new Promise<Response>((_resolve, reject) =>
          signal?.addEventListener('abort', () =>
            reject(new DOMException('The request was aborted.', 'AbortError'))
          )
        );
      }
      return answerPrompts(request, signal);
    });

    const textarea = await findSearchBox();
    fireEvent.change(textarea, {target: {value: 'kayaks'}});
    await waitFor(() =>
      expect(requests.map(({action}) => action?.name)).toContain('fetchSuggestions')
    );
    fireEvent.keyDown(textarea, {key: 'Enter', code: 'Enter'});

    await waitFor(() => expect(requests.at(-1)?.message).toBe('kayaks'));
    await screen.findByLabelText('A2-UI surface answer-1');
  });
});
