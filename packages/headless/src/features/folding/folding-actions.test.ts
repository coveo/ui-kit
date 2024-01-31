import {MockSearchEngine} from '../../test/mock-engine';
import {buildMockSearchAppEngine} from '../../test/mock-engine';
import {createMockState} from '../../test/mock-state';
import {buildSearchAndFoldingLoadCollectionRequest} from '../search-and-folding/search-and-folding-request';
import {loadCollection} from './folding-actions';

describe('folding actions', () => {
  let e: MockSearchEngine;

  beforeEach(() => {
    e = buildMockSearchAppEngine({state: createMockState()});
    jest.spyOn(e.apiClient, 'search');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('the search request "origin"', () => {
    it('with #executeSearch', async () => {
      const collectionId = 'test';
      await e.dispatch(loadCollection(collectionId));
      const req = {
        ...(await buildSearchAndFoldingLoadCollectionRequest(e.state)),
        enableQuerySyntax: true,
        cq: `@${e.state.folding.fields.collection}="${collectionId}"`,
        filterField: e.state.folding.fields.collection,
        childField: e.state.folding.fields.parent,
        parentField: e.state.folding.fields.child,
        filterFieldRange: 100,
      };
      expect(e.apiClient.search).toHaveBeenCalledWith(
        req,
        expect.objectContaining({
          origin: 'foldingCollection',
        })
      );
    });
  });
});
