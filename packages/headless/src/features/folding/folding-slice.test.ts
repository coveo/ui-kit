import {AnyAction} from '@reduxjs/toolkit';
import {PlatformClient} from '../../api/platform-client';
import {Result} from '../../api/search/search/result';
import {
  buildMockResult,
  buildMockSearchAppEngine,
  createMockState,
  MockSearchEngine,
} from '../../test';
import {buildMockResultWithFolding} from '../../test/mock-result-with-folding';
import {buildMockSearch} from '../../test/mock-search';
import {buildMockSearchResponse} from '../../test/mock-search-response';
import {executeSearch, fetchMoreResults} from '../search/search-actions';
import {loadCollection} from './folding-actions';
import {foldingReducer, ResultWithFolding} from './folding-slice';
import {FoldedResult, FoldingFields, FoldingState} from './folding-state';

interface MockFoldingHierarchy {
  name: string;
  children?: MockFoldingHierarchy[];
}

function buildMockResultsFromHierarchy(
  collectionName: string,
  root: MockFoldingHierarchy,
  parentName?: string
): ResultWithFolding[] {
  const result = buildMockResultWithFolding({
    uniqueId: root.name,
    title: root.name,
    raw: {
      urihash: '',
      collection: collectionName,
      id: root.name,
    },
  });

  if (parentName) {
    result.raw.parent = parentName;
  }

  return [
    result,
    ...(root.children ?? []).flatMap((child) =>
      buildMockResultsFromHierarchy(collectionName, child, root.name)
    ),
  ];
}

function emulateAPIFolding(
  results: ResultWithFolding[],
  target = results[0],
  fields: FoldingFields = {
    collection: 'collection',
    parent: 'parent',
    child: 'id',
  }
): ResultWithFolding {
  const newResult: ResultWithFolding = {...target};

  const getId = (result: ResultWithFolding) =>
    Array.isArray(result.raw[fields.child])
      ? (result.raw[fields.child] as string[])[0]
      : (result.raw[fields.child] as string);

  newResult.childResults = results
    .filter((result) => result.raw[fields.parent] === getId(target))
    .map((result) => emulateAPIFolding(results, result, fields));

  if (target.raw[fields.parent]) {
    newResult.parentResult = {
      ...results.find((result) => getId(result) === target.raw[fields.parent])!,
    };
    newResult.childResults.push({...newResult.parentResult});
  }

  return newResult;
}

function extractMockFoldingHierarchy(root: FoldedResult): MockFoldingHierarchy {
  const part: MockFoldingHierarchy = {name: root.result.title};
  if (root.children.length) {
    part.children = root.children.map((child) =>
      extractMockFoldingHierarchy(child)
    );
  }
  return part;
}

describe('folding slice', () => {
  it('should be disabled by default', () => {
    expect(foldingReducer(undefined, {type: ''}).enabled).toBeFalsy();
  });

  describe('with folding enabled', () => {
    const testThreadHierarchy: MockFoldingHierarchy = {
      name: 'some-question',
      children: [
        {
          name: 'first-answer',
          children: [
            {
              name: 'comment-questioning-the-answer',
              children: [
                {name: 'comment-justifying-the-answer'},
                {
                  name: 'some-deleted-answer',
                  children: [{name: 'comment-that-has-no-context-anymore'}],
                },
              ],
            },
          ],
        },
        {
          name: 'better-response',
        },
      ],
    };

    const testStorageHierarchy: MockFoldingHierarchy = {
      name: 'root',
      children: [
        {name: 'private things', children: [{name: 'taxes'}]},
        {
          name: 'art',
          children: [
            {name: 'paintings'},
            {name: 'sketches'},
            {name: 'commissions'},
          ],
        },
      ],
    };

    let state: FoldingState;

    function dispatch(action: AnyAction) {
      state = foldingReducer(state, action);
    }

    function dispatchAsync<Arg, Meta>(
      actionCreator: (param0: Arg, param1: string, param2: Meta) => AnyAction,
      parameter: Arg,
      meta: Meta | null = null
    ) {
      dispatch(actionCreator(parameter, '', meta!));
    }

    function dispatchSearch(results: Result[]) {
      dispatchAsync(
        executeSearch.fulfilled,
        buildMockSearch({
          response: buildMockSearchResponse({
            results,
          }),
        })
      );
    }

    function dispatchLoadCollection(
      results: ResultWithFolding[],
      rootResult = results[0]
    ) {
      dispatchAsync(loadCollection.fulfilled, {
        collectionId: results[0].raw.collection!,
        results,
        rootResult,
      });
    }

    beforeEach(() => {
      state = {
        enabled: true,
        collections: {},
        fields: {collection: 'collection', parent: 'parent', child: 'id'},
        filterFieldRange: -1234,
      };
    });

    describe('when calling the platform to load a collection', () => {
      let rootResult: ResultWithFolding;
      let mockEngine: MockSearchEngine;

      beforeEach(() => {
        const fetched = () => {
          const payload = buildMockSearchResponse({
            results: [],
          });

          const body = JSON.stringify(payload);
          const response = new Response(body);

          return Promise.resolve(response);
        };

        PlatformClient.call = jest.fn().mockImplementationOnce(fetched);
        mockEngine = buildMockSearchAppEngine();
      });

      const doLoadCollection = async () => {
        const indexedResults = buildMockResultsFromHierarchy(
          'thread',
          testThreadHierarchy
        );
        rootResult = emulateAPIFolding(indexedResults);

        await Promise.resolve(
          mockEngine.dispatch(loadCollection(rootResult.raw.collection!))
        );
      };

      it('uses #cq with correct expression to obtain the full collection', async () => {
        await doLoadCollection();
        expect(PlatformClient.call).toHaveBeenCalledWith(
          expect.objectContaining({
            requestParams: expect.objectContaining({
              cq: `@foldingcollection="${rootResult.raw.collection!}"`,
            }),
          })
        );
      });

      it('uses #folding parameters to obtain parent and max 100 child results', async () => {
        await doLoadCollection();
        expect(PlatformClient.call).toHaveBeenCalledWith(
          expect.objectContaining({
            requestParams: expect.objectContaining({
              filterField: 'foldingcollection',
              parentField: 'foldingchild',
              filterFieldRange: 100,
            }),
          })
        );
      });

      it('when #querySyntax is enabled and #q is non empty, it build a proper query expression to get keywords highlighting', async () => {
        mockEngine = buildMockSearchAppEngine({
          state: {
            ...createMockState(),
            query: {enableQuerySyntax: true, q: 'hello'},
          },
        });
        await doLoadCollection();
        expect(PlatformClient.call).toHaveBeenCalledWith(
          expect.objectContaining({
            requestParams: expect.objectContaining({
              q: 'hello OR @uri',
              enableQuerySyntax: true,
            }),
          })
        );
      });

      it('when #querySyntax is disabled and #q is non empty, it build a proper query expression to get keywords highlighting', async () => {
        mockEngine = buildMockSearchAppEngine({
          state: {
            ...createMockState(),
            query: {enableQuerySyntax: false, q: 'hello'},
          },
        });
        await doLoadCollection();
        expect(PlatformClient.call).toHaveBeenCalledWith(
          expect.objectContaining({
            requestParams: expect.objectContaining({
              q: '( <@- hello -@> ) OR @uri',
              enableQuerySyntax: true,
            }),
          })
        );
      });

      it('does not uses facets to get the full collection', async () => {
        await doLoadCollection();
        expect(PlatformClient.call).toHaveBeenCalledWith(
          expect.objectContaining({
            requestParams: expect.not.objectContaining({
              facet: expect.anything(),
            }),
          })
        );
      });
    });

    it('should resolve the hierarchy from the root when the root is the relevant result', () => {
      const indexedResults = buildMockResultsFromHierarchy(
        'thread',
        testThreadHierarchy
      );
      const rootResult = emulateAPIFolding(indexedResults);

      dispatchSearch([rootResult]);

      expect(extractMockFoldingHierarchy(state.collections.thread)).toEqual(
        testThreadHierarchy
      );
    });

    it('should resolve the hierarchy partially from the root when a result is missing from childResults', () => {
      const indexedResults = buildMockResultsFromHierarchy(
        'thread',
        testThreadHierarchy
      );
      const rootResult = emulateAPIFolding(
        indexedResults,
        indexedResults.find((result) => result.title === 'first-answer')!
      );

      dispatchSearch([rootResult]);

      expect(extractMockFoldingHierarchy(state.collections.thread)).toEqual({
        ...testThreadHierarchy,
        children: [
          testThreadHierarchy.children!.find(
            (child) => child.name === 'first-answer'
          )!,
        ],
      });
    });

    it("should not fold when there's no collection id on the returned result", () => {
      const indexedResults = buildMockResultsFromHierarchy(
        'thread',
        testThreadHierarchy
      );
      const rootResult = emulateAPIFolding(indexedResults);

      delete rootResult.raw.collection;

      dispatchSearch([rootResult]);

      expect(state.collections).toEqual({});
    });

    it("should not fold when there's no child id on the returned result", () => {
      const results = buildMockResultsFromHierarchy(
        'thread',
        testThreadHierarchy
      );
      const rootResult = emulateAPIFolding(results);

      delete rootResult.raw.id;

      dispatchSearch([rootResult]);

      expect(state.collections).toEqual({});
    });

    it('should not get stuck in an infinite loop', async () => {
      const indexedResults = [
        buildMockResultWithFolding({
          uniqueId: 'a',
          title: 'A',
          raw: {
            urihash: '',
            collection: 'loop',
            parent: 'c',
            id: 'a',
          },
        }),
        buildMockResultWithFolding({
          uniqueId: 'b',
          title: 'B',
          raw: {
            urihash: '',
            collection: 'loop',
            parent: 'a',
            id: 'b',
          },
        }),
        buildMockResultWithFolding({
          uniqueId: 'c',
          title: 'C',
          raw: {
            urihash: '',
            collection: 'loop',
            parent: 'b',
            id: 'c',
          },
        }),
      ];
      const rootResult: ResultWithFolding = {
        ...indexedResults[0],
        childResults: [indexedResults[1], indexedResults[2]],
      };

      const timedOut = await Promise.race([
        new Promise<true>((resolve) => setTimeout(() => resolve(true), 500)),
        new Promise<false>((resolve) => {
          dispatchSearch([rootResult]);
          resolve(false);
        }),
      ]);

      expect(timedOut).toBeFalsy();
    });

    it('should resolve the hierarchy from the relevant result when the root cannot be found', () => {
      const indexedResults = buildMockResultsFromHierarchy(
        'thread',
        testThreadHierarchy
      );
      const rootResult = emulateAPIFolding(indexedResults);

      const relevantResult = rootResult.childResults[0];
      delete relevantResult.raw.parent;

      dispatchSearch([relevantResult]);

      expect(extractMockFoldingHierarchy(state.collections.thread)).toEqual(
        testThreadHierarchy.children![0]
      );
    });

    it('should still resolve the hierarchy when the root is a parent of itself', () => {
      const indexedResults = buildMockResultsFromHierarchy(
        'thread',
        testThreadHierarchy
      );
      const rootResult = emulateAPIFolding(indexedResults);
      rootResult.raw.parent = rootResult.raw.id;

      dispatchSearch([rootResult]);

      expect(extractMockFoldingHierarchy(state.collections.thread)).toEqual(
        testThreadHierarchy
      );
    });

    it('should still resolve the hierarchy when child fields are single-value arrays', () => {
      const indexedResults = buildMockResultsFromHierarchy(
        'thread',
        testThreadHierarchy
      );
      indexedResults.forEach((result) => (result.raw.id = [result.raw.id]));
      const rootResult = emulateAPIFolding(indexedResults);

      dispatchSearch([rootResult]);

      expect(extractMockFoldingHierarchy(state.collections.thread)).toEqual(
        testThreadHierarchy
      );
    });

    it('should be able to load more results into an existing collection', () => {
      const indexedResults = buildMockResultsFromHierarchy(
        'thread',
        testThreadHierarchy
      );
      const relevantUnfoldedResult = indexedResults.find(
        (result) => result.title === 'first-answer'
      )!;

      dispatchSearch([relevantUnfoldedResult]);

      expect(extractMockFoldingHierarchy(state.collections.thread)).toEqual(<
        MockFoldingHierarchy
      >{
        name: 'first-answer',
      });

      dispatchLoadCollection([emulateAPIFolding(indexedResults)]);

      expect(extractMockFoldingHierarchy(state.collections.thread)).toEqual(
        testThreadHierarchy
      );
    });

    it('should not change the collection when loadCollection is rejected', () => {
      const indexedResults = buildMockResultsFromHierarchy(
        'thread',
        testThreadHierarchy
      );
      const relevantUnfoldedResult = indexedResults.find(
        (result) => result.title === 'first-answer'
      )!;

      dispatchSearch([relevantUnfoldedResult]);

      dispatchAsync(loadCollection.rejected, new Error(), 'thread');

      expect(extractMockFoldingHierarchy(state.collections.thread)).toEqual(<
        MockFoldingHierarchy
      >{
        name: 'first-answer',
      });
    });

    it('should still resolve the collection when field names are different', () => {
      state.fields = {
        collection: 'col',
        parent: 'p',
        child: 'c',
      };
      const indexedResults = buildMockResultsFromHierarchy(
        'thread',
        testThreadHierarchy
      );
      indexedResults.forEach(
        (result) =>
          (result.raw = {
            urihash: '',
            col: result.raw.collection,
            p: result.raw.parent,
            c: result.raw.id,
          })
      );
      const rootResult = emulateAPIFolding(
        indexedResults,
        indexedResults[0],
        state.fields
      );

      dispatchSearch([rootResult]);

      expect(extractMockFoldingHierarchy(state.collections.thread)).toEqual(
        testThreadHierarchy
      );
    });

    it('can fold multiple collections', () => {
      const indexedThreadResults = buildMockResultsFromHierarchy(
        'thread',
        testThreadHierarchy
      );
      const indexedGenericResult = buildMockResult();
      const indexedStorageResults = buildMockResultsFromHierarchy(
        'storage',
        testStorageHierarchy
      );

      const rootThreadResult = emulateAPIFolding(indexedThreadResults);
      const rootStorageResult = emulateAPIFolding(indexedStorageResults);

      dispatchSearch([
        rootThreadResult,
        indexedGenericResult,
        rootStorageResult,
      ]);

      expect(Object.keys(state.collections)).toEqual(['thread', 'storage']);
      expect(extractMockFoldingHierarchy(state.collections.thread)).toEqual(
        testThreadHierarchy
      );
      expect(extractMockFoldingHierarchy(state.collections.storage)).toEqual(
        testStorageHierarchy
      );
    });

    it("doesn't affect unrelated collections when loading more results", () => {
      const indexedThreadResults = buildMockResultsFromHierarchy(
        'thread',
        testThreadHierarchy
      );
      const indexedGenericResult = buildMockResult();
      const indexedStorageResults = buildMockResultsFromHierarchy(
        'storage',
        testStorageHierarchy
      );

      const rootThreadResult = emulateAPIFolding(indexedThreadResults);

      dispatchSearch([
        rootThreadResult,
        indexedGenericResult,
        indexedStorageResults[0],
      ]);

      dispatchLoadCollection([emulateAPIFolding(indexedStorageResults)]);

      expect(extractMockFoldingHierarchy(state.collections.thread)).toEqual(
        testThreadHierarchy
      );
      expect(extractMockFoldingHierarchy(state.collections.storage)).toEqual(
        testStorageHierarchy
      );
    });

    it('adds more collections when fetchMoreResults is called', () => {
      const indexedThreadResults = buildMockResultsFromHierarchy(
        'thread',
        testThreadHierarchy
      );
      const indexedGenericResult = buildMockResult();
      const rootThreadResult = emulateAPIFolding(indexedThreadResults);
      dispatchSearch([rootThreadResult, indexedGenericResult]);

      expect(Object.keys(state.collections)).toEqual(['thread']);

      const indexedStorageResults = buildMockResultsFromHierarchy(
        'storage',
        testStorageHierarchy
      );
      const rootStorageResult = emulateAPIFolding(indexedStorageResults);
      dispatchAsync(
        fetchMoreResults.fulfilled,
        buildMockSearch({
          response: buildMockSearchResponse({results: [rootStorageResult]}),
        })
      );

      expect(Object.keys(state.collections)).toEqual(['thread', 'storage']);
    });

    it('creates a collection when a result has a parentResult', () => {
      const childResult = buildMockResultWithFolding();
      childResult.parentResult = buildMockResultWithFolding();
      childResult.raw.collection = childResult.parentResult.raw.collection =
        'the_collection';
      dispatchSearch([childResult]);
      expect(state.collections['the_collection'].result).toEqual(
        childResult.parentResult
      );
    });

    it('throws a clear error message when it is unable to find a collection in the state', () => {
      state.collections = {};
      const foldedResult = buildMockResultWithFolding();
      foldedResult.raw.collection = 'totally_does_not_exists';
      expect(() => dispatchLoadCollection([foldedResult])).toThrowError(
        /Unable to create collection totally_does_not_exists/
      );
    });
  });
});
