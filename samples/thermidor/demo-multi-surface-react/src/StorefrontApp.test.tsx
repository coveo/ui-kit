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

function sentPrompts(fetchMock: ReturnType<typeof vi.fn>): unknown[] {
  return fetchMock.mock.calls.map(
    ([, init]) => JSON.parse((init as RequestInit).body as string).message
  );
}

function sentRestores(fetchMock: ReturnType<typeof vi.fn>): unknown[] {
  return fetchMock.mock.calls.map(
    ([, init]) => JSON.parse((init as RequestInit).body as string).context.custom.restoreSurfaceId
  );
}

function search(query: string) {
  fireEvent.change(screen.getByRole('searchbox', {name: 'Search'}), {target: {value: query}});
  fireEvent.submit(screen.getByRole('search'));
}

/** The browser's Back button: jsdom goes back, then fires `popstate`, on a later task. */
async function browserBack() {
  await act(async () => {
    const popped = new Promise((resolve) =>
      window.addEventListener('popstate', resolve, {once: true})
    );
    window.history.back();
    await popped;
  });
}

const url = () => window.location.pathname + window.location.search;

function openListing(name: string) {
  fireEvent.click(screen.getByRole('button', {name: /Listing pages/}));
  fireEvent.click(
    within(screen.getByRole('list', {name: 'Listing pages'})).getByRole('button', {
      name: new RegExp(name),
    })
  );
}

describe('StorefrontApp', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    window.history.replaceState(null, '', '/');
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

  it("searches a listing page's category on the search view", async () => {
    render(<App />);
    await act(async () => {});
    fetchMock.mockClear();

    openListing('Surfing');
    await act(async () => {});

    expect(screen.getByRole('heading', {name: 'Surfing'})).toBeTruthy();
    expect(sentViews(fetchMock)).toEqual(['storefront-preview-search']);
    expect(sentPrompts(fetchMock)).toEqual(['Surfing']);
  });

  it('opens the page its URL names, and asks the server to restore the surface it names', async () => {
    window.history.replaceState(null, '', '/listing/surfing?surface=ui-1f');
    render(<App />);
    await act(async () => {});

    expect(screen.getByRole('heading', {name: 'Surfing'})).toBeTruthy();
    expect(sentViews(fetchMock)).toEqual(['storefront-preview-search']);
    expect(sentPrompts(fetchMock)).toEqual(['Surfing']);
    expect(sentRestores(fetchMock)).toEqual(['ui-1f']);
  });

  it('gives each page a URL, and shows the page again with the browser', async () => {
    window.history.replaceState(null, '', '/listing/surfing?surface=ui-1f');
    render(<App />);
    await act(async () => {});
    fireEvent.click(screen.getByRole('checkbox', {name: 'AI'}));
    search('kayak');
    await act(async () => {});

    expect(url()).toBe('/search?q=kayak');

    fetchMock.mockClear();
    await browserBack();

    expect(url()).toBe('/listing/surfing?surface=ui-1f');
    expect(screen.getByRole('heading', {name: 'Surfing'})).toBeTruthy();
    expect(sentPrompts(fetchMock)).toEqual(['Surfing']);
    expect(sentRestores(fetchMock)).toEqual(['ui-1f']);
  });

  it('sends nothing for an assistant answer the shopper comes back to, and says so', async () => {
    render(<App />);
    await act(async () => {});
    search('boating safety');
    await act(async () => {});
    expect(url()).toBe('/assistant?q=boating+safety');
    search('kayak');
    await act(async () => {});
    fetchMock.mockClear();

    await browserBack();

    expect(screen.getByRole('heading', {name: 'boating safety'})).toBeTruthy();
    expect(screen.getByText(/Going back to an assistant answer isn't supported yet/)).toBeTruthy();
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
