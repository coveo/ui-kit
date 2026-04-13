import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {clearIconCache, fetchIcon} from './fetch-icon';

let fetchMock: ReturnType<typeof vi.spyOn<typeof globalThis, 'fetch'>>;

describe('fetchIcon', () => {
  beforeEach(() => {
    fetchMock = vi
      .spyOn(window, 'fetch')
      .mockRejectedValue(new Error('fetch not mocked'));
    clearIconCache();
  });

  afterEach(() => {
    fetchMock.mockRestore();
  });

  it('fetches and returns the SVG text for a valid URL', async () => {
    fetchMock.mockResolvedValue({
      status: 200,
      statusText: 'OK',
      text: async () => '<svg></svg>',
    });

    const result = await fetchIcon('https://example.com/icon.svg');
    expect(result).toBe('<svg></svg>');
    expect(fetchMock).toHaveBeenCalledWith('https://example.com/icon.svg');
  });

  it('accepts 304 status responses', async () => {
    fetchMock.mockResolvedValue({
      status: 304,
      statusText: 'Not Modified',
      text: async () => '<svg></svg>',
    });

    const result = await fetchIcon('https://example.com/icon.svg');
    expect(result).toBe('<svg></svg>');
  });

  it('throws an error for non-200/304 HTTP status codes', async () => {
    fetchMock.mockResolvedValue({
      status: 404,
      statusText: 'Not Found',
      text: async () => '',
    });

    await expect(fetchIcon('https://example.com/missing.svg')).rejects.toThrow(
      'Could not fetch icon from https://example.com/missing.svg'
    );
  });

  it('throws an error when the network request fails', async () => {
    fetchMock.mockRejectedValue(new Error('Network error'));

    await expect(fetchIcon('https://example.com/icon.svg')).rejects.toThrow(
      'Could not fetch icon from https://example.com/icon.svg'
    );
  });

  it('caches successful fetch results for the same URL', async () => {
    fetchMock.mockResolvedValue({
      status: 200,
      statusText: 'OK',
      text: async () => '<svg></svg>',
    });

    const result1 = await fetchIcon('https://example.com/icon.svg');
    const result2 = await fetchIcon('https://example.com/icon.svg');

    expect(result1).toBe('<svg></svg>');
    expect(result2).toBe('<svg></svg>');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('does not cache failed fetch requests', async () => {
    fetchMock
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({
        status: 200,
        statusText: 'OK',
        text: async () => '<svg></svg>',
      });

    await expect(fetchIcon('https://example.com/icon.svg')).rejects.toThrow();
    const result = await fetchIcon('https://example.com/icon.svg');
    expect(result).toBe('<svg></svg>');
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  describe('clearIconCache', () => {
    it('allows re-fetching after the cache is cleared', async () => {
      fetchMock
        .mockResolvedValueOnce({
          status: 200,
          statusText: 'OK',
          text: async () => '<svg>first</svg>',
        })
        .mockResolvedValueOnce({
          status: 200,
          statusText: 'OK',
          text: async () => '<svg>second</svg>',
        });

      const result1 = await fetchIcon('https://example.com/icon.svg');
      expect(result1).toBe('<svg>first</svg>');
      expect(fetchMock).toHaveBeenCalledTimes(1);

      clearIconCache();

      const result2 = await fetchIcon('https://example.com/icon.svg');
      expect(result2).toBe('<svg>second</svg>');
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });
  });
});
