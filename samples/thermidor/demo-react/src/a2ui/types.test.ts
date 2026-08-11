import {describe, expect, it} from 'vitest';
import {parseSurfaceSnapshot, parseSurfaceSnapshots} from './types.js';

function snapshot(...messages: Record<string, unknown>[]) {
  return {messages};
}

function message(operation: Record<string, unknown>) {
  return {version: 'v1.0', ...operation};
}

describe('parseSurfaceSnapshots', () => {
  it('creates renderable surfaces from versioned createSurface messages', () => {
    expect(
      parseSurfaceSnapshot(
        snapshot(
          message({
            createSurface: {
              surfaceId: 'products',
              components: [
                {
                  id: 'root',
                  component: 'ProductCarousel',
                  componentProps: {heading: 'Featured'},
                },
              ],
              dataModel: {products: ['shoe']},
            },
          })
        )
      )
    ).toEqual([
      {
        surfaceId: 'products',
        rootId: 'root',
        componentType: 'ProductCarousel',
        componentProps: {heading: 'Featured'},
        data: {products: ['shoe']},
      },
    ]);
  });

  it('applies updates from later activities to their previously created surface', () => {
    const result = parseSurfaceSnapshots([
      snapshot(
        message({
          createSurface: {
            surfaceId: 'actions',
            components: [{id: 'root', component: 'ProductCarousel'}],
            dataModel: {status: 'loading', count: 1},
          },
        })
      ),
      snapshot(
        message({
          updateComponents: {
            surfaceId: 'actions',
            components: [{id: 'next-actions', component: 'NextActionsBar'}],
          },
        }),
        message({
          updateDataModel: {
            surfaceId: 'actions',
            path: '/status',
            value: 'ready',
          },
        })
      ),
    ]);

    expect(result).toEqual([
      {
        surfaceId: 'actions',
        rootId: 'next-actions',
        componentType: 'NextActionsBar',
        componentProps: {},
        data: {status: 'ready', count: 1},
      },
    ]);
  });

  it('replaces the full data model for an empty path and removes addressed values for null', () => {
    const result = parseSurfaceSnapshot(
      snapshot(
        message({
          createSurface: {
            surfaceId: 'data',
            dataModel: {status: 'initial', stale: true},
          },
        }),
        message({
          updateDataModel: {
            surfaceId: 'data',
            path: '/',
            value: {status: 'replacement', removable: true},
          },
        }),
        message({
          updateDataModel: {surfaceId: 'data', path: '/removable', value: null},
        })
      )
    );

    expect(result[0].data).toEqual({status: 'replacement'});
  });

  it('removes a surface on deleteSurface', () => {
    expect(
      parseSurfaceSnapshot(
        snapshot(
          message({createSurface: {surfaceId: 'removable'}}),
          message({deleteSurface: {surfaceId: 'removable'}})
        )
      )
    ).toEqual([]);
  });

  it('ignores old, malformed, and unsupported messages while preserving valid siblings', () => {
    expect(
      parseSurfaceSnapshot({
        operations: [{createSurface: {surfaceId: 'legacy'}}],
        messages: [
          {version: 'v0.8', createSurface: {surfaceId: 'old'}},
          {
            version: 'v1.0',
            createSurface: {surfaceId: 'invalid'},
            deleteSurface: {surfaceId: 'invalid'},
          },
          {version: 'v1.0', createSurface: {surfaceId: 42}},
          message({createSurface: {surfaceId: 'valid', dataModel: {ok: true}}}),
        ],
      })
    ).toEqual([
      {
        surfaceId: 'valid',
        rootId: 'root',
        componentType: '',
        componentProps: {},
        data: {ok: true},
      },
    ]);
  });

  it('returns no surfaces for snapshots without versioned messages', () => {
    expect(parseSurfaceSnapshot({})).toEqual([]);
    expect(parseSurfaceSnapshot({messages: 'invalid'})).toEqual([]);
    expect(parseSurfaceSnapshot({messages: []})).toEqual([]);
  });
});
