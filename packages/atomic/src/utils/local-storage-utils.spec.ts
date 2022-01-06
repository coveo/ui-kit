import {
  buildSearchEngine,
  getSampleSearchEngineConfiguration,
} from '@coveo/headless';
import {SafeStorage, StorageItems} from './local-storage-utils';

describe('Safe local storage', () => {
  let storage: SafeStorage;

  beforeEach(() => {
    buildSearchEngine({
      configuration: getSampleSearchEngineConfiguration(),
    });
    storage = new SafeStorage();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('allows to save and retrieve an item', () => {
    storage.setItem(StorageItems.RECENT_QUERIES, 'foo');
    expect(storage.getItem(StorageItems.RECENT_QUERIES)).toEqual('foo');
  });

  it('allows to save and retrieve an object', () => {
    storage.setJSON(StorageItems.RECENT_QUERIES, {foo: 'bar'});
    expect(
      storage.getParsedJSON(StorageItems.RECENT_QUERIES, {})
    ).toMatchObject({
      foo: 'bar',
    });
  });

  it('fails gracefully when local storage throws', () => {
    (localStorage.setItem as jest.Mock).mockImplementationOnce(() => {
      throw new Error('🤯');
    });
    expect(() => {
      storage.setItem(StorageItems.RECENT_QUERIES, 'foo');
    }).not.toThrowError();
  });

  it('returns fallback object when local storage throws', () => {
    (localStorage.getItem as jest.Mock).mockImplementationOnce(() => {
      throw new Error('🤯');
    });
    expect(storage.getParsedJSON(StorageItems.RECENT_QUERIES, 'foo')).toEqual(
      'foo'
    );
  });
});
