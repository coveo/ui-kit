import {describe, expect, it} from 'vitest';
import {makeSurfaces, makeTurn} from '../../../demo-schema-react/src/test/turn-fixtures.js';
import {buildPageView} from './view-surfaces.js';

function turn(id: string, ...surfaceIds: string[]) {
  return makeTurn({id, response: {surfaces: makeSurfaces(...surfaceIds)}});
}

const carousel = (surfaceId: string) => ({
  ...makeSurfaces(surfaceId)[0],
  rootComponentType: 'ProductCarousel',
});

const idsOf = (surfaces: readonly {surfaceId: string}[]) =>
  surfaces.map(({surfaceId}) => surfaceId);

describe('buildPageView', () => {
  it("draws the surfaces of the page's own turn, and nothing of another turn", () => {
    const view = buildPageView([turn('t1', 'ui-a', 'ui-b'), turn('t2', 'ui-c')], 't1');

    expect(view.turn?.id).toBe('t1');
    expect(idsOf(view.surfaces)).toEqual(['ui-a', 'ui-b']);
  });

  it('draws nothing before the session opens the page turn', () => {
    const view = buildPageView([turn('t1', 'ui-a')], undefined);

    expect(view.turn).toBeUndefined();
    expect(view.surfaces).toEqual([]);
    expect(view.searchSurfaceId).toBeUndefined();
  });

  it('names the search surface the page turn created, for the URL', () => {
    const search = makeTurn({
      id: 't1',
      response: {
        surfaces: [carousel('ui-answer'), ...makeSurfaces('ui-search')],
      },
    });

    expect(buildPageView([search], 't1').searchSurfaceId).toBe('ui-search');
    const answer = makeTurn({id: 't2', response: {surfaces: [carousel('ui-answer')]}});
    expect(buildPageView([answer], 't2').searchSurfaceId).toBeUndefined();
  });
});
