import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {act, cleanup, fireEvent, render, screen, within} from '@testing-library/react';
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

function sentViews(fetchMock: ReturnType<typeof vi.fn>): unknown[] {
  return fetchMock.mock.calls.map(
    ([, init]) => JSON.parse((init as RequestInit).body as string).context.custom.surfaceId
  );
}

async function search(query: string, {ai}: {ai: boolean}) {
  const toggle = screen.getByRole('checkbox', {name: 'AI'}) as HTMLInputElement;
  if (toggle.checked !== ai) {
    fireEvent.click(toggle);
  }
  fireEvent.change(screen.getByRole('searchbox', {name: 'Search'}), {target: {value: query}});
  fireEvent.submit(screen.getByRole('search'));
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
    await search('what is a wetsuit?', {ai: true});
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
      'storefront-preview-assistant',
      'storefront-preview-assistant',
      'storefront-preview-assistant',
    ]);
  });

  it('goes Back from the search layout to the conversation, which stays there', async () => {
    await search('what is a wetsuit?', {ai: true});
    fetchMock.mockImplementationOnce(async () => searchTurnResponse());
    await askInChat('show me wetsuits');
    await askInPanel('which one is warmest?');

    fireEvent.click(screen.getByRole('button', {name: '← Back'}));
    await act(async () => {});

    expect(heading()).toBe('Shopping assistant');
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
    await search('what is a wetsuit?', {ai: true});
    fetchMock.mockImplementationOnce(async () => searchTurnResponse());
    await search('kayaks', {ai: false});

    expect(heading()).toBe('Results for “kayaks”');
    expect(panelPrompts()).toEqual([expect.stringContaining('what is a wetsuit?')]);

    fireEvent.click(screen.getByRole('button', {name: '← Back'}));
    await act(async () => {});
    expect(heading()).toBe('Shopping assistant');
  });

  it('opens a plain search with an empty panel', async () => {
    fetchMock.mockImplementationOnce(async () => searchTurnResponse());
    await search('kayaks', {ai: false});

    expect(heading()).toBe('Results for “kayaks”');
    expect(within(panel()).getByText('Ask about the results on this page.')).toBeTruthy();
    expect(sentViews(fetchMock)).toEqual(['storefront-preview-search']);
  });

  it('opens the search layout in place of the chat when the question itself draws a search', async () => {
    fetchMock.mockImplementationOnce(async () => searchTurnResponse());
    await search('show me kayaks', {ai: true});

    expect(heading()).toBe('Results for “show me kayaks”');
    expect(panelPrompts()).toEqual([expect.stringContaining('show me kayaks')]);

    fireEvent.click(screen.getByRole('button', {name: '← Back'}));
    await act(async () => {});
    expect(heading()).toBe('Home');
  });
});
