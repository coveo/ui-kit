/**
 * Search API Tests
 */

import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  vi,
  MockedFunction,
} from 'vitest';
import {executeSearchAPI} from './searchAPI.js';
import {
  createTestEngine,
  createMockSearchResults,
} from '@/src/core/test-utils.js';
import * as configurationMutations from '@/src/core/interface/configuration/mutate.js';
import * as searchBoxMutations from '@/src/core/interface/search-box/mutate.js';
import * as resultsMutations from '@/src/core/interface/results/mutate.js';
import * as paginationMutations from '@/src/core/interface/pagination/mutate.js';
import * as facetMutations from '@/src/core/interface/facets/mutate.js';
import * as resultsSelectors from '@/src/core/interface/results/selectors.js';
import * as paginationSelectors from '@/src/core/interface/pagination/selectors.js';
import * as facetSelectors from '@/src/core/interface/facets/selectors.js';
import type {CoveoSearchResponse} from './types.js';
import {Engine} from '@/src/core/interface/engine/engine.js';
import {configurationSlice} from '@/src/core/internal/configuration/slice.js';
import {searchBoxSlice} from '@/src/core/internal/searchBox/slice.js';
import {resultsSlice} from '@/src/core/internal/results/slice.js';
import {paginationSlice} from '@/src/core/internal/pagination/slice.js';
import {facetsSlice} from '@/src/core/internal/facets/slice.js';

describe('executeSearchAPI()', () => {
  let engine: Engine;

  beforeEach(() => {
    engine = createTestEngine();

    // Adopt all slices needed for these tests
    engine.adoptSlice(configurationSlice);
    engine.adoptSlice(searchBoxSlice);
    engine.adoptSlice(resultsSlice);
    engine.adoptSlice(paginationSlice);
    engine.adoptSlice(facetsSlice);

    // Configure engine
    engine.mutate(configurationMutations.setOrganizationId('test-org'));
    engine.mutate(configurationMutations.setAccessToken('test-token'));
    engine.mutate(searchBoxMutations.setQuery('test query'));

    // Clear any previous mocks
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('Loading state management', () => {
    it('should set loading to true before request', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn(() => new Promise(() => {}))
      ); // Never resolves

      void executeSearchAPI(engine);

      // Check loading state is true immediately
      expect(engine.read(resultsSelectors.isLoading)).toBe(true);

      // Don't await - we want to check the loading state during the request
    });

    it('should set loading to false after successful request', async () => {
      const mockResponse: CoveoSearchResponse = {
        totalCount: 10,
        results: [
          {
            uniqueId: 'result-1',
            title: 'Test Result',
            uri: 'https://example.com',
            excerpt: 'Test excerpt',
          },
        ],
      };

      vi.stubGlobal(
        'fetch',
        vi.fn(() =>
          Promise.resolve(
            new Response(JSON.stringify(mockResponse), {status: 200})
          )
        )
      );

      await executeSearchAPI(engine);

      expect(engine.read(resultsSelectors.isLoading)).toBe(false);
    });

    it('should set loading to false after failed request', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn(() =>
          Promise.resolve(
            new Response(null, {status: 500, statusText: 'Server Error'})
          )
        )
      );

      await executeSearchAPI(engine);

      expect(engine.read(resultsSelectors.isLoading)).toBe(false);
    });

    it('should clear error before request', async () => {
      // Set initial error
      engine.mutate(resultsMutations.setError('Previous error'));

      vi.stubGlobal(
        'fetch',
        vi.fn(() =>
          Promise.resolve(
            new Response(JSON.stringify({totalCount: 0, results: []}), {
              status: 200,
            })
          )
        )
      );

      await executeSearchAPI(engine);

      expect(engine.read(resultsSelectors.error)).toBe(null);
    });
  });

  describe('Request building', () => {
    it('should include query from state', async () => {
      engine.mutate(searchBoxMutations.setQuery('laptops'));

      const mockFetch: MockedFunction<typeof fetch> = vi.fn(() =>
        Promise.resolve(
          new Response(JSON.stringify({totalCount: 0, results: []}), {
            status: 200,
          })
        )
      );
      vi.stubGlobal('fetch', mockFetch);

      await executeSearchAPI(engine);

      expect(mockFetch.mock.lastCall).toBeDefined();
      const requestBody = JSON.parse(
        (mockFetch.mock.lastCall![1] as RequestInit).body as string
      );
      expect(requestBody.q).toBe('laptops');
    });

    it('should include pagination parameters', async () => {
      // Note: setPageSize must be called before setPage because it resets page to 1
      engine.mutate(paginationMutations.setPageSize(20));
      engine.mutate(paginationMutations.setPage(2));

      const mockFetch: MockedFunction<typeof fetch> = vi.fn(() =>
        Promise.resolve(
          new Response(JSON.stringify({totalCount: 0, results: []}), {
            status: 200,
          })
        )
      );
      vi.stubGlobal('fetch', mockFetch);

      await executeSearchAPI(engine);

      expect(mockFetch.mock.lastCall).toBeDefined();
      const requestBody = JSON.parse(
        (mockFetch.mock.lastCall![1] as RequestInit).body as string
      );
      expect(requestBody.numberOfResults).toBe(20);
      expect(requestBody.firstResult).toBe(20); // (page 2 - 1) * 20 = 20
    });

    it('should build facet requests from state', async () => {
      engine.mutate(
        facetMutations.setFacet({
          id: 'author',
          label: 'Author',
          values: [],
          selectedValues: ['john', 'jane'],
        })
      );

      const mockFetch: MockedFunction<typeof fetch> = vi.fn(() =>
        Promise.resolve(
          new Response(JSON.stringify({totalCount: 0, results: []}), {
            status: 200,
          })
        )
      );
      vi.stubGlobal('fetch', mockFetch);

      await executeSearchAPI(engine);

      expect(mockFetch.mock.lastCall).toBeDefined();
      const requestBody = JSON.parse(
        (mockFetch.mock.lastCall![1] as RequestInit).body as string
      );
      expect(requestBody.facets).toHaveLength(1);
      expect(requestBody.facets[0].facetId).toBe('author');
      expect(requestBody.facets[0].currentValues).toEqual([
        {value: 'john', state: 'selected'},
        {value: 'jane', state: 'selected'},
      ]);
    });

    it('should build advanced query from facet selections', async () => {
      engine.mutate(
        facetMutations.setFacet({
          id: 'author',
          label: 'Author',
          values: [],
          selectedValues: ['john'],
        })
      );
      engine.mutate(
        facetMutations.setFacet({
          id: 'category',
          label: 'Category',
          values: [],
          selectedValues: ['blog', 'article'],
        })
      );

      const mockFetch: MockedFunction<typeof fetch> = vi.fn(() =>
        Promise.resolve(
          new Response(JSON.stringify({totalCount: 0, results: []}), {
            status: 200,
          })
        )
      );
      vi.stubGlobal('fetch', mockFetch);

      await executeSearchAPI(engine);

      expect(mockFetch.mock.lastCall).toBeDefined();
      const requestBody = JSON.parse(
        (mockFetch.mock.lastCall![1] as RequestInit).body as string
      );
      expect(requestBody.aq).toContain('@author==(john)');
      expect(requestBody.aq).toContain('@category==(blog,article)');
    });

    it('should not include aq when no facets selected', async () => {
      const mockFetch: MockedFunction<typeof fetch> = vi.fn(() =>
        Promise.resolve(
          new Response(JSON.stringify({totalCount: 0, results: []}), {
            status: 200,
          })
        )
      );
      vi.stubGlobal('fetch', mockFetch);

      await executeSearchAPI(engine);

      expect(mockFetch.mock.lastCall).toBeDefined();
      const requestBody = JSON.parse(
        (mockFetch.mock.lastCall![1] as RequestInit).body as string
      );
      expect(requestBody.aq).toBeUndefined();
    });
  });

  describe('Response handling', () => {
    it('should update results from successful response', async () => {
      const mockResponse: CoveoSearchResponse = {
        totalCount: 2,
        results: [
          {
            uniqueId: 'result-1',
            title: 'First Result',
            uri: 'https://example.com/1',
            clickUri: 'https://click.example.com/1',
            excerpt: 'First excerpt',
          },
          {
            uniqueId: 'result-2',
            title: 'Second Result',
            uri: 'https://example.com/2',
            excerpt: 'Second excerpt',
          },
        ],
      };

      vi.stubGlobal(
        'fetch',
        vi.fn(() =>
          Promise.resolve(
            new Response(JSON.stringify(mockResponse), {status: 200})
          )
        )
      );

      await executeSearchAPI(engine);

      const results = engine.read(resultsSelectors.results) as Array<any>;
      expect(results).toHaveLength(2);
      expect(results[0]).toEqual({
        id: 'result-1',
        title: 'First Result',
        uri: 'https://click.example.com/1', // Uses clickUri when available
        excerpt: 'First excerpt',
      });
      expect(results[1]).toEqual({
        id: 'result-2',
        title: 'Second Result',
        uri: 'https://example.com/2', // Falls back to uri
        excerpt: 'Second excerpt',
      });
    });

    it('should update total count from response', async () => {
      const mockResponse: CoveoSearchResponse = {
        totalCount: 150,
        results: [],
      };

      vi.stubGlobal(
        'fetch',
        vi.fn(() =>
          Promise.resolve(
            new Response(JSON.stringify(mockResponse), {status: 200})
          )
        )
      );

      await executeSearchAPI(engine);

      expect(engine.read(paginationSelectors.totalCount)).toBe(150);
    });

    it('should update facet values from response', async () => {
      // Set up initial facet
      engine.mutate(
        facetMutations.setFacet({
          id: 'author',
          label: 'Author',
          values: [],
          selectedValues: [],
        })
      );

      const mockResponse: CoveoSearchResponse = {
        totalCount: 10,
        results: [],
        facets: [
          {
            facetId: 'author',
            field: 'author',
            values: [
              {value: 'John Doe', numberOfResults: 5},
              {value: 'Jane Smith', numberOfResults: 3},
            ],
          },
        ],
      };

      vi.stubGlobal(
        'fetch',
        vi.fn(() =>
          Promise.resolve(
            new Response(JSON.stringify(mockResponse), {status: 200})
          )
        )
      );

      await executeSearchAPI(engine);

      const facet = engine.read(facetSelectors.byId('author')) as
        | {values: Array<any>}
        | undefined;
      expect(facet?.values).toHaveLength(2);
      expect(facet?.values[0]).toEqual({
        id: 'John Doe',
        label: 'John Doe',
        count: 5,
      });
    });

    it('should handle missing excerpt in results', async () => {
      const mockResponse: CoveoSearchResponse = {
        totalCount: 1,
        results: [
          {
            uniqueId: 'result-1',
            title: 'Test Result',
            uri: 'https://example.com',
            // No excerpt field
          },
        ],
      };

      vi.stubGlobal(
        'fetch',
        vi.fn(() =>
          Promise.resolve(
            new Response(JSON.stringify(mockResponse), {status: 200})
          )
        )
      );

      await executeSearchAPI(engine);

      const results = engine.read(resultsSelectors.results) as Array<any>;
      expect(results[0].excerpt).toBe('');
    });
  });

  describe('Error handling', () => {
    it('should set error state on HTTP error', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn(() =>
          Promise.resolve(
            new Response(null, {status: 401, statusText: 'Unauthorized'})
          )
        )
      );

      await executeSearchAPI(engine);

      const error = engine.read(resultsSelectors.error);
      expect(error).toContain('Authentication failed');
    });

    it('should set error state on network error', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn(() => Promise.reject(new TypeError('fetch failed')))
      );

      await executeSearchAPI(engine);

      const error = engine.read(resultsSelectors.error);
      expect(error).toBeDefined();
      expect(error).not.toBe(null);
    });

    it('should not update results on error', async () => {
      // Set initial results
      engine.mutate(resultsMutations.setResults(createMockSearchResults(3)));

      vi.stubGlobal(
        'fetch',
        vi.fn(() =>
          Promise.resolve(
            new Response(null, {status: 500, statusText: 'Server Error'})
          )
        )
      );

      await executeSearchAPI(engine);

      // Results should remain unchanged
      const results = engine.read(resultsSelectors.results);
      expect(results).toHaveLength(3);
    });
  });

  describe('API call format', () => {
    it('should call correct endpoint', async () => {
      const mockFetch: MockedFunction<typeof fetch> = vi.fn(() =>
        Promise.resolve(
          new Response(JSON.stringify({totalCount: 0, results: []}), {
            status: 200,
          })
        )
      );
      vi.stubGlobal('fetch', mockFetch);

      await executeSearchAPI(engine);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://platform.cloud.coveo.com/rest/search/v2',
        expect.any(Object)
      );
    });

    it('should use POST method', async () => {
      const mockFetch: MockedFunction<typeof fetch> = vi.fn(() =>
        Promise.resolve(
          new Response(JSON.stringify({totalCount: 0, results: []}), {
            status: 200,
          })
        )
      );
      vi.stubGlobal('fetch', mockFetch);

      await executeSearchAPI(engine);

      expect(mockFetch.mock.lastCall).toBeDefined();
      const fetchOptions = mockFetch.mock.lastCall![1] as
        | RequestInit
        | undefined;
      expect(fetchOptions?.method).toBe('POST');
    });

    it('should include authorization header', async () => {
      const mockFetch: MockedFunction<typeof fetch> = vi.fn(() =>
        Promise.resolve(
          new Response(JSON.stringify({totalCount: 0, results: []}), {
            status: 200,
          })
        )
      );
      vi.stubGlobal('fetch', mockFetch);

      await executeSearchAPI(engine);

      expect(mockFetch.mock.lastCall).toBeDefined();
      const fetchOptions = mockFetch.mock.lastCall![1] as
        | RequestInit
        | undefined;
      const headers = fetchOptions?.headers as
        | Record<string, string>
        | undefined;
      expect(headers?.['Authorization']).toBe('Bearer test-token');
    });
  });
});
