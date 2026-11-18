import {describe, expect, it} from 'vitest';
import type {SerializedSession} from '@coveo/thermidor';
import {memoryStorage} from '../test/memory-storage.js';
import {createConversationStorage} from './conversation-storage.js';

function serialized(padding = ''): SerializedSession {
  return {version: 4, sessionId: padding, turns: []};
}

function setup({quota, max}: {quota?: number; max?: number} = {}) {
  const local = memoryStorage(quota);
  const session = memoryStorage();
  let time = 0;
  const storage = createConversationStorage({
    local: () => local,
    session: () => session,
    max,
    now: () => ++time,
  });
  return {storage, local};
}

const ids = (storage: ReturnType<typeof setup>['storage']) => storage.list().map(({id}) => id);

describe('createConversationStorage', () => {
  it('lists saved conversations newest first, and loads them back', () => {
    const {storage} = setup();

    storage.save('a', 'surfboards', serialized('a'));
    storage.save('b', 'wetsuits', serialized('b'));
    storage.save('a', 'surfboards', serialized('a2'));

    expect(storage.list()).toEqual([
      {id: 'a', title: 'surfboards', updatedAt: 3},
      {id: 'b', title: 'wetsuits', updatedAt: 2},
    ]);
    expect(storage.load('a')).toEqual(serialized('a2'));
  });

  it('keeps at most `max` conversations, dropping the oldest', () => {
    const {storage, local} = setup({max: 2});

    for (const id of ['a', 'b', 'c']) storage.save(id, id, serialized());

    expect(ids(storage)).toEqual(['c', 'b']);
    expect(storage.load('a')).toBeUndefined();
    expect(local.length).toBe(3);
  });

  it('drops the oldest conversations until a new one fits', () => {
    const {storage} = setup({quota: 450});
    storage.save('a', 'a', serialized('x'.repeat(100)));
    storage.save('b', 'b', serialized('x'.repeat(100)));

    storage.save('c', 'c', serialized('x'.repeat(150)));

    expect(ids(storage)).toEqual(['c', 'b']);
    expect(storage.load('a')).toBeUndefined();
  });

  it('keeps every conversation, and its previous save, when it does not fit even alone', () => {
    const {storage} = setup({quota: 400});
    storage.save('a', 'a', serialized('x'.repeat(100)));
    storage.save('b', 'b', serialized('b'));

    storage.save('b', 'b', serialized('x'.repeat(500)));
    storage.save('c', 'c', serialized('x'.repeat(500)));

    expect(ids(storage)).toEqual(['b', 'a']);
    expect(storage.load('a')).toEqual(serialized('x'.repeat(100)));
    expect(storage.load('b')).toEqual(serialized('b'));
    expect(storage.load('c')).toBeUndefined();
  });

  it('renames a conversation, which keeps its title when saved again', () => {
    const {storage} = setup();
    storage.save('a', 'surfboards', serialized());
    storage.save('b', 'wetsuits', serialized());

    storage.rename('a', 'Board shopping');
    storage.save('a', 'surfboards', serialized('a2'));

    expect(storage.list().map(({id, title}) => [id, title])).toEqual([
      ['a', 'Board shopping'],
      ['b', 'wetsuits'],
    ]);
  });

  it('lists a started conversation once, before it has anything to load', () => {
    const {storage} = setup({max: 2});
    storage.save('a', 'surfboards', serialized());
    storage.save('b', 'wetsuits', serialized());

    storage.start('c', 'life jackets');
    storage.start('c', 'paddles');

    expect(storage.list().map(({id, title}) => [id, title])).toEqual([
      ['c', 'life jackets'],
      ['b', 'wetsuits'],
    ]);
    expect(storage.load('c')).toBeUndefined();
    expect(storage.load('a')).toBeUndefined();
  });

  it('removes a conversation', () => {
    const {storage} = setup();
    storage.save('a', 'a', serialized());
    storage.save('b', 'b', serialized());

    storage.remove('a');

    expect(ids(storage)).toEqual(['b']);
    expect(storage.load('a')).toBeUndefined();
  });

  it('remembers the current conversation apart from the saved ones', () => {
    const {storage} = setup();

    storage.setCurrentId('a');

    expect(storage.currentId()).toBe('a');
    expect(ids(storage)).toEqual([]);
  });

  it('finds nothing and saves nothing when storage is unavailable', () => {
    const unavailable = () => {
      throw new DOMException('Denied', 'SecurityError');
    };
    const storage = createConversationStorage({local: unavailable, session: unavailable});

    expect(() => {
      storage.save('a', 'a', serialized());
      storage.setCurrentId('a');
      storage.remove('a');
    }).not.toThrow();
    expect(storage.list()).toEqual([]);
    expect(storage.load('a')).toBeUndefined();
    expect(storage.currentId()).toBeUndefined();
  });

  it('ignores an index or a conversation it cannot parse', () => {
    const {storage, local} = setup();
    local.setItem('demo-conversations', '{not json');
    local.setItem('demo-conversation:a', '{not json');

    expect(storage.list()).toEqual([]);
    expect(storage.load('a')).toBeUndefined();
  });
});
