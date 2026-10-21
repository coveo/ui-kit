import {describe, expect, it} from 'vitest';
import type {A2uiV09Message} from '@coveo/thermidor';
import {makeTurn} from '../test/turn-fixtures.js';
import {buildSurfaceStream, toServerAction} from './surface-stream.js';

function turn(id: string, a2uiMessages: A2uiV09Message[]) {
  return makeTurn({id, response: {a2uiMessages}});
}

const create = (surfaceId: string) => ({version: 'v0.9', createSurface: {surfaceId}});
const remove = (surfaceId: string) => ({version: 'v0.9', deleteSurface: {surfaceId}});
const update = (surfaceId: string, value: unknown) => ({
  version: 'v0.9',
  updateDataModel: {surfaceId, path: '/state', value},
});

describe('buildSurfaceStream', () => {
  it('places each surface under the turn that created it, in order', () => {
    const stream = buildSurfaceStream([
      turn('t1', [create('ui-search')]),
      turn('t2', [create('agent-answer'), create('ui-option-search')]),
    ]);

    expect([...stream.surfacesByTurn]).toEqual([
      ['t1', ['t1/ui-search']],
      ['t2', ['t2/agent-answer', 't2/ui-option-search']],
    ]);
    expect(stream.messages).toEqual([
      create('t1/ui-search'),
      create('t2/agent-answer'),
      create('t2/ui-option-search'),
    ]);
  });

  it('applies a later turn update to the block that the update targets', () => {
    const stream = buildSurfaceStream([
      turn('t1', [create('ui-search')]),
      turn('t2', [update('ui-search', {brand: 'Nike'})]),
    ]);

    expect(stream.surfacesByTurn.get('t2')).toEqual([]);
    expect(stream.messages.at(-1)).toEqual(update('t1/ui-search', {brand: 'Nike'}));
  });

  it('keeps an earlier block when a later turn reuses its surface id', () => {
    const stream = buildSurfaceStream([
      turn('t1', [create('next-actions-surface')]),
      turn('t2', [create('next-actions-surface'), update('next-actions-surface', {})]),
    ]);

    expect(stream.surfacesByTurn.get('t1')).toEqual(['t1/next-actions-surface']);
    expect(stream.surfacesByTurn.get('t2')).toEqual(['t2/next-actions-surface']);
    expect(stream.messages.at(-1)).toEqual(update('t2/next-actions-surface', {}));
  });

  it('removes a deleted surface from its turn', () => {
    const stream = buildSurfaceStream([
      turn('t1', [create('ui-search'), create('agent-answer')]),
      turn('t2', [{version: 'v0.9', deleteSurface: {surfaceId: 'agent-answer'}}]),
    ]);

    expect(stream.surfacesByTurn.get('t1')).toEqual(['t1/ui-search']);
  });

  it('drops an operation on a surface that no turn created', () => {
    const stream = buildSurfaceStream([turn('t1', [update('unknown', {})])]);

    expect(stream.messages).toEqual([]);
  });

  it('maps each loading placeholder to its root component type by render id', () => {
    const stream = buildSurfaceStream([
      makeTurn({
        id: 't1',
        response: {
          a2uiMessages: [create('skel'), create('content')],
          surfaces: [
            {surfaceId: 'skel', rootComponentType: 'ProductCarousel', isLoading: true},
            {surfaceId: 'content', rootComponentType: 'NextActionsBar', isLoading: false},
          ],
        },
      }),
    ]);

    expect([...stream.loadingSurfaces]).toEqual([['t1/skel', 'ProductCarousel']]);
  });

  it('forgets a placeholder once the agent deletes it', () => {
    const placeholder = {surfaceId: 'skel', rootComponentType: 'ProductCarousel', isLoading: true};
    const content = {surfaceId: 'content', rootComponentType: 'ProductCarousel', isLoading: false};
    const loading = buildSurfaceStream([
      makeTurn({id: 't1', response: {a2uiMessages: [create('skel')], surfaces: [placeholder]}}),
    ]);
    const loaded = buildSurfaceStream([
      makeTurn({
        id: 't1',
        response: {
          a2uiMessages: [create('skel'), remove('skel'), create('content')],
          surfaces: [content],
        },
      }),
    ]);

    expect(loading.surfacesByTurn.get('t1')).toEqual(['t1/skel']);
    expect([...loading.loadingSurfaces]).toEqual([['t1/skel', 'ProductCarousel']]);
    expect(loaded.surfacesByTurn.get('t1')).toEqual(['t1/content']);
    expect(loaded.loadingSurfaces.size).toBe(0);
  });

  it('forgets a placeholder that a later turn deletes', () => {
    const stream = buildSurfaceStream([
      makeTurn({
        id: 't1',
        response: {
          a2uiMessages: [create('skel')],
          surfaces: [{surfaceId: 'skel', rootComponentType: 'ProductCarousel', isLoading: true}],
        },
      }),
      turn('t2', [remove('skel')]),
    ]);

    expect(stream.surfacesByTurn.get('t1')).toEqual([]);
    expect(stream.loadingSurfaces.size).toBe(0);
  });

  it('marks only the placeholder of the turn that reuses a server surface id', () => {
    const stream = buildSurfaceStream([
      makeTurn({
        id: 't1',
        response: {
          a2uiMessages: [create('carousel')],
          surfaces: [
            {surfaceId: 'carousel', rootComponentType: 'ProductCarousel', isLoading: false},
          ],
        },
      }),
      makeTurn({
        id: 't2',
        response: {
          a2uiMessages: [create('carousel')],
          surfaces: [
            {surfaceId: 'carousel', rootComponentType: 'ProductCarousel', isLoading: true},
          ],
        },
      }),
    ]);

    expect([...stream.loadingSurfaces]).toEqual([['t2/carousel', 'ProductCarousel']]);
  });

  it('never marks an earlier turn block as loading for a surface the turn did not create', () => {
    const stream = buildSurfaceStream([
      turn('t1', [create('carousel')]),
      makeTurn({
        id: 't2',
        response: {
          a2uiMessages: [],
          surfaces: [
            {surfaceId: 'carousel', rootComponentType: 'ProductCarousel', isLoading: true},
          ],
        },
      }),
    ]);

    expect(stream.loadingSurfaces.size).toBe(0);
  });
});

describe('toServerAction', () => {
  const {serverSurfaceIds} = buildSurfaceStream([turn('t1', [create('ui-search')])]);

  it('re-addresses an action to the server surface id', () => {
    expect(
      toServerAction(
        {version: 'v0.9', userAction: {name: 'selectPage', surfaceId: 't1/ui-search'}},
        serverSurfaceIds
      )
    ).toEqual({version: 'v0.9', userAction: {name: 'selectPage', surfaceId: 'ui-search'}});
  });

  it('leaves a message without a known surface unchanged', () => {
    const submitPrompt = {name: 'submitPrompt', payload: {prompt: 'kayaks'}};

    expect(toServerAction(submitPrompt, serverSurfaceIds)).toBe(submitPrompt);
  });
});
