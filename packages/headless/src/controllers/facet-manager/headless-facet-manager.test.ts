import {deselectAllBreadcrumbs} from '../../features/breadcrumb/breadcrumb-actions';
import {facetOptionsReducer as facetOptions} from '../../features/facet-options/facet-options-slice';
import {executeSearch} from '../../features/search/search-actions';
import {searchReducer as search} from '../../features/search/search-slice';
import {
  MockedSearchEngine,
  buildMockSearchEngine,
} from '../../test/mock-engine-v2';
import {createMockState} from '../../test/mock-state';
import {FacetManager} from '../core/facet-manager/headless-core-facet-manager';
import {buildFacetManager} from './headless-facet-manager';

jest.mock('../../features/search/search-actions');
jest.mock('../../features/breadcrumb/breadcrumb-actions');

describe('Facet Manager', () => {
  let engine: MockedSearchEngine;
  let facetManager: FacetManager;

  function initController() {
    engine = buildMockSearchEngine(createMockState());

    facetManager = buildFacetManager(engine);
  }

  beforeEach(() => {
    jest.resetAllMocks();
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
