import {StrictMode} from 'react';
import {act, fireEvent, screen, waitFor} from '@testing-library/react';
import {describe, expect, it, vi} from 'vitest';
import {SearchBox} from './SearchBox.js';
import {LOOKUP_DEBOUNCE_MS} from '../../a2ui/QuerySuggestions/QuerySuggestions.js';
import {
  answerLookups,
  createTestSession,
  renderWithSession,
  type ConverseRequest,
} from '../../test/session.js';

/** Holds each lookup until the test answers it, in any order. */
function holdLookups() {
  const pending = new Map<string, () => void>();
  const {session} = createTestSession(
    (request) =>
      new Promise((resolve) => {
        pending.set(String(request.action?.context['query']), () =>
          resolve(answerLookups(request))
        );
      })
  );
  return {
    session,
    /** Types `text` and waits until its lookup is sent. */
    async typeAndLookUp(text: string) {
      type(text);
      await waitFor(() => expect(pending.has(text)).toBe(true));
    },
    async answer(query: string) {
      await act(async () => {
        pending.get(query)!();
        // Lets the session read the lookup's stream and apply it.
        await new Promise((resolve) => setTimeout(resolve, 0));
      });
    },
  };
}

const lookups = (requests: ConverseRequest[]) =>
  requests.filter((request) => request.action?.name === 'fetchSuggestions');

function type(text: string) {
  const input = screen.getByLabelText('Prompt');
  input.focus();
  fireEvent.change(input, {target: {value: text}});
}

const optionLabels = () => screen.queryAllByRole('option').map((option) => option.textContent);

/** Waits long enough for any debounced lookup to have been sent. */
const afterDebounce = () =>
  act(() => new Promise((resolve) => setTimeout(resolve, LOOKUP_DEBOUNCE_MS * 2)));

describe('SearchBox', () => {
  it('draws an enabled input in the first render, before any request', () => {
    const {session, requests} = createTestSession(answerLookups);
    renderWithSession(<SearchBox onSubmit={vi.fn()} isStreaming={false} />, session);

    expect((screen.getByLabelText('Prompt') as HTMLTextAreaElement).disabled).toBe(false);
    expect(requests).toEqual([]);
  });

  it('looks up each query and shows its completions as they change', async () => {
    const {session, requests} = createTestSession(answerLookups);
    renderWithSession(<SearchBox onSubmit={vi.fn()} isStreaming={false} />, session);
    const input = screen.getByLabelText('Prompt');

    type('surf');
    await waitFor(() => expect(optionLabels()).toEqual(['surf boards', 'surf wax']));

    type('kayak');
    await waitFor(() => expect(optionLabels()).toEqual(['kayak boards', 'kayak wax']));

    expect(lookups(requests)).toMatchObject([
      {
        surfaceTemplate: 'search-box',
        action: {sourceComponentId: 'root', context: {query: 'surf'}},
      },
      {surfaceTemplate: 'search-box', action: {context: {query: 'kayak'}}},
    ]);
    expect(screen.getByLabelText('Prompt')).toBe(input);
    expect(document.activeElement).toBe(input);
  });

  it('sends no lookup and shows no completions for an empty input', async () => {
    const {session, requests} = createTestSession(answerLookups);
    renderWithSession(<SearchBox onSubmit={vi.fn()} isStreaming={false} />, session);

    type('surf');
    await waitFor(() => expect(optionLabels()).toHaveLength(2));
    type('');

    expect(optionLabels()).toEqual([]);
    expect(lookups(requests)).toHaveLength(1);
  });

  it('looks up only the query typing paused on', async () => {
    const {session, requests} = createTestSession(answerLookups);
    renderWithSession(<SearchBox onSubmit={vi.fn()} isStreaming={false} />, session);

    for (const text of ['s', 'su', 'sur', 'surf']) {
      type(text);
    }
    await waitFor(() => expect(optionLabels()).toEqual(['surf boards', 'surf wax']));
    await afterDebounce();

    expect(lookups(requests).map((request) => request.action!.context['query'])).toEqual(['surf']);
  });

  it('sends no pending lookup once the input is submitted or cleared', async () => {
    const onSubmit = vi.fn();
    const {session, requests} = createTestSession(answerLookups);
    renderWithSession(<SearchBox onSubmit={onSubmit} isStreaming={false} />, session);

    type('surf');
    fireEvent.keyDown(screen.getByLabelText('Prompt'), {key: 'Enter'});
    type('kayak');
    type('');
    await afterDebounce();

    expect(onSubmit).toHaveBeenCalledWith('surf');
    expect(lookups(requests)).toEqual([]);
  });

  it('submits a selected completion', async () => {
    const onSubmit = vi.fn();
    const {session} = createTestSession(answerLookups);
    renderWithSession(<SearchBox onSubmit={onSubmit} isStreaming={false} />, session);

    type('surf');
    fireEvent.mouseDown(await screen.findByRole('option', {name: /surf wax/}));

    expect(onSubmit).toHaveBeenCalledWith('surf wax');
    expect(optionLabels()).toEqual([]);
  });

  it('never shows the completions of a lookup that answered after a submit', async () => {
    const lookup = holdLookups();
    const onSubmit = vi.fn();
    renderWithSession(<SearchBox onSubmit={onSubmit} isStreaming={false} />, lookup.session);

    await lookup.typeAndLookUp('surf');
    fireEvent.keyDown(screen.getByLabelText('Prompt'), {key: 'Enter'});
    expect(onSubmit).toHaveBeenCalledWith('surf');
    await lookup.answer('surf');

    await lookup.typeAndLookUp('kayak');
    expect(optionLabels()).toEqual([]);

    await lookup.answer('kayak');
    expect(optionLabels()).toEqual(['kayak boards', 'kayak wax']);
  });

  it('never replaces the completions of a newer query with those of an older one', async () => {
    const lookup = holdLookups();
    renderWithSession(<SearchBox onSubmit={vi.fn()} isStreaming={false} />, lookup.session);

    await lookup.typeAndLookUp('su');
    await lookup.typeAndLookUp('surf');
    await lookup.answer('surf');
    await lookup.answer('su');

    expect(optionLabels()).toEqual(['surf boards', 'surf wax']);
  });

  it('keeps typing and completions usable while an answer streams, and holds the submit', async () => {
    const onSubmit = vi.fn();
    const {session} = createTestSession(answerLookups);
    renderWithSession(<SearchBox onSubmit={onSubmit} isStreaming={true} />, session);

    type('surf');
    await waitFor(() => expect(optionLabels()).toHaveLength(2));
    fireEvent.keyDown(screen.getByLabelText('Prompt'), {key: 'Enter'});

    expect(onSubmit).not.toHaveBeenCalled();
    expect((screen.getByLabelText('Submit') as HTMLButtonElement).disabled).toBe(true);
  });

  it('gives each search box an instance of its own, under a prefixed surface id', async () => {
    const {session, requests} = createTestSession(answerLookups);
    renderWithSession(
      <>
        <SearchBox onSubmit={vi.fn()} isStreaming={false} />
        <SearchBox onSubmit={vi.fn()} isStreaming={false} />
      </>,
      session
    );
    const [first, second] = screen.getAllByLabelText('Prompt');

    first.focus();
    fireEvent.change(first, {target: {value: 'surf'}});
    second.focus();
    fireEvent.change(second, {target: {value: 'kayak'}});

    await waitFor(() => expect(lookups(requests)).toHaveLength(2));
    const [firstLookup, secondLookup] = lookups(requests);
    expect(firstLookup.action!.surfaceId).not.toBe(secondLookup.action!.surfaceId);
    expect(firstLookup.action!.surfaceId).toMatch(/^template:search-box-/);
    expect(secondLookup.action!.surfaceId).toMatch(/^template:search-box-/);
  });

  it('creates its instance again after an unmount, as StrictMode does', async () => {
    const {session} = createTestSession(answerLookups);
    const {unmount} = renderWithSession(
      <StrictMode>
        <SearchBox onSubmit={vi.fn()} isStreaming={false} />
      </StrictMode>,
      session
    );

    type('surf');
    await waitFor(() => expect(optionLabels()).toEqual(['surf boards', 'surf wax']));
    unmount();

    renderWithSession(<SearchBox onSubmit={vi.fn()} isStreaming={false} />, session);
    type('kayak');
    await waitFor(() => expect(optionLabels()).toEqual(['kayak boards', 'kayak wax']));
  });
});
