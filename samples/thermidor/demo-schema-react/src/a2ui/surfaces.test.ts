import {describe, expect, it} from 'vitest';
import {getA2UIMessages} from './surfaces.js';

describe('getA2UIMessages', () => {
  it('passes raw A2-UI operations through from multiple activities', () => {
    const operation1 = {version: 'v0.9', createSurface: {surfaceId: 'surface-1'}};
    const operation2 = {version: 'v0.9', createSurface: {surfaceId: 'surface-2'}};

    expect(
      getA2UIMessages([
        {
          id: 'activity-1',
          kind: 'a2ui-surface',
          replace: false,
          payload: {a2ui_operations: [operation1]},
        },
        {
          id: 'activity-2',
          kind: 'a2ui-surface',
          replace: false,
          payload: {a2ui_operations: [operation2]},
        },
      ])
    ).toEqual([operation1, operation2]);
  });

  it('honors per-activity-id replacement semantics', () => {
    const firstVersion = {version: 'v0.9', createSurface: {surfaceId: 'old'}};
    const updatedVersion = {version: 'v0.9', createSurface: {surfaceId: 'updated'}};

    expect(
      getA2UIMessages([
        {
          id: 'activity-1',
          kind: 'a2ui-surface',
          replace: false,
          payload: {a2ui_operations: [firstVersion]},
        },
        {
          id: 'activity-1',
          kind: 'a2ui-surface',
          replace: true,
          payload: {a2ui_operations: [updatedVersion]},
        },
      ])
    ).toEqual([updatedVersion]);
  });

  it('converts v1.0 messages to v0.9 format', () => {
    const result = getA2UIMessages([
      {
        id: 'activity-1',
        kind: 'a2ui-surface',
        replace: false,
        payload: {
          messages: [
            {
              version: 'v1.0',
              createSurface: {
                surfaceId: 'my-surface',
                components: [{id: 'root', component: 'ProductCarousel', props: {controllers: {}}}],
              },
            },
          ],
        },
      },
    ]);

    expect(result[0]).toEqual({version: 'v0.9', createSurface: {surfaceId: 'my-surface'}});
    expect(result[1]).toEqual({
      version: 'v0.9',
      updateComponents: {
        surfaceId: 'my-surface',
        components: [{id: 'root', component: 'ProductCarousel', controllers: {}}],
      },
    });
  });

  it('ignores activities that are not a2ui-surface', () => {
    expect(
      getA2UIMessages([
        {
          id: 'activity-1',
          kind: 'text',
          replace: false,
          payload: {content: 'hello'},
        },
      ])
    ).toEqual([]);
  });
});
