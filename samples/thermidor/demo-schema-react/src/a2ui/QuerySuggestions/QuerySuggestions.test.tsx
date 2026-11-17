import {act, fireEvent, screen, waitFor} from '@testing-library/react';
import {afterEach, describe, expect, it, vi} from 'vitest';
import {SessionSearchBox} from '../../components/SessionSearchBox/SessionSearchBox.js';
import {
  answerShell,
  createTestSession,
  findSearchBox,
  renderWithSession,
  run,
  sseResponse,
  suggestionsRun,
  SHELL_SURFACE_ID,
  type ConverseHandler,
} from '../../test/session.js';
import {submitQuery} from '../session-request.js';
import {SUGGESTIONS_DEBOUNCE_MS} from './QuerySuggestions.js';

afterEach(() => {
  vi.unstubAllGlobals();
});

const pause = () =>
  act(() => new Promise((resolve) => setTimeout(resolve, SUGGESTIONS_DEBOUNCE_MS + 50)));

async function renderSearchBox(
  handler: ConverseHandler = answerShell,
  {focus = true, clearOnSubmit = false} = {}
) {
  const onSubmit = vi.fn();
  const test = createTestSession(handler);
  renderWithSession(
    <SessionSearchBox onSubmit={onSubmit} busy={false} clearOnSubmit={clearOnSubmit} />,
    test.session
  );
  const textarea = await findSearchBox();
  if (focus) {
    act(() => textarea.focus());
  }
  const type = (value: string) => fireEvent.change(textarea, {target: {value}});
  const queriesSent = () =>
    test.actions('fetchSuggestions').map(({context}) => context['query'] as string);
  return {...test, onSubmit, textarea, type, queriesSent};
}

const options = () =>
  screen
    .queryAllByRole('option')
    .filter(({id}) => id.startsWith('suggestion-item-'))
    .map((option) => option.textContent);

describe('QuerySuggestions', () => {
  it("sends the query once typing pauses, from the shell's QuerySuggestions node", async () => {
    const {type, actions} = await renderSearchBox();

    type('s');
    type('su');
    type('surf');
    await pause();

    expect(actions('fetchSuggestions')).toEqual([
      expect.objectContaining({context: {query: ''}}),
      expect.objectContaining({
        name: 'fetchSuggestions',
        surfaceId: SHELL_SURFACE_ID,
        sourceComponentId: 'query-suggestions',
        context: {query: 'surf'},
      }),
    ]);
  });

  it('shows the completions of the query in the input', async () => {
    const {type} = await renderSearchBox();

    type('surf');

    await waitFor(() => expect(options()).toEqual(['surf boards', 'surf wax']));
  });

  it('bolds the query the completions answer', async () => {
    const {type} = await renderSearchBox();

    type('surf');

    await waitFor(() => expect(options()).toEqual(['surf boards', 'surf wax']));
    expect(
      screen.getAllByRole('option').map((option) => option.querySelector('strong')?.textContent)
    ).toEqual(['surf', 'surf']);
  });

  it('bolds the query only where it starts a word', async () => {
    const {type} = await renderSearchBox((request) =>
      request.action?.name === 'fetchSuggestions'
        ? sseResponse(suggestionsRun(SHELL_SURFACE_ID, 'shoe', ['snowshoes', 'shoe rack']))
        : answerShell(request)
    );

    type('shoe');

    await waitFor(() => expect(options()).toEqual(['snowshoes', 'shoe rack']));
    expect(
      screen.getAllByRole('option').map((option) => option.querySelector('strong')?.textContent)
    ).toEqual([undefined, 'shoe']);
  });

  it('sends an empty query once for a focused input left empty or blank', async () => {
    const {type, queriesSent} = await renderSearchBox();

    type('   ');
    await pause();
    type('');
    await pause();

    expect(queriesSent()).toEqual(['']);
  });

  it('keeps the last completions shown while typing until the next ones arrive', async () => {
    const {type} = await renderSearchBox();
    type('surf');
    await waitFor(() => expect(options()).toHaveLength(2));

    type('surfx');

    expect(options()).toEqual(['surf boards', 'surf wax']);
    await waitFor(() => expect(options()).toEqual(['surfx boards', 'surfx wax']));
  });

  it('hides the last completions once a newer request fails', async () => {
    const {type} = await renderSearchBox((request) =>
      request.action?.name === 'fetchSuggestions' && request.action.context['query'] === 'surfx'
        ? new Response('', {status: 500})
        : answerShell(request)
    );
    type('surf');
    await waitFor(() => expect(options()).toHaveLength(2));

    type('surfx');
    expect(options()).toEqual(['surf boards', 'surf wax']);

    await waitFor(() => expect(options()).toEqual([]));
  });

  it('gives each completion an id without whitespace', async () => {
    const {type} = await renderSearchBox();

    type('surf');

    await waitFor(() => expect(options()).toHaveLength(2));
    for (const option of screen.getAllByRole('option')) {
      expect(option.id).not.toMatch(/\s/);
    }
  });

  it('hides completions when the input is cleared', async () => {
    const {type} = await renderSearchBox();
    type('surf');
    await waitFor(() => expect(options()).toHaveLength(2));

    type('');
    expect(options()).toEqual([]);

    type('w');
    expect(options()).toEqual([]);
    await waitFor(() => expect(options()).toEqual(['w boards', 'w wax']));
  });

  it('hides completions while an answer streams', async () => {
    let finish!: () => void;
    const {type, session} = await renderSearchBox((request) => {
      if (request.message !== null) {
        return new Promise<Response>((resolve) => {
          finish = () => resolve(sseResponse(run([])));
        });
      }
      return answerShell(request);
    });
    type('surf');
    await waitFor(() => expect(options()).toHaveLength(2));

    act(() => void session.dispatchAction({name: 'submitPrompt', payload: {prompt: 'paddles'}}));

    await waitFor(() => expect(options()).toEqual([]));
    await act(async () => finish());
    await waitFor(() => expect(options()).toEqual(['surf boards', 'surf wax']));
  });

  it('submits the expression of a selected completion', async () => {
    const {type, onSubmit} = await renderSearchBox();
    type('surf');
    await waitFor(() => expect(options()).toHaveLength(2));

    fireEvent.mouseDown(screen.getByRole('option', {name: /surf wax/}));

    expect(onSubmit).toHaveBeenCalledWith('surf wax');
  });

  it('hides completions on submit until the next keystroke', async () => {
    const {type, textarea, onSubmit} = await renderSearchBox();
    type('surf');
    await waitFor(() => expect(options()).toHaveLength(2));

    fireEvent.keyDown(textarea, {key: 'Enter', code: 'Enter'});
    expect(onSubmit).toHaveBeenCalledWith('surf');
    expect(options()).toEqual([]);

    type('surfb');
    expect(options()).toEqual([]);
    await waitFor(() => expect(options()).toEqual(['surfb boards', 'surfb wax']));
  });

  it('never sends the text typed before a submit', async () => {
    const {type, textarea, queriesSent} = await renderSearchBox();

    type('kayaks');
    fireEvent.keyDown(textarea, {key: 'Enter', code: 'Enter'});
    type('p');
    await pause();

    expect(queriesSent()).toEqual(['', 'p']);
  });

  it('drops a query still waiting to be sent when the input is submitted', async () => {
    let release!: () => void;
    const test = createTestSession((request) => {
      if (request.action?.name === 'fetchSuggestions' && request.action.context['query'] === 'k') {
        return new Promise<Response>((resolve) => {
          release = () => resolve(sseResponse(suggestionsRun(SHELL_SURFACE_ID, 'k', ['kayaks'])));
        });
      }
      return answerShell(request);
    });
    renderWithSession(
      <SessionSearchBox
        onSubmit={(prompt) => void submitQuery(test.session, prompt)}
        busy={false}
      />,
      test.session
    );
    const textarea = await findSearchBox();
    textarea.focus();
    const type = (value: string) => fireEvent.change(textarea, {target: {value}});

    type('k');
    await pause();
    type('kay');
    await pause();

    fireEvent.keyDown(textarea, {key: 'Enter', code: 'Enter'});
    release();

    await waitFor(() =>
      expect(
        test.requests.filter(({message}) => message !== null).map(({message}) => message)
      ).toEqual(['kay'])
    );
    expect(test.actions('fetchSuggestions').map(({context}) => context['query'])).toEqual(['k']);
  });

  it('waits while the session is busy, then sends only the latest query', async () => {
    let release!: () => void;
    const {type, queriesSent} = await renderSearchBox((request) => {
      if (request.action?.name === 'fetchSuggestions' && request.action.context['query'] === 'k') {
        return new Promise<Response>((resolve) => {
          release = () => resolve(sseResponse(suggestionsRun(SHELL_SURFACE_ID, 'k', ['kayaks'])));
        });
      }
      return answerShell(request);
    });

    type('k');
    await pause();
    type('ka');
    await pause();
    type('kay');
    await pause();
    expect(queriesSent()).toEqual(['', 'k']);

    await act(async () => release());

    await waitFor(() => expect(queriesSent()).toEqual(['', 'k', 'kay']));
    await waitFor(() => expect(options()).toEqual(['kay boards', 'kay wax']));
  });
});

/**
 * A producer holding the session's recent queries, `recent`, newest first: `fetchSuggestions`
 * answers those that start with its query, and one completion; `removeRecentQuery` and
 * `clearRecentQueries` edit them.
 */
function recentQueriesProducer(recent: string[]) {
  const handler: ConverseHandler = (request) => {
    const action = request.action;
    switch (action?.name) {
      case 'fetchSuggestions': {
        const query = String(action.context['query']);
        const matching = recent
          .filter((recentQuery) => recentQuery.startsWith(query.toLowerCase()))
          .slice(0, query ? 3 : 8);
        const completions = query ? [`${query} poles`] : ['backpack'];
        return sseResponse(suggestionsRun(action.surfaceId!, query, completions, matching));
      }
      case 'removeRecentQuery':
        recent.splice(recent.indexOf(String(action.context['query'])), 1);
        return sseResponse(run([]));
      case 'clearRecentQueries':
        recent.length = 0;
        return sseResponse(
          run([
            {
              version: 'v1.0',
              updateDataModel: {
                surfaceId: action.surfaceId,
                path: '/state/query-suggestions/recentQueries',
                value: [],
              },
            },
          ])
        );
      default:
        return answerShell(request);
    }
  };
  return handler;
}

const groups = () => screen.queryAllByRole('group').map((group) => group.textContent);
const announced = () => screen.getByRole('status').textContent;

describe('QuerySuggestions recent queries', () => {
  it('shows them under "Recent searches", above the completions, once the empty input has the focus', async () => {
    const {textarea, queriesSent} = await renderSearchBox(
      recentQueriesProducer(['tents', 'hiking boots']),
      {focus: false}
    );
    await pause();
    expect(queriesSent()).toEqual([]);

    act(() => textarea.focus());

    await waitFor(() => expect(options()).toEqual(['tents', 'hiking boots', 'backpack']));
    expect(queriesSent()).toEqual(['']);
    expect(screen.getByRole('group', {name: 'Query suggestions'})).toBeDefined();
    expect(groups()[0]).toMatch(/^Recent searchesClear/);
  });

  it('shows them when the input, emptied by a submit, gets the focus back, but not the window', async () => {
    const {type, textarea, queriesSent} = await renderSearchBox(recentQueriesProducer(['tents']), {
      clearOnSubmit: true,
    });
    type('tents');
    await pause();
    fireEvent.keyDown(textarea, {key: 'Enter', code: 'Enter'});
    await pause();

    fireEvent.blur(textarea);
    fireEvent.focus(textarea);
    await pause();
    expect(queriesSent()).toEqual(['', 'tents']);
    expect(options()).toEqual([]);

    act(() => textarea.blur());
    act(() => textarea.focus());

    await waitFor(() => expect(options()).toEqual(['tents', 'backpack']));
    expect(queriesSent()).toEqual(['', 'tents', '']);
  });

  it('waits for a fresh answer before showing them again in the refocused empty input', async () => {
    const recent = ['tents'];
    const producer = recentQueriesProducer(recent);
    let hold = false;
    let release!: () => void;
    const {textarea, queriesSent} = await renderSearchBox((request, signal) => {
      if (hold && request.action?.name === 'fetchSuggestions') {
        return new Promise<Response>((resolve) => {
          release = () => resolve(producer(request, signal) as Response);
        });
      }
      return producer(request, signal);
    });
    await waitFor(() => expect(options()).toEqual(['tents', 'backpack']));

    act(() => textarea.blur());
    expect(options()).toEqual([]);
    recent.unshift('kayaks');
    hold = true;
    act(() => textarea.focus());

    await waitFor(() => expect(queriesSent()).toEqual(['', '']));
    expect(options()).toEqual([]);
    await act(async () => release());
    await waitFor(() => expect(options()).toEqual(['kayaks', 'tents', 'backpack']));
  });

  it('hides the answer for the empty input once text is typed', async () => {
    const {type} = await renderSearchBox(recentQueriesProducer(['tents', 'water sports']));
    await waitFor(() => expect(options()).toEqual(['tents', 'water sports', 'backpack']));

    type('w');

    expect(options()).toEqual([]);
    await waitFor(() => expect(options()).toEqual(['water sports', 'w poles']));
  });

  it('hides a removed recent query until the producer lists it again', async () => {
    const recent = ['tents', 'hiking boots'];
    const {textarea, actions, queriesSent} = await renderSearchBox(recentQueriesProducer(recent));
    await waitFor(() => expect(options()).toEqual(['tents', 'hiking boots', 'backpack']));

    fireEvent.click(screen.getByRole('button', {name: 'Remove tents from recent searches'}));

    expect(options()).toEqual(['hiking boots', 'backpack']);
    expect(announced()).toBe('tents removed from recent searches.');
    await waitFor(() => expect(queriesSent()).toEqual(['', '']));
    expect(actions('removeRecentQuery')).toEqual([
      expect.objectContaining({sourceComponentId: 'query-suggestions', context: {query: 'tents'}}),
    ]);
    expect(options()).toEqual(['hiking boots', 'backpack']);

    recent.unshift('tents');
    act(() => textarea.blur());
    act(() => textarea.focus());

    await waitFor(() => expect(options()).toEqual(['tents', 'hiking boots', 'backpack']));
  });

  it('keeps a removed recent query hidden when the suggestions fetched after it fail', async () => {
    const producer = recentQueriesProducer(['tents', 'hiking boots']);
    let failSuggestions = false;
    const {queriesSent} = await renderSearchBox((request, signal) =>
      failSuggestions && request.action?.name === 'fetchSuggestions'
        ? new Response('', {status: 500})
        : producer(request, signal)
    );
    await waitFor(() => expect(options()).toEqual(['tents', 'hiking boots', 'backpack']));
    failSuggestions = true;

    fireEvent.click(screen.getByRole('button', {name: 'Remove tents from recent searches'}));

    await waitFor(() => expect(queriesSent()).toEqual(['', '']));
    await pause();
    expect(options()).toEqual(['hiking boots', 'backpack']);
  });

  it('clears the recent queries at once, keeps the text, and fetches its suggestions once answered', async () => {
    const recent = ['tents', 'trail shoes'];
    const {type, textarea, actions, queriesSent} = await renderSearchBox(
      recentQueriesProducer(recent)
    );
    type('t');
    await waitFor(() => expect(options()).toEqual(['tents', 'trail shoes', 't poles']));

    fireEvent.click(screen.getByRole('option', {name: 'Clear recent searches'}));

    expect(options()).toEqual(['t poles']);
    expect(textarea.value).toBe('t');
    const first = announced();
    expect(first).toBe('Recent searches cleared.');
    await waitFor(() => expect(queriesSent()).toEqual(['', 't', 't']));
    expect(actions('clearRecentQueries').map(({context}) => context)).toEqual([{}]);
    expect(options()).toEqual(['t poles']);

    recent.push('tents');
    type('te');
    await waitFor(() => expect(options()).toEqual(['tents', 'te poles']));
    fireEvent.click(screen.getByRole('option', {name: 'Clear recent searches'}));

    expect(announced()).not.toBe(first);
    expect(announced()?.trim()).toBe('Recent searches cleared.');
  });

  it('removes a recent query only once the session is free', async () => {
    let release!: () => void;
    const producer = recentQueriesProducer(['hiking boots', 'hats']);
    const {type, actions, queriesSent} = await renderSearchBox((request, signal) => {
      if (request.action?.name === 'fetchSuggestions' && request.action.context['query'] === 'hi') {
        return new Promise<Response>((resolve) => {
          release = () => resolve(producer(request, signal) as Response);
        });
      }
      return producer(request, signal);
    });
    type('h');
    await waitFor(() => expect(options()).toEqual(['hiking boots', 'hats', 'h poles']));
    type('hi');
    await pause();

    fireEvent.click(screen.getByRole('button', {name: 'Remove hats from recent searches'}));
    expect(options()).toEqual(['hiking boots', 'h poles']);
    expect(actions('removeRecentQuery')).toEqual([]);

    await act(async () => release());

    await waitFor(() => expect(queriesSent()).toEqual(['', 'h', 'hi', 'hi']));
    expect(actions('removeRecentQuery').map(({context}) => context)).toEqual([{query: 'hats'}]);
    await waitFor(() => expect(options()).toEqual(['hiking boots', 'hi poles']));
  });
});
