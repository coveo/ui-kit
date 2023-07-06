import {configuration} from '../../app/common-reducers';
import {setDesiredCount} from '../../features/facets/automatic-facet-set/automatic-facet-set-actions';
import {automaticFacetSetReducer as automaticFacetSet} from '../../features/facets/automatic-facet-set/automatic-facet-set-slice';
import {searchReducer as search} from '../../features/search/search-slice';
import {MockSearchEngine, buildMockSearchAppEngine} from '../../test';
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
    expect(engine.addReducers).toHaveBeenCalledWith({
      automaticFacetSet,
      configuration,
      search,
    });
  });

  it('should dispatch #setDesiredCount', () => {
    expect(engine.actions).toContainEqual(setDesiredCount(props.desiredCount));
  });

  it('should return automatic facets as empty array if the response is empty', () => {
    expect(facetManager.state.automaticFacets).toEqual([]);
  });
});
