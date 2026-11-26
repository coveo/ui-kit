import {cleanup, fireEvent, render, screen, waitFor, within} from '@testing-library/react';
import {afterEach, describe, expect, it, vi} from 'vitest';
import {AppShell} from './AppShell.js';
import {SessionProvider, type DemoSession} from '../context/session.js';
import {createConversationStorage} from '../conversations/conversation-storage.js';
import {memoryStorage} from '../test/memory-storage.js';
import {
  answerShell,
  createTestSession,
  createTestSessionFactory,
  findSearchBox,
  shellRun,
  sseResponse,
  SHELL_SURFACE_ID,
  type ConverseHandler,
} from '../test/session.js';

vi.mock('./TopBar/TopBar.js', () => ({TopBar: () => null}));

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
            version: '1.0',
            createSurface: {
              surfaceId,
              catalogId: 'https://schema.thermidor.coveo.com/a2-ui/catalog.json',
              components: [
                {
                  id: 'root',
                  component: 'NextActionsBar',
                  suggestedActions: {'@path': '/state/root/suggestedActions'},
                },
              ],
            },
          },
          {
            version: '1.0',
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

  it('keeps an expired conversation readable, its turns mounted, and sends it nothing', async () => {
    const local = memoryStorage();
    const tab = memoryStorage();
    const storage = createConversationStorage({local: () => local, session: () => tab});
    const searchRun = [
      {type: 'RUN_STARTED', threadId: 'session-1', runId: 'search', ...SESSION_KEYS},
      {type: 'TOOL_CALL_START', toolCallId: 'call-1', toolCallName: 'search_products'},
      {type: 'TOOL_CALL_ARGS', toolCallId: 'call-1', delta: '{"query":"kayaks"}'},
      {type: 'TOOL_CALL_END', toolCallId: 'call-1'},
      {
        type: 'ACTIVITY_SNAPSHOT',
        messageId: 'activity-search-1',
        activityType: 'a2ui-surface',
        content: {
          messages: [
            {
              version: '1.0',
              createSurface: {
                surfaceId: 'search-1',
                catalogId: 'https://schema.thermidor.coveo.com/a2-ui/catalog.json',
                components: [
                  {id: 'root', component: 'CommerceSearch', mainChild: 'pagination'},
                  {
                    id: 'pagination',
                    component: 'Pagination',
                    page: {'@path': '/state/pagination/page'},
                    pageSize: {'@path': '/state/pagination/pageSize'},
                    totalEntries: {'@path': '/state/pagination/totalEntries'},
                    totalPages: {'@path': '/state/pagination/totalPages'},
                  },
                ],
              },
            },
            {
              version: '1.0',
              updateDataModel: {
                surfaceId: 'search-1',
                path: '/state/pagination',
                value: {page: 0, pageSize: 12, totalEntries: 43, totalPages: 4},
              },
            },
          ],
        },
      },
      {type: 'RUN_FINISHED', threadId: 'session-1', runId: 'search', ...SESSION_KEYS},
    ];
    const answerSearch: ConverseHandler = (request, signal) =>
      typeof request.message === 'string' ? sseResponse(searchRun) : answerShell(request, signal);
    const renderTab = (handler: ConverseHandler) => {
      const test = createTestSessionFactory(handler);
      render(
        <SessionProvider createSession={test.create} storage={storage}>
          <AppShell />
        </SessionProvider>
      );
      return test;
    };
    renderTab(answerSearch);
    const textarea = await findSearchBox();
    fireEvent.change(textarea, {target: {value: 'kayaks'}});
    fireEvent.keyDown(textarea, {key: 'Enter', code: 'Enter'});
    await screen.findByLabelText('A2-UI surface search-1');
    await waitFor(() => expect(storage.list()[0]).toBeDefined());
    await waitFor(() => expect(storage.load(storage.list()[0].id)?.turns).toHaveLength(1));
    cleanup();

    const replacedKeys = {conversationSessionId: 'session-2', conversationToken: 'token-2'};
    let expire = () => {};
    const {requests} = renderTab((request, signal) =>
      request.action?.name === 'initialize'
        ? new Promise((resolve) => {
            expire = () =>
              resolve(
                sseResponse(
                  shellRun().map((event) =>
                    'threadId' in event ? {...event, ...replacedKeys} : event
                  )
                )
              );
          })
        : answerSearch(request, signal)
    );
    const surface = await screen.findByLabelText('A2-UI surface search-1');
    expire();
    await screen.findByText(/This conversation expired/);
    const sent = requests.length;

    expect(surface.isConnected).toBe(true);
    const progress = screen.getByRole('group', {name: 'Agent progress'}) as HTMLDetailsElement;
    fireEvent.click(within(progress).getByText('1 tool call'));
    expect(progress.open).toBe(true);
    const state = {
      thermidorSearch: {surfaceId: 'search-1', snapshot: {query: '', page: 2, pageSize: 12}},
    };
    window.history.replaceState(state, '');
    window.dispatchEvent(new PopStateEvent('popstate', {state}));
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(requests.slice(sent).map(({action}) => action?.name)).toEqual([]);
  });

  it("keeps a restored conversation's earlier blocks read-only, its last one and its search box live", async () => {
    const local = memoryStorage();
    const tab = memoryStorage();
    const storage = createConversationStorage({local: () => local, session: () => tab});
    let answers = 0;
    const answerEachPrompt: ConverseHandler = (request, signal) =>
      typeof request.message === 'string'
        ? sseResponse(answerRun(`answer-${++answers}`))
        : answerShell(request, signal);
    const renderTab = (handler: ConverseHandler) => {
      const test = createTestSessionFactory(handler);
      let session: DemoSession | undefined;
      render(
        <SessionProvider
          createSession={(saved) => (session = test.create(saved))}
          storage={storage}
        >
          <AppShell />
        </SessionProvider>
      );
      return {actions: test.actions, session: () => session!};
    };
    const chipOf = (surfaceId: string) =>
      within(screen.getByLabelText(`A2-UI surface ${surfaceId}`)).getByRole('button', {
        name: 'Show me kayaks',
      });
    renderTab(answerEachPrompt);
    for (const [prompt, surfaceId] of [
      ['kayaks', 'answer-1'],
      ['canoes', 'answer-2'],
    ]) {
      const textarea = await findSearchBox();
      fireEvent.change(textarea, {target: {value: prompt}});
      fireEvent.keyDown(textarea, {key: 'Enter', code: 'Enter'});
      await screen.findByLabelText(`A2-UI surface ${surfaceId}`);
    }
    await waitFor(() => expect(storage.load(storage.list()[0].id)?.turns).toHaveLength(2));
    cleanup();

    let resume = () => {};
    const {actions, session} = renderTab((request, signal) =>
      request.action?.name === 'initialize'
        ? new Promise((resolve) => (resume = () => resolve(sseResponse(shellRun('shell-2')))))
        : answerEachPrompt(request, signal)
    );

    const notes = await screen.findAllByText('Restored results. Search again to refine.');
    expect(notes).toHaveLength(1);
    expect(notes[0].closest('fieldset')?.contains(chipOf('answer-1'))).toBe(true);
    // The restored shell stays usable while the session resumes, then the resumed one replaces it.
    expect((await findSearchBox()).disabled).toBe(false);
    resume();
    await waitFor(() => expect(session().getSnapshot().request).toBeUndefined());
    expect(chipOf('answer-1').matches(':disabled')).toBe(true);
    expect(chipOf('answer-2').matches(':disabled')).toBe(false);
    fireEvent.change(await findSearchBox(), {target: {value: 'paddles'}});
    await waitFor(() =>
      expect(actions('fetchSuggestions').at(-1)).toMatchObject({
        surfaceId: 'shell-2',
        context: {query: 'paddles'},
      })
    );
  });
});
