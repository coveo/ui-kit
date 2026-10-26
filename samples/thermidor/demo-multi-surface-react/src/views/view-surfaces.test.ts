import {describe, expect, it} from 'vitest';
import type {Turn} from '@coveo/thermidor';
import {makeSurfaces, makeTurn} from '../../../demo-schema-react/src/test/turn-fixtures.js';
import {buildViewSurfaces} from './view-surfaces.js';

function turn(id: string, ...surfaceIds: string[]) {
  return makeTurn({id, response: {surfaces: makeSurfaces(...surfaceIds)}});
}

/** The view surfaces of `turns`, each tagged with the page visit that sent it. */
function views(turns: Turn[], visits: Record<string, number>) {
  return buildViewSurfaces(turns, {turnVisits: new Map(Object.entries(visits))});
}

const idsOf = (surfaces: readonly {surfaceId: string}[]) =>
  surfaces.map(({surfaceId}) => surfaceId);

describe('buildViewSurfaces', () => {
  it("draws each page visit's own surfaces, and nothing of another visit", () => {
    const result = views([turn('t1', 'ui-home-1', 'ui-home-2'), turn('t2', 'ui-answer')], {
      t1: 1,
      t2: 2,
    });

    expect(idsOf(result.surfacesOfVisit(1))).toEqual(['ui-home-1', 'ui-home-2']);
    expect(idsOf(result.surfacesOfVisit(2))).toEqual(['ui-answer']);
    expect(result.turnsOfVisit(2).map(({id}) => id)).toEqual(['t2']);
  });

  it('draws the surfaces of every turn of a visit, in turn order', () => {
    const result = views([turn('t1', 'ui-a'), turn('t2', 'ui-b'), turn('t3', 'ui-c')], {
      t1: 1,
      t2: 2,
      t3: 1,
    });

    expect(idsOf(result.surfacesOfVisit(1))).toEqual(['ui-a', 'ui-c']);
  });

  it('draws nothing for a turn no visit sent', () => {
    expect(views([turn('t1', 'ui-a')], {}).surfacesOfVisit(1)).toEqual([]);
  });

  it('finds the turn that created a surface', () => {
    const result = views([turn('t1', 'ui-a'), turn('t2', 'ui-b')], {t1: 1, t2: 2});

    expect(result.turnOfSurface('ui-b')?.id).toBe('t2');
    expect(result.turnOfSurface('ui-gone')).toBeUndefined();
  });
});
