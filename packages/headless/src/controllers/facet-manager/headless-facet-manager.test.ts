import {deselectAllBreadcrumbs} from '../../features/breadcrumb/breadcrumb-actions';
import {executeSearch} from '../../features/commerce/search/search-actions';
import {facetOptionsReducer as facetOptions} from '../../features/facet-options/facet-options-slice';
import {searchReducer as search} from '../../features/search/search-slice';
import {SearchAppState} from '../../state/search-app-state';
import {
  MockedSearchEngine,
  buildMockSearchEngine,
} from '../../test/mock-engine-v2';
import {createMockState} from '../../test/mock-state';
import {FacetManager} from '../core/facet-manager/headless-core-facet-manager';
import {buildFacetManager} from './headless-facet-manager';

jest.mock('../../features/search/search-actions');

describe('Facet Manager', () => {
  let engine: MockedSearchEngine;
  let state: SearchAppState;
  let facetManager: FacetManager;

  function initController() {
    engine = buildMockSearchEngine(createMockState());
    engine.state = state;
    facetManager = buildFacetManager(engine);
  }

  beforeEach(() => {
    state = createMockState();
    initController();
  });

  it('renders', () => {
    expect(facetManager).toBeTruthy();
  });

  it('it adds the correct reducers to engine', () => {
    expect(engine.addReducers).toHaveBeenCalledWith({
      facetOptions,
      search,
    });
  });

  describe('#deselectAll', () => {
    it('dispatches #deselectAllBreadcrumbs', () => {
      facetManager.deselectAll();
      expect(deselectAllBreadcrumbs).toHaveBeenCalled();
    });

    it('dispatches #executeSearch', () => {
      facetManager.deselectAll();
      expect(executeSearch).toHaveBeenCalled();
    });
  });
});
