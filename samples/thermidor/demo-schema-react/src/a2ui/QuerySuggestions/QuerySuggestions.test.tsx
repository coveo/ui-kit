import {act, fireEvent, screen, waitFor} from '@testing-library/react';
import {afterEach, describe, expect, it, vi} from 'vitest';
import {SessionSearchBox} from '../../components/SessionSearchBox/SessionSearchBox.js';
import {
  answerShell,
  createTestSession,
  findSearchBox,
  renderWithSession,
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

async function renderSearchBox(handler: ConverseHandler = answerShell) {
  const onSubmit = vi.fn();
  const test = createTestSession(handler);
  renderWithSession(<SessionSearchBox onSubmit={onSubmit} busy={false} />, test.session);
  const textarea = await findSearchBox();
  textarea.focus();
  const type = (value: string) => fireEvent.change(textarea, {target: {value}});
  const queriesSent = () =>
    test.actions('fetchSuggestions').map(({context}) => context['query'] as string);
  return {...test, onSubmit, textarea, type, queriesSent};
}

const options = () => screen.queryAllByRole('option').map((option) => option.textContent);

describe('QuerySuggestions', () => {
  it("sends the query once typing pauses, from the shell's QuerySuggestions node", async () => {
    const {type, actions} = await renderSearchBox();

    type('s');
    type('su');
    type('surf');
    await pause();

    expect(actions('fetchSuggestions')).toEqual([
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

  it('sends nothing for an empty or blank query', async () => {
    const {type, queriesSent} = await renderSearchBox();

    type('   ');
    await pause();
    type('');
    await pause();

    expect(queriesSent()).toEqual([]);
  });

  it('hides completions that answer another query than the one in the input', async () => {
    const {type} = await renderSearchBox();
    type('surf');
    await waitFor(() => expect(options()).toHaveLength(2));

    type('surfx');

    expect(options()).toEqual([]);
    await waitFor(() => expect(options()).toEqual(['surfx boards', 'surfx wax']));
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
    expect(queriesSent()).toEqual(['k']);

    await act(async () => release());

    await waitFor(() => expect(queriesSent()).toEqual(['k', 'kay']));
    await waitFor(() => expect(options()).toEqual(['kay boards', 'kay wax']));
  });
});
