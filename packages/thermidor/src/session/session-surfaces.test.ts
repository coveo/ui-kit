import {describe, expect, it} from 'vitest';
import {createTurn, deriveSurfaces} from './fold.js';
import {deriveSessionSurfaces} from './session-surfaces.js';
import type {Activity, Turn} from './types.js';

const create = (surfaceId: string, component = 'ProductCarousel') => ({
  version: 'v1.0',
  createSurface: {surfaceId, catalogId: 'catalog', components: [{id: 'root', component}]},
});
const remove = (surfaceId: string) => ({version: 'v1.0', deleteSurface: {surfaceId}});

function turn(id: string, ...messageBatches: unknown[][]): Turn {
  const activities: Activity[] = messageBatches.map((messages, index) => ({
    id: `${id}-${index}`,
    kind: 'a2ui-surface',
    replace: false,
    payload: {messages},
  }));
  const base = createTurn(id, {prompt: id});
  return {
    ...base,
    status: 'complete',
    response: {...base.response, activities, surfaces: deriveSurfaces(activities)},
  };
}

const ids = (surfaces: readonly {surfaceId: string}[]) => surfaces.map(({surfaceId}) => surfaceId);

describe('deriveSessionSurfaces', () => {
  it('lists every live surface of the session, in creation order', () => {
    const view = deriveSessionSurfaces([
      turn('t1', [create('search')]),
      turn('t2', [create('answer')]),
    ]);

    expect(ids(view.surfaces)).toEqual(['search', 'answer']);
  });

  it('narrows each turn to the live surfaces it created', () => {
    const view = deriveSessionSurfaces([
      turn('t1', [create('search')]),
      turn('t2', [create('answer')]),
    ]);

    expect(view.turns.map((candidate) => ids(candidate.response.surfaces))).toEqual([
      ['search'],
      ['answer'],
    ]);
  });

  it('removes a surface a later turn deletes from the turn that created it', () => {
    const view = deriveSessionSurfaces([
      turn('t1', [create('search'), create('placeholder')]),
      turn('t2', [remove('placeholder')]),
    ]);

    expect(ids(view.surfaces)).toEqual(['search']);
    expect(ids(view.turns[0].response.surfaces)).toEqual(['search']);
    expect(view.ownerTurnIds.has('placeholder')).toBe(false);
  });

  it('gives a surface a later turn creates again under the same id to that turn', () => {
    const view = deriveSessionSurfaces([
      turn('t1', [create('carousel')]),
      turn('t2', [create('carousel')]),
    ]);

    expect(ids(view.surfaces)).toEqual(['carousel']);
    expect(view.turns.map((candidate) => ids(candidate.response.surfaces))).toEqual([
      [],
      ['carousel'],
    ]);
    expect(view.ownerTurnIds.get('carousel')).toBe('t2');
  });

  it('records the turn that created a surface the projection leaves out', () => {
    const view = deriveSessionSurfaces([
      turn('t1', [{version: 'v1.0', createSurface: {surfaceId: 'no-catalog', components: []}}]),
    ]);

    expect(view.surfaces).toEqual([]);
    expect(view.ownerTurnIds.get('no-catalog')).toBe('t1');
  });
});
