import type {DiscoveredSurface, Turn} from '@coveo/thermidor';

/**
 * What the page being shown draws. The server says nothing about placement: a page draws the
 * surfaces the turn of its own prompt created. A page shown again from its URL asks the server to
 * restore the surface it showed, so that turn creates the same surface again, with the state the
 * server has for it.
 */
export interface PageView {
  /** The turn of the page's prompt, once the session has opened it. */
  turn: Turn | undefined;
  /** The live surfaces that turn created, in order. */
  surfaces: readonly DiscoveredSurface[];
  /** The search surface among them, which a search or listing page's URL names. */
  searchSurfaceId: string | undefined;
}

const SEARCH_ROOT = 'CommerceSearch';

export function buildPageView(turns: readonly Turn[], pageTurnId: string | undefined): PageView {
  const turn = pageTurnId === undefined ? undefined : turns.find(({id}) => id === pageTurnId);
  const surfaces = turn?.response.surfaces ?? [];
  return {
    turn,
    surfaces,
    searchSurfaceId: surfaces.find(({rootComponentType}) => rootComponentType === SEARCH_ROOT)
      ?.surfaceId,
  };
}
