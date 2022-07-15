import {
  buildMockSearchAppEngine,
  createMockState,
  MockSearchEngine,
} from '../../../test';
import {
  BreadcrumbManager,
  buildCoreBreadcrumbManager,
} from './headless-core-breadcrumb-manager';
import {SearchAppState} from '../../../state/search-app-state';
import {
  configuration,
  search,
  facetSet,
  numericFacetSet,
  dateFacetSet,
  categoryFacetSet,
} from '../../../app/reducers';
import {deselectAllBreadcrumbs} from '../../../features/breadcrumb/breadcrumb-actions';

describe('headless breadcrumb manager', () => {
  let engine: MockSearchEngine;
  let state: SearchAppState;
  let breadcrumbManager: BreadcrumbManager;

  function initController() {
    engine = buildMockSearchAppEngine();
    engine.state = state;
    breadcrumbManager = buildCoreBreadcrumbManager(engine);
  }

  beforeEach(() => {
    state = createMockState();
    initController();
  });

  it('it adds the correct reducers to engine', () => {
    expect(engine.addReducers).toHaveBeenCalledWith({
      configuration,
      search,
      facetSet,
      numericFacetSet,
      dateFacetSet,
      categoryFacetSet,
    });
  });

  describe('#deselectAll', () => {
    it('dispatches #deselectAllBreadcrumbs', () => {
      breadcrumbManager.deselectAll();
      expect(engine.actions).toContainEqual(deselectAllBreadcrumbs());
    });
  });
});
