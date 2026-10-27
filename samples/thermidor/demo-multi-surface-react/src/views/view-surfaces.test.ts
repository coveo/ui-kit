import {describe, expect, it} from 'vitest';
import type {Turn} from '@coveo/thermidor';
import {makeSurfaces, makeTurn} from '../../../demo-schema-react/src/test/turn-fixtures.js';
import type {StorefrontView} from '../session/storefront-session.js';
import {buildViewSurfaces} from './view-surfaces.js';

function turn(id: string, ...surfaceIds: string[]) {
  return makeTurn({id, response: {surfaces: makeSurfaces(...surfaceIds)}});
}

/** The view surfaces of `turns`, each tagged with the view and page visit that sent it. */
function views(turns: Turn[], tags: Record<string, [StorefrontView, number]>) {
  const entries = Object.entries(tags);
  return buildViewSurfaces(turns, {
    turnViews: new Map(entries.map(([id, [view]]) => [id, view])),
    turnVisits: new Map(entries.map(([id, [, visitId]]) => [id, visitId])),
  });
}

const idsOf = (surfaces: readonly {surfaceId: string}[]) =>
  surfaces.map(({surfaceId}) => surfaceId);

const SEARCH: StorefrontView = 'storefront-preview-search';
const ASSISTANT: StorefrontView = 'storefront-preview-assistant';

const search = (visitId: number) => ({visitId, view: SEARCH});
const assistant = (visitId: number) => ({visitId, view: ASSISTANT});

describe('buildViewSurfaces', () => {
  it("draws each page visit's own surfaces, and nothing of another visit", () => {
    const result = views([turn('t1', 'ui-search-1', 'ui-search-2'), turn('t2', 'ui-answer')], {
      t1: [SEARCH, 1],
      t2: [ASSISTANT, 2],
    });

    expect(idsOf(result.surfacesOfView(search(1)))).toEqual(['ui-search-1', 'ui-search-2']);
    expect(idsOf(result.surfacesOfView(assistant(2)))).toEqual(['ui-answer']);
    expect(result.turnsOfView(assistant(2)).map(({id}) => id)).toEqual(['t2']);
  });

  it('draws the surfaces of every turn of a view, in turn order', () => {
    const result = views([turn('t1', 'ui-a'), turn('t2', 'ui-b'), turn('t3', 'ui-c')], {
      t1: [SEARCH, 1],
      t2: [SEARCH, 2],
      t3: [SEARCH, 1],
    });

    expect(idsOf(result.surfacesOfView(search(1)))).toEqual(['ui-a', 'ui-c']);
  });

  it('tells apart the views of one page visit by the view each turn was sent on', () => {
    const result = views([turn('t1', 'ui-results'), turn('t2', 'ui-answer'), turn('t3')], {
      t1: [SEARCH, 1],
      t2: [ASSISTANT, 1],
      t3: [ASSISTANT, 1],
    });

    expect(idsOf(result.surfacesOfView(search(1)))).toEqual(['ui-results']);
    expect(idsOf(result.surfacesOfView(assistant(1)))).toEqual(['ui-answer']);
    expect(result.turnsOfView(assistant(1)).map(({id}) => id)).toEqual(['t2', 't3']);
  });

  it('finds the view that draws a surface from the turn that created it', () => {
    const result = views([turn('t1', 'ui-results'), turn('t2', 'ui-answer')], {
      t1: [SEARCH, 1],
      t2: [ASSISTANT, 1],
    });

    expect(result.viewOfSurface('ui-results')).toEqual(search(1));
    expect(result.viewOfSurface('ui-answer')).toEqual(assistant(1));
    expect(result.viewOfSurface('ui-gone')).toBeUndefined();
  });

  it('draws nothing for a turn no view sent', () => {
    const result = views([turn('t1', 'ui-a')], {});

    expect(result.surfacesOfView(search(1))).toEqual([]);
    expect(result.viewOfSurface('ui-a')).toBeUndefined();
  });
});
