import {SearchAppState} from '../../state/search-app-state';
import {buildMockSearchAppEngine, MockEngine} from '../../test';
import {buildMockFacetResponse} from '../../test/mock-facet-response';
import {
  buildFacetManager,
  FacetManager,
  FacetManagerPayload,
} from './headless-facet-manager';

describe('facet manager', () => {
  let engine: MockEngine<SearchAppState>;
  let facetManager: FacetManager;

  beforeEach(() => {
    engine = buildMockSearchAppEngine();
    facetManager = buildFacetManager(engine);
  });

  it('exposes a #subscribe method', () => {
    expect(facetManager.subscribe).toBeTruthy();
  });

  it('when #response.facets is empty, #state.facetIds returns an empty array', () => {
    expect(facetManager.state.facetIds).toEqual([]);
  });

  it('when #response.facets is populated, #state.facetIds returns the ids in the same order as the response', () => {
    const facet1 = buildMockFacetResponse({facetId: '1'});
    const facet2 = buildMockFacetResponse({facetId: '2'});

    engine.state.search.response.facets = [facet1, facet2];

    expect(facetManager.state.facetIds).toEqual([
      facet1.facetId,
      facet2.facetId,
    ]);
  });

  describe('#sort', () => {
    function buildFacetManagerPayload(
      facetId: string,
      payload: string
    ): FacetManagerPayload<string> {
      return {facetId, payload};
    }

    it('when the facetId does not exist, it still returns it', () => {
      const facet1 = buildFacetManagerPayload('1', 'a');

      const facets = [facet1];
      const sortedFacets = facetManager.sort(facets);
      expect(sortedFacets).toEqual([facet1]);
    });

    it('when the facetId exists, it returns the facet payload', () => {
      const facet1 = buildFacetManagerPayload('1', '');

      const facets = [facet1];

      engine.state.search.response.facets = [
        buildMockFacetResponse({facetId: '1'}),
      ];

      expect(facetManager.sort(facets)).toEqual([facet1]);
    });

    it('when the facetIds exist but out of order, it sorts the payloads according to order in the response', () => {
      const facet1 = buildFacetManagerPayload('1', 'a');
      const facet2 = buildFacetManagerPayload('2', 'b');

      const facets = [facet1, facet2];

      engine.state.search.response.facets = [
        buildMockFacetResponse({facetId: '2'}),
        buildMockFacetResponse({facetId: '1'}),
      ];

      expect(facetManager.sort(facets)).toEqual([facet2, facet1]);
    });

    it('when one facetId exists but another does not, it returns the facetId that exists first', () => {
      const facet1 = buildFacetManagerPayload('1', 'a');
      const facet2 = buildFacetManagerPayload('2', 'b');

      const facets = [facet1, facet2];

      engine.state.search.response.facets = [
        buildMockFacetResponse({facetId: '2'}),
        buildMockFacetResponse({facetId: '3'}),
      ];

      expect(facetManager.sort(facets)).toEqual([facet2, facet1]);
    });
  });
});
