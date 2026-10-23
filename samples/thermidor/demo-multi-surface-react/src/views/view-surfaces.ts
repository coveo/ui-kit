import type {Turn} from '@coveo/thermidor';
import {
  buildSurfaceStream,
  type SurfaceStream,
} from '../../../demo-schema-react/src/a2ui/surface-stream.js';
import {SHELL_CONTEXT, type StorefrontContext} from '../session/turn-scheduler.js';

/**
 * Where every surface of the session is drawn. The server says nothing about placement: the app
 * remembers which view sent each turn, and a view draws the surfaces its own turns created.
 */
export interface ViewSurfaces {
  /** The whole session's renderer stream, one render id per surface (`<turn id>/<surface id>`). */
  stream: SurfaceStream;
  /** The suggestions popover's surfaces: those of the latest shell turn that created any. */
  suggestions: readonly string[];
  /** The surfaces the turns of one page visit created, in order. */
  surfacesOfVisit(visitId: number): readonly string[];
  /** The turns of one page visit, oldest first. */
  turnsOfVisit(visitId: number): readonly Turn[];
  /**
   * The session's latest turn. The session only sends actions for the surfaces of that turn, so
   * every other surface is read-only (see the README's known limits).
   */
  latestTurnId: string | undefined;
}

interface TurnViews {
  turnContexts: ReadonlyMap<string, StorefrontContext>;
  turnVisits: ReadonlyMap<string, number>;
}

export function buildViewSurfaces(
  turns: readonly Turn[],
  {turnContexts, turnVisits}: TurnViews
): ViewSurfaces {
  const stream = buildSurfaceStream(turns);
  const surfacesOf = (turn: Turn) => stream.surfacesByTurn.get(turn.id) ?? [];
  const latestShellTurn = turns.findLast(
    (turn) => turnContexts.get(turn.id) === SHELL_CONTEXT && surfacesOf(turn).length > 0
  );
  const turnsOfVisit = (visitId: number) =>
    turns.filter((turn) => turnVisits.get(turn.id) === visitId);

  return {
    stream,
    suggestions: latestShellTurn ? surfacesOf(latestShellTurn) : [],
    surfacesOfVisit: (visitId) => turnsOfVisit(visitId).flatMap(surfacesOf),
    turnsOfVisit,
    latestTurnId: turns.at(-1)?.id,
  };
}
