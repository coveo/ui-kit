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

/** A converse stream whose turn opens a search surface, as the mock answers a search. */
function searchTurnResponse() {
  const createSurface = {
    surfaceId: 'ui-search',
    catalogId: 'https://schema.thermidor.coveo.com/a2-ui/catalog.json',
    components: [{id: 'root', component: 'CommerceSearch'}],
  };
  const events = [
    {type: 'RUN_STARTED'},
    {
      type: 'ACTIVITY_SNAPSHOT',
      messageId: 'search-surface',
      activityType: 'a2ui-surface',
      content: {messages: [{version: 'v1.0', createSurface}]},
    },
    {type: 'RUN_FINISHED'},
  ];
  const body = events.map((event) => `data:${JSON.stringify(event)}\n\n`).join('');
  return new Response(body, {headers: {'Content-Type': 'text/event-stream'}});
}

function sentViews(fetchMock: ReturnType<typeof vi.fn>): unknown[] {
  return fetchMock.mock.calls.map(
    ([, init]) => JSON.parse((init as RequestInit).body as string).context.custom.surfaceId
  );
}

function submitSearch(query: string) {
  fireEvent.change(screen.getByRole('searchbox', {name: 'Search'}), {target: {value: query}});
  fireEvent.submit(screen.getByRole('search'));
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

  it('sends a prompt on the session shell, and opens the search layout for a search surface', async () => {
    fetchMock.mockImplementationOnce(async () => searchTurnResponse());
    render(<App />);
    await act(async () => {});

    submitSearch('kayak');
    await act(async () => {});

    expect(sentViews(fetchMock)).toEqual(['storefront-preview']);
    expect(screen.getByRole('heading', {name: 'Results for “kayak”'})).toBeTruthy();
    expect(screen.getByRole('complementary', {name: 'Shopping assistant'})).toBeTruthy();
  });

  it('opens the assistant layout for an answer without a search surface', async () => {
    render(<App />);
    await act(async () => {});

    submitSearch('which kayak should I get?');
    await act(async () => {});

    expect(sentViews(fetchMock)).toEqual(['storefront-preview']);
    expect(screen.getByRole('heading', {name: 'which kayak should I get?', level: 1})).toBeTruthy();
    expect(screen.getByRole('button', {name: '← Back to home'})).toBeTruthy();
    expect(screen.queryByRole('complementary', {name: 'Shopping assistant'})).toBeNull();
  });

  it('disables the search box while a request is in flight, so no search races it', async () => {
    let finishAnswer: (() => void) | undefined;
    fetchMock.mockImplementationOnce(
      () =>
        new Promise<Response>((resolve) => {
          finishAnswer = () => resolve(emptyTurnResponse());
        })
    );
    render(<App />);
    await act(async () => {});
    const searchBox = screen.getByRole('searchbox', {name: 'Search'}) as HTMLInputElement;

    submitSearch('kayak');
    await act(async () => {});

    expect(searchBox.disabled).toBe(true);
    expect(screen.getByText('Working on “kayak”…')).toBeTruthy();
    submitSearch('boots');
    await act(async () => {});
    expect(sentViews(fetchMock)).toEqual(['storefront-preview']);

    await act(async () => finishAnswer?.());

    expect(searchBox.disabled).toBe(false);
  });

  it('records the view that sent each turn', async () => {
    render(<App />);
    await act(async () => {});

    submitSearch('boating safety?');
    await act(async () => {});
    submitSearch('kayak');
    await act(async () => {});

    const rows = within(screen.getByRole('table')).getAllByRole('row').slice(1);
    expect(rows.map((row) => within(row).getAllByRole('cell')[1].textContent)).toEqual([
      'storefront-preview',
      'storefront-preview',
    ]);
  });
});
