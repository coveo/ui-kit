import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  type Mocked,
  vi,
} from 'vitest';
import {
  type HistoryElement,
  MAX_NUMBER_OF_HISTORY_ELEMENTS,
  MAX_VALUE_SIZE,
  STORE_KEY,
} from './history-store.js';
import HistoryStore from './history-store.js';
import type {WebStorage} from './storage.js';

describe('HistoryStore', () => {
  let mockStorage: Mocked<WebStorage>;
  let historyStore: HistoryStore;
  const resetHistoryStoreInstance = () => {
    Object.defineProperty(HistoryStore, 'instance', {value: null});
  };
  beforeEach(() => {
    resetHistoryStoreInstance();
    mockStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    };

    vi.useFakeTimers();
    vi.setSystemTime(new Date('2023-01-01T00:00:00.000Z'));
    historyStore = HistoryStore.getInstance(mockStorage);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
    resetHistoryStoreInstance();
  });

  it('should return the same instance when getInstance is called multiple times', () => {
    const instance1 = HistoryStore.getInstance(mockStorage);
    const instance2 = HistoryStore.getInstance();

    expect(instance1).toBe(instance2);
  });

  describe('#addElement', () => {
    it('should add element to empty history', () => {
      mockStorage.getItem.mockReturnValue(null);

      const element: HistoryElement = {
        name: 'query',
        value: 'test search',
        time: '2023-01-01T00:00:00.000Z',
      };

      historyStore.addElement(element);

      expect(mockStorage.setItem).toHaveBeenCalled();
    });

    it('should not add duplicate element within threshold time', () => {
      const existingElement: HistoryElement = {
        name: 'query',
        value: 'same search',
        time: '2023-01-01T00:00:00.000Z',
        internalTime: 1672531200000,
      };

      mockStorage.getItem.mockReturnValue(JSON.stringify([existingElement]));

      vi.advanceTimersByTime(30000);

      const duplicateElement: HistoryElement = {
        name: 'query',
        value: 'same search',
        time: '2023-01-01T00:00:30.000Z',
      };

      historyStore.addElement(duplicateElement);

      expect(mockStorage.setItem).not.toHaveBeenCalled();
    });

    it('should crop query values longer than MAX_VALUE_SIZE', () => {
      mockStorage.getItem.mockReturnValue(null);

      const element: HistoryElement = {
        name: 'query',
        value: 'a'.repeat(100),
        time: '2023-01-01T00:00:00.000Z',
      };

      historyStore.addElement(element);

      const setItemCall = mockStorage.setItem.mock.calls[0];
      const storedHistory = JSON.parse(setItemCall[1]);

      expect(storedHistory[0].value).toHaveLength(MAX_VALUE_SIZE);
    });

    it('should strip empty query values', () => {
      mockStorage.getItem.mockReturnValue(null);

      const element: HistoryElement = {
        name: 'query',
        value: '   ',
        time: '2023-01-01T00:00:00.000Z',
      };

      historyStore.addElement(element);

      const setItemCall = mockStorage.setItem.mock.calls[0];
      const storedHistory = JSON.parse(setItemCall[1]);

      expect(storedHistory[0]).not.toHaveProperty('value');
    });
  });

  describe('#addElementAsync', () => {
    it('should add element asynchronously', async () => {
      mockStorage.getItem.mockResolvedValue(null);

      const element: HistoryElement = {
        name: 'query',
        value: 'test search',
        time: '2023-01-01T00:00:00.000Z',
      };

      await historyStore.addElementAsync(element);

      expect(mockStorage.setItem).toHaveBeenCalled();
    });
  });

  describe('#getHistory', () => {
    it('should return empty array when no history exists', () => {
      mockStorage.getItem.mockReturnValue(null);

      const result = historyStore.getHistory();

      expect(result).toEqual([]);
    });

    it('should return history without internal time', () => {
      const historyWithInternalTime: HistoryElement[] = [
        {
          name: 'query',
          value: 'search 1',
          time: '2023-01-01T00:00:00.000Z',
          internalTime: 1672531200000,
        },
      ];

      mockStorage.getItem.mockReturnValue(
        JSON.stringify(historyWithInternalTime)
      );

      const result = historyStore.getHistory();

      expect(result).toEqual([
        {
          name: 'query',
          value: 'search 1',
          time: '2023-01-01T00:00:00.000Z',
        },
      ]);
    });

    it('should handle malformed JSON gracefully', () => {
      mockStorage.getItem.mockReturnValue('invalid json');

      const result = historyStore.getHistory();

      expect(result).toEqual([]);
    });
  });

  describe('#getHistoryAsync', () => {
    it('should return empty array when no history exists', async () => {
      mockStorage.getItem.mockResolvedValue(null);

      const result = await historyStore.getHistoryAsync();

      expect(result).toEqual([]);
    });

    it('should handle async storage exceptions gracefully', async () => {
      mockStorage.getItem.mockRejectedValue(new Error('Async storage error'));

      const result = await historyStore.getHistoryAsync();

      expect(result).toEqual([]);
    });
  });

  describe('#setHistory', () => {
    it('should store history with maximum element limit', () => {
      const largeHistory: HistoryElement[] = Array.from(
        {length: 25},
        (_, i) => ({
          name: 'query',
          value: `search ${i}`,
          time: `2023-01-01T00:0${i < 10 ? '0' : ''}${i}:00.000Z`,
          internalTime: 1672531200000 + i * 60000,
        })
      );

      historyStore.setHistory(largeHistory);

      const setItemCall = mockStorage.setItem.mock.calls[0];
      const storedHistory = JSON.parse(setItemCall[1]);

      expect(storedHistory).toHaveLength(MAX_NUMBER_OF_HISTORY_ELEMENTS);
    });
  });

  describe('#clear', () => {
    it('should remove history from storage', () => {
      historyStore.clear();

      expect(mockStorage.removeItem).toHaveBeenCalledWith(STORE_KEY);
    });
  });

  describe('#getMostRecentElement', () => {
    it('should return the most recent element by internal time', () => {
      const history: HistoryElement[] = [
        {
          name: 'query',
          value: 'older search',
          time: '2023-01-01T00:00:00.000Z',
          internalTime: 1672531200000,
        },
        {
          name: 'query',
          value: 'newest search',
          time: '2023-01-01T00:02:00.000Z',
          internalTime: 1672531320000,
        },
      ];

      mockStorage.getItem.mockReturnValue(JSON.stringify(history));

      const result = historyStore.getMostRecentElement();

      expect(result?.value).toBe('newest search');
    });

    it('should return undefined when history is empty', () => {
      mockStorage.getItem.mockReturnValue(JSON.stringify([]));

      const result = historyStore.getMostRecentElement();

      expect(result).toBeUndefined();
    });

    it('should return undefined when history is not an array', () => {
      mockStorage.getItem.mockReturnValue(null);

      const result = historyStore.getMostRecentElement();

      expect(result).toBeUndefined();
    });
  });
});
