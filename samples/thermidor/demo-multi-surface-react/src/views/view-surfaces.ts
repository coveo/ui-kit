import type {DiscoveredSurface, Turn} from '@coveo/thermidor';
import type {StorefrontView, TurnViews} from '../session/storefront-session.js';

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
