import {describe, expect, it} from 'vitest';
import type {Turn} from '@coveo/thermidor';
import {makeTurn} from '../../../demo-schema-react/src/test/turn-fixtures.js';
import {buildSurfaceLayout, findSurfaceByRoot, surfacesInSlot} from './surface-layout.js';

interface SurfaceSpec {
  surfaceId: string;
  slot?: string;
  root?: string;
}

const v09Create = (surfaceId: string) => ({version: 'v0.9', createSurface: {surfaceId}});
const v09Update = (surfaceId: string) => ({
  version: 'v0.9',
  updateDataModel: {surfaceId, path: '/state/root', value: {}},
});
const v09Delete = (surfaceId: string) => ({version: 'v0.9', deleteSurface: {surfaceId}});

/**
 * A turn as the session folds it: the raw v1.0 `createSurface` (with its layout hint) in
 * `activities`, and its v0.9 projection in `a2uiMessages`.
 */
function turn(
  id: string,
  {
    created = [],
    messages = [],
  }: {created?: SurfaceSpec[]; messages?: Record<string, unknown>[]} = {}
): Turn {
  return makeTurn({
    id,
    response: {
      activities: [
        {
          id: `${id}-activity`,
          kind: 'a2ui-surface',
          replace: true,
          payload: {
            messages: created.map(({surfaceId, slot, root = 'ProductCarousel'}) => ({
              version: 'v1.0',
              createSurface: {
                surfaceId,
                catalogId: 'catalog',
                ...(slot ? {metadata: {extensions: {coveo_layout: {slot}}}} : {}),
                components: [{id: 'root', component: root}],
              },
            })),
          },
        },
      ],
      a2uiMessages: [...created.map(({surfaceId}) => v09Create(surfaceId)), ...messages],
    },
  });
}

describe('buildSurfaceLayout', () => {
  it('places each surface in the slot its createSurface metadata asks for', () => {
    const layout = buildSurfaceLayout([
      turn('t1', {
        created: [
          {surfaceId: 'ui-cart', slot: 'header.cart', root: 'Cart'},
          {surfaceId: 'ui-home', slot: 'main'},
        ],
      }),
    ]);

    expect(layout.surfaces).toEqual([
      {surfaceId: 'ui-cart', slot: 'header.cart', rootComponent: 'Cart', turnIndex: 0},
      {surfaceId: 'ui-home', slot: 'main', rootComponent: 'ProductCarousel', turnIndex: 0},
    ]);
    expect(surfacesInSlot(layout, 'main').map((surface) => surface.surfaceId)).toEqual(['ui-home']);
  });

  it('keeps a surface alive across turns, so a later turn can update it', () => {
    const layout = buildSurfaceLayout([
      turn('t1', {created: [{surfaceId: 'ui-suggestions', slot: 'header.suggestions'}]}),
      turn('t2', {messages: [v09Update('ui-suggestions')]}),
    ]);

    expect(layout.surfaces.map((surface) => surface.surfaceId)).toEqual(['ui-suggestions']);
    expect(layout.messages).toEqual([v09Create('ui-suggestions'), v09Update('ui-suggestions')]);
  });

  it('removes a surface a later turn deletes, and keeps the others', () => {
    const layout = buildSurfaceLayout([
      turn('t1', {
        created: [
          {surfaceId: 'ui-cart', slot: 'header.cart', root: 'Cart'},
          {surfaceId: 'ui-home', slot: 'main'},
        ],
      }),
      turn('t2', {
        created: [{surfaceId: 'ui-answer', slot: 'main'}],
        messages: [v09Delete('ui-home')],
      }),
    ]);

    expect(layout.surfaces.map((surface) => surface.surfaceId)).toEqual(['ui-cart', 'ui-answer']);
  });

  it('drops operations on a surface the stream does not know', () => {
    const layout = buildSurfaceLayout([
      turn('t1', {messages: [v09Update('ui-unknown'), v09Delete('ui-unknown')]}),
    ]);

    expect(layout.messages).toEqual([]);
    expect(layout.surfaces).toEqual([]);
  });

  it('leaves a surface with no layout hint out of every slot', () => {
    const layout = buildSurfaceLayout([turn('t1', {created: [{surfaceId: 'ui-free'}]})]);

    expect(layout.surfaces[0].slot).toBeUndefined();
    expect(surfacesInSlot(layout, 'main')).toEqual([]);
  });
});

describe('surfacesInSlot', () => {
  it('only returns the surfaces created since the given turn', () => {
    const layout = buildSurfaceLayout([
      turn('t1', {created: [{surfaceId: 'ui-old', slot: 'main'}]}),
      turn('t2', {created: [{surfaceId: 'ui-new', slot: 'main'}]}),
    ]);

    expect(surfacesInSlot(layout, 'main', 1).map((surface) => surface.surfaceId)).toEqual([
      'ui-new',
    ]);
  });
});

describe('findSurfaceByRoot', () => {
  it('finds the live surface rooted on a component', () => {
    const layout = buildSurfaceLayout([
      turn('t1', {created: [{surfaceId: 'ui-cart', slot: 'header.cart', root: 'Cart'}]}),
    ]);

    expect(findSurfaceByRoot(layout, 'Cart')?.surfaceId).toBe('ui-cart');
    expect(findSurfaceByRoot(layout, 'QuerySuggestions')).toBeUndefined();
  });
});
