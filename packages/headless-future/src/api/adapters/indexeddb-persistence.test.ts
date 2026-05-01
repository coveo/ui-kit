import {beforeEach, describe, expect, it, vi} from 'vitest';
import {IndexedDbPersistenceAdapter} from './indexeddb-persistence.js';

const getMock = vi.hoisted(() => vi.fn());
const putMock = vi.hoisted(() => vi.fn());
const deleteMock = vi.hoisted(() => vi.fn());
const getAllKeysMock = vi.hoisted(() => vi.fn());
const openDbMock = vi.hoisted(() => vi.fn());

vi.mock('idb', () => ({
  openDB: openDbMock,
}));

function makeDbMock() {
  return {
    put: putMock,
    get: getMock,
    delete: deleteMock,
    getAllKeys: getAllKeysMock,
    objectStoreNames: {
      contains: vi.fn(() => true),
    },
    createObjectStore: vi.fn(),
  };
}

describe('IndexedDbPersistenceAdapter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (globalThis as {window?: object}).window = {};
    (globalThis as {indexedDB?: object}).indexedDB = {};

    const db = makeDbMock();
    openDbMock.mockResolvedValue(db);
  });

  it('saves and loads payload roundtrip', async () => {
    const adapter = new IndexedDbPersistenceAdapter();
    const payload = {a: 1, nested: {ok: true}};

    getMock.mockResolvedValue({key: 'conversation:state', payload});

    await adapter.save('conversation:state', payload);
    const loaded = await adapter.load('conversation:state');

    expect(putMock).toHaveBeenCalledWith('kv', {
      key: 'conversation:state',
      payload,
    });
    expect(loaded).toEqual(payload);
  });

  it('returns null when key does not exist', async () => {
    const adapter = new IndexedDbPersistenceAdapter();
    getMock.mockResolvedValue(undefined);

    const loaded = await adapter.load('missing:key');

    expect(loaded).toBeNull();
  });

  it('filters keys with list(prefix)', async () => {
    const adapter = new IndexedDbPersistenceAdapter();
    getAllKeysMock.mockResolvedValue([
      'conversation:state',
      'surfaces:state',
      'conversation:cache',
    ]);

    const keys = await adapter.list('conversation:');

    expect(keys).toEqual(['conversation:state', 'conversation:cache']);
  });

  it('resolves delete without throwing', async () => {
    const adapter = new IndexedDbPersistenceAdapter();

    await expect(adapter.delete('conversation:state')).resolves.toBeUndefined();
    expect(deleteMock).toHaveBeenCalledWith('kv', 'conversation:state');
  });

  it('is SSR-safe when window is unavailable', async () => {
    delete (globalThis as {window?: object}).window;
    const adapter = new IndexedDbPersistenceAdapter();

    await expect(adapter.save('key', {a: 1})).resolves.toBeUndefined();
    await expect(adapter.delete('key')).resolves.toBeUndefined();
    await expect(adapter.load('key')).resolves.toBeNull();
    await expect(adapter.list()).resolves.toEqual([]);

    expect(openDbMock).not.toHaveBeenCalled();
  });

  it('fails soft on storage errors', async () => {
    const adapter = new IndexedDbPersistenceAdapter();
    putMock.mockRejectedValue(new Error('quota exceeded'));
    getMock.mockRejectedValue(new Error('read failed'));
    deleteMock.mockRejectedValue(new Error('delete failed'));
    getAllKeysMock.mockRejectedValue(new Error('keys failed'));

    await expect(adapter.save('k', {a: 1})).resolves.toBeUndefined();
    await expect(adapter.load('k')).resolves.toBeNull();
    await expect(adapter.delete('k')).resolves.toBeUndefined();
    await expect(adapter.list()).resolves.toEqual([]);
  });
});
