import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {act, cleanup, fireEvent, render, screen, within} from '@testing-library/react';
import App from './App.js';

/** A converse stream that completes its turn with no surface. */
function emptyTurnResponse() {
  const body = ['turn_started', 'RUN_STARTED', 'RUN_FINISHED', 'turn_complete']
    .map((type) => `data:${JSON.stringify({type})}\n\n`)
    .join('');
  return new Response(body, {headers: {'Content-Type': 'text/event-stream'}});
}

function sentViews(fetchMock: ReturnType<typeof vi.fn>): unknown[] {
  return fetchMock.mock.calls.map(
    ([, init]) => JSON.parse((init as RequestInit).body as string).context.custom.surfaceId
  );
}

describe('StorefrontApp', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn(async () => emptyTurnResponse());
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it('opens on the home page, which sends nothing', async () => {
    render(<App />);
    await act(async () => {});

    expect(screen.getByRole('heading', {name: 'Home'})).toBeTruthy();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('shows a listing page as in progress, and sends nothing for it', async () => {
    render(<App />);
    await act(async () => {});
    fetchMock.mockClear();

    fireEvent.click(screen.getByRole('button', {name: /Listing pages/}));
    fireEvent.click(
      within(screen.getByRole('list', {name: 'Listing pages'})).getByRole('button', {
        name: /Surfing/,
      })
    );
    await act(async () => {});

    expect(screen.getByRole('status').textContent).toContain('In progress');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('searches on the search view with the AI toggle off', async () => {
    render(<App />);
    await act(async () => {});
    fetchMock.mockClear();

    fireEvent.click(screen.getByRole('checkbox', {name: 'AI'}));
    fireEvent.change(screen.getByRole('searchbox', {name: 'Search'}), {target: {value: 'kayak'}});
    fireEvent.submit(screen.getByRole('search'));
    await act(async () => {});

    expect(screen.getByRole('heading', {name: 'Results for “kayak”'})).toBeTruthy();
    expect(sentViews(fetchMock)).toEqual(['storefront-preview-search']);
    expect(screen.getByText('The server sent no results for this search.')).toBeTruthy();
  });

  it('sends a page prompt once the request it cancelled has unwound', async () => {
    let finishAnswer: (() => void) | undefined;
    fetchMock.mockImplementationOnce(
      () =>
        new Promise<Response>((_resolve, reject) => {
          finishAnswer = () => reject(new DOMException('Aborted', 'AbortError'));
        })
    );
    render(<App />);
    await act(async () => {});

    fireEvent.change(screen.getByRole('searchbox', {name: 'Search'}), {
      target: {value: 'boating safety'},
    });
    fireEvent.submit(screen.getByRole('search'));
    await act(async () => {});
    fireEvent.click(screen.getByRole('checkbox', {name: 'AI'}));
    fireEvent.change(screen.getByRole('searchbox', {name: 'Search'}), {target: {value: 'kayak'}});
    fireEvent.submit(screen.getByRole('search'));
    finishAnswer?.();
    await act(async () => {});

    expect(sentViews(fetchMock)).toEqual([
      'storefront-preview-assistant',
      'storefront-preview-search',
    ]);
  });

  it('asks the assistant on its view with the AI toggle on', async () => {
    render(<App />);
    await act(async () => {});
    fetchMock.mockClear();

    fireEvent.change(screen.getByRole('searchbox', {name: 'Search'}), {
      target: {value: 'boating safety'},
    });
    fireEvent.submit(screen.getByRole('search'));
    await act(async () => {});

    expect(sentViews(fetchMock)).toEqual(['storefront-preview-assistant']);
  });
});
