import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {act, cleanup, fireEvent, render, screen, within} from '@testing-library/react';
import App from '../App.js';

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

async function openKayakSearch() {
  render(<App />);
  await act(async () => {});
  fireEvent.click(screen.getByRole('checkbox', {name: 'AI'}));
  fireEvent.change(screen.getByRole('searchbox', {name: 'Search'}), {target: {value: 'kayak'}});
  fireEvent.submit(screen.getByRole('search'));
  await act(async () => {});
}

function panel() {
  return screen.getByRole('complementary', {name: 'Shopping assistant'});
}

/** Holds the next converse request open until the returned function answers it. */
function holdNextAnswer(fetchMock: ReturnType<typeof vi.fn>): () => void {
  let finish: (() => void) | undefined;
  fetchMock.mockImplementationOnce(
    () =>
      new Promise<Response>((resolve) => {
        finish = () => resolve(emptyTurnResponse());
      })
  );
  return () => finish?.();
}

function panelInput() {
  return within(panel()).getByRole('textbox', {
    name: 'Ask the shopping assistant',
  }) as HTMLInputElement;
}

/** Gives the thread a layout jsdom lacks, scrolled to `scrollTop`. */
function layOutThread(scrollTop: number) {
  const thread = within(panel()).getByRole('list', {name: 'Conversation'});
  Object.defineProperty(thread, 'scrollHeight', {configurable: true, value: 1000});
  Object.defineProperty(thread, 'clientHeight', {configurable: true, value: 200});
  thread.scrollTop = scrollTop;
  fireEvent.scroll(thread);
  return thread;
}

/** A browser drops the focus of a disabled control to the body; jsdom keeps it there. */
function dropFocusToBody() {
  const elsewhere = document.createElement('button');
  document.body.append(elsewhere);
  elsewhere.focus();
  elsewhere.remove();
}

function ask(prompt: string) {
  fireEvent.change(within(panel()).getByRole('textbox', {name: 'Ask the shopping assistant'}), {
    target: {value: prompt},
  });
  fireEvent.click(within(panel()).getByRole('button', {name: 'Send'}));
}

describe('ChatPanel', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn(async () => emptyTurnResponse());
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it('sits next to the search results', async () => {
    await openKayakSearch();

    expect(screen.getByRole('heading', {name: 'Results for “kayak”'})).toBeTruthy();
    expect(sentViews(fetchMock)).toEqual(['storefront-preview-search']);
    expect(within(panel()).getByText('Ask about the results on this page.')).toBeTruthy();
  });

  it('asks the assistant on its view, and keeps the search page', async () => {
    await openKayakSearch();

    ask('which one is the cheapest?');
    await act(async () => {});

    expect(sentViews(fetchMock)).toEqual([
      'storefront-preview-search',
      'storefront-preview-assistant',
    ]);
    expect(screen.getByRole('heading', {name: 'Results for “kayak”'})).toBeTruthy();
    expect(within(panel()).getByText('which one is the cheapest?')).toBeTruthy();
    expect(screen.getByText('The server sent no results for this search.')).toBeTruthy();
  });

  it('records the panel turn with the assistant view, on the search page', async () => {
    await openKayakSearch();

    ask('which one is the cheapest?');
    await act(async () => {});

    const rows = within(screen.getByRole('table')).getAllByRole('row').slice(1);
    expect(rows.map((row) => within(row).getAllByRole('cell')[1].textContent)).toEqual([
      'storefront-preview-search',
      'storefront-preview-assistant',
    ]);
    expect(within(panel()).getAllByRole('listitem')).toHaveLength(1);
  });

  it('disables every input while a request is in flight, so none gets a conflict', async () => {
    let finishAnswer: (() => void) | undefined;
    await openKayakSearch();
    fetchMock.mockImplementationOnce(
      () =>
        new Promise<Response>((resolve) => {
          finishAnswer = () => resolve(emptyTurnResponse());
        })
    );
    const input = () =>
      within(panel()).getByRole('textbox', {
        name: 'Ask the shopping assistant',
      }) as HTMLInputElement;
    const searchBox = screen.getByRole('searchbox', {name: 'Search'}) as HTMLInputElement;

    ask('which one is the cheapest?');
    await act(async () => {});

    expect(input().disabled).toBe(true);
    expect(searchBox.disabled).toBe(true);

    await act(async () => finishAnswer?.());

    expect(input().disabled).toBe(false);
    expect(searchBox.disabled).toBe(false);
  });

  it('gives the input its focus back once the answer ends', async () => {
    await openKayakSearch();
    const answer = holdNextAnswer(fetchMock);

    panelInput().focus();
    fireEvent.change(panelInput(), {target: {value: 'which one is the cheapest?'}});
    fireEvent.submit(panelInput());
    await act(async () => {});
    expect(panelInput().disabled).toBe(true);
    expect(document.activeElement).toBe(panelInput());
    dropFocusToBody();

    await act(async () => answer());

    expect(document.activeElement).toBe(panelInput());
  });

  it('follows the latest answer only while the reader is at the bottom', async () => {
    await openKayakSearch();
    ask('which one is the cheapest?');
    await act(async () => {});

    const answer = holdNextAnswer(fetchMock);
    ask('and the most expensive?');
    await act(async () => {});
    const thread = layOutThread(100);

    await act(async () => answer());

    expect(thread.scrollTop).toBe(100);

    ask('which one floats best?');
    await act(async () => {});

    expect(thread.scrollTop).toBe(1000);
  });
});
