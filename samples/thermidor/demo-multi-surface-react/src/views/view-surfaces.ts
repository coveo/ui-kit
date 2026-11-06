import type {DiscoveredSurface, Turn} from '@coveo/thermidor';
import type {StorefrontView, TurnViews} from '../session/storefront-session.js';

/** The view of the assistant's conversation: the assistant layout and the chat panel send on it. */
export const ASSISTANT_VIEW: StorefrontView = 'storefront-preview-assistant';

/** The session shell, where the search box sends: the server routes a prompt by its intent. */
const SHELL_VIEW: StorefrontView = 'storefront-preview';

/** The root component of a search surface, drawn as a page's results. */
const SEARCH_ROOT = 'CommerceSearch';

export function isSearchSurface({rootComponentType}: DiscoveredSurface): boolean {
  return rootComponentType === SEARCH_ROOT;
}

/** Whether a turn drew a search surface: its results open the search layout. */
export function drawsSearch(turn: Turn): boolean {
  return turn.response.surfaces.some(isSearchSurface);
}

/** What the shopper asked in a turn: the prompt, or the text of the chip whose action opened it. */
export function shopperText({input}: Turn): string | undefined {
  const text = input.prompt ?? (input.action?.context as {text?: unknown} | undefined)?.text;
  return typeof text === 'string' ? text : undefined;
}

/** A view drawn on one page visit, such as the search page's results or its chat panel. */
interface VisitView {
  visitId: number;
  view: StorefrontView;
}

/**
 * Where every surface of the session is drawn. The server says nothing about placement: the app
 * remembers which view, on which page visit, sent each turn, and a view draws the surfaces its own
 * turns created. One page can hold several views, such as the search page's results and its chat
 * panel, told apart by the view each turn was sent on.
 */
export interface ViewSurfaces {
  /** The live surfaces the turns of one view created, in order. */
  surfacesOfView(view: VisitView): readonly DiscoveredSurface[];
  /** The turns of one view, oldest first. */
  turnsOfView(view: VisitView): readonly Turn[];
  /** The turns of one page visit, whichever of its views sent them, oldest first. */
  turnsOfVisit(visitId: number): readonly Turn[];
  /**
   * The shopper's conversation with the assistant across page visits, such as the assistant layout
   * and the search layouts it opened, oldest first: the assistant view's turns of these visits,
   * and the turns on the session shell, but for a search the search box opened its page with.
   */
  conversationOf(visitIds: ReadonlySet<number>): readonly Turn[];
  /**
   * The turn whose search a search page shows: the latest that drew a search surface, from the
   * turn that opened the page (its own search, or the conversation turn whose search it shows)
   * on, among that turn's visit and the page's own.
   */
  resultsOf(visitId: number, openingTurnId?: string): Turn | undefined;
  /** The view that draws a surface: that of the turn that created it. */
  viewOfSurface(surfaceId: string): VisitView | undefined;
}

export function buildViewSurfaces(
  turns: readonly Turn[],
  {turnViews, turnVisits}: TurnViews
): ViewSurfaces {
  const turnsOfView = ({visitId, view}: VisitView) =>
    turns.filter((turn) => turnVisits.get(turn.id) === visitId && turnViews.get(turn.id) === view);

  return {
    surfacesOfView: (view) => turnsOfView(view).flatMap((turn) => turn.response.surfaces),
    turnsOfView,
    turnsOfVisit: (visitId) => turns.filter((turn) => turnVisits.get(turn.id) === visitId),
    conversationOf(visitIds) {
      const opening = new Set<string>();
      const opened = new Set<number | undefined>();
      for (const turn of turns) {
        if (!opened.has(turnVisits.get(turn.id))) {
          opened.add(turnVisits.get(turn.id));
          opening.add(turn.id);
        }
      }
      return turns.filter((turn) => {
        const view = turnViews.get(turn.id);
        const pageSearch = opening.has(turn.id) && drawsSearch(turn);
        return (
          visitIds.has(turnVisits.get(turn.id) ?? -1) &&
          (view === ASSISTANT_VIEW || (view === SHELL_VIEW && !pageSearch))
        );
      });
    },
    resultsOf(visitId, openingTurnId) {
      const start = openingTurnId
        ? turns.findIndex((turn) => turn.id === openingTurnId)
        : turns.findIndex((turn) => turnVisits.get(turn.id) === visitId);
      if (start < 0) {
        return undefined;
      }
      const visits = new Set([visitId, turnVisits.get(turns[start].id)]);
      return turns
        .slice(start)
        .filter((turn) => visits.has(turnVisits.get(turn.id)) && drawsSearch(turn))
        .at(-1);
    },
    viewOfSurface(surfaceId) {
      const turn = turns.find(({response}) =>
        response.surfaces.some((surface) => surface.surfaceId === surfaceId)
      );
      const visitId = turn && turnVisits.get(turn.id);
      const view = turn && turnViews.get(turn.id);
      return visitId === undefined || view === undefined ? undefined : {visitId, view};
    },
  };
}
