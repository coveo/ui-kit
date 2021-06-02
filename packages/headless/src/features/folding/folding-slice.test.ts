import {AnyAction} from 'redux';
import {buildMockResultWithFolding} from '../../test/mock-result-with-folding';
import {buildMockSearch} from '../../test/mock-search';
import {buildMockSearchResponse} from '../../test/mock-search-response';
import {executeSearch} from '../search/search-actions';
import {foldingReducer, ResultWithFolding} from './folding-slice';
import {FoldedResult, FoldingState} from './folding-state';

interface Hierarchy {
  name: string;
  children?: Hierarchy[];
}

function buildMockResultsFromHierarchy(
  collectionName: string,
  root: Hierarchy,
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
  target: ResultWithFolding
): ResultWithFolding {
  const newResult: ResultWithFolding = {...target};

  newResult.childResults = results
    .filter((result) => result.raw.parent === target.raw.id)
    .map((result) => emulateAPIFolding(results, result));

  if (target.raw.parent) {
    newResult.parentResult = {
      ...results.find((result) => result.raw.id === target.raw.parent)!,
    };
    newResult.childResults.push({...newResult.parentResult});
  }

  return newResult;
}

function extractHierarchy(root: FoldedResult): Hierarchy {
  const part: Hierarchy = {name: root.title};
  if (root.children.length) {
    part.children = root.children.map((child) => extractHierarchy(child));
  }
  return part;
}

describe('folding slice', () => {
  it('should be disabled by default', () => {
    expect(foldingReducer(undefined, {type: ''}).enabled).toBeFalsy();
  });

  describe('with folding enabled', () => {
    const testThreadHierarchy: Hierarchy = {
      name: 'some-question',
      children: [
        {
          name: 'first-answer',
          children: [
            {
              name: 'comment-questionning-the-answer',
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

    let state: FoldingState;

    function dispatch(action: AnyAction) {
      state = foldingReducer(state, action);
    }

    function dispatchSearch(results: ResultWithFolding[]) {
      dispatch(
        executeSearch.fulfilled(
          buildMockSearch({
            response: buildMockSearchResponse({
              results,
            }),
          }),
          '',
          null as never
        )
      );
    }

    beforeEach(() => {
      state = {
        enabled: true,
        collections: {},
        fields: {collection: 'collection', parent: 'parent', child: 'id'},
        filterFieldRange: -1234,
      };
    });

    it('should correctly fold a single collection from the root', () => {
      const results = buildMockResultsFromHierarchy(
        'thread',
        testThreadHierarchy
      );
      const resultReturnedByIndex = emulateAPIFolding(
        results,
        results.find((result) => result.title === 'some-question')!
      );

      dispatchSearch([resultReturnedByIndex]);

      const collection = Object.values(state.collections)[0];
      expect(extractHierarchy(collection)).toEqual(testThreadHierarchy);
    });
  });
});
