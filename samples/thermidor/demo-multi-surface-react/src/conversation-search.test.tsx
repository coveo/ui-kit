import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {act, cleanup, fireEvent, render, screen, waitFor, within} from '@testing-library/react';
import App from './App.js';

function stream(events: object[]) {
  const body = events.map((event) => `data:${JSON.stringify(event)}\n\n`).join('');
  return new Response(body, {headers: {'Content-Type': 'text/event-stream'}});
}

/** A converse stream that completes its turn with no surface. */
function emptyTurnResponse() {
  return stream([
    {type: 'turn_started'},
    {type: 'RUN_STARTED'},
    {type: 'RUN_FINISHED'},
    {type: 'turn_complete'},
  ]);
}

/** A converse stream whose turn draws a search surface. */
function searchTurnResponse() {
  const createSurface = {
    surfaceId: `ui-search-${Math.random()}`,
    catalogId: 'https://schema.thermidor.coveo.com/a2-ui/catalog.json',
    components: [{id: 'root', component: 'CommerceSearch'}],
  };
  return stream([
    {type: 'RUN_STARTED'},
    {
      type: 'ACTIVITY_SNAPSHOT',
      messageId: 'search-surface',
      activityType: 'a2ui-surface',
      content: {messages: [{version: 'v1.0', createSurface}]},
    },
    {type: 'RUN_FINISHED'},
  ]);
}

/** A search surface with its pagination, which a restore needs. */
function paginatedSearchResponse(surfaceId: string) {
  const createSurface = {
    surfaceId,
    catalogId: 'https://schema.thermidor.coveo.com/a2-ui/catalog.json',
    components: [
      {id: 'root', component: 'CommerceSearch', mainChild: 'pagination'},
      {
        id: 'pagination',
        component: 'Pagination',
        page: {path: '/state/pagination/page'},
        pageSize: {path: '/state/pagination/pageSize'},
        totalEntries: {path: '/state/pagination/totalEntries'},
        totalPages: {path: '/state/pagination/totalPages'},
      },
    ],
    dataModel: {state: {pagination: {page: 1, pageSize: 20, totalEntries: 82, totalPages: 5}}},
  };
  return stream([
    {type: 'RUN_STARTED'},
    {
      type: 'ACTIVITY_SNAPSHOT',
      messageId: `search-${surfaceId}`,
      activityType: 'a2ui-surface',
      content: {messages: [{version: 'v1.0', createSurface}]},
    },
    {type: 'RUN_FINISHED'},
  ]);
}

function sentActions(fetchMock: ReturnType<typeof vi.fn>): unknown[] {
  return fetchMock.mock.calls
    .map(([, init]) => JSON.parse((init as RequestInit).body as string).action)
    .filter((action) => action !== null && action !== undefined);
}

function restoreOf(surfaceId: string) {
  return expect.objectContaining({
    surfaceId,
    name: 'restoreState',
    sourceComponentId: 'root',
    context: {query: '', page: 1, pageSize: 20},
  });
}

function sentViews(fetchMock: ReturnType<typeof vi.fn>): unknown[] {
  return fetchMock.mock.calls.map(
    ([, init]) => JSON.parse((init as RequestInit).body as string).context.custom.viewId
  );
}

/** The search box sends to the session shell, which routes the prompt by its intent. */
async function search(query: string) {
  fireEvent.change(screen.getByRole('searchbox', {name: 'Search'}), {target: {value: query}});
  fireEvent.submit(screen.getByRole('search'));
  await act(async () => {});
}

async function openListing(name: RegExp) {
  fireEvent.click(screen.getByRole('button', {name: /Listing pages/}));
  fireEvent.click(
    within(screen.getByRole('list', {name: 'Listing pages'})).getByRole('button', {name})
  );
  await act(async () => {});
}

async function askInChat(prompt: string) {
  fireEvent.change(screen.getByRole('combobox', {name: 'Prompt'}), {target: {value: prompt}});
  fireEvent.click(screen.getByRole('button', {name: 'Submit'}));
  await act(async () => {});
}

function panel() {
  return screen.getByRole('complementary', {name: 'Shopping assistant'});
}

async function askInPanel(prompt: string) {
  const input = within(panel()).getByRole('textbox', {name: 'Ask the shopping assistant'});
  fireEvent.change(input, {target: {value: prompt}});
  fireEvent.submit(input.closest('form')!);
  await act(async () => {});
}

function panelPrompts() {
  return within(panel())
    .queryAllByRole('listitem')
    .map((turn) => turn.textContent);
}

function heading() {
  return screen.getByRole('heading', {level: 1}).textContent;
}

describe('the conversation and the search layout', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    fetchMock = vi.fn(async () => emptyTurnResponse());
    vi.stubGlobal('fetch', fetchMock);
    render(<App />);
    await act(async () => {});
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it('continues the conversation in the side panel when a turn of it draws a search', async () => {
    await search('what is a wetsuit?');
    expect(heading()).toBe('Shopping assistant');

    fetchMock.mockImplementationOnce(async () => searchTurnResponse());
    await askInChat('show me wetsuits');

    expect(heading()).toBe('Results for “show me wetsuits”');
    expect(
      within(screen.getByRole('region', {name: 'Search results'})).queryByText(
        'The server sent no results for this search.'
      )
    ).toBeNull();
    expect(panelPrompts()).toEqual([
      expect.stringContaining('what is a wetsuit?'),
      expect.stringContaining('show me wetsuits'),
    ]);

    await askInPanel('which one is warmest?');

    expect(heading()).toBe('Results for “show me wetsuits”');
    expect(panelPrompts()).toHaveLength(3);
    expect(sentViews(fetchMock)).toEqual([
      'storefront-preview',
      'storefront-preview-assistant',
      'storefront-preview-assistant',
    ]);
  });

  it('goes Back from the search layout to the conversation, which stays there', async () => {
    await search('what is a wetsuit?');
    fetchMock.mockImplementationOnce(async () => searchTurnResponse());
    await askInChat('show me wetsuits');
    await askInPanel('which one is warmest?');

    fireEvent.click(screen.getByRole('button', {name: '← Back'}));
    // Back goes through the browser history, whose popstate comes asynchronously.
    await waitFor(() => expect(heading()).toBe('Shopping assistant'));
    const turns = within(screen.getByRole('log', {name: 'Conversation'})).getAllByRole('article');
    expect(turns.map((turn) => turn.textContent)).toEqual([
      expect.stringContaining('what is a wetsuit?'),
      expect.stringContaining('show me wetsuits'),
      expect.stringContaining('which one is warmest?'),
    ]);
    expect(fetchMock).toHaveBeenCalledTimes(3);

    fireEvent.click(screen.getByRole('button', {name: 'See the results →'}));
    await act(async () => {});
    expect(heading()).toBe('Results for “show me wetsuits”');
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('keeps the conversation in the panel of a search from the header', async () => {
    await search('what is a wetsuit?');
    fetchMock.mockImplementationOnce(async () => searchTurnResponse());
    await search('kayaks');

    expect(heading()).toBe('Results for “kayaks”');
    expect(panelPrompts()).toEqual([expect.stringContaining('what is a wetsuit?')]);

    fireEvent.click(screen.getByRole('button', {name: '← Back'}));
    await waitFor(() => expect(heading()).toBe('Shopping assistant'));
  });

  it('opens a plain search with an empty panel', async () => {
    fetchMock.mockImplementationOnce(async () => searchTurnResponse());
    await search('kayaks');

    expect(heading()).toBe('Results for “kayaks”');
    expect(within(panel()).getByText('Ask about the results on this page.')).toBeTruthy();
    expect(sentViews(fetchMock)).toEqual(['storefront-preview']);
  });

  it('goes Back from a plain search to the page before it', async () => {
    fetchMock.mockImplementationOnce(async () => searchTurnResponse());
    await search('show me kayaks');

    expect(heading()).toBe('Results for “show me kayaks”');

    fireEvent.click(screen.getByRole('button', {name: '← Back'}));
    await waitFor(() => expect(heading()).toBe('Home'));
  });
});

describe('going Back to an earlier search', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    fetchMock = vi.fn(async () => emptyTurnResponse());
    vi.stubGlobal('fetch', fetchMock);
    render(<App />);
    await act(async () => {});
    fetchMock.mockImplementationOnce(async () => paginatedSearchResponse('ui-kayaks'));
    await search('kayaks');
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("restores it with the page's Back button, and the assistant then answers about it", async () => {
    fetchMock.mockImplementationOnce(async () => paginatedSearchResponse('ui-surfboards'));
    await search('surfboards');
    expect(sentActions(fetchMock)).toEqual([]);

    fireEvent.click(screen.getByRole('button', {name: '← Back'}));

    await waitFor(() => expect(heading()).toBe('Results for “kayaks”'));
    await waitFor(() => expect(sentActions(fetchMock)).toEqual([restoreOf('ui-kayaks')]));
    expect(sentViews(fetchMock).at(-1)).toBe('storefront-preview');
  });

  it("restores it with the browser's Back", async () => {
    fetchMock.mockImplementationOnce(async () => paginatedSearchResponse('ui-surfboards'));
    await search('surfboards');

    act(() => window.history.back());

    await waitFor(() => expect(heading()).toBe('Results for “kayaks”'));
    await waitFor(() => expect(sentActions(fetchMock)).toEqual([restoreOf('ui-kayaks')]));
  });

  it('restores it from a listing page', async () => {
    await openListing(/Surfing/);
    expect(heading()).toBe('Surfing');

    act(() => window.history.back());

    await waitFor(() => expect(heading()).toBe('Results for “kayaks”'));
    await waitFor(() => expect(sentActions(fetchMock)).toEqual([restoreOf('ui-kayaks')]));
  });

  it('sends nothing for a listing page Back returns to, which draws no search', async () => {
    await openListing(/Surfing/);
    fetchMock.mockImplementationOnce(async () => paginatedSearchResponse('ui-surfboards'));
    await search('surfboards');

    fireEvent.click(screen.getByRole('button', {name: '← Back'}));
    await waitFor(() => expect(heading()).toBe('Surfing'));
    await act(async () => {});
    expect(sentActions(fetchMock)).toEqual([]);

    act(() => window.history.back());
    await waitFor(() => expect(heading()).toBe('Results for “kayaks”'));
    await waitFor(() => expect(sentActions(fetchMock)).toEqual([restoreOf('ui-kayaks')]));
  });

  it('restores it again on every return', async () => {
    fetchMock.mockImplementationOnce(async () => paginatedSearchResponse('ui-surfboards'));
    await search('surfboards');
    fireEvent.click(screen.getByRole('button', {name: '← Back'}));
    await waitFor(() => expect(sentActions(fetchMock)).toHaveLength(1));

    fetchMock.mockImplementationOnce(async () => paginatedSearchResponse('ui-paddles'));
    await search('paddles');
    fireEvent.click(screen.getByRole('button', {name: '← Back'}));

    await waitFor(() => expect(heading()).toBe('Results for “kayaks”'));
    await waitFor(() =>
      expect(sentActions(fetchMock)).toEqual([restoreOf('ui-kayaks'), restoreOf('ui-kayaks')])
    );
  });

  it("keeps the page Back returned to on the browser's Forward, so the next Back leaves it", async () => {
    fetchMock.mockImplementationOnce(async () => paginatedSearchResponse('ui-surfboards'));
    await search('surfboards');
    fireEvent.click(screen.getByRole('button', {name: '← Back'}));
    await waitFor(() => expect(heading()).toBe('Results for “kayaks”'));

    act(() => window.history.forward());
    await waitFor(() => expect(window.history.state).toEqual({storefrontDepth: 1}));
    expect(heading()).toBe('Results for “kayaks”');

    fireEvent.click(screen.getByRole('button', {name: '← Back'}));
    await waitFor(() => expect(heading()).toBe('Home'));
  });
});
