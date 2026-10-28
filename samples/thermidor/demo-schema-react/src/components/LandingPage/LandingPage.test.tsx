import {act, screen, fireEvent, waitFor} from '@testing-library/react';
import {afterEach, describe, it, expect, vi} from 'vitest';
import {LandingPage} from './LandingPage.js';
import {
  answerShell,
  createTestSession,
  findSearchBox,
  renderWithSession,
  sseResponse,
  shellRun,
} from '../../test/session.js';

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

function prompt() {
  return screen.getByLabelText('Prompt') as HTMLTextAreaElement;
}

describe('LandingPage search box', () => {
  it('draws a disabled input until the session shell arrives, then its search box', async () => {
    let answerInitialize!: (response: Response) => void;
    const {session} = createTestSession((request) =>
      request.action?.name === 'initialize'
        ? new Promise<Response>((resolve) => (answerInitialize = resolve))
        : answerShell(request)
    );
    renderWithSession(<LandingPage onSubmit={vi.fn()} isStreaming={false} />, session);

    await waitFor(() => expect(session.request).toEqual({kind: 'initialize'}));
    expect(prompt().disabled).toBe(true);
    expect(screen.getAllByLabelText('Prompt')).toHaveLength(1);

    await act(async () => answerInitialize(sseResponse(shellRun())));

    expect((await findSearchBox()).disabled).toBe(false);
    expect(screen.getAllByLabelText('Prompt')).toHaveLength(1);
  });

  it('draws a plain input without suggestions when the session could not open', async () => {
    const onSubmit = vi.fn();
    const {session, actions} = createTestSession((request) =>
      request.action?.name === 'initialize'
        ? new Response('{}', {status: 500})
        : answerShell(request)
    );
    renderWithSession(<LandingPage onSubmit={onSubmit} isStreaming={false} />, session);

    await waitFor(() => expect(session.initialization?.status).toBe('error'));
    const textarea = await findSearchBox();
    vi.useFakeTimers();
    textarea.focus();
    fireEvent.change(textarea, {target: {value: 'surf'}});
    await act(async () => vi.advanceTimersByTime(1000));

    expect(actions('fetchSuggestions')).toEqual([]);
    expect(screen.queryByRole('listbox')).toBeNull();

    fireEvent.keyDown(textarea, {key: 'Enter', code: 'Enter'});
    expect(onSubmit).toHaveBeenCalledWith('surf');
  });
});
