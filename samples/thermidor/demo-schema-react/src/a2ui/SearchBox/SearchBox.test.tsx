import {fireEvent, screen, waitFor} from '@testing-library/react';
import {afterEach, describe, expect, it, vi} from 'vitest';
import {SessionSearchBox} from '../../components/SessionSearchBox/SessionSearchBox.js';
import {
  answerShell,
  createTestSession,
  findSearchBox,
  renderWithSession,
  run,
  sseResponse,
} from '../../test/session.js';
import type {SearchBoxOptions} from './search-box-context.js';

afterEach(() => {
  vi.unstubAllGlobals();
});

async function renderSearchBox(options: Partial<SearchBoxOptions> = {}) {
  const onSubmit = vi.fn();
  const test = createTestSession();
  const view = renderWithSession(
    <SessionSearchBox onSubmit={onSubmit} busy={false} {...options} />,
    test.session
  );
  const textarea = await findSearchBox();
  return {...test, ...view, onSubmit, textarea};
}

describe('SearchBox', () => {
  it('draws the input inside the session shell', async () => {
    const {container, textarea} = await renderSearchBox({placeholder: 'Ask anything...'});

    expect(container.querySelector('[data-surface-id="shell-1"]')?.contains(textarea)).toBe(true);
    expect(textarea.placeholder).toBe('Ask anything...');
  });

  it('draws a usable input without suggestions when the session opens without a shell', async () => {
    const onSubmit = vi.fn();
    const test = createTestSession((request) =>
      request.action?.name === 'initialize' ? sseResponse(run([])) : answerShell(request)
    );
    renderWithSession(<SessionSearchBox onSubmit={onSubmit} busy={false} />, test.session);

    const textarea = await findSearchBox();
    fireEvent.change(textarea, {target: {value: 'kayaks'}});
    fireEvent.keyDown(textarea, {key: 'Enter', code: 'Enter'});

    expect(onSubmit).toHaveBeenCalledWith('kayaks');
    expect(test.actions('fetchSuggestions')).toEqual([]);
  });

  it("submits the trimmed query through the page's handler", async () => {
    const {textarea, onSubmit} = await renderSearchBox();

    fireEvent.change(textarea, {target: {value: '  kayaks '}});
    fireEvent.keyDown(textarea, {key: 'Enter', code: 'Enter'});

    expect(onSubmit).toHaveBeenCalledWith('kayaks');
  });

  it('holds the submit while busy, and still fetches suggestions', async () => {
    const {textarea, onSubmit, actions} = await renderSearchBox({busy: true});

    fireEvent.change(textarea, {target: {value: 'kayaks'}});
    fireEvent.keyDown(textarea, {key: 'Enter', code: 'Enter'});

    expect(onSubmit).not.toHaveBeenCalled();
    await waitFor(() => expect(actions('fetchSuggestions')).toHaveLength(1));
  });

  it('clears the input on submit when asked to', async () => {
    const {textarea} = await renderSearchBox({clearOnSubmit: true});

    fireEvent.change(textarea, {target: {value: 'kayaks'}});
    fireEvent.keyDown(textarea, {key: 'Enter', code: 'Enter'});

    expect(textarea.value).toBe('');
  });

  it('opens the completions where the page places them', async () => {
    const {textarea} = await renderSearchBox({suggestionsPlacement: 'above'});

    textarea.focus();
    fireEvent.change(textarea, {target: {value: 'surf'}});

    await waitFor(() => expect(screen.getByRole('listbox').className).toMatch(/above/));
  });
});
