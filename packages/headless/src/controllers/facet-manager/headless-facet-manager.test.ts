import {automaticFacetsReducer as automaticFacets} from '../../features/facets/automatic-facets/automatic-facets-slice';
import {getAutomaticFacetId} from '../../features/facets/automatic-facets/automatic-facets-utils';
import {MockSearchEngine, buildMockSearchAppEngine} from '../../test';
import {buildMockFacetResponse} from '../../test/mock-facet-response';
import {
  FacetManager,
  FacetManagerProps,
  buildFacetManager,
} from './headless-facet-manager';

describe('facet manager', () => {
  let engine: MockSearchEngine;
  let facetManager: FacetManager;
  let props: FacetManagerProps;

  beforeEach(() => {
    props = {desiredCount: 5};
    engine = buildMockSearchAppEngine();
    facetManager = buildFacetManager(engine, props);
  });

  it('should add the correct reducers to engine', () => {
    expect(engine.addReducers).toHaveBeenCalledWith({automaticFacets});
  });

  it('should modify automatic facets with generated facets ids', () => {
    const field = 'author';
    const facetId = getAutomaticFacetId(field);
    engine.state.search.response.generateAutomaticFacets = {
      facets: [buildMockFacetResponse({field})],
    };
    const finalState = buildMockFacetResponse({
      field,
      facetId,
    });

    facetManager = buildFacetManager(engine, props);

    expect(facetManager.state.automaticFacets?.[0]).toEqual(finalState);
  });
});
