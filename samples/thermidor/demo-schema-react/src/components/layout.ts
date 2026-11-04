/**
 * PROTOTYPE (HACK-408, after the COMSHOPX-1470 spike): how the page places the shopper's results
 * and the assistant's answers.
 *
 * - `feed`: one feed; every search and answer is a block in the turn that produced it.
 * - `floating`: the latest search fills a results panel the shopper always owns, and the
 *   assistant answers in a window floating over it, which can be minimized or maximized.
 * - `docked`: the same, with the assistant docked as a column beside the results.
 *
 * It is a client-only choice over the same session: the gateway streams the same events. The
 * layout is read from `?layout=`, so a link opens any of them.
 */
export type Layout = 'feed' | 'floating' | 'docked';

export const LAYOUTS: readonly Layout[] = ['feed', 'floating', 'docked'];

export const LAYOUT_LABELS: Record<Layout, string> = {
  feed: 'Feed',
  floating: 'Floating',
  docked: 'Docked',
};

const LAYOUT_PARAM = 'layout';

export function readLayout(search: string = window.location.search): Layout {
  const value = new URLSearchParams(search).get(LAYOUT_PARAM);
  return LAYOUTS.find((layout) => layout === value) ?? 'feed';
}

export function writeLayout(layout: Layout): void {
  const url = new URL(window.location.href);
  url.searchParams.set(LAYOUT_PARAM, layout);
  window.history.replaceState(window.history.state, '', url);
}
