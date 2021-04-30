import {buildMockResultWithFolding} from '../../test/mock-result-with-folding';
import {buildMockSearch} from '../../test/mock-search';
import {buildMockSearchResponse} from '../../test/mock-search-response';
import {executeSearch, fetchMoreResults} from '../search/search-actions';
import {foldingReducer} from './folding-slice';
import {
  FoldedResult,
  FoldingState,
  getFoldingInitialState,
} from './folding-state';

function getEncyclopediaCollection() {
  const collection = 'encyclopedia';

  const animalsResult = buildMockResultWithFolding({
    uniqueId: '_animals',
    raw: {urihash: '', collection, id: ['animals']},
  });

  const ballPythonsResult = buildMockResultWithFolding({
    uniqueId: '_ballPythons',
    raw: {urihash: '', collection, parent: 'reptiles'},
  });

  const geckosResult = buildMockResultWithFolding({
    uniqueId: '_geckos',
    raw: {urihash: '', collection, parent: 'reptiles'},
  });

  const mammalsResult = buildMockResultWithFolding({
    uniqueId: '_mammals',
    raw: {
      urihash: '',
      collection,
      parent: 'animals',
    },
    parentResult: {...animalsResult},
  });

  const relevantResult = buildMockResultWithFolding({
    uniqueId: '_reptiles',
    raw: {
      urihash: '',
      collection,
      id: ['reptiles'],
      parent: 'animals',
    },
    parentResult: {...animalsResult},
    childResults: [mammalsResult, ballPythonsResult, geckosResult],
  });

  return {
    animalsResult,
    relevantResult,
    ballPythonsResult,
    geckosResult,
    mammalsResult,
  };
}

describe('folding slice', () => {
  it('should be disabled by default', () => {
    expect(foldingReducer(undefined, {type: ''}).enabled).toBeFalsy();
  });

  it('should correctly fold hierarchical results', () => {
    const {
      animalsResult,
      relevantResult,
      ballPythonsResult,
      geckosResult,
      mammalsResult,
    } = getEncyclopediaCollection();

    const otherResult = buildMockResultWithFolding();

    const initialState: FoldingState = {
      ...getFoldingInitialState(),
      enabled: true,
      fields: {collection: 'collection', parent: 'parent', child: 'id'},
    };

    const action = executeSearch.fulfilled(
      buildMockSearch({
        response: buildMockSearchResponse({
          results: [relevantResult, otherResult],
        }),
      }),
      '',
      null as never
    );

    const expectedHierarchy = {
      ...animalsResult,
      children: [
        {
          ...relevantResult,
          children: [
            {...ballPythonsResult, children: []},
            {...geckosResult, children: []},
          ],
        },
        {...mammalsResult, children: []},
      ],
    };

    const expectedOtherResult = {...otherResult, children: []};

    const results = foldingReducer(initialState, action).collections;

    expect(results).toEqual([expectedHierarchy, expectedOtherResult]);
  });

  it('should correctly fold new hierarchical results', () => {
    const {
      animalsResult,
      relevantResult,
      ballPythonsResult,
      geckosResult,
      mammalsResult,
    } = getEncyclopediaCollection();

    const foldedOtherResult: FoldedResult = {
      ...buildMockResultWithFolding(),
      children: [],
    };

    const initialState: FoldingState = {
      ...getFoldingInitialState(),
      enabled: true,
      fields: {collection: 'collection', parent: 'parent', child: 'id'},
      collections: [foldedOtherResult],
    };

    const action = fetchMoreResults.fulfilled(
      buildMockSearch({
        response: buildMockSearchResponse({
          results: [relevantResult],
        }),
      }),
      '',
      null as never
    );

    const expectedHierarchy = {
      ...animalsResult,
      children: [
        {
          ...relevantResult,
          children: [
            {...ballPythonsResult, children: []},
            {...geckosResult, children: []},
          ],
        },
        {...mammalsResult, children: []},
      ],
    };

    const results = foldingReducer(initialState, action).collections;

    expect(results).toEqual([foldedOtherResult, expectedHierarchy]);
  });
});
