import type {DiscoveredSurface, Turn} from '@coveo/thermidor';

/**
 * Where every surface of the session is drawn. The server says nothing about placement: the app
 * remembers which page visit sent each turn, and a page draws the surfaces its own turns created.
 */
export interface ViewSurfaces {
  /** The live surfaces the turns of one page visit created, in order. */
  surfacesOfVisit(visitId: number): readonly DiscoveredSurface[];
  /** The turns of one page visit, oldest first. */
  turnsOfVisit(visitId: number): readonly Turn[];
  /** The turn that created a live surface, which the surface belongs to. */
  turnOfSurface(surfaceId: string): Turn | undefined;
}

interface TurnViews {
  turnVisits: ReadonlyMap<string, number>;
}

export function buildViewSurfaces(turns: readonly Turn[], {turnVisits}: TurnViews): ViewSurfaces {
  const turnsOfVisit = (visitId: number) =>
    turns.filter((turn) => turnVisits.get(turn.id) === visitId);

  return {
    surfacesOfVisit: (visitId) => turnsOfVisit(visitId).flatMap((turn) => turn.response.surfaces),
    turnsOfVisit,
    turnOfSurface: (surfaceId) =>
      turns.find((turn) =>
        turn.response.surfaces.some((surface) => surface.surfaceId === surfaceId)
      ),
  };
}
