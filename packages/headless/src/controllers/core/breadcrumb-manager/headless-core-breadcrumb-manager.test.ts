import {deselectAllBreadcrumbs} from '../../../features/breadcrumb/breadcrumb-actions.js';
import {SearchAppState} from '../../../state/search-app-state.js';
import {
  buildMockSearchAppEngine,
  createMockState,
  MockSearchEngine,
} from '../../../test.js';
import {
  BreadcrumbManager,
  buildCoreBreadcrumbManager,
} from './headless-core-breadcrumb-manager.js';

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

  describe('#deselectAll', () => {
    it('dispatches #deselectAllBreadcrumbs', () => {
      breadcrumbManager.deselectAll();
      expect(engine.actions).toContainEqual(deselectAllBreadcrumbs());
    });
  });
});
