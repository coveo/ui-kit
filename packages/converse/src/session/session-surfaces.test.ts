import {describe, expect, it} from 'vitest';
import {createTurn, deriveSurfaces} from './fold.js';
import {
  INITIALIZATION,
  abandonedPlaceholderIds,
  deriveSessionSurfaces,
} from './session-surfaces.js';
import type {Activity, SessionInitialization, Turn} from './types.js';

const create = (surfaceId: string, component = 'ProductCarousel') => ({
  version: '1.0',
  createSurface: {surfaceId, catalogId: 'catalog', components: [{id: 'root', component}]},
});
const remove = (surfaceId: string) => ({version: '1.0', deleteSurface: {surfaceId}});

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

const T1 = {kind: 'turn', turnId: 't1'} as const;

const ids = (surfaces: readonly {surfaceId: string}[]) => surfaces.map(({surfaceId}) => surfaceId);

describe('deriveSessionSurfaces', () => {
  it('lists every live surface of the session, in creation order', () => {
    const view = deriveSessionSurfaces({
      turns: [turn('t1', [create('search')]), turn('t2', [create('answer')])],
    });

    expect(ids(view.surfaces)).toEqual(['search', 'answer']);
  });

  it('narrows each turn to the live surfaces it created', () => {
    const view = deriveSessionSurfaces({
      turns: [turn('t1', [create('search')]), turn('t2', [create('answer')])],
    });

    expect(view.turns.map((candidate) => ids(candidate.response.surfaces))).toEqual([
      ['search'],
      ['answer'],
    ]);
  });

  it('removes a surface a later turn deletes from the turn that created it', () => {
    const view = deriveSessionSurfaces({
      turns: [
        turn('t1', [create('search'), create('placeholder')]),
        turn('t2', [remove('placeholder')]),
      ],
    });

    expect(ids(view.surfaces)).toEqual(['search']);
    expect(ids(view.turns[0].response.surfaces)).toEqual(['search']);
    expect(view.ownerTurnIds.has('placeholder')).toBe(false);
  });

  it('keeps a surface a later turn creates again under its live id with the turn that created it', () => {
    const view = deriveSessionSurfaces({
      turns: [turn('t1', [create('search')]), turn('t2', [create('answer')], [create('search')])],
    });

    expect(ids(view.surfaces)).toEqual(['answer', 'search']);
    expect(view.turns.map((candidate) => ids(candidate.response.surfaces))).toEqual([
      ['search'],
      ['answer'],
    ]);
    expect(view.ownerTurnIds.get('search')).toBe('t1');
  });

  it('gives a surface a later turn creates again after its deletion to that turn', () => {
    const view = deriveSessionSurfaces({
      turns: [
        turn('t1', [create('carousel')]),
        turn('t2', [remove('carousel'), create('carousel')]),
      ],
    });

    expect(view.turns.map((candidate) => ids(candidate.response.surfaces))).toEqual([
      [],
      ['carousel'],
    ]);
    expect(view.ownerTurnIds.get('carousel')).toBe('t2');
  });

  it('gives a surface to the turn that first creates it, even without a catalog', () => {
    const view = deriveSessionSurfaces({
      turns: [
        turn('t1', [{version: '1.0', createSurface: {surfaceId: 'carousel', components: []}}]),
        turn('t2', [create('carousel')]),
      ],
    });

    expect(view.turns.map((candidate) => ids(candidate.response.surfaces))).toEqual([
      ['carousel'],
      [],
    ]);
  });

  it('records the turn that created a surface the projection leaves out', () => {
    const view = deriveSessionSurfaces({
      turns: [
        turn('t1', [{version: '1.0', createSurface: {surfaceId: 'no-catalog', components: []}}]),
      ],
    });

    expect(view.surfaces).toEqual([]);
    expect(view.ownerTurnIds.get('no-catalog')).toBe('t1');
  });

  it('marks read-only a surface a restored activity created, until a later run creates it again', () => {
    const restored = turn('t1', [create('answer')]);
    const restoredActivities = new Set(restored.response.activities);

    const view = deriveSessionSurfaces(
      {turns: [restored]},
      undefined,
      undefined,
      restoredActivities
    );
    const recreated = deriveSessionSurfaces(
      {turns: [restored, turn('t2', [create('answer')])]},
      undefined,
      undefined,
      restoredActivities
    );

    expect(view.surfaces[0].readOnly).toBe(true);
    expect(recreated.surfaces[0].readOnly).toBeUndefined();
    expect(recreated.readOnlySurfaceIds.size).toBe(0);
  });

  describe('loading placeholders', () => {
    const placeholder = (surfaceId: string) => ({
      version: '1.0',
      createSurface: {
        surfaceId,
        catalogId: 'catalog',
        components: [{id: 'root', component: 'ProductCarousel'}],
        dataModel: {isLoading: true},
      },
    });
    const withStatus = (status: Turn['status']) => ({
      ...turn('t1', [placeholder('skeleton'), create('content')]),
      status,
    });

    it('lists the placeholders of a turn while it streams', () => {
      const view = deriveSessionSurfaces({turns: [withStatus('streaming')]});

      expect(ids(view.surfaces)).toEqual(['skeleton', 'content']);
    });

    it('lists the placeholders of a turn the request in flight streams into', () => {
      const view = deriveSessionSurfaces({turns: [withStatus('complete')]}, T1);

      expect(ids(view.turns[0].response.surfaces)).toEqual(['skeleton', 'content']);
    });

    it.each(['complete', 'error'] as const)(
      'drops the placeholders a %s turn left behind',
      (status) => {
        const view = deriveSessionSurfaces({turns: [withStatus(status)]});

        expect(ids(view.surfaces)).toEqual(['content']);
        expect(ids(view.turns[0].response.surfaces)).toEqual(['content']);
      }
    );

    it('keeps a placeholder the turn had abandoned out while a later request streams into it', () => {
      const runs = {turns: [withStatus('complete')]};
      const abandoned = abandonedPlaceholderIds(runs, T1);

      const view = deriveSessionSurfaces(runs, T1, abandoned);

      expect([...abandoned]).toEqual(['skeleton']);
      expect(ids(view.surfaces)).toEqual(['content']);
      expect(ids(view.turns[0].response.surfaces)).toEqual(['content']);
    });

    it('abandons nothing in a turn that is still streaming', () => {
      expect([...abandonedPlaceholderIds({turns: [withStatus('streaming')]}, T1)]).toEqual([]);
    });

    it('lists a placeholder a later run creates again while that run streams, under its first turn', () => {
      const runs = {turns: [turn('t1', [create('search')]), turn('t2', [placeholder('search')])]};
      const T2 = {kind: 'turn', turnId: 't2'} as const;

      const streaming = deriveSessionSurfaces(runs, T2);

      expect(ids(streaming.turns[0].response.surfaces)).toEqual(['search']);
      expect(ids(deriveSessionSurfaces(runs).surfaces)).toEqual([]);
      expect([...abandonedPlaceholderIds(runs, T2)]).toEqual(['search']);
    });

    it('hands a placeholder to a later run that creates it again without a catalog', () => {
      const noCatalog = {
        version: '1.0',
        createSurface: {
          surfaceId: 'skeleton',
          components: [{id: 'root', component: 'ProductCarousel'}],
        },
      };
      const runs = {turns: [turn('t1', [placeholder('skeleton')]), turn('t2', [noCatalog])]};
      const T2 = {kind: 'turn', turnId: 't2'} as const;

      expect(ids(deriveSessionSurfaces(runs, T2).surfaces)).toEqual(['skeleton']);
      expect([...abandonedPlaceholderIds(runs, T1)]).toEqual([]);
      expect([...abandonedPlaceholderIds(runs, T2)]).toEqual([]);
    });
  });

  describe('the initialization', () => {
    function initialization(
      status: SessionInitialization['status'],
      ...messageBatches: unknown[][]
    ): SessionInitialization {
      return {status, activities: turn('init', ...messageBatches).response.activities};
    }
    const skeleton = {
      version: '1.0',
      createSurface: {
        surfaceId: 'shell-skeleton',
        catalogId: 'catalog',
        components: [{id: 'root', component: 'SessionShell'}],
        dataModel: {isLoading: true},
      },
    };

    it('lists the surfaces it created first, in no turn', () => {
      const view = deriveSessionSurfaces({
        initialization: initialization('complete', [create('shell', 'SessionShell')]),
        turns: [turn('t1', [create('search')])],
      });

      expect(ids(view.surfaces)).toEqual(['shell', 'search']);
      expect(ids(view.turns[0].response.surfaces)).toEqual(['search']);
      expect(view.ownerTurnIds.has('shell')).toBe(false);
    });

    it('keeps a surface a turn creates again under its live id in no turn', () => {
      const view = deriveSessionSurfaces({
        initialization: initialization('complete', [create('shell', 'SessionShell')]),
        turns: [turn('t1', [create('shell', 'SessionShell')])],
      });

      expect(ids(view.surfaces)).toEqual(['shell']);
      expect(ids(view.turns[0].response.surfaces)).toEqual([]);
      expect(view.ownerTurnIds.has('shell')).toBe(false);
    });

    it('lists a placeholder a turn creates again under its live id while that turn streams', () => {
      const runs = {
        initialization: initialization('complete', [create('shell', 'SessionShell')]),
        turns: [
          turn('t1', [
            {...skeleton, createSurface: {...skeleton.createSurface, surfaceId: 'shell'}},
          ]),
        ],
      };

      expect(ids(deriveSessionSurfaces(runs, T1).surfaces)).toEqual(['shell']);
      expect(ids(deriveSessionSurfaces(runs, T1).turns[0].response.surfaces)).toEqual([]);
      expect(ids(deriveSessionSurfaces(runs, INITIALIZATION).surfaces)).toEqual([]);
      expect(ids(deriveSessionSurfaces(runs).surfaces)).toEqual([]);
      expect([...abandonedPlaceholderIds(runs, T1)]).toEqual(['shell']);
      expect([...abandonedPlaceholderIds(runs, INITIALIZATION)]).toEqual([]);
    });

    it('lists its placeholders only while it streams, or while a request streams into it', () => {
      const streaming = deriveSessionSurfaces({
        initialization: initialization('streaming', [skeleton]),
        turns: [],
      });
      const answered = {initialization: initialization('complete', [skeleton]), turns: []};

      expect(ids(streaming.surfaces)).toEqual(['shell-skeleton']);
      expect(ids(deriveSessionSurfaces(answered).surfaces)).toEqual([]);
      expect(ids(deriveSessionSurfaces(answered, INITIALIZATION).surfaces)).toEqual([
        'shell-skeleton',
      ]);
      expect([...abandonedPlaceholderIds(answered, INITIALIZATION)]).toEqual(['shell-skeleton']);
    });
  });
});
