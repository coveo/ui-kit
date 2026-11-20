import {afterEach, describe, expect, it, vi} from 'vitest';
import {EMPTY_RENDERER_STREAM, appendToRendererStream} from './renderer-stream.js';

const createSurface = (surfaceId: string) => ({
  version: '1.0',
  createSurface: {
    surfaceId,
    catalogId: 'commerce',
    components: [{id: 'root', component: 'ProductCarousel'}],
    dataModel: {isLoading: true},
  },
});
const deleteSurface = (surfaceId: string) => ({version: '1.0', deleteSurface: {surfaceId}});
const updateDataModel = (surfaceId: string, value: unknown) => ({
  version: '1.0',
  updateDataModel: {surfaceId, path: '/isLoading', value},
});
const updateComponents = (surfaceId: string) => ({
  version: '1.0',
  updateComponents: {surfaceId, components: [{id: 'root', component: 'ProductCarousel'}]},
});

describe('appendToRendererStream', () => {
  afterEach(() => vi.restoreAllMocks());

  it('forwards A2-UI v1.0 messages unchanged, inline components and data model included', () => {
    const messages = [createSurface('s'), updateComponents('s'), updateDataModel('s', false)];

    const stream = appendToRendererStream(EMPTY_RENDERER_STREAM, messages);

    expect(stream.messages).toEqual(messages);
    expect(stream.messages[0]).toBe(messages[0]);
    expect([...stream.liveSurfaceIds]).toEqual(['s']);
  });

  it('forwards a data-model deletion (value: null) as is', () => {
    const deletion = updateDataModel('s', null);

    const stream = appendToRendererStream(EMPTY_RENDERER_STREAM, [createSurface('s'), deletion]);

    expect(stream.messages.at(-1)).toEqual(deletion);
  });

  it('deletes a live surface before a createSurface replaces it', () => {
    const created = appendToRendererStream(EMPTY_RENDERER_STREAM, [createSurface('s')]);

    const replaced = appendToRendererStream(created, [createSurface('s')]);

    expect(replaced.messages).toEqual([createSurface('s'), deleteSurface('s'), createSurface('s')]);
    expect([...replaced.liveSurfaceIds]).toEqual(['s']);
  });

  it('does not delete a surface that was deleted before it is created again', () => {
    const stream = appendToRendererStream(EMPTY_RENDERER_STREAM, [
      createSurface('s'),
      deleteSurface('s'),
      createSurface('s'),
    ]);

    expect(stream.messages).toEqual([createSurface('s'), deleteSurface('s'), createSurface('s')]);
  });

  it('drops an update for a surface that is not live', () => {
    const stream = appendToRendererStream(EMPTY_RENDERER_STREAM, [
      createSurface('s'),
      deleteSurface('s'),
      updateDataModel('s', false),
      updateComponents('s'),
      updateDataModel('never-created', false),
    ]);

    expect(stream.messages).toEqual([createSurface('s'), deleteSurface('s')]);
    expect(stream.liveSurfaceIds.size).toBe(0);
  });

  it('forwards a deleteSurface for a surface that is not live', () => {
    const stream = appendToRendererStream(EMPTY_RENDERER_STREAM, [deleteSurface('earlier')]);

    expect(stream.messages).toEqual([deleteSurface('earlier')]);
  });

  it.each([['v1.0'], ['v0.9'], [undefined]])(
    'drops a message whose version is %s, and warns',
    (version) => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const stream = appendToRendererStream(EMPTY_RENDERER_STREAM, [
        {...createSurface('s'), version},
      ]);

      expect(stream).toBe(EMPTY_RENDERER_STREAM);
      expect(warn).toHaveBeenCalledTimes(1);
    }
  );

  it('ignores what is not a message', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const stream = appendToRendererStream(EMPTY_RENDERER_STREAM, [null, 'createSurface', []]);

    expect(stream).toBe(EMPTY_RENDERER_STREAM);
  });

  it('returns the same stream when nothing is appended', () => {
    const stream = appendToRendererStream(EMPTY_RENDERER_STREAM, [createSurface('s')]);

    expect(appendToRendererStream(stream, [updateDataModel('other', true)])).toBe(stream);
  });
});
