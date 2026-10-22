/**
 * PROTOTYPE (COMSHOPX-1470): how the page places search results.
 *
 * - `stacked`: one feed; every search and answer is a block in the turn that produced it.
 * - `floating`: the latest search surface fills a persistent results panel, and a floating chat
 *   window the shopper can minimize or maximize holds everything else (text, reasoning, answer
 *   blocks, search traces).
 *
 * It is a client-only choice: the gateway streams the same events in both layouts. The layout is
 * read from `?layout=`, so a link can open either one.
 */
export type Layout = 'stacked' | 'floating';

export const LAYOUTS: readonly Layout[] = ['stacked', 'floating'];

const LAYOUT_PARAM = 'layout';

export function readLayout(): Layout {
  const value = new URLSearchParams(window.location.search).get(LAYOUT_PARAM);
  return LAYOUTS.find((layout) => layout === value) ?? 'stacked';
}

export function writeLayout(layout: Layout): void {
  const url = new URL(window.location.href);
  url.searchParams.set(LAYOUT_PARAM, layout);
  window.history.replaceState(window.history.state, '', url);
}
